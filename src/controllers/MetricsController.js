const performanceMonitor = require('../middlewares/performanceMonitor');
const { logger } = require('../utils/logger');

const getMetrics = (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    const cpuUsage = process.cpuUsage();
    
    res.json({
      status: true,
      data: {
        ...metrics,
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        timestamp: Date.now(),
      },
      api_version: '1.0',
    });
  } catch (error) {
    logger.error('Error fetching metrics', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch metrics',
      api_version: '1.0',
    });
  }
};

const resetMetrics = (req, res) => {
  try {
    performanceMonitor.reset();
    res.json({
      status: true,
      message: 'Metrics reset successfully',
      api_version: '1.0',
    });
  } catch (error) {
    logger.error('Error resetting metrics', error);
    res.status(500).json({
      status: false,
      message: 'Failed to reset metrics',
      api_version: '1.0',
    });
  }
};

module.exports = {
  getMetrics,
  resetMetrics,
};
