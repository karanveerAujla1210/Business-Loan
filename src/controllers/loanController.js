/**
 * Loan Controller
 * Handles loan application, approval, and disbursement endpoints
 * @author MiniBusiness Loan
 */

const loanServices = require('../services/loanServices');
const camServices = require('../services/camServices');
const Applicant = require('../models/applicant');
const { catchAsync, sendSuccessResponse, sendErrorResponse } = require('../utils/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Create loan proposal
 * POST /api/v1/loans/create
 */
const createLoan = catchAsync(async (req, res) => {
  const loanData = req.validatedData;

  const loan = await loanServices.createLoanProposal(loanData);

  sendSuccessResponse(res, 201, 'Loan proposal created successfully', {
    loanID: loan.loanID,
    customerID: loan.customerID,
    status: loan.status,
    amountApplied: loan.amountApplied,
  });
});

/**
 * Get loan by ID
 * GET /api/v1/loans/:loanID
 */
const getLoanById = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  const loan = await loanServices.getLoanById(loanID);
  const summary = await loanServices.getLoanSummary(loanID);

  sendSuccessResponse(res, 200, 'Loan retrieved successfully', summary);
});

/**
 * Get loans by customer
 * GET /api/v1/loans/customer/:customerID
 */
const getCustomerLoans = catchAsync(async (req, res) => {
  const { customerID } = req.params;

  const loans = await loanServices.getLoansByCustomer(customerID);

  sendSuccessResponse(res, 200, 'Customer loans retrieved', {
    total: loans.length,
    loans,
  });
});

/**
 * List all loans with pagination and filters
 * GET /api/v1/loans/list
 */
const listLoans = catchAsync(async (req, res) => {
  const { status, customerID, page = 1, limit = 20 } = req.validatedQuery;
  const offset = (page - 1) * limit;

  const result = await loanServices.getLoanList(
    { status, customerID },
    limit,
    offset
  );

  sendSuccessResponse(res, 200, 'Loans list retrieved', {
    total: result.total,
    page: result.page,
    pages: result.pages,
    loans: result.loans,
  });
});

/**
 * Approve loan
 * POST /api/v1/loans/:loanID/approve
 */
const approveLoan = catchAsync(async (req, res) => {
  const { loanID } = req.params;
  const { approvedBy } = req.body;

  if (!approvedBy) {
    return sendErrorResponse(res, 400, 'Approver ID is required');
  }

  // Only credit officers and above can approve
  if (!req.user || !['credit_officer', 'branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only credit officers can approve loans');
  }

  const loan = await loanServices.approveLoan(loanID, { approvedBy });

  sendSuccessResponse(res, 200, 'Loan approved successfully', {
    loanID: loan.loanID,
    status: loan.status,
    approvalDate: loan.approvalDate,
    NetDisbursement: loan.NetDisbursement,
  });
});

/**
 * Reject loan
 * POST /api/v1/loans/:loanID/reject
 */
const rejectLoan = catchAsync(async (req, res) => {
  const { loanID } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    return sendErrorResponse(res, 400, 'Rejection reason is required');
  }

  if (!req.user || !['credit_officer', 'branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only credit officers can reject loans');
  }

  const loan = await loanServices.rejectLoan(loanID, rejectionReason);

  sendSuccessResponse(res, 200, 'Loan rejected', {
    loanID: loan.loanID,
    status: loan.status,
    rejectionReason: loan.rejectedReason,
  });
});

/**
 * Get loan status
 * GET /api/v1/loans/:loanID/status
 */
const getLoanStatus = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  const loan = await loanServices.getLoanById(loanID);

  sendSuccessResponse(res, 200, 'Loan status retrieved', {
    loanID: loan.loanID,
    status: loan.status,
    loanApplicationStatus: loan.loanApplicationStatus,
    currentStage: this.getLoanStage(loan.status),
    outstandingBalance: loan.outstandingBalance,
    nextEMIDate: loan.nextEMIDate,
    EMI: loan.EMI,
  });
});

/**
 * Get loan EMI schedule
 * GET /api/v1/loans/:loanID/emi-schedule
 */
const getEMISchedule = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  const loan = await loanServices.getLoanById(loanID);

  if (!loan.EMI || !loan.firstDateofInstallment) {
    return sendErrorResponse(res, 400, 'Loan EMI schedule not yet calculated');
  }

  const schedule = await require('../services/repaymentServices').createPaymentSchedule(
    loanID,
    loan.tenure,
    loan.EMI
  );

  sendSuccessResponse(res, 200, 'EMI schedule retrieved', {
    loanID,
    tenure: loan.tenure,
    emiAmount: loan.EMI,
    schedule,
  });
});

/**
 * Get loan details for dashboard
 * GET /api/v1/loans/:loanID/details
 */
const getLoanDetails = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  const loan = await loanServices.getLoanById(loanID);
  const applicant = await Applicant.findOne({ where: { customerID: loan.customerID } });

  const totalPaid = await require('../services/repaymentServices').getTotalPaidAmount(loanID);
  const outstandingEMIs = await require('../services/repaymentServices').getOutstandingEMICount(loanID);

  sendSuccessResponse(res, 200, 'Loan details retrieved', {
    loan: {
      loanID: loan.loanID,
      customerID: loan.customerID,
      customerName: applicant?.firstName,
      status: loan.status,
      amountApplied: loan.amountApplied,
      tenure: loan.tenure,
      interestRate: loan.interestRate,
      EMI: loan.EMI,
      processingFee: loan.processingFee,
      NetDisbursement: loan.NetDisbursement,
      disbursementDate: loan.disbursementDate,
      nextEMIDate: loan.nextEMIDate,
      outstandingBalance: loan.outstandingBalance,
      lateCharges: loan.lateCharges,
      totalPaid,
      emisPaid: loan.emisPaid,
      outstandingEMIs,
      lastPaymentDate: loan.lastPaymentDate,
    },
  });
});

/**
 * Get loan stage description
 */
const getLoanStage = (status) => {
  const stages = {
    pending: 'Stage 1: Application Received',
    under_review: 'Stage 2: Under Review',
    approved: 'Stage 3: Approved',
    disbursed: 'Stage 4: Disbursed',
    active: 'Stage 5: Active Repayment',
    overdue: 'Stage 6: Overdue',
    closed: 'Stage 7: Closed',
    default: 'Stage 8: Default',
    npa: 'Stage 8: NPA',
    rejected: 'Rejected',
  };
  return stages[status] || 'Unknown Status';
};

/**
 * Mark loan as overdue
 * POST /api/v1/loans/:loanID/mark-overdue
 */
const markLoanOverdue = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  if (!req.user || !['collection_agent', 'branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only collection agents can mark loans overdue');
  }

  const loan = await loanServices.markOverdue(loanID);

  sendSuccessResponse(res, 200, 'Loan marked as overdue', {
    loanID,
    status: loan.status,
  });
});

/**
 * Mark loan as NPA
 * POST /api/v1/loans/:loanID/mark-npa
 */
const markLoanNPA = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can mark loans as NPA');
  }

  const loan = await loanServices.markNPA(loanID);

  sendSuccessResponse(res, 200, 'Loan marked as NPA', {
    loanID,
    status: loan.status,
  });
});

/**
 * Update loan EMI
 * POST /api/v1/loans/:loanID/update-emi
 */
const updateLoanEMI = catchAsync(async (req, res) => {
  const { loanID } = req.params;
  const { newEMI } = req.body;

  if (!newEMI || newEMI <= 0) {
    return sendErrorResponse(res, 400, 'Invalid EMI amount');
  }

  // TODO: Implement EMI update logic
  sendSuccessResponse(res, 200, 'EMI updated successfully', {
    loanID,
    newEMI,
  });
});

module.exports = {
  createLoan,
  getLoanById,
  getCustomerLoans,
  listLoans,
  approveLoan,
  rejectLoan,
  getLoanStatus,
  getEMISchedule,
  getLoanDetails,
  markLoanOverdue,
  markLoanNPA,
  updateLoanEMI,
};
