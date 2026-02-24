const { logger } = require('./logger');

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  cacheMiddleware(duration = 300000) {
    return (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = req.originalUrl;
      const cached = this.cache.get(key);

      if (cached && Date.now() - cached.timestamp < duration) {
        logger.debug('Cache hit', { url: key });
        return res.json(cached.data);
      }

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        this.cache.set(key, { data, timestamp: Date.now() });
        return originalJson(data);
      };

      next();
    };
  }

  clearCache(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    logger.info('Cache cleared', { pattern });
  }

  async batchProcess(items, processor, batchSize = 100) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    return results;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async measurePerformance(name, fn) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      logger.info('Performance measurement', { name, duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Performance measurement failed', { name, duration: `${duration}ms`, error });
      throw error;
    }
  }
}

module.exports = new PerformanceOptimizer();
