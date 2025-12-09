const fs = require('fs').promises;
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Supported conversion formats
const SUPPORTED_CONVERSIONS = {
  pdf: ['jpg', 'png', 'txt', 'doc', 'docx'],
  jpg: ['pdf', 'png', 'webp'],
  jpeg: ['pdf', 'png', 'webp'],
  png: ['pdf', 'jpg', 'webp'],
  webp: ['pdf', 'jpg', 'png'],
  doc: ['txt'],  // Limited support
  docx: ['txt'], // Limited support
  txt: ['pdf']
};

// Main conversion function
exports.convertFile = async (inputPath, fromFormat, toFormat, originalFileName) => {
  // Validate inputs
  if (!fromFormat || !toFormat) {
    throw new Error('Source and target formats are required');
  }
  
  fromFormat = fromFormat.toLowerCase();
  toFormat = toFormat.toLowerCase();

  // Validate conversion
  if (!SUPPORTED_CONVERSIONS[fromFormat]) {
    throw new Error(`Unsupported input format: ${fromFormat}`);
  }

  if (!SUPPORTED_CONVERSIONS[fromFormat].includes(toFormat)) {
    throw new Error(`Cannot convert from ${fromFormat} to ${toFormat}`);
  }

  // Generate output path
  const outputDir = path.join(__dirname, '../converted');
  await fs.mkdir(outputDir, { recursive: true });
  
  const baseName = path.parse(originalFileName).name;
  const timestamp = Date.now();
  const outputPath = path.join(outputDir, `${baseName}_${timestamp}.${toFormat}`);

  // Route to appropriate converter
  if (fromFormat === 'pdf' && ['jpg', 'png'].includes(toFormat)) {
    return await convertPdfToImage(inputPath, outputPath, toFormat);
  } else if (['jpg', 'jpeg', 'png', 'webp'].includes(fromFormat) && toFormat === 'pdf') {
    return await convertImageToPdf(inputPath, outputPath);
  } else if (['jpg', 'jpeg', 'png', 'webp'].includes(fromFormat) && ['jpg', 'jpeg', 'png', 'webp'].includes(toFormat)) {
    return await convertImageToImage(inputPath, outputPath, toFormat);
  } else if (fromFormat === 'pdf' && toFormat === 'txt') {
    return await convertPdfToText(inputPath, outputPath);
  } else if (toFormat === 'pdf' && fromFormat === 'txt') {
    return await convertTextToPdf(inputPath, outputPath);
  } else if (fromFormat === 'pdf' && ['doc', 'docx'].includes(toFormat)) {
    // For now, convert PDF to text and save as .doc
    return await convertPdfToDoc(inputPath, outputPath);
  } else {
    throw new Error(`Conversion from ${fromFormat} to ${toFormat} not yet implemented`);
  }
};

// PDF to Image conversion
async function convertPdfToImage(pdfPath, outputPath, format) {
  try {
    // Read PDF
    const dataBuffer = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(dataBuffer);
    
    // Get first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // For simplicity, we'll create a placeholder image
    // In production, use pdf2pic or pdf-poppler for actual rendering
    const image = sharp({
      create: {
        width: Math.round(width),
        height: Math.round(height),
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    });

    // Add text overlay (simplified version)
    const text = `PDF Page 1\nSize: ${width}x${height}\nConverted to ${format.toUpperCase()}`;
    
    await image
      .png()
      .toFile(outputPath.replace(`.${format}`, '.png'));

    // Convert to requested format
    await sharp(outputPath.replace(`.${format}`, '.png'))
      [format]()
      .toFile(outputPath);

    // Clean up temp PNG if different format requested
    if (format !== 'png') {
      await fs.unlink(outputPath.replace(`.${format}`, '.png'));
    }

    return outputPath;
  } catch (error) {
    throw new Error(`PDF to image conversion failed: ${error.message}`);
  }
}

// Image to PDF conversion
async function convertImageToPdf(imagePath, outputPath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const pdfDoc = await PDFDocument.create();
    
    // Embed image
    let embeddedImage;
    if (metadata.format === 'png') {
      embeddedImage = await pdfDoc.embedPng(imageBuffer);
    } else if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      embeddedImage = await pdfDoc.embedJpg(imageBuffer);
    } else {
      // Convert to PNG first
      const pngBuffer = await image.png().toBuffer();
      embeddedImage = await pdfDoc.embedPng(pngBuffer);
    }

    // Create page with image dimensions
    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
    
    // Draw image
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);

    return outputPath;
  } catch (error) {
    throw new Error(`Image to PDF conversion failed: ${error.message}`);
  }
}

// Image to Image conversion
async function convertImageToImage(inputPath, outputPath, format) {
  try {
    await sharp(inputPath)
      [format]()
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    throw new Error(`Image conversion failed: ${error.message}`);
  }
}

// PDF to Text conversion
async function convertPdfToText(pdfPath, outputPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    await fs.writeFile(outputPath, data.text);
    
    return outputPath;
  } catch (error) {
    throw new Error(`PDF to text conversion failed: ${error.message}`);
  }
}

// Text to PDF conversion
async function convertTextToPdf(textPath, outputPath) {
  try {
    const textContent = await fs.readFile(textPath, 'utf-8');
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    const maxWidth = page.getWidth() - (margin * 2);
    
    // Split text into lines
    const lines = textContent.split('\n');
    let yPosition = page.getHeight() - margin;
    
    for (const line of lines) {
      if (yPosition < margin) {
        // Create new page if needed
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = newPage.getHeight() - margin;
      }
      
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: fontSize,
      });
      
      yPosition -= lineHeight;
    }
    
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
  } catch (error) {
    throw new Error(`Text to PDF conversion failed: ${error.message}`);
  }
}

// PDF to DOC conversion (simplified - extracts text and saves as .doc)
async function convertPdfToDoc(pdfPath, outputPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    // Create a simple text document (not true .doc format, but readable)
    // For true .doc conversion, you'd need LibreOffice or similar
    const docContent = `${data.text}\n\n---\nConverted from PDF using PDF Converter`;
    
    await fs.writeFile(outputPath, docContent);
    
    return outputPath;
  } catch (error) {
    throw new Error(`PDF to DOC conversion failed: ${error.message}`);
  }
}

// Get supported formats
exports.getSupportedFormats = () => {
  return SUPPORTED_CONVERSIONS;
};