const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    comment: "Primary Key",
    field: "id",
  },
  branchID: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "branchID",
  },
  branchName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "branchName",
  },
  branchCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "branchCode",
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "address",
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "city",
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "state",
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "zipCode",
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "country",
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "phone",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "email",
  },
  openingDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "openingDate",
  },
  closingDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "closingDate",
  },
  isActive: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "isActive",
  },
};

const options = {
  tableName: "branchMaster",
  timestamps: false,
  comment: "Branch Master Table",
  indexes: [],
};

const model = sequelize?.define("branchMaster", attributes, options);

module.exports = model;
