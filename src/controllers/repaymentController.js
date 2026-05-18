/**
 * Repayment/Payment Controller
 * Handles payment processing and collection endpoints
 * @author MiniBusiness Loan
 */

const repaymentServices = require('../services/repaymentServices');
const loanServices = require('../services/loanServices');
const LoanProposal = require('../models/LoanProposal');
const Applicant = require('../models/applicant');
const { catchAsync, sendSuccessResponse, sendErrorResponse } = require('../utils/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Process EMI payment
 * POST /api/v1/payments/process
 */
const processPayment = catchAsync(async (req, res) => {
  const paymentData = req.validatedData;

  const result = await repaymentServices.processPayment(paymentData);

  // TODO: Send payment receipt to customer
  // TODO: Send collection confirmation to agent

  sendSuccessResponse(res, 200, 'Payment processed successfully', {
    transactionID: result.transaction.transactionID,
    loanID: result.transaction.loanID,
    amountReceived: result.transaction.paymentAmountReceived,
    lateCharges: result.transaction.lateCharges,
    totalAmount: result.transaction.totalAmount,
    outstandingBalance: result.loan.outstandingBalance,
    nextEMIDate: result.loan.nextEMIDate,
    status: result.transaction.status,
  });
});

/**
 * Get payment history for a loan
 * GET /api/v1/payments/loan/:loanID/history
 */
const getPaymentHistory = catchAsync(async (req, res) => {
  const { loanID } = req.params;
  const { page = 1, limit = 20 } = req.validatedQuery;
  const offset = (page - 1) * limit;

  const result = await repaymentServices.getPaymentHistory(loanID, limit, offset);

  sendSuccessResponse(res, 200, 'Payment history retrieved', {
    loanID,
    total: result.total,
    page: result.page,
    pages: result.pages,
    transactions: result.transactions,
  });
});

/**
 * Get customer payment history
 * GET /api/v1/payments/customer/:customerID/history
 */
const getCustomerPaymentHistory = catchAsync(async (req, res) => {
  const { customerID } = req.params;
  const { page = 1, limit = 20 } = req.validatedQuery;
  const offset = (page - 1) * limit;

  const result = await repaymentServices.getCustomerPaymentHistory(customerID, limit, offset);

  sendSuccessResponse(res, 200, 'Customer payment history retrieved', {
    customerID,
    total: result.total,
    page: result.page,
    pages: result.pages,
    transactions: result.transactions,
  });
});

/**
 * Get total paid for loan
 * GET /api/v1/payments/loan/:loanID/total-paid
 */
const getTotalPaid = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  const totalPaid = await repaymentServices.getTotalPaidAmount(loanID);

  sendSuccessResponse(res, 200, 'Total paid amount retrieved', {
    loanID,
    totalPaid,
  });
});

/**
 * Get outstanding EMI count
 * GET /api/v1/payments/loan/:loanID/outstanding-emis
 */
const getOutstandingEMIs = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  const outstandingCount = await repaymentServices.getOutstandingEMICount(loanID);

  sendSuccessResponse(res, 200, 'Outstanding EMI count retrieved', {
    loanID,
    outstandingEMICount: outstandingCount,
  });
});

/**
 * Get collection agent statistics
 * GET /api/v1/payments/agent/:agentID/statistics
 */
const getAgentStatistics = catchAsync(async (req, res) => {
  const { agentID } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return sendErrorResponse(res, 400, 'Start date and end date are required');
  }

  const stats = await repaymentServices.getAgentRepaymentStats(
    agentID,
    new Date(startDate),
    new Date(endDate)
  );

  sendSuccessResponse(res, 200, 'Agent statistics retrieved', {
    agentID,
    period: { startDate, endDate },
    ...stats,
  });
});

/**
 * Get overdue loans for collection
 * GET /api/v1/payments/overdue-loans
 */
const getOverdueLoans = catchAsync(async (req, res) => {
  const { page = 1, limit = 50 } = req.validatedQuery;
  const offset = (page - 1) * limit;

  const result = await repaymentServices.getOverdueLoans(limit, offset);

  // Enrich with applicant details
  const enrich = await Promise.all(
    result.overdueLoans.map(async (loan) => {
      const applicant = await Applicant.findOne({
        where: { customerID: loan.customerID },
        attributes: ['firstName', 'phoneNumber'],
      });
      return {
        ...loan.toJSON(),
        applicantName: applicant?.firstName,
        applicantPhone: applicant?.phoneNumber,
      };
    })
  );

  sendSuccessResponse(res, 200, 'Overdue loans retrieved', {
    total: result.total,
    page: result.page,
    pages: result.pages,
    overdueLoans: enrich,
  });
});

/**
 * Generate payment receipt
 * GET /api/v1/payments/receipt/:transactionID
 */
const getPaymentReceipt = catchAsync(async (req, res) => {
  const { transactionID } = req.params;

  // TODO: Implement receipt generation from transaction history
  sendSuccessResponse(res, 200, 'Payment receipt retrieved', {
    transactionID,
    receiptURL: '/receipts/' + transactionID + '.pdf',
  });
});

/**
 * Create payment link for QR code
 * POST /api/v1/payments/create-link
 */
const createPaymentLink = catchAsync(async (req, res) => {
  const { loanID, amount } = req.body;

  if (!loanID || !amount) {
    return sendErrorResponse(res, 400, 'Loan ID and amount are required');
  }

  const loan = await LoanProposal.findOne({ where: { loanID } });
  if (!loan) {
    return sendErrorResponse(res, 404, 'Loan not found');
  }

  // TODO: Create Razorpay payment link
  const paymentLink = {
    loanID,
    amount,
    shortURL: 'https://rzp.io/link/XXXXX', // Placeholder
    qrCode: 'data:image/png;base64,...', // Placeholder
  };

  sendSuccessResponse(res, 201, 'Payment link created', paymentLink);
});

/**
 * Get loan payment status
 * GET /api/v1/payments/loan/:loanID/status
 */
const getLoanPaymentStatus = catchAsync(async (req, res) => {
  const { loanID } = req.params;

  const loan = await loanServices.getLoanById(loanID);

  const totalPaid = await repaymentServices.getTotalPaidAmount(loanID);
  const outstandingEMIs = await repaymentServices.getOutstandingEMICount(loanID);

  sendSuccessResponse(res, 200, 'Loan payment status retrieved', {
    loanID,
    totalDue: loan.amountApplied,
    totalPaid,
    outstandingBalance: loan.outstandingBalance,
    nextEMIDate: loan.nextEMIDate,
    nextEMIAmount: loan.EMI,
    outstandingEMICount: outstandingEMIs,
    paymentStatus: loan.status,
    daysOverdue: this.calculateDaysOverdue(loan.nextEMIDate),
  });
});

/**
 * Calculate days overdue
 */
const calculateDaysOverdue = (nextEMIDate) => {
  if (!nextEMIDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextEMIDate);
  dueDate.setHours(0, 0, 0, 0);
  const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysOverdue);
};

/**
 * Get collection dashboard data
 * GET /api/v1/payments/collection/dashboard
 */
const getCollectionDashboard = catchAsync(async (req, res) => {
  // TODO: Implement comprehensive collection dashboard
  // Including: Collection efficiency, pending collections, overdue analysis, agent performance
  
  sendSuccessResponse(res, 200, 'Collection dashboard retrieved', {
    totalLoans: 0,
    activeLoans: 0,
    overdueLoans: 0,
    defaultedLoans: 0,
    collectionRate: 0,
    totalCollected: 0,
  });
});

module.exports = {
  processPayment,
  getPaymentHistory,
  getCustomerPaymentHistory,
  getTotalPaid,
  getOutstandingEMIs,
  getAgentStatistics,
  getOverdueLoans,
  getPaymentReceipt,
  createPaymentLink,
  getLoanPaymentStatus,
  getCollectionDashboard,
};
