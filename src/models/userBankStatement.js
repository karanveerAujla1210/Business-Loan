const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserBankStatement = sequelize.define(
  "userBankStatement",
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerID: {
      type: DataTypes.STRING(255),
    },
    bankName: {
      type: DataTypes.STRING(255),
    },
    accountNumber: {
      type: DataTypes.STRING(255),
    },
    accountHolderName: {
      type: DataTypes.STRING(255),
    },
    ifscCode: {
      type: DataTypes.STRING(255),
    },
    bankBranchName: {
      type: DataTypes.STRING(255),
    },
    periodStart: {
      type: DataTypes.STRING(255),
    },
    periodEnd: {
      type: DataTypes.STRING(255),
    },
    addressInBank: {
      type: DataTypes.STRING(255),
    },
    email: {
      type: DataTypes.STRING(255),
    },
    mobileNumber: {
      type: DataTypes.STRING(15),
    },
    panNumber: {
      type: DataTypes.STRING(15),
    },
    monthsEvaluated: {
      type: DataTypes.STRING(10),
    },
    documentType: {
      type: DataTypes.STRING(255),
    },
    lastCustomerTransactionDate: {
      type: DataTypes.STRING(255),
    },
    odCcLimit: {
      type: DataTypes.STRING(255),
    },
    inwardReturnCount: {
      type: DataTypes.STRING(255),
    },
    outwardReturnCount: {
      type: DataTypes.STRING(255),
    },
    inwardReturnAmount: {
      type: DataTypes.STRING(255),
    },
    outwardReturnAmount: {
      type: DataTypes.STRING(255),
    },
    totalNetCredits: {
      type: DataTypes.STRING(255),
    },
    averageBalance: {
      type: DataTypes.STRING(255),
    },
    customAverageBalance: {
      type: DataTypes.STRING(255),
    },
    customAverageBalanceLastThreeMonth: {
      type: DataTypes.STRING(255),
    },
    averageBalanceLastThreeMonth: {
      type: DataTypes.STRING(255),
    },
    averageBalanceLastSixMonth: {
      type: DataTypes.STRING(255),
    },
    averageBalanceLastTwelveMonth: {
      type: DataTypes.STRING(255),
    },
    averageReceiptLastSixMonth: {
      type: DataTypes.STRING(255),
    },
    averageReceiptLastTwelveMonth: {
      type: DataTypes.STRING(255),
    },
    salaryCreditCountLastThreeMonth: {
      type: DataTypes.STRING(255),
    },
    salaryCreditCountLastSixMonth: {
      type: DataTypes.STRING(255),
    },
    minBalanceLastThreeMonth: {
      type: DataTypes.STRING(255),
    },
    minBalanceLastSixMonth: {
      type: DataTypes.STRING(255),
    },
    minBalanceChargeCountLastSixMonth: {
      type: DataTypes.STRING(255),
    },
    balanceOn5th: {
      type: DataTypes.STRING(255),
    },
    balanceOn10th: {
      type: DataTypes.STRING(255),
    },
    balanceOn15th: {
      type: DataTypes.STRING(255),
    },
    balanceOn20th: {
      type: DataTypes.STRING(255),
    },
    balanceOn25th: {
      type: DataTypes.STRING(255),
    },
    monthsEvaluated: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = UserBankStatement;
