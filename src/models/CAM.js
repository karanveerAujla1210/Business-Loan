/**
 * Credit Assessment Memo (CAM) Model
 * Central model for loan approval decisions - Per specification Section 3 Domain 6
 * @author MiniBusiness Loan
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CAM = sequelize.define(
  'CAM',
  {
    camID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    customerID: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'applicants',
        key: 'customerID',
      },
    },
    loanID: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
      references: {
        model: 'loan_proposals',
        key: 'loanID',
      },
    },

    // INCOME SECTION
    dailySales: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Average daily sales in rupees',
    },
    businessRunningDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Days business operational per month',
    },
    monthlyTurnover: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Monthly business turnover',
    },
    annualTurnOver: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Annual business turnover',
    },
    businessVintage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Years of business operation',
    },
    otherIncome: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Income from other sources',
    },

    // EXPENSE SECTION
    businessRent: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Monthly business rent/lease',
    },
    expensesCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Other monthly business expenses',
    },
    salary: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Monthly salary costs for employees',
    },
    householdExpenses: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Monthly personal household expenses',
    },
    existingMonthlyObligations: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Existing loan EMIs and obligations',
    },

    // LOAN APPLICATION SECTION
    loanAmountApplied: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Loan amount requested',
    },
    noOfEMI: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Number of EMI months',
    },
    approvedLoanAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Loan amount approved',
    },
    APR: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Annual percentage rate',
    },

    // COLLATERAL SECTION
    stockInventory: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Business inventory value',
    },
    stock: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Collateral stock value',
    },
    actualBankBalance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Bank balance available',
    },

    // CALCULATED VALUES SECTION
    netBusinessTurnOver: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Turnover - Business Expenses',
    },
    netIncomeAfterExpenses: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Income after all expenses',
    },
    netDisposableIncome: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Available income after obligations',
    },
    perDayCashFlow: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Daily average cash flow',
    },
    businessMargin: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Business margin percentage',
    },

    // LTV AND RATIO CALCULATIONS
    gstLTV: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: 'Loan to Value based on GST',
    },
    itrLTV: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: 'Loan to Value based on ITR',
    },
    maxLoanAsPerGST: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Max loan per GST calculation',
    },
    maxLoanAsPerITR: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Max loan per ITR calculation',
    },
    maxLoanAsPerStockLTV: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Max loan per stock LTV',
    },
    maxLoanAsPerIncome: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Max loan per income capacity',
    },
    maxLoanAsPerABB: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Max loan per bank balance',
    },
    finalLoanAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Final loan amount (minimum of all)',
    },
    FOIR: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Fixed Obligation to Income Ratio',
    },

    // DECISION SECTION
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'),
      defaultValue: 'DRAFT',
      comment: 'CAM status',
    },
    recommendedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Credit Officer ID',
    },
    recommendedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date of recommendation',
    },
    finalApprovalBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Final approver ID',
    },
    finalApprovalDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date of final approval',
    },

    // METADATA
    entryBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'User ID who created/entered',
    },
    createdOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Created date',
    },
    noOfStaff: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of employees',
    },
  },
  {
    sequelize,
    tableName: 'CAM',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['customerID'] },
      { fields: ['loanID'] },
      { fields: ['status'] },
    ],
  }
);

module.exports = CAM;
