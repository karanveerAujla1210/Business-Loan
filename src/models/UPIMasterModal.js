const { DataTypes } = require("sequelize");
const sequelize = require("../config/database").MAIN_DATABASE;

const CompanyUPIDetails = sequelize.define(
  "CompanyUPIDetails",
  {
    UPI_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    CompanyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    UPIAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    BankName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    AccountNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    IFSCCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    IsActive: {
      type: DataTypes.INTEGER,
      defaultValue: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = CompanyUPIDetails;
