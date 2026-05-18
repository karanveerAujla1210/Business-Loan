/**
 * Authentication Middleware
 * Protects routes and validates JWT tokens
 * @author MiniBusiness Loan
 */

const { logger } = require('../utils/logger');
const authService = require('../services/authenticationService');

/**
 * Customer Authentication Middleware
 */
const authenticateCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Missing authorization header',
      });
    }

    // Validate and extract token
    const decoded = authService.validateBearerToken(authHeader);

    if (decoded.userType !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type for customer endpoint',
      });
    }

    // Attach decoded token to request
    req.user = decoded;
    req.customerID = decoded.customerID;

    logger.info('Customer authenticated', { customerID: decoded.customerID });
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });

    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or missing token.',
    });
  }
};

/**
 * Staff Authentication Middleware
 */
const authenticateStaff = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Missing authorization header',
      });
    }

    // Validate and extract token
    const decoded = authService.validateBearerToken(authHeader);

    if (decoded.userType !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type for staff endpoint',
      });
    }

    // Attach decoded token to request
    req.user = decoded;
    req.staffID = decoded.staffID;

    logger.info('Staff authenticated', { staffID: decoded.staffID });
    next();
  } catch (error) {
    logger.error('Staff authentication failed', { error: error.message });

    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or missing token.',
    });
  }
};

/**
 * Optional Authentication (doesn't fail if not provided)
 */
const optionalAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const decoded = authService.validateBearerToken(authHeader);
      req.user = decoded;
      req.isAuthenticated = true;

      logger.info('Optional authentication successful', { userType: decoded.userType });
    } else {
      req.isAuthenticated = false;
    }

    next();
  } catch (error) {
    logger.warn('Optional authentication failed', { error: error.message });
    req.isAuthenticated = false;
    next();
  }
};

/**
 * Role-based Authorization Middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role || req.user.userType;

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Unauthorized access attempt', {
        userRole,
        allowedRoles,
        userID: req.user.customerID || req.user.staffID,
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for this action',
      });
    }

    next();
  };
};

/**
 * Rate Limiting Middleware
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const store = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!store.has(key)) {
      store.set(key, []);
    }

    const requests = store.get(key);

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < windowMs);
    store.set(key, validRequests);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }

    validRequests.push(now);
    store.set(key, validRequests);

    next();
  };
};

/**
 * Request Logging Middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userID: req.user?.customerID || req.user?.staffID || 'anonymous',
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

module.exports = {
  authenticateCustomer,
  authenticateStaff,
  optionalAuthentication,
  authorize,
  rateLimit,
  requestLogger,
};
