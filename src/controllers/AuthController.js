/**
 * Authentication Controller
 * Handles OTP, login, and token management
 * @author MiniBusiness Loan
 */

const authService = require('../services/authenticationService');
const legacyAuthServices = require('../services/authServices');
const { catchAsync, sendSuccessResponse, sendErrorResponse } = require('../utils/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Send OTP to customer
 * POST /api/v1/auth/send-otp
 * Body: { phoneNumber }
 */
const sendOTP = catchAsync(async (req, res) => {
  const { phoneNumber } = req.validatedData;

  const result = await authService.sendOTPToCustomer(phoneNumber);

  sendSuccessResponse(res, 200, result.message, {
    expiryTime: result.expiryTime,
    message: 'Check your phone for OTP',
  });
});

/**
 * Verify OTP and login
 * POST /api/v1/auth/verify-otp
 * Body: { phoneNumber, otp }
 */
const verifyOTP = catchAsync(async (req, res) => {
  const { phoneNumber, otp } = req.validatedData;

  const result = await authService.customerLoginWithOTP(phoneNumber, otp);
  sendSuccessResponse(res, 200, result.message, result.data);
});

/**
 * Customer login with phone and OTP (combined)
 * POST /api/v1/auth/customer/login
 * Body: { phoneNumber, otp }
 */
const customerLogin = catchAsync(async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return sendErrorResponse(res, 400, 'Phone number and OTP are required');
  }

  const result = await authService.customerLoginWithOTP(phoneNumber, otp);

  sendSuccessResponse(res, 200, result.message, result.data);
});

/**
 * Staff login
 * POST /api/v1/auth/staff/login
 * Body: { username, password }
 */
const staffLogin = catchAsync(async (req, res) => {
  const userId = req.body?.userId || req.body?.username || req.body?.employeeId;
  const { password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({
      status: false,
      data: {},
      message: 'User ID and password are required',
      api_version: '1.0',
    });
  }

  const token = await legacyAuthServices.staffLogin({ userId, password });

  if (!token || token === 'INVALID_CREDENTIALS') {
    return res.status(401).json({
      status: false,
      data: {},
      message: 'Invalid credentials',
      api_version: '1.0',
    });
  }

  if (token === 'PASSWORD_NOT_SET') {
    return res.status(403).json({
      status: false,
      data: {},
      message: 'Password is not set for this staff account',
      api_version: '1.0',
    });
  }

  if (token === 'User Account is blocked' || token === 'No Staff Found with this number') {
    return res.status(403).json({
      status: false,
      data: {},
      message: token,
      api_version: '1.0',
    });
  }

  return res.status(200).json({
    status: true,
    data: token,
    message: 'SUCCESS',
    api_version: '1.0',
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh-token
 * Body: { refreshToken }
 */
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendErrorResponse(res, 400, 'Refresh token is required');
  }

  const result = await authService.refreshAccessToken(refreshToken);

  sendSuccessResponse(res, 200, 'Token refreshed successfully', result.data);
});

/**
 * Logout
 * POST /api/v1/auth/logout
 * Headers: Authorization: Bearer <token>
 */
const logout = catchAsync(async (req, res) => {
  const customerID = req.customerID || req.user?.customerID;

  if (!customerID) {
    return sendErrorResponse(res, 401, 'Authentication required');
  }

  const result = await authService.logout(customerID);

  sendSuccessResponse(res, 200, result.message, {});
});

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 * Headers: Authorization: Bearer <token>
 */
const getCurrentProfile = catchAsync(async (req, res) => {
  if (!req.user) {
    return sendErrorResponse(res, 401, 'Authentication required');
  }

  sendSuccessResponse(res, 200, 'Profile retrieved', {
    user: {
      customerID: req.user.customerID,
      phoneNumber: req.user.phoneNumber,
      userType: req.user.userType,
    },
  });
});

/**
 * Verify token validity
 * GET /api/v1/auth/verify-token
 * Headers: Authorization: Bearer <token>
 */
const verifyToken = catchAsync(async (req, res) => {
  if (!req.user) {
    return sendErrorResponse(res, 401, 'Invalid or expired token');
  }

  sendSuccessResponse(res, 200, 'Token is valid', {
    user: req.user,
    isValid: true,
  });
});

/**
 * Resend OTP
 * POST /api/v1/auth/resend-otp
 * Body: { phoneNumber }
 */
const resendOTP = catchAsync(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return sendErrorResponse(res, 400, 'Phone number is required');
  }

  const result = await authService.sendOTPToCustomer(phoneNumber);

  sendSuccessResponse(res, 200, 'OTP resent successfully', {
    expiryTime: result.expiryTime,
  });
});

/**
 * Check phone number availability
 * GET /api/v1/auth/check-phone/:phoneNumber
 */
const checkPhoneAvailability = catchAsync(async (req, res) => {
  const { phoneNumber } = req.params;

  // TODO: Check if phone already exists in database
  sendSuccessResponse(res, 200, 'Phone availability checked', {
    phoneNumber,
    isAvailable: true,
  });
});

module.exports = {
  sendOTP,
  verifyOTP,
  customerLogin,
  staffLogin,
  refreshToken,
  logout,
  getCurrentProfile,
  verifyToken,
  resendOTP,
  checkPhoneAvailability,
};
