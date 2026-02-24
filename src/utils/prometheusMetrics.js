const performanceMonitor = require('../middlewares/performanceMonitor');

const generatePrometheusMetrics = () => {
  const metrics = performanceMonitor.getMetrics();
  const memUsage = process.memoryUsage();
  
  return `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.totalRequests}

# HELP http_errors_total Total number of HTTP errors
# TYPE http_errors_total counter
http_errors_total ${metrics.totalErrors}

# HELP http_request_duration_ms Average HTTP request duration in milliseconds
# TYPE http_request_duration_ms gauge
http_request_duration_ms ${parseInt(metrics.avgResponseTime)}

# HELP http_slow_requests_total Total number of slow requests
# TYPE http_slow_requests_total counter
http_slow_requests_total ${metrics.slowRequests}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${Math.floor(metrics.uptime)}

# HELP process_memory_heap_used_bytes Process heap memory used in bytes
# TYPE process_memory_heap_used_bytes gauge
process_memory_heap_used_bytes ${memUsage.heapUsed}

# HELP process_memory_heap_total_bytes Process heap memory total in bytes
# TYPE process_memory_heap_total_bytes gauge
process_memory_heap_total_bytes ${memUsage.heapTotal}

# HELP process_memory_rss_bytes Process resident set size in bytes
# TYPE process_memory_rss_bytes gauge
process_memory_rss_bytes ${memUsage.rss}
`.trim();
};

module.exports = { generatePrometheusMetrics };
