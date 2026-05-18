/**
 * Applicant/Customer Controller
 * Handles customer profile, KYC, and document management
 * @author MiniBusiness Loan
 */

const Applicant = require('../models/applicant');
const CoApplicant = require('../models/CoApplicant');
const encryptionService = require('../utils/encryptionService');
const { catchAsync, sendSuccessResponse, sendErrorResponse } = require('../utils/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Create or update applicant profile
 * POST /api/v1/applicant/profile
 */
const updateProfile = catchAsync(async (req, res) => {
  const applicantData = req.validatedData;
  const customerID = req.user?.customerID || req.body.customerID;

  if (!customerID) {
    return sendErrorResponse(res, 400, 'Customer ID is required');
  }

  let applicant = await Applicant.findOne({ where: { customerID } });

  if (!applicant) {
    // Create new applicant
    applicantData.customerID = customerID;
    applicant = await Applicant.create(applicantData);
    logger.info(`New applicant created: ${customerID}`);
  } else {
    // Update existing applicant
    // Encrypt sensitive data if provided
    if (applicantData.aadharNumber) {
      const { encrypted, iv } = encryptionService.encrypt(applicantData.aadharNumber);
      applicantData.aadharNumberEncrypted = `${iv}:${encrypted}`;
      applicantData.maskedAadharNumber = encryptionService.maskAadhaar(applicantData.aadharNumber);
    }

    if (applicantData.panNumber) {
      const { encrypted, iv } = encryptionService.encrypt(applicantData.panNumber);
      applicantData.panNumberEncrypted = `${iv}:${encrypted}`;
      applicantData.maskedPANNumber = encryptionService.maskPAN(applicantData.panNumber);
    }

    if (applicantData.bankAccountNumber) {
      const { encrypted, iv } = encryptionService.encrypt(applicantData.bankAccountNumber);
      applicantData.bankAccountNumberEncrypted = `${iv}:${encrypted}`;
      applicantData.maskedBankAccount = encryptionService.maskBankAccount(
        applicantData.bankAccountNumber
      );
    }

    await applicant.update(applicantData);
    logger.info(`Applicant updated: ${customerID}`);
  }

  sendSuccessResponse(res, applicant.isNewRecord ? 201 : 200, 'Profile updated successfully', {
    customerID: applicant.customerID,
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    email: applicant.email,
    maskedAadharNumber: applicant.maskedAadharNumber,
    maskedPANNumber: applicant.maskedPANNumber,
  });
});

/**
 * Get applicant profile
 * GET /api/v1/applicant/profile/:customerID
 */
const getProfile = catchAsync(async (req, res) => {
  const { customerID } = req.params;

  // Authorization check
  if (req.user?.customerID !== customerID && req.user?.role !== 'super_admin') {
    return sendErrorResponse(res, 403, 'Unauthorized access to profile');
  }

  const applicant = await Applicant.findOne({
    where: { customerID },
    attributes: {
      exclude: [
        'aadharNumberEncrypted',
        'panNumberEncrypted',
        'bankAccountNumberEncrypted',
        'passwordHash',
      ],
    },
  });

  if (!applicant) {
    return sendErrorResponse(res, 404, 'Applicant not found');
  }

  sendSuccessResponse(res, 200, 'Profile retrieved', applicant);
});

/**
 * Get decrypted sensitive information
 * GET /api/v1/applicant/sensitive/:customerID
 */
const getSensitiveInfo = catchAsync(async (req, res) => {
  const { customerID } = req.params;

  // Only applicant or super_admin can access
  if (req.user?.customerID !== customerID && req.user?.role !== 'super_admin') {
    return sendErrorResponse(res, 403, 'Unauthorized access');
  }

  const applicant = await Applicant.findOne({ where: { customerID } });

  if (!applicant) {
    return sendErrorResponse(res, 404, 'Applicant not found');
  }

  const sensitiveData = {};

  // Decrypt and return only for authorized user
  if (applicant.aadharNumberEncrypted) {
    try {
      sensitiveData.aadharNumber = encryptionService.decrypt(applicant.aadharNumberEncrypted);
    } catch (error) {
      logger.error('Aadhaar decryption failed:', error);
    }
  }

  if (applicant.panNumberEncrypted) {
    try {
      sensitiveData.panNumber = encryptionService.decrypt(applicant.panNumberEncrypted);
    } catch (error) {
      logger.error('PAN decryption failed:', error);
    }
  }

  if (applicant.bankAccountNumberEncrypted) {
    try {
      sensitiveData.bankAccountNumber = encryptionService.decrypt(
        applicant.bankAccountNumberEncrypted
      );
    } catch (error) {
      logger.error('Bank account decryption failed:', error);
    }
  }

  sendSuccessResponse(res, 200, 'Sensitive information retrieved', {
    customerID,
    ...sensitiveData,
  });
});

/**
 * Update KYC status
 * POST /api/v1/applicant/kyc/update
 */
const updateKYCStatus = catchAsync(async (req, res) => {
  const { customerID, kycStatus, verifiedBy, verificationDate } = req.body;

  if (!customerID || !kycStatus) {
    return sendErrorResponse(res, 400, 'Customer ID and KYC status are required');
  }

  const validStatuses = ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'];
  if (!validStatuses.includes(kycStatus)) {
    return sendErrorResponse(res, 400, `Invalid KYC status. Valid: ${validStatuses.join(', ')}`);
  }

  const applicant = await Applicant.findOne({ where: { customerID } });

  if (!applicant) {
    return sendErrorResponse(res, 404, 'Applicant not found');
  }

  await applicant.update({
    kycStatus,
    kycVerifiedBy: verifiedBy,
    kycVerificationDate: verificationDate || new Date(),
  });

  logger.info(`KYC updated for ${customerID}: ${kycStatus}`);

  sendSuccessResponse(res, 200, 'KYC status updated', {
    customerID,
    kycStatus,
    verificationDate: applicant.kycVerificationDate,
  });
});

/**
 * Upload KYC documents
 * POST /api/v1/applicant/documents/upload
 */
const uploadDocument = catchAsync(async (req, res) => {
  const { customerID, documentType, documentFile } = req.body;

  if (!customerID || !documentType || !documentFile) {
    return sendErrorResponse(res, 400, 'Customer ID, document type, and file are required');
  }

  const applicant = await Applicant.findOne({ where: { customerID } });

  if (!applicant) {
    return sendErrorResponse(res, 404, 'Applicant not found');
  }

  // TODO: Upload to S3 or file storage
  const documentURL = `/documents/${customerID}/${documentType}_${Date.now()}.pdf`;

  logger.info(`Document uploaded for ${customerID}: ${documentType}`);

  sendSuccessResponse(res, 201, 'Document uploaded successfully', {
    customerID,
    documentType,
    documentURL,
  });
});

/**
 * Get applicant documents
 * GET /api/v1/applicant/documents/:customerID
 */
const getDocuments = catchAsync(async (req, res) => {
  const { customerID } = req.params;

  // Authorization check
  if (req.user?.customerID !== customerID && req.user?.role !== 'super_admin') {
    return sendErrorResponse(res, 403, 'Unauthorized access');
  }

  const applicant = await Applicant.findOne({ where: { customerID } });

  if (!applicant) {
    return sendErrorResponse(res, 404, 'Applicant not found');
  }

  // TODO: Fetch documents from storage
  const documents = [
    { type: 'aadhar', uploadedAt: '2026-05-10', status: 'verified' },
    { type: 'pan', uploadedAt: '2026-05-10', status: 'verified' },
    { type: 'bankStatement', uploadedAt: '2026-05-12', status: 'pending' },
  ];

  sendSuccessResponse(res, 200, 'Documents retrieved', {
    customerID,
    documents,
  });
});

/**
 * Add co-applicant
 * POST /api/v1/applicant/co-applicant/add
 */
const addCoApplicant = catchAsync(async (req, res) => {
  const { primaryCustomerID, coApplicantData } = req.body;

  if (!primaryCustomerID || !coApplicantData) {
    return sendErrorResponse(res, 400, 'Primary customer ID and co-applicant data are required');
  }

  const primaryApplicant = await Applicant.findOne({ where: { customerID: primaryCustomerID } });

  if (!primaryApplicant) {
    return sendErrorResponse(res, 404, 'Primary applicant not found');
  }

  // Create co-applicant
  const coApplicant = await CoApplicant.create({
    primaryCustomerID,
    ...coApplicantData,
  });

  logger.info(`Co-applicant added to ${primaryCustomerID}`);

  sendSuccessResponse(res, 201, 'Co-applicant added successfully', {
    coApplicantID: coApplicant.coApplicantID,
    primaryCustomerID,
    name: coApplicant.firstName + ' ' + coApplicant.lastName,
  });
});

/**
 * Get co-applicants for a customer
 * GET /api/v1/applicant/co-applicants/:customerID
 */
const getCoApplicants = catchAsync(async (req, res) => {
  const { customerID } = req.params;

  const coApplicants = await CoApplicant.findAll({
    where: { primaryCustomerID: customerID },
    attributes: [
      'coApplicantID',
      'firstName',
      'lastName',
      'relationship',
      'phoneNumber',
      'email',
    ],
  });

  sendSuccessResponse(res, 200, 'Co-applicants retrieved', {
    customerID,
    count: coApplicants.length,
    coApplicants,
  });
});

/**
 * Get applicant list (admin)
 * GET /api/v1/applicant/list
 */
const listApplicants = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can access applicant list');
  }

  const { page = 1, limit = 50, status } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) {
    where.kycStatus = status;
  }

  const { count, rows } = await Applicant.findAndCountAll({
    where,
    attributes: [
      'customerID',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'kycStatus',
      'createdAt',
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  sendSuccessResponse(res, 200, 'Applicants list retrieved', {
    total: count,
    page,
    pages: Math.ceil(count / limit),
    applicants: rows,
  });
});

/**
 * Get applicant summary
 * GET /api/v1/applicant/summary/:customerID
 */
const getSummary = catchAsync(async (req, res) => {
  const { customerID } = req.params;

  const applicant = await Applicant.findOne({ where: { customerID } });

  if (!applicant) {
    return sendErrorResponse(res, 404, 'Applicant not found');
  }

  // Get associated data
  const LoanProposal = require('../models/LoanProposal');
  const loans = await LoanProposal.findAll({
    where: { customerID },
    attributes: ['loanID', 'amountApplied', 'status', 'createdAt'],
  });

  sendSuccessResponse(res, 200, 'Applicant summary retrieved', {
    profile: {
      customerID: applicant.customerID,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phoneNumber: applicant.phoneNumber,
      kycStatus: applicant.kycStatus,
    },
    loans: {
      total: loans.length,
      active: loans.filter((l) => ['disbursed', 'active'].includes(l.status)).length,
      data: loans,
    },
  });
});

module.exports = {
  updateProfile,
  getProfile,
  getSensitiveInfo,
  updateKYCStatus,
  uploadDocument,
  getDocuments,
  addCoApplicant,
  getCoApplicants,
  listApplicants,
  getSummary,
};
