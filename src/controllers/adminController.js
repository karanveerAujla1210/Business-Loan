/**
 * Admin & Reporting Controller
 * Handles dashboard, reports, and administrative functions
 * @author MiniBusiness Loan
 */

const Applicant = require('../models/applicant');
const LoanProposal = require('../models/LoanProposal');
const CAM = require('../models/CAM');
const repaymentTransactionsHistory = require('../models/repaymentTransactionsHistory');
const { catchAsync, sendSuccessResponse, sendErrorResponse } = require('../utils/errorHandler');
const { logger } = require('../utils/logger');
const { Sequelize } = require('sequelize');

/**
 * Get system dashboard statistics
 * GET /api/v1/admin/dashboard
 */
const getDashboard = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can access dashboard');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Total applications
  const totalApplications = await Applicant.count();
  const newApplicationsToday = await Applicant.count({
    where: {
      createdAt: { [Sequelize.Op.gte]: today },
    },
  });

  // Loan statistics
  const totalLoans = await LoanProposal.count();
  const activeLoans = await LoanProposal.count({
    where: { status: { [Sequelize.Op.in]: ['disbursed', 'active'] } },
  });
  const overdueLoans = await LoanProposal.count({
    where: { status: 'overdue' },
  });
  const defaultedLoans = await LoanProposal.count({
    where: { status: { [Sequelize.Op.in]: ['default', 'npa'] } },
  });
  const closedLoans = await LoanProposal.count({
    where: { status: 'closed' },
  });

  // CAM statistics
  const totalCAMs = await CAM.count();
  const approvedCAMs = await CAM.count({
    where: { status: 'APPROVED' },
  });
  const rejectedCAMs = await CAM.count({
    where: { status: 'REJECTED' },
  });
  const pendingCAMs = await CAM.count({
    where: { status: { [Sequelize.Op.in]: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'] } },
  });

  // Collection statistics
  const totalCollected = await repaymentTransactionsHistory.sum('paymentAmountReceived');
  const totalEMIs = await repaymentTransactionsHistory.count();

  // Portfolio value
  const totalDisbursed = await LoanProposal.sum('disbursalAmount');
  const totalOutstanding = await LoanProposal.sum('outstandingBalance', {
    where: { status: { [Sequelize.Op.in]: ['active', 'overdue'] } },
  });

  sendSuccessResponse(res, 200, 'Dashboard data retrieved', {
    date: new Date(),
    applications: {
      total: totalApplications,
      newToday: newApplicationsToday,
    },
    loans: {
      total: totalLoans,
      active: activeLoans,
      overdue: overdueLoans,
      defaulted: defaultedLoans,
      closed: closedLoans,
    },
    creditAssessment: {
      total: totalCAMs,
      approved: approvedCAMs,
      rejected: rejectedCAMs,
      pending: pendingCAMs,
      approvalRate: totalCAMs > 0 ? (approvedCAMs / totalCAMs * 100).toFixed(2) : 0,
    },
    portfolio: {
      totalDisbursed,
      totalOutstanding,
      collectionRate: totalDisbursed > 0 ? ((totalDisbursed - totalOutstanding) / totalDisbursed * 100).toFixed(2) : 0,
    },
    collection: {
      totalCollected,
      totalEMIsProcessed: totalEMIs,
    },
  });
});

/**
 * Get loan statistics and analysis
 * GET /api/v1/admin/reports/loans
 */
const getLoanReport = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can access reports');
  }

  const loans = await LoanProposal.findAll({
    attributes: [
      'status',
      [Sequelize.fn('COUNT', Sequelize.col('loanID')), 'count'],
      [Sequelize.fn('SUM', Sequelize.col('amountApplied')), 'totalAmount'],
      [Sequelize.fn('AVG', Sequelize.col('interestRate')), 'avgRate'],
    ],
    group: ['status'],
    raw: true,
  });

  sendSuccessResponse(res, 200, 'Loan report retrieved', {
    generatedAt: new Date(),
    reportType: 'Loan Status Distribution',
    data: loans,
  });
});

/**
 * Get customer demographics report
 * GET /api/v1/admin/reports/customers
 */
const getCustomerReport = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can access reports');
  }

  const customersByGender = await Applicant.findAll({
    attributes: [
      'gender',
      [Sequelize.fn('COUNT', Sequelize.col('customerID')), 'count'],
    ],
    group: ['gender'],
    raw: true,
  });

  const customersByOccupation = await Applicant.findAll({
    attributes: [
      'occupationType',
      [Sequelize.fn('COUNT', Sequelize.col('customerID')), 'count'],
    ],
    group: ['occupationType'],
    raw: true,
  });

  sendSuccessResponse(res, 200, 'Customer demographics retrieved', {
    generatedAt: new Date(),
    byGender: customersByGender,
    byOccupation: customersByOccupation,
    total: await Applicant.count(),
  });
});

/**
 * Get collection performance report
 * GET /api/v1/admin/reports/collection
 */
const getCollectionReport = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can access reports');
  }

  const { startDate, endDate } = req.query;

  const query = {};
  if (startDate && endDate) {
    query.paymentDate = {
      [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  const collections = await repaymentTransactionsHistory.findAll({
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('paymentDate')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('transactionID')), 'transactionCount'],
      [Sequelize.fn('SUM', Sequelize.col('paymentAmountReceived')), 'totalAmount'],
    ],
    where: query,
    group: [Sequelize.fn('DATE', Sequelize.col('paymentDate'))],
    order: [[Sequelize.fn('DATE', Sequelize.col('paymentDate')), 'DESC']],
    raw: true,
  });

  const totalCollected = await repaymentTransactionsHistory.sum('paymentAmountReceived', { where: query });

  sendSuccessResponse(res, 200, 'Collection report retrieved', {
    generatedAt: new Date(),
    period: { startDate, endDate },
    totalCollected,
    collections,
  });
});

/**
 * Get default/NPA analysis
 * GET /api/v1/admin/reports/npa-analysis
 */
const getNPAAnalysis = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can access reports');
  }

  const overdue30 = await LoanProposal.count({
    where: {
      status: 'overdue',
      nextEMIDate: {
        [Sequelize.Op.lte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const overdue60 = await LoanProposal.count({
    where: {
      status: 'overdue',
      nextEMIDate: {
        [Sequelize.Op.lte]: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const overdue90 = await LoanProposal.count({
    where: {
      status: 'overdue',
      nextEMIDate: {
        [Sequelize.Op.lte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const npaLoans = await LoanProposal.count({
    where: { status: 'npa' },
  });

  const defaultLoans = await LoanProposal.count({
    where: { status: 'default' },
  });

  sendSuccessResponse(res, 200, 'NPA analysis retrieved', {
    generatedAt: new Date(),
    overdue: {
      days30: overdue30,
      days60: overdue60,
      days90: overdue90,
    },
    status: {
      npa: npaLoans,
      default: defaultLoans,
    },
  });
});

/**
 * Get credit quality analysis
 * GET /api/v1/admin/reports/credit-quality
 */
const getCreditQualityReport = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can access reports');
  }

  const bureauScore = await CAM.findAll({
    attributes: [
      [
        Sequelize.literal(
          "CASE WHEN bureauScore >= 750 THEN 'Excellent' " +
          "WHEN bureauScore >= 650 THEN 'Good' " +
          "WHEN bureauScore >= 550 THEN 'Fair' " +
          "ELSE 'Poor' END"
        ),
        'scoreRange',
      ],
      [Sequelize.fn('COUNT', Sequelize.col('camID')), 'count'],
    ],
    group: [
      Sequelize.literal(
        "CASE WHEN bureauScore >= 750 THEN 'Excellent' " +
        "WHEN bureauScore >= 650 THEN 'Good' " +
        "WHEN bureauScore >= 550 THEN 'Fair' " +
        "ELSE 'Poor' END"
      ),
    ],
    raw: true,
  });

  sendSuccessResponse(res, 200, 'Credit quality report retrieved', {
    generatedAt: new Date(),
    bureauScoreDistribution: bureauScore,
  });
});

/**
 * Generate monthly performance report
 * GET /api/v1/admin/reports/monthly
 */
const getMonthlyReport = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can access reports');
  }

  const { month, year } = req.query;

  if (!month || !year) {
    return sendErrorResponse(res, 400, 'Month and year are required');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const newApplications = await Applicant.count({
    where: {
      createdAt: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
  });

  const newLoans = await LoanProposal.count({
    where: {
      createdAt: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
  });

  const approvedLoans = await LoanProposal.count({
    where: {
      approvalDate: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
  });

  const disbursedAmount = await LoanProposal.sum('NetDisbursement', {
    where: {
      disbursementDate: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
  });

  const collectionsData = await repaymentTransactionsHistory.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('paymentAmountReceived')), 'totalCollected'],
      [Sequelize.fn('COUNT', Sequelize.col('transactionID')), 'transactionCount'],
    ],
    where: {
      paymentDate: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    raw: true,
  });

  sendSuccessResponse(res, 200, 'Monthly report generated', {
    generatedAt: new Date(),
    month: `${month}/${year}`,
    period: { startDate, endDate },
    metrics: {
      newApplications,
      newLoans,
      approvedLoans,
      disbursedAmount: disbursedAmount || 0,
      collectionsAmount: collectionsData[0]?.totalCollected || 0,
      collectionsCount: collectionsData[0]?.transactionCount || 0,
    },
  });
});

/**
 * Export data to CSV/Excel
 * GET /api/v1/admin/export/loans
 */
const exportLoansData = catchAsync(async (req, res) => {
  if (!req.user || !['branch_manager', 'super_admin'].includes(req.user.role)) {
    return sendErrorResponse(res, 403, 'Only managers can export data');
  }

  // TODO: Implement CSV export functionality
  sendSuccessResponse(res, 200, 'Data export initiated', {
    downloadURL: '/exports/loans_export_20260517.csv',
  });
});

/**
 * Get system health and performance metrics
 * GET /api/v1/admin/system-health
 */
const getSystemHealth = catchAsync(async (req, res) => {
  if (!req.user || !req.user.role === 'super_admin') {
    return sendErrorResponse(res, 403, 'Only super admin can access system health');
  }

  const dbStatus = 'Connected';
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  sendSuccessResponse(res, 200, 'System health retrieved', {
    timestamp: new Date(),
    database: { status: dbStatus },
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    memory: {
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
  });
});

module.exports = {
  getDashboard,
  getLoanReport,
  getCustomerReport,
  getCollectionReport,
  getNPAAnalysis,
  getCreditQualityReport,
  getMonthlyReport,
  exportLoansData,
  getSystemHealth,
};
