const mongoose = require('mongoose');

const conversionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,  // Made optional for non-authenticated users
    default: null
  },
  originalFileName: {
    type: String,
    required: true
  },
  originalFileType: {
    type: String,
    required: true,
    uppercase: true
  },
  targetFileType: {
    type: String,
    required: true,
    uppercase: true
  },
  originalFilePath: {
    type: String,
    required: true
  },
  convertedFilePath: {
    type: String,
    required: false,  // Made optional since it's set after conversion
    default: ''
  },
  originalFileSize: {
    type: Number,
    required: true
  },
  convertedFileSize: {
    type: Number,
    required: false,  // Made optional since it's set after conversion
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: null
  },
  processingTime: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Index for faster queries
conversionHistorySchema.index({ userId: 1, createdAt: -1 });
conversionHistorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ConversionHistory', conversionHistorySchema);