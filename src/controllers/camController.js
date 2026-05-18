/**
 * CAM Controller
 * Handles Credit Assessment Memo (CAM) API endpoints
 * @author MiniBusiness Loan
 */

const camServices = require('../services/camServices');
const { catchAsync, sendSuccessResponse, sendErrorResponse } = require('../utils/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Create CAM
 * POST /api/v1/cam/create
 */
const createCAM = catchAsync(async (req, res) => {
  const camData = req.validatedData;

  const cam = await camServices.createCAM(camData);

  sendSuccessResponse(res, 201, 'CAM created successfully', {
    camID: cam.camID,
    customerID: cam.customerID,
    status: cam.status,
  });
});

/**
 * Get CAM by ID
 * GET /api/v1/cam/:camID
 */
const getCAMById = catchAsync(async (req, res) => {
  const { camID } = req.params;

  const cam = await camServices.getCAMById(camID);

  sendSuccessResponse(res, 200, 'CAM retrieved successfully', cam);
});

/**
 * Get CAM by Customer ID
 * GET /api/v1/cam/customer/:customerID
 */
const getCAMByCustomer = catchAsync(async (req, res) => {
  const { customerID } = req.params;

  const cam = await camServices.getCAMByCustomerID(customerID);

  if (!cam) {
    return sendErrorResponse(res, 404, 'No CAM found for this customer');
  }

  sendSuccessResponse(res, 200, 'CAM retrieved successfully', cam);
});

/**
 * Update CAM
 * PUT /api/v1/cam/:camID
 */
const updateCAM = catchAsync(async (req, res) => {
  const { camID } = req.params;
  const updateData = req.validatedData;

  const cam = await camServices.updateCAM(camID, updateData);

  sendSuccessResponse(res, 200, 'CAM updated successfully', {
    camID: cam.camID,
    status: cam.status,
  });
});

/**
 * Submit CAM for approval
 * POST /api/v1/cam/:camID/submit
 */
const submitCAM = catchAsync(async (req, res) => {
  const { camID } = req.params;

  const cam = await camServices.submitCAM(camID);

  sendSuccessResponse(res, 200, 'CAM submitted for approval', {
    camID: cam.camID,
    status: cam.status,
    submittedDate: cam.submittedDate,
  });
});

/**
 * Get approval decision
 * GET /api/v1/cam/:camID/decision
 */
const getApprovalDecision = catchAsync(async (req, res) => {
  const { camID } = req.params;

  const decision = await camServices.approvalDecision(camID);

  sendSuccessResponse(res, 200, 'Approval decision retrieved', {
    camID,
    decision,
  });
});

/**
 * Approve CAM (Credit Officer action)
 * POST /api/v1/cam/:camID/approve
 */
const approveCAM = catchAsync(async (req, res) => {
  const { camID } = req.params;
  const { approverID, notes } = req.validatedData;

  // Check if user is credit officer or higher
  if (!req.user || !['credit_officer', 'branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only credit officers can approve CAMs');
  }

  const cam = await camServices.approveCAM(camID, approverID, notes);

  sendSuccessResponse(res, 200, 'CAM approved successfully', {
    camID: cam.camID,
    status: cam.status,
    approvedBy: cam.finalApprovalBy,
    approvalDate: cam.finalApprovalDate,
  });
});

/**
 * Reject CAM
 * POST /api/v1/cam/:camID/reject
 */
const rejectCAM = catchAsync(async (req, res) => {
  const { camID } = req.params;
  const { rejectionReason, approverID } = req.validatedData;

  // Check if user is authorized to reject
  if (!req.user || !['credit_officer', 'branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only credit officers can reject CAMs');
  }

  const cam = await camServices.rejectCAM(camID, rejectionReason, approverID);

  sendSuccessResponse(res, 200, 'CAM rejected', {
    camID: cam.camID,
    status: cam.status,
    rejectionReason: cam.notes,
  });
});

/**
 * Get CAM List with filters
 * GET /api/v1/cam/list
 */
const getCAMList = catchAsync(async (req, res) => {
  const { status, customerID, page = 1, limit = 20 } = req.validatedQuery;
  const offset = (page - 1) * limit;

  const result = await camServices.getCAMList(
    { status, customerID },
    limit,
    offset
  );

  sendSuccessResponse(res, 200, 'CAM list retrieved', {
    total: result.total,
    page: result.page,
    pages: result.pages,
    cams: result.cams,
  });
});

/**
 * Calculate EMI
 * POST /api/v1/cam/calculate-emi
 */
const calculateEMI = catchAsync(async (req, res) => {
  const { principal, annualRate, months } = req.body;

  if (!principal || !months || annualRate === undefined) {
    return sendErrorResponse(res, 400, 'Missing required fields: principal, annualRate, months');
  }

  const emi = camServices.calculateEMI(principal, annualRate, months);

  sendSuccessResponse(res, 200, 'EMI calculated', {
    principal,
    annualRate,
    months,
    emiAmount: emi,
  });
});

/**
 * Calculate LTV
 * POST /api/v1/cam/calculate-ltv
 */
const calculateLTV = catchAsync(async (req, res) => {
  const { loanAmount, collateralValue } = req.body;

  if (!loanAmount || !collateralValue) {
    return sendErrorResponse(res, 400, 'Missing required fields: loanAmount, collateralValue');
  }

  const ltv = camServices.calculateLTV(loanAmount, collateralValue);

  sendSuccessResponse(res, 200, 'LTV calculated', {
    loanAmount,
    collateralValue,
    ltvPercentage: ltv.toFixed(2),
  });
});

/**
 * Get CAM Dashboard Statistics
 * GET /api/v1/cam/dashboard/stats
 */
const getCAMDashboardStats = catchAsync(async (req, res) => {
  // TODO: Implement comprehensive dashboard statistics
  const stats = {
    totalCAMs: 0,
    pendingCAMs: 0,
    approvedCAMs: 0,
    rejectedCAMs: 0,
    averageLoanAmount: 0,
    approvalRate: 0,
  };

  sendSuccessResponse(res, 200, 'Dashboard statistics retrieved', stats);
});

module.exports = {
  createCAM,
  getCAMById,
  getCAMByCustomer,
  updateCAM,
  submitCAM,
  getApprovalDecision,
  approveCAM,
  rejectCAM,
  getCAMList,
  calculateEMI,
  calculateLTV,
  getCAMDashboardStats,
};
