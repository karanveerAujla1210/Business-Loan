/**
 * CAM (Credit Assessment Memo) Service
 * Business logic for credit assessment and loan approval decisions
 * @author MiniBusiness Loan
 */

const CAM = require('../models/CAM');
const Applicant = require('../models/applicant');
const LoanProposal = require('../models/LoanProposal');
const { logger } = require('../utils/logger');

class CAMService {
  /**
   * Create new CAM
   */
  async createCAM(camData) {
    try {
      const cam = await CAM.create(camData);
      logger.info('CAM created', { camID: cam.camID, customerID: cam.customerID });
      return cam;
    } catch (error) {
      logger.error('Failed to create CAM', { error: error.message });
      throw error;
    }
  }

  /**
   * Get CAM by ID
   */
  async getCAMById(camID) {
    try {
      const cam = await CAM.findByPk(camID);
      if (!cam) {
        throw new Error('CAM not found');
      }
      return cam;
    } catch (error) {
      logger.error('Failed to get CAM', { camID, error: error.message });
      throw error;
    }
  }

  /**
   * Get CAM by customer ID
   */
  async getCAMByCustomerID(customerID) {
    try {
      const cam = await CAM.findOne({ where: { customerID } });
      return cam;
    } catch (error) {
      logger.error('Failed to get CAM by customer', { customerID, error: error.message });
      throw error;
    }
  }

  /**
   * Update CAM
   */
  async updateCAM(camID, updateData) {
    try {
      const cam = await CAM.findByPk(camID);
      if (!cam) {
        throw new Error('CAM not found');
      }

      await cam.update(updateData);
      logger.info('CAM updated', { camID });
      return cam;
    } catch (error) {
      logger.error('Failed to update CAM', { camID, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate EMI
   * Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
   * where P = principal, r = monthly rate, n = number of months
   */
  calculateEMI(principal, annualRate, months) {
    if (months <= 0 || principal <= 0 || annualRate < 0) {
      throw new Error('Invalid parameters for EMI calculation');
    }

    const monthlyRate = annualRate / 100 / 12;

    if (monthlyRate === 0) {
      return principal / months;
    }

    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    const emi = numerator / denominator;

    return Math.round(emi * 100) / 100;
  }

  /**
   * Calculate LTV (Loan to Value)
   */
  calculateLTV(loanAmount, collateralValue) {
    if (collateralValue <= 0) return 0;
    return (loanAmount / collateralValue) * 100;
  }

  /**
   * Calculate FOIR (Fixed Obligation to Income Ratio)
   */
  calculateFOIR(monthlyIncome, monthlyObligation) {
    if (monthlyIncome <= 0) return 0;
    return monthlyObligation / monthlyIncome;
  }

  /**
   * Calculate Net Disposable Income
   */
  calculateNDI(grossIncome, totalExpenses, existingObligations) {
    return Math.max(0, grossIncome - totalExpenses - existingObligations);
  }

  /**
   * Determine loan approval decision based on credit rules
   * Rules:
   * 1. Bureau score >= 600
   * 2. LTV <= 250%
   * 3. FOIR <= 0.50 (50%)
   * 4. Net Disposable Income >= Proposed EMI
   */
  async approvalDecision(camID) {
    try {
      const cam = await this.getCAMById(camID);
      if (!cam) {
        throw new Error('CAM not found');
      }

      const decision = {
        approved: true,
        reasons: [],
        warnings: [],
      };

      // Rule 1: Bureau Score check
      if (!cam.bureauScore || cam.bureauScore < 600) {
        decision.approved = false;
        decision.reasons.push(`Bureau score ${cam.bureauScore || 'N/A'} is below 600 threshold`);
      } else {
        decision.reasons.push(`Bureau score ${cam.bureauScore} is acceptable`);
      }

      // Rule 2: LTV check (Loan to Value should not exceed 250%)
      const ltv = this.calculateLTV(cam.loanAmountApplied, cam.stockInventory + cam.actualBankBalance);
      if (ltv > 250) {
        decision.approved = false;
        decision.reasons.push(`LTV ${ltv.toFixed(2)}% exceeds 250% limit`);
      } else {
        decision.reasons.push(`LTV ${ltv.toFixed(2)}% is within acceptable range`);
      }

      // Rule 3: FOIR check (Fixed Obligation to Income should not exceed 50%)
      const foir = this.calculateFOIR(cam.monthlyTurnover || 0, cam.existingMonthlyObligations || 0);
      if (foir > 0.5) {
        decision.approved = false;
        decision.reasons.push(`FOIR ${(foir * 100).toFixed(2)}% exceeds 50% limit`);
      } else {
        decision.reasons.push(`FOIR ${(foir * 100).toFixed(2)}% is acceptable`);
      }

      // Rule 4: Net Disposable Income check
      const ndi = this.calculateNDI(
        cam.monthlyTurnover || 0,
        cam.businessRent + cam.expensesCost + cam.salary + cam.householdExpenses,
        cam.existingMonthlyObligations || 0
      );

      const emi = this.calculateEMI(cam.loanAmountApplied, cam.APR || 12, cam.noOfEMI);
      
      if (ndi < emi) {
        decision.approved = false;
        decision.reasons.push(`NDI Rs.${ndi.toFixed(2)} is insufficient for EMI Rs.${emi.toFixed(2)}`);
      } else {
        const buffer = ndi - emi;
        decision.reasons.push(`NDI Rs.${ndi.toFixed(2)} covers EMI Rs.${emi.toFixed(2)} with buffer Rs.${buffer.toFixed(2)}`);
      }

      // Warnings
      if (cam.businessVintage && cam.businessVintage < 1) {
        decision.warnings.push('Business vintage less than 1 year - high risk');
      }

      if (cam.bureauScore && cam.bureauScore < 700) {
        decision.warnings.push('Bureau score below 700 - medium risk');
      }

      return decision;
    } catch (error) {
      logger.error('Failed to make approval decision', { camID, error: error.message });
      throw error;
    }
  }

  /**
   * Submit CAM for approval
   */
  async submitCAM(camID) {
    try {
      const cam = await CAM.findByPk(camID);
      if (!cam) {
        throw new Error('CAM not found');
      }

      await cam.update({
        status: 'SUBMITTED',
        submittedDate: new Date(),
      });

      logger.info('CAM submitted for approval', { camID });
      return cam;
    } catch (error) {
      logger.error('Failed to submit CAM', { camID, error: error.message });
      throw error;
    }
  }

  /**
   * Approve CAM and link to loan
   */
  async approveCAM(camID, approverID, notes = '') {
    try {
      const cam = await CAM.findByPk(camID);
      if (!cam) {
        throw new Error('CAM not found');
      }

      const decision = await this.approvalDecision(camID);

      await cam.update({
        status: 'APPROVED',
        finalApprovalBy: approverID,
        finalApprovalDate: new Date(),
        decisionDate: new Date(),
        notes: notes || decision.reasons.join('; '),
      });

      logger.info('CAM approved', { camID, approverID });
      return cam;
    } catch (error) {
      logger.error('Failed to approve CAM', { camID, error: error.message });
      throw error;
    }
  }

  /**
   * Reject CAM
   */
  async rejectCAM(camID, rejectionReason, approverID) {
    try {
      const cam = await CAM.findByPk(camID);
      if (!cam) {
        throw new Error('CAM not found');
      }

      await cam.update({
        status: 'REJECTED',
        finalApprovalBy: approverID,
        finalApprovalDate: new Date(),
        decisionDate: new Date(),
        notes: rejectionReason,
      });

      logger.info('CAM rejected', { camID, approverID });
      return cam;
    } catch (error) {
      logger.error('Failed to reject CAM', { camID, error: error.message });
      throw error;
    }
  }

  /**
   * Get CAM list with filters
   */
  async getCAMList(filters = {}, limit = 20, offset = 0) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.customerID) {
        where.customerID = filters.customerID;
      }
      if (filters.loanID) {
        where.loanID = filters.loanID;
      }

      const { count, rows } = await CAM.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        total: count,
        cams: rows,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Failed to get CAM list', { error: error.message });
      throw error;
    }
  }
}

module.exports = new CAMService();
