const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PaymentFrequency = sequelize.define(
  "paymentFrequency",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    frequency: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    installment: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // updateDate: {
    //   type: DataTypes.DATEONLY,
    //   allowNull: true,
    // },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = PaymentFrequency;
