const rateLimit = require('express-rate-limit');

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth route limiter (stricter)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

// Conversion limiter for non-authenticated users
exports.conversionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 conversions per day for unauthenticated users
  message: {
    success: false,
    message: 'Daily conversion limit reached. Please sign up for more conversions.'
  },
  keyGenerator: (req) => {
    return req.ip;
  }
});

// Custom middleware to check user conversion limits
exports.checkConversionLimit = async (req, res, next) => {
  try {
    // Skip check if no user (will be handled by IP-based rate limiter)
    if (!req.user) {
      return next();
    }

    const canConvert = await req.user.canConvert();
    
    if (!canConvert) {
      return res.status(429).json({
        success: false,
        message: `Daily conversion limit reached (${process.env.FREE_CONVERSIONS_PER_DAY || 10} conversions). Upgrade to premium for unlimited conversions.`,
        limit: process.env.FREE_CONVERSIONS_PER_DAY || 10,
        used: req.user.conversionsToday,
        plan: req.user.plan
      });
    }

    next();
  } catch (error) {
    console.error('Error checking conversion limit:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking conversion limit'
    });
  }
};