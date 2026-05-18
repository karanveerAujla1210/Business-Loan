/**
 * Error Handling Middleware
 * Centralized error handling for all API endpoints
 * @author MiniBusiness Loan
 */

const { logger } = require('./logger');

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async wrapper to catch errors in async route handlers
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error
  logger.error('Error occurred', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({
      success: false,
      message: `Validation Error: ${message}`,
      errors: err.errors,
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = Object.keys(err.fields)[0];
    const message = `${field} already exists`;
    return res.status(409).json({
      success: false,
      message,
      field,
    });
  }

  // Sequelize foreign key error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference to related data',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Operational errors (known errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Programming errors (unknown errors)
  logger.error('Programming Error', {
    error: err,
    message: err.message,
  });

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  });
};

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Resource not found: ${req.url}`, 404);
  next(error);
};

/**
 * Uncaught Exception Handler (for process errors)
 */
const uncaughtExceptionHandler = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
};

/**
 * Unhandled Rejection Handler (for promise errors)
 */
const unhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason,
      promise,
    });
    process.exit(1);
  });
};

/**
 * Error Response Helper
 */
const sendErrorResponse = (res, statusCode, message, additionalData = {}) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...additionalData,
  });
};

/**
 * Success Response Helper
 */
const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// API Error codes
const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: { code: 'AUTH_001', statusCode: 401, message: 'Invalid credentials' },
  TOKEN_EXPIRED: { code: 'AUTH_002', statusCode: 401, message: 'Token has expired' },
  UNAUTHORIZED: { code: 'AUTH_003', statusCode: 403, message: 'Unauthorized access' },
  INVALID_TOKEN: { code: 'AUTH_004', statusCode: 401, message: 'Invalid token' },

  // Applicant errors
  APPLICANT_NOT_FOUND: { code: 'APPL_001', statusCode: 404, message: 'Applicant not found' },
  APPLICANT_EXISTS: { code: 'APPL_002', statusCode: 409, message: 'Applicant already exists' },
  INVALID_PHONE: { code: 'APPL_003', statusCode: 400, message: 'Invalid phone number' },
  INVALID_AADHAAR: { code: 'APPL_004', statusCode: 400, message: 'Invalid Aadhaar number' },

  // Loan errors
  LOAN_NOT_FOUND: { code: 'LOAN_001', statusCode: 404, message: 'Loan not found' },
  LOAN_NOT_APPROVED: { code: 'LOAN_002', statusCode: 400, message: 'Loan is not approved' },
  LOAN_ALREADY_DISBURSED: { code: 'LOAN_003', statusCode: 400, message: 'Loan already disbursed' },
  INSUFFICIENT_BALANCE: { code: 'LOAN_004', statusCode: 400, message: 'Insufficient outstanding balance' },

  // CAM errors
  CAM_NOT_FOUND: { code: 'CAM_001', statusCode: 404, message: 'CAM not found' },
  CAM_NOT_SUBMITTED: { code: 'CAM_002', statusCode: 400, message: 'CAM not submitted for approval' },
  INVALID_CAM_DATA: { code: 'CAM_003', statusCode: 400, message: 'Invalid CAM data' },

  // Payment errors
  PAYMENT_FAILED: { code: 'PAY_001', statusCode: 400, message: 'Payment processing failed' },
  INVALID_AMOUNT: { code: 'PAY_002', statusCode: 400, message: 'Invalid payment amount' },
  PAYMENT_ALREADY_PROCESSED: { code: 'PAY_003', statusCode: 409, message: 'Payment already processed' },

  // General errors
  VALIDATION_ERROR: { code: 'VALID_001', statusCode: 400, message: 'Validation error' },
  DATABASE_ERROR: { code: 'DB_001', statusCode: 500, message: 'Database error' },
  INTERNAL_ERROR: { code: 'INT_001', statusCode: 500, message: 'Internal server error' },
};

module.exports = {
  AppError,
  catchAsync,
  errorHandler,
  notFoundHandler,
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
  sendErrorResponse,
  sendSuccessResponse,
  ERROR_CODES,
};
