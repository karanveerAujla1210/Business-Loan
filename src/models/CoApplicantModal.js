const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");


const Co_Applicant = sequelize.define(
  "Co_Applicant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerID: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    middleName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    dob: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    careOf: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    maskedAadharNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    AadharNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    combinedAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    house: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    landMark: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    subDist: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    dist: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    vtc: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    po: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    pincode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    panNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    pendingReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    maritalStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    emailID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    religion: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    caste: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Co_Applicant;
