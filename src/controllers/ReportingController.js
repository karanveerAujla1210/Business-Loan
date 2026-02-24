const reportingService = require('../services/reportingService');
const { logger } = require('../utils/logger');
const { catchAsync } = require('../middlewares/errorHandler');

const getDailyReport = catchAsync(async (req, res) => {
  const { date } = req.query;
  const reportDate = date || new Date().toISOString().split('T')[0];

  const report = await reportingService.getDailyReport(reportDate);

  res.json({
    status: true,
    data: report,
    api_version: '1.0',
  });
});

const getLoanStatistics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const stats = await reportingService.getLoanStatistics(
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.json({
    status: true,
    data: stats,
    api_version: '1.0',
  });
});

const getRepaymentStatistics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const stats = await reportingService.getRepaymentStatistics(
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate || new Date()
  );

  res.json({
    status: true,
    data: stats,
    api_version: '1.0',
  });
});

const getCustomerStatistics = catchAsync(async (req, res) => {
  const stats = await reportingService.getCustomerStatistics();

  res.json({
    status: true,
    data: stats,
    api_version: '1.0',
  });
});

module.exports = {
  getDailyReport,
  getLoanStatistics,
  getRepaymentStatistics,
  getCustomerStatistics,
};
