const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust the path if needed

const RepaymentTransactionUPI = sequelize.define(
  "repaymentTransactionUPI",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    loanID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.STRING, // Matches NVARCHAR(100)
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    amountDue: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    paidAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    paymentCountReceived: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    receipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    initiatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true, // prevents pluralization
    timestamps: false,     // no createdAt/updatedAt fields
  }
);

module.exports = RepaymentTransactionUPI;
