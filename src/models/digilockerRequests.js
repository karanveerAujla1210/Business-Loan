// src/models/digilockerRequests.js

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const DigilockerRequestModel = sequelize.define(
  "DigilockerRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    emailID: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    clientId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "pending",
    },
  },
  {
    tableName: "digilockerRequest",
    timestamps: false,
  }
);

module.exports = DigilockerRequestModel;
