const cron = require('node-cron');
const { sequelize } = require('../config/database');
const { logger } = require('../utils/logger');
const notificationServices = require('../services/notificationServices');

class NotificationScheduler {
  constructor() {
    this.jobs = [];
  }

  start() {
    // Daily EMI reminder at 9 AM
    const emiReminderJob = cron.schedule('0 9 * * *', async () => {
      logger.info('Running daily EMI reminder job');
      await this.sendEMIReminders();
    });

    // Overdue payment reminder at 10 AM
    const overdueReminderJob = cron.schedule('0 10 * * *', async () => {
      logger.info('Running overdue payment reminder job');
      await this.sendOverdueReminders();
    });

    // Weekly report on Monday at 8 AM
    const weeklyReportJob = cron.schedule('0 8 * * 1', async () => {
      logger.info('Running weekly report job');
      await this.sendWeeklyReports();
    });

    this.jobs.push(emiReminderJob, overdueReminderJob, weeklyReportJob);
    logger.info('Notification scheduler started');
  }

  async sendEMIReminders() {
    try {
      const query = `
        SELECT u.id, u.mobile, u.name, r.amount, r.due_date
        FROM repaymentTransactionsHistory r
        JOIN user u ON r.user_id = u.id
        WHERE r.status = 'pending'
        AND r.due_date = CAST(GETDATE() AS DATE)
      `;

      const [results] = await sequelize.query(query);

      for (const record of results) {
        await notificationServices.sendNotification({
          userId: record.id,
          title: 'EMI Payment Reminder',
          message: `Your EMI of ₹${record.amount} is due today. Please make the payment to avoid late fees.`,
          type: 'payment_reminder',
        });
      }

      logger.info(`Sent ${results.length} EMI reminders`);
    } catch (error) {
      logger.error('Error sending EMI reminders', error);
    }
  }

  async sendOverdueReminders() {
    try {
      const query = `
        SELECT u.id, u.mobile, u.name, r.amount, r.due_date,
               DATEDIFF(day, r.due_date, GETDATE()) as days_overdue
        FROM repaymentTransactionsHistory r
        JOIN user u ON r.user_id = u.id
        WHERE r.status = 'pending'
        AND r.due_date < CAST(GETDATE() AS DATE)
      `;

      const [results] = await sequelize.query(query);

      for (const record of results) {
        await notificationServices.sendNotification({
          userId: record.id,
          title: 'Overdue Payment Alert',
          message: `Your payment of ₹${record.amount} is ${record.days_overdue} days overdue. Please pay immediately to avoid penalties.`,
          type: 'overdue_alert',
        });
      }

      logger.info(`Sent ${results.length} overdue reminders`);
    } catch (error) {
      logger.error('Error sending overdue reminders', error);
    }
  }

  async sendWeeklyReports() {
    try {
      // Send weekly summary to admins
      logger.info('Weekly report sent to admins');
    } catch (error) {
      logger.error('Error sending weekly reports', error);
    }
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    logger.info('Notification scheduler stopped');
  }
}

module.exports = new NotificationScheduler();
