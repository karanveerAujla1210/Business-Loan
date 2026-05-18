/**
 * Authentication Service
 * Handles OTP generation, verification, and JWT token management
 * @author MiniBusiness Loan
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Applicant = require('../models/applicant');
const { logger } = require('../utils/logger');
const encryptionService = require('../utils/encryptionService');

// In-memory OTP storage (replace with Redis in production)
const otpStorage = new Map();

class AuthenticationService {
  /**
   * Generate OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to customer
   */
  async sendOTPToCustomer(phoneNumber) {
    try {
      const otp = this.generateOTP();
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in memory (should be Redis in production)
      otpStorage.set(phoneNumber, {
        otp,
        expiryTime,
        attempts: 0,
      });

      logger.info('OTP generated', { phoneNumber });

      // TODO: Send SMS via SMS service
      // await sendSMS(phoneNumber, `Your MiniBusiness Loan OTP is ${otp}. Valid for 10 minutes.`);

      return {
        success: true,
        message: 'OTP sent to registered phone number',
        expiryTime,
      };
    } catch (error) {
      logger.error('Failed to send OTP', { phoneNumber, error: error.message });
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber, providedOTP) {
    try {
      const otpData = otpStorage.get(phoneNumber);

      if (!otpData) {
        throw new Error('OTP not found. Please request a new OTP.');
      }

      // Check if OTP expired
      if (new Date() > otpData.expiryTime) {
        otpStorage.delete(phoneNumber);
        throw new Error('OTP has expired. Please request a new OTP.');
      }

      // Check attempt limit (3 attempts)
      if (otpData.attempts >= 3) {
        otpStorage.delete(phoneNumber);
        throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
      }

      // Verify OTP
      if (otpData.otp !== providedOTP) {
        otpData.attempts += 1;
        throw new Error('Invalid OTP. Please try again.');
      }

      // OTP verified, remove from storage
      otpStorage.delete(phoneNumber);

      logger.info('OTP verified', { phoneNumber });
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      logger.error('OTP verification failed', { phoneNumber, error: error.message });
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  generateJWTToken(payload, expiresIn = '1h') {
    try {
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
      return token;
    } catch (error) {
      logger.error('Failed to generate JWT token', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  verifyJWTToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.error('JWT verification failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Customer login with OTP
   */
  async customerLoginWithOTP(phoneNumber, otp) {
    try {
      // Verify OTP
      await this.verifyOTP(phoneNumber, otp);

      // Get or create customer
      let applicant = await Applicant.findOne({
        where: { phoneNumber },
      });

      if (!applicant) {
        // Create new customer profile
        applicant = await Applicant.create({
          phoneNumber,
          customerID: `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          loanApplicationStatus: 0,
          appliedMode: 'walk_in',
        });

        logger.info('New customer created during login', { phoneNumber, customerID: applicant.customerID });
      }

      // Check if customer is blocked
      if (applicant.isBlocked) {
        throw new Error('This account has been blocked. Please contact support.');
      }

      // Generate JWT tokens
      const accessToken = this.generateJWTToken(
        {
          customerID: applicant.customerID,
          phoneNumber: applicant.phoneNumber,
          userType: 'customer',
        },
        '1h'
      );

      const refreshToken = this.generateJWTToken(
        {
          customerID: applicant.customerID,
          phoneNumber: applicant.phoneNumber,
          userType: 'customer',
        },
        '7d'
      );

      logger.info('Customer login successful', { customerID: applicant.customerID });

      return {
        success: true,
        message: 'Login successful',
        data: {
          customerID: applicant.customerID,
          phoneNumber: applicant.phoneNumber,
          firstName: applicant.firstName,
          accessToken,
          refreshToken,
          expiresIn: 3600, // 1 hour in seconds
        },
      };
    } catch (error) {
      logger.error('Customer login failed', { phoneNumber, error: error.message });
      throw error;
    }
  }

  /**
   * Staff login
   */
  async staffLogin(username, password) {
    try {
      // TODO: Implement staff authentication against staff database
      // This is a placeholder for staff login implementation

      logger.info('Staff login attempt', { username });

      // Validate credentials against staff table
      // For now, throwing not implemented error
      throw new Error('Staff login not yet implemented');
    } catch (error) {
      logger.error('Staff login failed', { username, error: error.message });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyJWTToken(refreshToken);

      if (decoded.userType !== 'customer') {
        throw new Error('Invalid token type');
      }

      // Generate new access token
      const newAccessToken = this.generateJWTToken(
        {
          customerID: decoded.customerID,
          phoneNumber: decoded.phoneNumber,
          userType: 'customer',
        },
        '1h'
      );

      logger.info('Access token refreshed', { customerID: decoded.customerID });

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: 3600,
        },
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(customerID) {
    try {
      // TODO: Implement token blacklisting if using Redis

      logger.info('Customer logged out', { customerID });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      logger.error('Logout failed', { customerID, error: error.message });
      throw error;
    }
  }

  /**
   * Validate bearer token
   */
  validateBearerToken(authHeader) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
      }

      const token = authHeader.split(' ')[1];
      return this.verifyJWTToken(token);
    } catch (error) {
      logger.error('Bearer token validation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if customer is authenticated
   */
  async isCustomerAuthenticated(customerID, token) {
    try {
      const decoded = this.verifyJWTToken(token);

      if (decoded.customerID !== customerID) {
        throw new Error('Token does not match customer');
      }

      return true;
    } catch (error) {
      logger.error('Authentication check failed', { customerID, error: error.message });
      throw error;
    }
  }
}

module.exports = new AuthenticationService();
