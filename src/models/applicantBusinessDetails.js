const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const ApplicantBusinessDetails = sequelize.define(
  "applicantBusinessDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    udyamNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gstNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    businessName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    businessNature: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    businessPurpose: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    businessVintage: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    businessAddress: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    staffCount: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    avgTurnover: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    createdOn: {
      type: DataTypes.DATE,
      //   defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = ApplicantBusinessDetails;
