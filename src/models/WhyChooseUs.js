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
  title: {
    type: DataTypes.TEXT, // NVARCHAR(MAX) maps to TEXT in Sequelize
    allowNull: true,
    field: "title",
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "status",
  },
};

const options = {
  tableName: "whyChooseUs",
  timestamps: false,
  comment: "",
  indexes: [],
};

const model = sequelize?.define("whyChooseUs", attributes, options);

module.exports = model;
