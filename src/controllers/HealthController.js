const { sequelize } = require('../config/database');
const { logger } = require('../utils/logger');

const healthCheck = async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Database check
    await sequelize.authenticate();
    healthcheck.checks.database = 'connected';
  } catch (error) {
    healthcheck.checks.database = 'disconnected';
    healthcheck.message = 'DEGRADED';
    logger.error('Health check - Database connection failed', error);
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  healthcheck.checks.memory = memUsageMB;

  const statusCode = healthcheck.message === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthcheck);
};

module.exports = { healthCheck };
