/**
 * Loan Service
 * Business logic for loan lifecycle management
 * @author MiniBusiness Loan
 */

const LoanProposal = require('../models/LoanProposal');
const Applicant = require('../models/applicant');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class LoanService {
  /**
   * Create new loan proposal
   */
  async createLoanProposal(loanData) {
    try {
      const loanID = `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const loan = await LoanProposal.create({
        loanID,
        customerID: loanData.customerID,
        proposalDate: new Date(),
        amountApplied: loanData.amountApplied,
        tenure: loanData.tenure,
        interestRate: loanData.interestRate || 12,
        processingFee: loanData.processingFee || 0,
        status: 'pending',
        loanApplicationStatus: 0,
        outstandingBalance: loanData.amountApplied,
        emisPaid: 0,
        nextEMIDate: this.calculateNextEMIDate(new Date(), loanData.paymentFrequency),
        paymentFrequency: loanData.paymentFrequency || 'monthly',
      });

      logger.info('Loan proposal created', { loanID, customerID: loanData.customerID });
      return loan;
    } catch (error) {
      logger.error('Failed to create loan proposal', { error: error.message });
      throw error;
    }
  }

  /**
   * Get loan by ID
   */
  async getLoanById(loanID) {
    try {
      const loan = await LoanProposal.findOne({ where: { loanID } });
      if (!loan) {
        throw new Error('Loan not found');
      }
      return loan;
    } catch (error) {
      logger.error('Failed to get loan', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Get loans by customer ID
   */
  async getLoansByCustomer(customerID) {
    try {
      const loans = await LoanProposal.findAll({
        where: { customerID },
        order: [['createdAt', 'DESC']],
      });
      return loans;
    } catch (error) {
      logger.error('Failed to get customer loans', { customerID, error: error.message });
      throw error;
    }
  }

  /**
   * Approve loan
   */
  async approveLoan(loanID, approvalData) {
    try {
      const loan = await this.getLoanById(loanID);

      // Calculate first disbursement
      const disbursementDate = new Date();
      const processingFee = loan.processingFee || 0;
      const netDisbursement = loan.amountApplied - processingFee;

      await loan.update({
        status: 'active',
        loanApplicationStatus: 1,
        approvalDate: new Date(),
        approvedBy: approvalData.approvedBy,
        disbursementDate: disbursementDate,
        firstDateofInstallment: this.calculateFirstEMIDate(disbursementDate),
        lastDateofInstallment: this.calculateLastEMIDate(disbursementDate, loan.tenure),
        NetDisbursement: netDisbursement,
        nextEMIDate: this.calculateFirstEMIDate(disbursementDate),
      });

      logger.info('Loan approved', { loanID, approvedBy: approvalData.approvedBy });
      return loan;
    } catch (error) {
      logger.error('Failed to approve loan', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Reject loan
   */
  async rejectLoan(loanID, rejectionReason) {
    try {
      const loan = await this.getLoanById(loanID);

      await loan.update({
        status: 'rejected',
        loanApplicationStatus: 2,
        rejectedDate: new Date(),
        rejectedReason: rejectionReason,
      });

      logger.info('Loan rejected', { loanID });
      return loan;
    } catch (error) {
      logger.error('Failed to reject loan', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Update outstanding balance after payment
   */
  async updateOutstandingBalance(loanID, paymentAmount) {
    try {
      const loan = await this.getLoanById(loanID);
      const newBalance = loan.outstandingBalance - paymentAmount;

      await loan.update({
        outstandingBalance: Math.max(0, newBalance),
        lastPaymentDate: new Date(),
        lastPaymentAmount: paymentAmount,
        status: newBalance <= 0 ? 'closed' : 'active',
      });

      logger.info('Outstanding balance updated', { loanID, newBalance });
      return loan;
    } catch (error) {
      logger.error('Failed to update balance', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Advance EMI date
   */
  async advanceEMIDate(loanID) {
    try {
      const loan = await this.getLoanById(loanID);
      const nextDate = this.addMonthsToDate(loan.nextEMIDate, 1);

      await loan.update({
        nextEMIDate: nextDate,
        emisPaid: (loan.emisPaid || 0) + 1,
      });

      logger.info('EMI date advanced', { loanID, nextEMIDate: nextDate });
      return loan;
    } catch (error) {
      logger.error('Failed to advance EMI date', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Mark loan as overdue
   */
  async markOverdue(loanID) {
    try {
      const loan = await this.getLoanById(loanID);
      await loan.update({ status: 'overdue' });

      logger.info('Loan marked overdue', { loanID });
      return loan;
    } catch (error) {
      logger.error('Failed to mark loan overdue', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Mark loan as NPA (Non-Performing Asset)
   */
  async markNPA(loanID) {
    try {
      const loan = await this.getLoanById(loanID);
      await loan.update({ status: 'npa' });

      logger.info('Loan marked NPA', { loanID });
      return loan;
    } catch (error) {
      logger.error('Failed to mark loan NPA', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Close loan
   */
  async closeLoan(loanID) {
    try {
      const loan = await this.getLoanById(loanID);
      
      await loan.update({
        status: 'closed',
        SettlementDate: new Date(),
        Settlement_Type: 'normal',
        outstandingBalance: 0,
      });

      logger.info('Loan closed', { loanID });
      return loan;
    } catch (error) {
      logger.error('Failed to close loan', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate next EMI date based on frequency
   */
  calculateNextEMIDate(baseDate, frequency = 'monthly') {
    const date = new Date(baseDate);
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'monthly':
      default:
        date.setMonth(date.getMonth() + 1);
        break;
    }
    
    return date;
  }

  /**
   * Calculate first EMI date (30 days from disbursement)
   */
  calculateFirstEMIDate(disbursementDate) {
    const date = new Date(disbursementDate);
    date.setDate(date.getDate() + 30);
    return date;
  }

  /**
   * Calculate last EMI date
   */
  calculateLastEMIDate(startDate, tenureMonths) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + tenureMonths);
    return date;
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
   * Get loan summary
   */
  async getLoanSummary(loanID) {
    try {
      const loan = await this.getLoanById(loanID);
      const applicant = await Applicant.findOne({
        where: { customerID: loan.customerID },
      });

      return {
        loanID: loan.loanID,
        customerID: loan.customerID,
        customerName: applicant ? applicant.firstName : 'N/A',
        amountApplied: loan.amountApplied,
        outstandingBalance: loan.outstandingBalance,
        EMI: loan.EMI,
        tenure: loan.tenure,
        status: loan.status,
        interestRate: loan.interestRate,
        nextEMIDate: loan.nextEMIDate,
        emisPaid: loan.emisPaid,
        processingFee: loan.processingFee,
      };
    } catch (error) {
      logger.error('Failed to get loan summary', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Get paginated loan list
   */
  async getLoanList(filters = {}, limit = 20, offset = 0) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.customerID) {
        where.customerID = filters.customerID;
      }

      const { count, rows } = await LoanProposal.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        total: count,
        loans: rows,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Failed to get loan list', { error: error.message });
      throw error;
    }
  }
}

module.exports = new LoanService();
