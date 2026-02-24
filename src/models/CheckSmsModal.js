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
  mobileNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
    field: "mobileNumber",
  },
  transactionID: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: "transactionID",
  },
  otp: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: "otp",
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: "status",
  },
  otpVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: "otpVerified",
  },
  createdOn: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: "CreatedOn",
  },
};

const options = {
  tableName: "checksmsdetail",
  timestamps: false,
  comment: "",
  indexes: [],
};

const model = sequelize?.define("CheckSMSDetail", attributes, options);

module.exports = model;
