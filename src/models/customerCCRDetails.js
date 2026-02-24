const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const CustomerCCRDetails = sequelize.define(
  "customerCCRDetails",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    creditScore: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    NoOfAccounts: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    NoOfActiveAccounts: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    NoOfWriteOffs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TotalPastDue: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    MostSevereStatusWithIn24Months: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    SingleHighestCredit: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    SingleHighestSanctionAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    TotalHighCredit: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    AverageOpenBalance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    SingleHighestBalance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    NoOfPastDueAccounts: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    NoOfZeroBalanceAccounts: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    RecentAccount: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OldestAccount: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    TotalBalanceAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    TotalSanctionAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    TotalCreditLimit: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    TotalMonthlyPaymentAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      //   defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = CustomerCCRDetails;
