/**
 * Loan Proposal Model
 * Represents complete loan terms and repayment tracking
 * @author MiniBusiness Loan
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoanProposal = sequelize.define(
  'LoanProposal',
  {
    loanID: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
      comment: 'Unique loan identifier',
    },
    customerID: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'Applicant',
        key: 'customerID',
      },
      comment: 'Reference to applicant',
    },

    // LOAN PROPOSAL DETAILS
    proposalDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of proposal',
    },
    amountApplied: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Loan amount applied for',
    },
    tenure: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Loan tenure in months',
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 12,
      comment: 'Annual interest rate %',
    },
    processingFee: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'One-time processing fee',
    },
    EMI: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Calculated EMI amount',
    },
    NetDisbursement: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Net amount after fees',
    },

    // DISBURSEMENT SECTION
    disbursementDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When loan was disbursed',
    },
    disbursementConfirmedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When disbursal was confirmed',
    },
    bankReferenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Bank UTR/reference number',
    },

    // REPAYMENT SCHEDULE
    firstDateofInstallment: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'First EMI due date',
    },
    lastDateofInstallment: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last EMI due date',
    },
    nextEMIDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Next upcoming EMI date',
    },
    paymentFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
      defaultValue: 'monthly',
      comment: 'EMI payment frequency',
    },

    // REPAYMENT TRACKING
    outstandingBalance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Remaining loan amount',
    },
    emisPaid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of EMIs paid',
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date of last payment',
    },
    lastPaymentAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Amount of last payment',
    },
    lateCharges: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Accumulated late charges (2% daily)',
    },

    // STATUS & LIFECYCLE
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      comment: 'pending,approved,disbursed,active,overdue,closed,default,npa,rejected',
    },
    loanApplicationStatus: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '0=pending,1=approved,2=rejected,3=under_review',
    },

    // CLOSURE & SETTLEMENT
    SettlementDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Loan settlement/closure date',
    },
    Settlement_Type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'normal, prepayment, default, npa',
    },

    // LOAN CYCLE & METADATA
    LoanCycle: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Loan cycle number (repeat customer)',
    },
    repaymentAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Total repayment amount',
    },

    // APPROVAL WORKFLOW
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date of approval',
    },
    approvedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Approving authority ID',
    },
    rejectedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date of rejection',
    },
    rejectedReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for rejection',
    },
    rejectedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Rejecting authority ID',
    },

    // ESIGN & DOCUMENT
    isEsignCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether eSign is completed',
    },
    esignDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date of eSign completion',
    },

    // RAZORPAY INTEGRATION
    razorpayOrderID: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Razorpay order ID for payments',
    },
    razorpayCustID: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Razorpay customer ID',
    },

    // METADATA
    deathMark: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '1 if applicant deceased',
    },
    deathDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date of death notification',
    },
  },
  {
    sequelize,
    tableName: 'LoanProposal',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['customerID'] },
      { fields: ['status'] },
      { fields: ['nextEMIDate'] },
      { fields: ['outstandingBalance'] },
    ],
  }
);

module.exports = LoanProposal;
