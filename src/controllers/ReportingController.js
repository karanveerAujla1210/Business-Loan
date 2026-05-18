const reportingService = require('../services/reportingService');
const { catchAsync } = require('../middlewares/errorHandler');
const { AppError } = require('../middlewares/errorHandler');

const parseDate = (value, fieldName) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
  return parsed;
};

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
  const parsedStart = parseDate(startDate, 'startDate');
  const parsedEnd = parseDate(endDate, 'endDate');

  const stats = await reportingService.getLoanStatistics(
    parsedStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    parsedEnd || new Date()
  );

  res.json({
    status: true,
    data: stats,
    api_version: '1.0',
  });
});

const getRepaymentStatistics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const parsedStart = parseDate(startDate, 'startDate');
  const parsedEnd = parseDate(endDate, 'endDate');

  const stats = await reportingService.getRepaymentStatistics(
    parsedStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    parsedEnd || new Date()
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
