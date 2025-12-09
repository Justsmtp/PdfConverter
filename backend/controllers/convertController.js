const ConversionHistory = require('../models/ConversionHistory');
const { convertFile } = require('../utils/fileConverter');
const fs = require('fs').promises;
const path = require('path');

// @desc    Convert file
// @route   POST /api/convert
// @access  Private/Public
exports.convertFile = async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { targetFormat } = req.body;
    
    if (!targetFormat) {
      return res.status(400).json({
        success: false,
        message: 'Please specify target format'
      });
    }

    const originalFile = req.file;
    const fileExtension = path.extname(originalFile.originalname).slice(1);
    
    if (!fileExtension) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file: No file extension found'
      });
    }
    
    const originalFormat = fileExtension.toUpperCase();

    // Create conversion history record
    const conversion = await ConversionHistory.create({
      userId: req.user ? req.user._id : null,
      originalFileName: originalFile.originalname,
      originalFileType: originalFormat,
      targetFileType: targetFormat.toUpperCase(),
      originalFilePath: originalFile.path,
      convertedFilePath: '', // Will be updated after conversion
      originalFileSize: originalFile.size,
      convertedFileSize: 0,
      status: 'processing'
    });

    try {
      // Convert the file
      const convertedFilePath = await convertFile(
        originalFile.path,
        originalFormat.toLowerCase(),
        targetFormat.toLowerCase(),
        originalFile.originalname
      );

      // Get converted file size
      const stats = await fs.stat(convertedFilePath);
      const processingTime = Date.now() - startTime;

      // Update conversion record
      conversion.convertedFilePath = convertedFilePath;
      conversion.convertedFileSize = stats.size;
      conversion.status = 'completed';
      conversion.processingTime = processingTime;
      await conversion.save();

      // Increment user conversion count
      if (req.user) {
        await req.user.incrementConversions();
      }

      res.status(200).json({
        success: true,
        message: 'File converted successfully',
        conversion: {
          id: conversion._id,
          originalFileName: conversion.originalFileName,
          originalFileType: conversion.originalFileType,
          targetFileType: conversion.targetFileType,
          originalFileSize: conversion.originalFileSize,
          convertedFileSize: conversion.convertedFileSize,
          processingTime: conversion.processingTime,
          downloadUrl: `/api/convert/download/${conversion._id}`
        }
      });

    } catch (conversionError) {
      // Update conversion record with error
      conversion.status = 'failed';
      conversion.errorMessage = conversionError.message;
      await conversion.save();

      throw conversionError;
    }

  } catch (error) {
    console.error('Conversion error:', error);
    
    // Clean up uploaded file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error converting file',
      error: error.message
    });
  }
};

// @desc    Download converted file
// @route   GET /api/convert/download/:id
// @access  Public
exports.downloadFile = async (req, res) => {
  try {
    const conversion = await ConversionHistory.findById(req.params.id);

    if (!conversion) {
      return res.status(404).json({
        success: false,
        message: 'Conversion not found'
      });
    }

    if (conversion.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Conversion is not completed yet'
      });
    }

    // Check if file exists
    try {
      await fs.access(conversion.convertedFilePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Converted file not found or expired'
      });
    }

    // Increment download count
    conversion.downloadCount += 1;
    await conversion.save();

    // Set headers for download
    const fileName = `${path.parse(conversion.originalFileName).name}.${conversion.targetFileType.toLowerCase()}`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Send file
    res.sendFile(path.resolve(conversion.convertedFilePath));

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
};

// @desc    Get conversion history
// @route   GET /api/convert/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const conversions = await ConversionHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-convertedFilePath -originalFilePath');

    const total = await ConversionHistory.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      conversions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversion history'
    });
  }
};

// @desc    Get conversion stats
// @route   GET /api/convert/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await ConversionHistory.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalConversions: { $sum: 1 },
          successfulConversions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedConversions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalOriginalSize: { $sum: '$originalFileSize' },
          totalConvertedSize: { $sum: '$convertedFileSize' },
          avgProcessingTime: { $avg: '$processingTime' }
        }
      }
    ]);

    const result = stats[0] || {
      totalConversions: 0,
      successfulConversions: 0,
      failedConversions: 0,
      totalOriginalSize: 0,
      totalConvertedSize: 0,
      avgProcessingTime: 0
    };

    res.status(200).json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};