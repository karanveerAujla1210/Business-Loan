const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const CAM = sequelize.define(
  "CAM",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerID: {
      type: DataTypes.STRING,
    },
    dailySales: {
      type: DataTypes.DECIMAL(18, 2),
    },
    businessRunningDays: {
      type: DataTypes.INTEGER,
    },
    monthlyTurnover: {
      type: DataTypes.DECIMAL(18, 2),
    },
    annualTurnOver: {
      type: DataTypes.DECIMAL(18, 2),
    },
    businessVintage: {
      type: DataTypes.INTEGER,
    },
    existingMonthlyObligations: {
      type: DataTypes.DECIMAL(18, 2),
    },
    loanAmountApplied: {
      type: DataTypes.DECIMAL(18, 2),
    },
    noOfEMI: {
      type: DataTypes.INTEGER,
    },
    perDayCashFlow: {
      type: DataTypes.DECIMAL(18, 2),
    },
    stockInventory: {
      type: DataTypes.DECIMAL(18, 2),
    },
    netBusinessTurnOver: {
      type: DataTypes.DECIMAL(18, 2),
    },
    businessRent: {
      type: DataTypes.DECIMAL(18, 2),
    },
    expensesCost: {
      type: DataTypes.DECIMAL(18, 2),
    },
    businessMargin: {
      type: DataTypes.DECIMAL(5, 2),
    },
    noOfStaff: {
      type: DataTypes.INTEGER,
    },
    salary: {
      type: DataTypes.DECIMAL(18, 2),
    },
    otherIncome: {
      type: DataTypes.DECIMAL(18, 2),
    },
    householdExpenses: {
      type: DataTypes.DECIMAL(18, 2),
    },
    netIncomeAfterExpenses: {
      type: DataTypes.DECIMAL(18, 2),
    },
    netDisposableIncome: {
      type: DataTypes.DECIMAL(18, 2),
    },
    gstLTV: {
      type: DataTypes.DECIMAL(18, 2),
    },
    itrLTV: {
      type: DataTypes.DECIMAL(18, 2),
    },
    actualBankBalance: {
      type: DataTypes.DECIMAL(18, 2),
    },
    stock: {
      type: DataTypes.DECIMAL(18, 2),
    },
    maxLoanAsPerGST: {
      type: DataTypes.DECIMAL(18, 2),
    },
    maxLoanAsPerITR: {
      type: DataTypes.DECIMAL(18, 2),
    },
    maxLoanAsPerStockLTV: {
      type: DataTypes.DECIMAL(18, 2),
    },
    maxLoanAsPerIncome: {
      type: DataTypes.DECIMAL(18, 2),
    },
    maxLoanAsPerABB: {
      type: DataTypes.DECIMAL(18, 2),
    },
    FOIR: {
      type: DataTypes.DECIMAL(5, 2),
    },
    finalLoanAmount: {
      type: DataTypes.DECIMAL(18, 2),
    },
    approvedLoanAmount: {
      type: DataTypes.DECIMAL(18, 2),
    },
    APR: {
      type: DataTypes.DECIMAL(5, 2),
    },
    recommendedBy: {
      type: DataTypes.STRING,
    },
    recommendedDate: {
      type: DataTypes.DATE,
    },
    finalApprovalBy: {
      type: DataTypes.STRING,
    },
    finalApprovalDate: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.STRING(50),
    },
    entryBy: {
      type: DataTypes.STRING(50),
    },
    createdOn: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "CAM",
    timestamps: false,
  }
);

module.exports = CAM;
