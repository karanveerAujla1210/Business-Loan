const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    comment: "Primary Key",
    field: "id",
  },
  customerID: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: "customerID",
  },
  loanID: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: "loanID",
  },
  transactionID: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: "transactionID",
  },
  accountNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
    field: "accountNumber",
  },
  ifsc: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: "ifsc",
  },
  accountHolderName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: "accountHolderName",
  },
  amountTransfer: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "amountTransfer",
  },
  utrNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    field: "utrNumber",
  },
  paymentMode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "paymentMode",
  },
  paymentStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: "paymentStatus",
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "status",
  },
  errorCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "errorCode",
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "errorMessage",
  },
  responseCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "responseCode",
  },
  response: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "response",
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "transaction_date",
  },
  createdOn: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "createOn",
  },
  updatedOn: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updatedOn",
  },
};

const options = {
  tableName: "transactionHistory",
  timestamps: false,
  comment: "",
  indexes: [],
};

const model = sequelize?.define("Transaction", attributes, options);

module.exports = model;
