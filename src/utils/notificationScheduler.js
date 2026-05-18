/**
 * EMI Reminder and Overdue Scheduler
 * Runs automated jobs for EMI reminders and overdue tracking
 * @author MiniBusiness Loan
 */

const cron = require('node-cron');
const { Op } = require('sequelize');
const { logger } = require('./logger');
const LoanProposal = require('../models/LoanProposal');
const Applicant = require('../models/applicant');

class NotificationScheduler {
  constructor() {
    this.jobs = [];
    this.initialized = false;
  }

  /**
   * Calculate days between two dates
   */
  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.floor((Math.abs(date2 - date1)) / oneDay);
  }

  /**
   * Add days to date
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    try {
      if (this.initialized) {
        logger.warn('NotificationScheduler already initialized');
        return;
      }

      // EMI Reminder: Run daily at 8 AM
      const emiReminderJob = cron.schedule('0 8 * * *', async () => {
        logger.info('Running daily EMI reminder job');
        await this.sendEMIReminders();
      });

      // Overdue Check: Run daily at 9 AM
      const overdueCheckJob = cron.schedule('0 9 * * *', async () => {
        logger.info('Running overdue check job');
        await this.checkOverdueLoans();
      });

      // Weekly report on Monday at 8 AM
      const weeklyReportJob = cron.schedule('0 8 * * 1', async () => {
        logger.info('Running weekly report job');
        await this.sendWeeklyReports();
      });

      this.jobs.push(emiReminderJob, overdueCheckJob, weeklyReportJob);
      this.initialized = true;
      logger.info('Notification scheduler started with 3 jobs');
    } catch (error) {
      logger.error('Failed to start notification scheduler', { error: error.message });
    }
  }

  /**
   * Send EMI reminders for loans due tomorrow
   */
  async sendEMIReminders() {
    try {
      logger.info('[SCHEDULER] Running EMI reminder job');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = this.addDays(today, 1);
      const nextDay = this.addDays(tomorrow, 1);

      // Find loans where nextEMIDate = tomorrow
      const loans = await LoanProposal.findAll({
        where: {
          status: { [Op.in]: [0, 'active'] },
          nextEMIDate: {
            [Op.gte]: tomorrow,
            [Op.lt]: nextDay,
          },
        },
        raw: true,
      });

      logger.info(`[SCHEDULER] Found ${loans.length} loans with EMI due tomorrow`);

      for (const loan of loans) {
        try {
          const applicant = await Applicant.findOne({
            where: { customerID: loan.customerID },
            attributes: ['customerID', 'firstName', 'lastName', 'emailID', 'phoneNumber', 'name'],
            raw: true,
          });

          if (!applicant) {
            logger.warn(`Applicant not found for customerID: ${loan.customerID}`);
            continue;
          }

          const emiAmount = loan.EMI;
          const dueDate = new Date(loan.nextEMIDate).toLocaleDateString();
          const lateCharges = (emiAmount * 0.02).toFixed(2);

          logger.info(`Sending EMI reminder for ${applicant.phoneNumber}`, { loanID: loan.loanID, emiAmount });

          // TODO: Implement push notification service
          // TODO: Implement email service
          // TODO: Implement SMS service
        } catch (error) {
          logger.error('Error processing loan EMI reminder', { loanID: loan.loanID, error: error.message });
        }
      }

      logger.info(`[SCHEDULER] EMI reminder job completed. Processed ${loans.length} loans`);
    } catch (error) {
      logger.error('[SCHEDULER] EMI reminder job failed', { error: error.message });
    }
  }

  /**
   * Check for overdue loans and update status
   */
  async checkOverdueLoans() {
    try {
      logger.info('[SCHEDULER] Running overdue check job');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find overdue loans
      const overdueLoans = await LoanProposal.findAll({
        where: {
          status: { [Op.in]: [0, 'active'] },
          nextEMIDate: {
            [Op.lt]: today,
          },
        },
        raw: true,
      });

      logger.info(`[SCHEDULER] Found ${overdueLoans.length} overdue loans`);

      for (const loan of overdueLoans) {
        try {
          const daysOverdue = this.daysBetween(new Date(loan.nextEMIDate), today);

          // Update loan status based on overdue days
          let newStatus = 'overdue';
          if (daysOverdue >= 90) {
            newStatus = 'npa'; // Non-Performing Asset
          }

          await LoanProposal.update(
            { status: newStatus },
            { where: { loanID: loan.loanID } }
          );

          // Calculate late charges (2% per day)
          const lateCharges = loan.lateCharges ? parseFloat(loan.lateCharges) + (loan.EMI * 0.02 * daysOverdue) : (loan.EMI * 0.02 * daysOverdue);
          await LoanProposal.update(
            { lateCharges },
            { where: { loanID: loan.loanID } }
          );

          logger.info(`Updated loan status to ${newStatus}`, { loanID: loan.loanID, daysOverdue, lateCharges });
        } catch (error) {
          logger.error('Error processing overdue loan', { loanID: loan.loanID, error: error.message });
        }
      }

      logger.info(`[SCHEDULER] Overdue check job completed. Processed ${overdueLoans.length} loans`);
    } catch (error) {
      logger.error('[SCHEDULER] Overdue check job failed', { error: error.message });
    }
  }

  /**
   * Send weekly reports
   */
  async sendWeeklyReports() {
    try {
      logger.info('[SCHEDULER] Running weekly report job');

      // TODO: Implement weekly reporting
      logger.info('[SCHEDULER] Weekly report job completed');
    } catch (error) {
      logger.error('[SCHEDULER] Weekly report job failed', { error: error.message });
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    for (const job of this.jobs) {
      if (job) {
        job.stop();
      }
    }
    this.jobs = [];
    this.initialized = false;
    logger.info('NotificationScheduler stopped');
  }
}

module.exports = new NotificationScheduler();
