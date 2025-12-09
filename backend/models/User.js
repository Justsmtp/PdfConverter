const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  conversionsToday: {
    type: Number,
    default: 0
  },
  lastConversionReset: {
    type: Date,
    default: Date.now
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Reset daily conversion count
userSchema.methods.resetDailyConversions = function() {
  const now = new Date();
  const lastReset = new Date(this.lastConversionReset);
  
  // Check if it's been more than 24 hours
  if (now - lastReset > 24 * 60 * 60 * 1000) {
    this.conversionsToday = 0;
    this.lastConversionReset = now;
    return this.save();
  }
};

// Check if user can convert
userSchema.methods.canConvert = async function() {
  await this.resetDailyConversions();
  
  if (this.plan === 'premium') {
    return true;
  }
  
  return this.conversionsToday < (process.env.FREE_CONVERSIONS_PER_DAY || 10);
};

// Increment conversion count
userSchema.methods.incrementConversions = async function() {
  this.conversionsToday += 1;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);