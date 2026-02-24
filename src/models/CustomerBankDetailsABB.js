const { DataTypes } = require('sequelize');
const { sequelize } = require("../config/database"); // Adjust path if needed

const UserBankStatementABB = sequelize.define('UserBankStatementABB', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  customerID: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bankStatementID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  balanceOn5th: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  balanceOn10th: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  balanceOn15th: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  balanceOn20th: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  balanceOn25th: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
}, {
  tableName: 'userBankStatementABB',
  schema: 'dbo',
  timestamps: false, // assuming there are no createdAt/updatedAt fields
});

module.exports = UserBankStatementABB;
