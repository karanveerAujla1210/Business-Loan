const { sequelize } = require('../config/database');
const { logger } = require('../utils/logger');

class ReportingService {
  async getLoanStatistics(startDate, endDate) {
    try {
      const query = `
        SELECT 
          COUNT(*) as totalApplications,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedCount,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedCount,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCount,
          AVG(CASE WHEN status = 'approved' THEN loan_amount ELSE NULL END) as avgLoanAmount,
          SUM(CASE WHEN status = 'approved' THEN loan_amount ELSE 0 END) as totalDisbursed
        FROM applicants
        WHERE created_at BETWEEN :startDate AND :endDate
      `;

      const [results] = await sequelize.query(query, {
        replacements: { startDate, endDate },
      });

      return results[0];
    } catch (error) {
      logger.error('Error fetching loan statistics', error);
      throw error;
    }
  }

  async getRepaymentStatistics(startDate, endDate) {
    try {
      const query = `
        SELECT 
          COUNT(*) as totalPayments,
          SUM(amount) as totalCollected,
          SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as successfulPayments,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedPayments,
          AVG(amount) as avgPaymentAmount
        FROM repaymentTransactionsHistory
        WHERE created_at BETWEEN :startDate AND :endDate
      `;

      const [results] = await sequelize.query(query, {
        replacements: { startDate, endDate },
      });

      return results[0];
    } catch (error) {
      logger.error('Error fetching repayment statistics', error);
      throw error;
    }
  }

  async getCustomerStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as totalCustomers,
          COUNT(CASE WHEN created_at >= DATEADD(day, -30, GETDATE()) THEN 1 END) as newCustomers,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as activeCustomers
        FROM user
      `;

      const [results] = await sequelize.query(query);
      return results[0];
    } catch (error) {
      logger.error('Error fetching customer statistics', error);
      throw error;
    }
  }

  async getDailyReport(date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const [loanStats, repaymentStats, customerStats] = await Promise.all([
      this.getLoanStatistics(startDate, endDate),
      this.getRepaymentStatistics(startDate, endDate),
      this.getCustomerStatistics(),
    ]);

    return {
      date: date,
      loans: loanStats,
      repayments: repaymentStats,
      customers: customerStats,
    };
  }
}

module.exports = new ReportingService();
