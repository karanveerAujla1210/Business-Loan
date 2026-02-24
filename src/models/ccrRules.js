const { DataTypes } = require("sequelize");
const sequelize = require("../config/database").MAIN_DATABASE;

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    comment: "Primary Key",
    field: "id",
  },
  noOfAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "no_of_accounts",
  },
  noOfActiveAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "no_of_active_accounts",
  },
  noOfWriteOffs: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "no_of_write_offs",
  },
  totalPastDue: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "total_past_due",
  },
  mostSevereStatusWithIn24Months: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "most_severe_status_within_24_months",
  },
  singleHighestCredit: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "single_highest_credit",
  },
  singleHighestSanctionAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "single_highest_sanction_amount",
  },
  totalHighCredit: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "total_high_credit",
  },
  averageOpenBalance: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "average_open_balance",
  },
  singleHighestBalance: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "single_highest_balance",
  },
  noOfPastDueAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "no_of_past_due_accounts",
  },
  noOfZeroBalanceAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "no_of_zero_balance_accounts",
  },
  recentAccount: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "recent_account",
  },
  oldestAccount: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "oldest_account",
  },
  totalBalanceAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "total_balance_amount",
  },
  totalSanctionAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "total_sanction_amount",
  },
  totalCreditLimit: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "total_credit_limit",
  },
  totalMonthlyPaymentAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    field: "total_monthly_payment_amount",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize?.literal("CURRENT_TIMESTAMP"),
    field: "created_at",
  },
};

const options = {
  tableName: "CCR_Rules",
  timestamps: false,
  comment: "",
  indexes: [],
};

const model = sequelize?.define("CCR_Rules", attributes, options);

module.exports = model;
