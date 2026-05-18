/**
 * Repayment Service
 * Handles EMI payment processing and collection
 * @author MiniBusiness Loan
 */

const repaymentTransactionsHistory = require('../models/repaymentTransactionsHistory');
const LoanProposal = require('../models/LoanProposal');
const Applicant = require('../models/applicant');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class RepaymentService {
  /**
   * Process EMI payment
   */
  async processPayment(paymentData) {
    try {
      const {
        loanID,
        customerID,
        amount,
        paymentMode,
        razorpayOrderID,
        razorpayPaymentID,
        razorpaySignature,
        collectedBy,
      } = paymentData;

      // Get loan details
      const loan = await LoanProposal.findOne({ where: { loanID } });
      if (!loan) {
        throw new Error('Loan not found');
      }

      // Verify loan belongs to customer
      if (loan.customerID !== customerID) {
        throw new Error('Loan does not belong to this customer');
      }

      // Calculate late charges if applicable
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextEMIDate = new Date(loan.nextEMIDate);
      nextEMIDate.setHours(0, 0, 0, 0);
      
      let lateCharges = 0;
      if (today > nextEMIDate) {
        const daysOverdue = Math.floor((today - nextEMIDate) / (1000 * 60 * 60 * 24));
        lateCharges = loan.EMI * 0.02 * daysOverdue; // 2% per day
      }

      const totalAmount = amount + lateCharges;

      // Create transaction record
      const transaction = await repaymentTransactionsHistory.create({
        transactionID: `TXN-${Date.now()}-${uuidv4()}`,
        customerID,
        loanID,
        razorpayCustID: loan.razorpayCustID,
        amount: amount,
        paymentAmountReceived: amount,
        lateCharges: lateCharges,
        totalAmount: totalAmount,
        status: 'completed',
        type: 'credit',
        entity: 'EMI',
        fixedAmount: loan.EMI,
        paymentMode: paymentMode,
        razorpayOrderID: razorpayOrderID,
        razorpayPaymentID: razorpayPaymentID,
        razorpaySignature: razorpaySignature,
        collectedBy: collectedBy,
        description: `EMI Payment for Loan ${loanID}`,
      });

      logger.info('Payment transaction created', { transactionID: transaction.transactionID });

      // Update loan details
      await LoanProposal.update(
        {
          outstandingBalance: loan.outstandingBalance - amount,
          emisPaid: (loan.emisPaid || 0) + 1,
          lastPaymentDate: new Date(),
          lastPaymentAmount: amount,
          nextEMIDate: this.addMonthsToDate(loan.nextEMIDate, 1),
          status: loan.outstandingBalance - amount <= 0 ? 'closed' : 'active',
          lateCharges: (loan.lateCharges || 0) + lateCharges,
        },
        { where: { loanID } }
      );

      logger.info('Loan updated post payment', { loanID, outstandingBalance: loan.outstandingBalance - amount });

      // Get updated loan
      const updatedLoan = await LoanProposal.findOne({ where: { loanID } });
      return {
        transaction,
        loan: updatedLoan,
      };
    } catch (error) {
      logger.error('Failed to process payment', { error: error.message });
      throw error;
    }
  }

  /**
   * Create payment schedule
   */
  async createPaymentSchedule(loanID, tenure, emiAmount) {
    try {
      const loan = await LoanProposal.findOne({ where: { loanID } });
      if (!loan) {
        throw new Error('Loan not found');
      }

      const schedule = [];
      let currentDate = new Date(loan.firstDateofInstallment || new Date());
      let outstandingBalance = loan.amountApplied;

      for (let i = 1; i <= tenure; i++) {
        const interest = outstandingBalance * (loan.interestRate / 100) / 12;
        const principal = emiAmount - interest;
        outstandingBalance -= principal;

        schedule.push({
          emiNumber: i,
          dueDate: new Date(currentDate),
          principalAmount: Math.round(principal * 100) / 100,
          interestAmount: Math.round(interest * 100) / 100,
          emiAmount: emiAmount,
          outstandingBalance: Math.max(0, Math.round(outstandingBalance * 100) / 100),
          status: 'pending',
          paid: false,
        });

        currentDate = this.addMonthsToDate(currentDate, 1);
      }

      logger.info('Payment schedule created', { loanID, totalEMIs: schedule.length });
      return schedule;
    } catch (error) {
      logger.error('Failed to create payment schedule', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Get payment history for a loan
   */
  async getPaymentHistory(loanID, limit = 50, offset = 0) {
    try {
      const { count, rows } = await repaymentTransactionsHistory.findAndCountAll({
        where: { loanID },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        total: count,
        transactions: rows,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Failed to get payment history', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Get payment history for a customer
   */
  async getCustomerPaymentHistory(customerID, limit = 50, offset = 0) {
    try {
      const { count, rows } = await repaymentTransactionsHistory.findAndCountAll({
        where: { customerID },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        total: count,
        transactions: rows,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Failed to get customer payment history', { customerID, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate total paid amount for a loan
   */
  async getTotalPaidAmount(loanID) {
    try {
      const result = await repaymentTransactionsHistory.sum('paymentAmountReceived', {
        where: { loanID, status: 'completed' },
      });

      return result || 0;
    } catch (error) {
      logger.error('Failed to calculate total paid', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Get outstanding EMI count
   */
  async getOutstandingEMICount(loanID) {
    try {
      const loan = await LoanProposal.findOne({ where: { loanID } });
      if (!loan) {
        throw new Error('Loan not found');
      }

      return Math.ceil(loan.outstandingBalance / loan.EMI);
    } catch (error) {
      logger.error('Failed to get outstanding EMI count', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Add months to date
   */
  addMonthsToDate(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Get repayment statistics for collection agent
   */
  async getAgentRepaymentStats(collectionAgentID, startDate, endDate) {
    try {
      const transactions = await repaymentTransactionsHistory.findAll({
        where: {
          collectedBy: collectionAgentID,
          createdAt: {
            [require('sequelize').Op.between]: [startDate, endDate],
          },
        },
      });

      const stats = {
        totalCollected: 0,
        totalTransactions: transactions.length,
        totalLateCharges: 0,
        averagePaymentAmount: 0,
      };

      transactions.forEach((txn) => {
        stats.totalCollected += txn.paymentAmountReceived;
        stats.totalLateCharges += txn.lateCharges || 0;
      });

      stats.averagePaymentAmount = stats.totalTransactions > 0 
        ? stats.totalCollected / stats.totalTransactions 
        : 0;

      return stats;
    } catch (error) {
      logger.error('Failed to get agent stats', { collectionAgentID, error: error.message });
      throw error;
    }
  }

  /**
   * Get overdue loans
   */
  async getOverdueLoans(limit = 100, offset = 0) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, rows } = await LoanProposal.findAndCountAll({
        where: {
          status: ['active', 'overdue'],
          nextEMIDate: {
            [require('sequelize').Op.lt]: today,
          },
        },
        limit,
        offset,
        order: [['nextEMIDate', 'ASC']],
      });

      return {
        total: count,
        overdueLoans: rows,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Failed to get overdue loans', { error: error.message });
      throw error;
    }
  }
}

module.exports = new RepaymentService();
