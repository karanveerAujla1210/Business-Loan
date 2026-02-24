const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const attributes = {
  EmployeeID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "employeeName",
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: "gender",
  },
  mobileNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: "mobileNo",
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "designation",
  },
  roleID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "roleID",
  },
  dateOfJoining: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: "dateOfJoining",
  },
  grade: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: "grade",
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "department",
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "location",
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: "birthDate",
  },
  maritalStatus: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: "maritalStatus",
  },
  personalEmailId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "personalEmailId",
  },
  officialMailID: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "officialMailID",
  },
  fatherHusbandName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "fatherHusbandName",
  },
  husbandName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "husbandName",
  },
  permanentAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "permanentAddress",
  },
  presentAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "presentAddress",
  },
  dateOfLeaving: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: "dateOfLeaving",
  },
  postingBranch: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "postingBranch",
  },
  staffImage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "staffImage",
  },
  roleAssigned: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "roleAssigned",
  },
  isBlocked: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "isBlocked",
  },
  createdOn: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "createdOn",
    defaultValue: DataTypes.NOW,
  },
};

const options = {
  tableName: "Employees",
  timestamps: false,
  comment: "Staff details table",
};

const model = sequelize?.define("Employees", attributes, options);

module.exports = model;
