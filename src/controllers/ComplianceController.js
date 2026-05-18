const dataRetentionManager = require('../utils/dataRetentionManager');
const dataPrivacy = require('../middlewares/dataPrivacy');
const { logger } = require('../utils/logger');
const { catchAsync } = require('../middlewares/errorHandler');
const auditTrail = require('../utils/auditTrail');
const { AppError } = require('../middlewares/errorHandler');
const consentService = require('../services/consentService');

const exportUserData = catchAsync(async (req, res) => {
  const userId = req.authUserId;

  const userData = await dataRetentionManager.exportUserData(userId);

  await dataPrivacy.logDataAccess(userId, 'user_data', 'EXPORT', req.ip);

  res.json({
    status: true,
    data: userData,
    message: 'User data exported successfully',
    api_version: '1.0',
  });
});

const deleteUserData = catchAsync(async (req, res) => {
  const userId = req.authUserId;

  await dataRetentionManager.deleteUserData(userId);

  await dataPrivacy.logDataAccess(userId, 'user_data', 'DELETE', req.ip);

  res.json({
    status: true,
    message: 'User data deletion request processed. Your data will be anonymized within 30 days.',
    api_version: '1.0',
  });
});

const getPrivacyPolicy = catchAsync((req, res) => {
  res.json({
    status: true,
    data: {
      version: '1.0',
      lastUpdated: '2025-01-01',
      dataCollected: [
        'Name, email, mobile number',
        'Aadhaar, PAN details',
        'Bank account information',
        'Loan application data',
        'Transaction history',
      ],
      dataUsage: [
        'Loan processing and approval',
        'Identity verification',
        'Communication',
        'Compliance and legal requirements',
      ],
      dataRetention: {
        logs: '90 days',
        auditTrail: '365 days',
        userData: 'Until account deletion',
      },
      userRights: [
        'Right to access your data',
        'Right to data portability',
        'Right to deletion',
        'Right to rectification',
      ],
    },
    api_version: '1.0',
  });
});

const consentManagement = catchAsync(async (req, res) => {
  const { consentType, granted } = req.body;
  const userId = req.authUserId;

  if (typeof consentType !== 'string' || consentType.trim().length === 0) {
    throw new AppError('consentType is required', 400);
  }

  if (typeof granted !== 'boolean') {
    throw new AppError('granted must be boolean', 400);
  }

  const normalizedConsentType = consentType.trim();
  await consentService.saveUserConsent({
    userId,
    consentType: normalizedConsentType,
    granted,
  });

  await auditTrail.log({
    userId,
    action: 'CONSENT_UPDATED',
    entityType: 'consent',
    entityId: userId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    newValues: {
      consentType: normalizedConsentType,
      granted,
      updatedAt: new Date().toISOString(),
    },
  });

  logger.info('Consent updated', { userId, consentType: normalizedConsentType, granted });

  res.json({
    status: true,
    message: 'Consent preferences updated',
    api_version: '1.0',
  });
});

module.exports = {
  exportUserData,
  deleteUserData,
  getPrivacyPolicy,
  consentManagement,
};
