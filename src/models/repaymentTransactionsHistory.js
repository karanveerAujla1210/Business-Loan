const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const RepaymentTransactionHistory = sequelize.define(
  "repaymentTransactionHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpayCustID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    loanID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    entity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    fixedAmount: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT, // Matches NVARCHAR(MAX)
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    paymentAmountReceived: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    paymentCountReceived: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    expireAt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    initiatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = RepaymentTransactionHistory;
