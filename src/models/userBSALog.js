const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserBSALog = sequelize.define(
  "userBSALog",
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    requestID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tempURL: {
      type: DataTypes.TEXT, // Use TEXT for NVARCHAR(MAX)
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    fileNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    accountType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    userEmailID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    userBSAStatus: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = UserBSALog;
