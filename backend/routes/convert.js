const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  convertFile,
  downloadFile,
  getHistory,
  getStats
} = require('../controllers/convertController');
const { protect, optionalAuth } = require('../middleware/auth');
const { conversionLimiter, checkConversionLimit } = require('../middleware/rateLimit');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx|txt|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX, TXT, WEBP'));
    }
  }
});

// Convert file - works with or without auth
router.post(
  '/',
  upload.single('file'),
  optionalAuth,
  checkConversionLimit,
  convertFile
);

// Download converted file - public
router.get('/download/:id', downloadFile);

// Get conversion history - protected
router.get('/history', protect, getHistory);

// Get conversion stats - protected
router.get('/stats', protect, getStats);

module.exports = router;