const { logger } = require('./logger');
const nodemailer = require('nodemailer');

class AlertManager {
  constructor() {
    this.alerts = [];
    this.thresholds = {
      errorRate: 5, // 5% error rate
      responseTime: 2000, // 2 seconds
      memoryUsage: 80, // 80% memory usage
    };
    
    this.transporter = process.env.EMAIL_HOST ? nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }) : null;
  }

  async sendAlert(type, message, details = {}) {
    const alert = {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    this.alerts.push(alert);
    logger.error(`ALERT: ${type}`, { message, details });

    // Send email if configured
    if (this.transporter && process.env.ALERT_EMAIL) {
      try {
        await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: process.env.ALERT_EMAIL,
          subject: `[ALERT] ${type}: ${message}`,
          text: `Alert Type: ${type}\nMessage: ${message}\nDetails: ${JSON.stringify(details, null, 2)}\nTimestamp: ${alert.timestamp}`,
        });
      } catch (error) {
        logger.error('Failed to send alert email', error);
      }
    }

    return alert;
  }

  checkThresholds(metrics) {
    const alerts = [];

    // Check error rate
    const errorRate = parseFloat(metrics.errorRate);
    if (errorRate > this.thresholds.errorRate) {
      alerts.push(this.sendAlert(
        'HIGH_ERROR_RATE',
        `Error rate is ${errorRate}%, exceeding threshold of ${this.thresholds.errorRate}%`,
        { errorRate, threshold: this.thresholds.errorRate }
      ));
    }

    // Check response time
    const avgResponseTime = parseInt(metrics.avgResponseTime);
    if (avgResponseTime > this.thresholds.responseTime) {
      alerts.push(this.sendAlert(
        'SLOW_RESPONSE',
        `Average response time is ${avgResponseTime}ms, exceeding threshold of ${this.thresholds.responseTime}ms`,
        { avgResponseTime, threshold: this.thresholds.responseTime }
      ));
    }

    // Check memory usage
    const memUsage = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (memUsage > this.thresholds.memoryUsage) {
      alerts.push(this.sendAlert(
        'HIGH_MEMORY_USAGE',
        `Memory usage is ${memUsage.toFixed(2)}%, exceeding threshold of ${this.thresholds.memoryUsage}%`,
        { memUsage: memUsage.toFixed(2), threshold: this.thresholds.memoryUsage }
      ));
    }

    return Promise.all(alerts);
  }

  getRecentAlerts(limit = 10) {
    return this.alerts.slice(-limit).reverse();
  }

  clearAlerts() {
    this.alerts = [];
  }
}

module.exports = new AlertManager();
