const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const LoanProposal = sequelize.define(
  "LoanProposal",
  {
    customerID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },

    loanID: {
      type: DataTypes.STRING(50),
    },

    proposalDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    amountApplied: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tenure: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    repaymentAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    interestRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    processingFee: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    EMI: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    NetDisbursement: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    disbursementDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    firstDateofInstallment: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastDateofInstallment: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SettlementDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Settlement_Type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    LoanCycle: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deathMark: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deathDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEsignCompleted: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = LoanProposal;
