const { logger } = require('../utils/logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowRequests: 0,
    };
    this.slowRequestThreshold = 1000; // 1 second
  }

  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      this.metrics.requests++;

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.metrics.totalResponseTime += duration;

        if (duration > this.slowRequestThreshold) {
          this.metrics.slowRequests++;
          logger.warn('Slow request detected', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            statusCode: res.statusCode,
          });
        }

        if (res.statusCode >= 500) {
          this.metrics.errors++;
        }
      });

      next();
    };
  }

  getMetrics() {
    const avgResponseTime = this.metrics.requests > 0
      ? Math.round(this.metrics.totalResponseTime / this.metrics.requests)
      : 0;

    return {
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      errorRate: this.metrics.requests > 0
        ? ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%'
        : '0%',
      avgResponseTime: `${avgResponseTime}ms`,
      slowRequests: this.metrics.slowRequests,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowRequests: 0,
    };
  }
}

module.exports = new PerformanceMonitor();
