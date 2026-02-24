const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust the path as necessary

const ESignLog = sequelize.define(
  "eSignLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    loanProposalID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    documentID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    customerID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // created_at: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = ESignLog;
