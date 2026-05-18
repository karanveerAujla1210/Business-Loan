/**
 * Validation Schemas
 * Input validation schemas for all API endpoints
 * @author MiniBusiness Loan
 */

const Joi = require('joi');

// Common field schemas
const phoneSchema = Joi.string().pattern(/^[0-9]{10}$/).required().messages({
  'string.pattern.base': 'Phone number must be 10 digits',
});

const emailSchema = Joi.string().email().required();

const aadharSchema = Joi.string().pattern(/^[0-9]{12}$/).required().messages({
  'string.pattern.base': 'Aadhaar must be 12 digits',
});

const panSchema = Joi.string().pattern(/^[A-Z0-9]{10}$/).required().messages({
  'string.pattern.base': 'PAN must be 10 alphanumeric characters',
});

const amountSchema = Joi.number().positive().precision(2).required();

const tenureSchema = Joi.number().integer().min(1).max(120).required().messages({
  'number.max': 'Tenure cannot exceed 120 months',
});

// ============ AUTHENTICATION SCHEMAS ============

const sendOTPSchema = Joi.object({
  phoneNumber: phoneSchema,
  userType: Joi.string().valid('customer', 'staff').required(),
}).unknown(false);

const verifyOTPSchema = Joi.object({
  phoneNumber: phoneSchema,
  otp: Joi.string().length(6).pattern(/^[0-9]{6}$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must be 6 digits',
  }),
  userType: Joi.string().valid('customer', 'staff').required(),
}).unknown(false);

// ============ APPLICANT SCHEMAS ============

const createApplicantSchema = Joi.object({
  phoneNumber: phoneSchema,
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().optional(),
  dob: Joi.date().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  emailID: emailSchema,
  panNumber: panSchema,
  aadharNumber: aadharSchema,
  address: Joi.string().required(),
  appliedMode: Joi.string()
    .valid('walk_in', 'phone', 'website', 'reference', 'employee')
    .required(),
  maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed'),
  dependents: Joi.number().integer().min(0),
}).unknown(false);

const updateApplicantSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  emailID: emailSchema.optional(),
  address: Joi.string().optional(),
  maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').optional(),
  dependents: Joi.number().integer().min(0).optional(),
}).unknown(false);

// ============ LOAN SCHEMAS ============

const createLoanProposalSchema = Joi.object({
  customerID: Joi.string().required(),
  amountApplied: amountSchema,
  tenure: tenureSchema,
  interestRate: Joi.number().positive().precision(2).optional(),
  processingFee: Joi.number().positive().precision(2).optional(),
  paymentFrequency: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
}).unknown(false);

const approveLoanSchema = Joi.object({
  loanID: Joi.string().required(),
  approvedBy: Joi.string().required(),
  notes: Joi.string().optional(),
}).unknown(false);

const rejectLoanSchema = Joi.object({
  loanID: Joi.string().required(),
  rejectionReason: Joi.string().required(),
  rejectedBy: Joi.string().required(),
}).unknown(false);

// ============ CAM SCHEMAS ============

const createCAMSchema = Joi.object({
  customerID: Joi.string().required(),
  loanID: Joi.string().optional(),
  dailySales: Joi.number().positive().precision(2).optional(),
  businessRunningDays: Joi.number().integer().min(0).max(31).optional(),
  monthlyTurnover: Joi.number().positive().precision(2).optional(),
  annualTurnOver: Joi.number().positive().precision(2).optional(),
  businessVintage: Joi.number().integer().min(0).optional(),
  businessRent: Joi.number().positive().precision(2).optional(),
  expensesCost: Joi.number().positive().precision(2).optional(),
  salary: Joi.number().positive().precision(2).optional(),
  householdExpenses: Joi.number().positive().precision(2).optional(),
  existingMonthlyObligations: Joi.number().positive().precision(2).optional(),
  loanAmountApplied: amountSchema,
  noOfEMI: Joi.number().integer().min(1).required(),
  stockInventory: Joi.number().positive().precision(2).optional(),
  otherIncome: Joi.number().positive().precision(2).optional(),
}).unknown(false);

const submitCAMSchema = Joi.object({
  camID: Joi.string().required(),
}).unknown(false);

const approveCAMSchema = Joi.object({
  camID: Joi.string().required(),
  approverID: Joi.string().required(),
  notes: Joi.string().optional(),
}).unknown(false);

const rejectCAMSchema = Joi.object({
  camID: Joi.string().required(),
  rejectionReason: Joi.string().required(),
  approverID: Joi.string().required(),
}).unknown(false);

// ============ REPAYMENT SCHEMAS ============

const processPaymentSchema = Joi.object({
  loanID: Joi.string().required(),
  customerID: Joi.string().required(),
  amount: amountSchema,
  paymentMode: Joi.string().valid('cash', 'bank_transfer', 'upi', 'cheque').required(),
  razorpayOrderID: Joi.string().optional(),
  razorpayPaymentID: Joi.string().optional(),
  razorpaySignature: Joi.string().optional(),
  collectedBy: Joi.string().required(),
}).unknown(false);

// ============ DISBURSAL SCHEMAS ============

const initiateDisbursalSchema = Joi.object({
  loanID: Joi.string().required(),
  customerID: Joi.string().required(),
  disbursalAmount: amountSchema,
  bankAccountID: Joi.string().optional(),
  bankName: Joi.string().optional(),
  accountNumber: Joi.string().pattern(/^[0-9]{9,18}$/).optional(),
}).unknown(false);

const confirmDisbursalSchema = Joi.object({
  loanID: Joi.string().required(),
  utr: Joi.string().required(),
  bankReference: Joi.string().required(),
}).unknown(false);

// ============ PAGINATION SCHEMAS ============

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
}).unknown(false);

const loanFilterSchema = Joi.object({
  status: Joi.string().optional(),
  customerID: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
}).unknown(false);

// ============ EXPORT VALIDATION FUNCTIONS ============

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  req.validatedData = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  req.validatedQuery = value;
  next();
};

// ============ EXPORT ALL ============

module.exports = {
  // Validation functions
  validate,
  validateQuery,

  // Schemas
  sendOTPSchema,
  verifyOTPSchema,
  createApplicantSchema,
  updateApplicantSchema,
  createLoanProposalSchema,
  approveLoanSchema,
  rejectLoanSchema,
  createCAMSchema,
  submitCAMSchema,
  approveCAMSchema,
  rejectCAMSchema,
  processPaymentSchema,
  initiateDisbursalSchema,
  confirmDisbursalSchema,
  paginationSchema,
  loanFilterSchema,

  // Middleware wrappers
  validateSendOTP: validate(sendOTPSchema),
  validateVerifyOTP: validate(verifyOTPSchema),
  validateCreateApplicant: validate(createApplicantSchema),
  validateUpdateApplicant: validate(updateApplicantSchema),
  validateCreateLoan: validate(createLoanProposalSchema),
  validateApproveLoan: validate(approveLoanSchema),
  validateRejectLoan: validate(rejectLoanSchema),
  validateCreateCAM: validate(createCAMSchema),
  validateSubmitCAM: validate(submitCAMSchema),
  validateApproveCAM: validate(approveCAMSchema),
  validateRejectCAM: validate(rejectCAMSchema),
  validateProcessPayment: validate(processPaymentSchema),
  validateInitiateDisburssal: validate(initiateDisbursalSchema),
  validateConfirmDisbursal: validate(confirmDisbursalSchema),
};
