const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const ApiErrorLog = sequelize.define(
  "apiErrorLogs",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apiRequest: {
      type: DataTypes.TEXT, // TEXT covers NVARCHAR(MAX)
      allowNull: true,
    },
    apiResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // logDate: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = ApiErrorLog;
