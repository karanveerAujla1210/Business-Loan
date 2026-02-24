const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: false,
    message: 'Too many requests from this IP, please try again later.',
    api_version: '1.0'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    status: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    api_version: '1.0'
  }
});

// OTP limiter
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 OTP requests per hour
  message: {
    status: false,
    message: 'Too many OTP requests, please try again after 1 hour.',
    api_version: '1.0'
  }
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    status: false,
    message: 'Too many file uploads, please try again later.',
    api_version: '1.0'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  uploadLimiter
};
