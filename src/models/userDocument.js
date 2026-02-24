const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: "Primary Key",
    field: "id",
  },
  customerID: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "customerID",
  },
  aadharURL: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "aadharURL",
  },
  aadharUserImageURL: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "aadharUserImageURL",
  },
  panURL: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "panURL",
  },
  electricityBill: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "electricityBill",
  },
  coAppAadharURL: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "coAppAadharURL",
  },
  coAppAadharUserImageURL: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "coAppAadharUserImageURL",
  },
  coAppPanURL: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "coAppPanURL",
  },
  bankStatementURL: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "bankStatementURL",
  },
  businessPhoto: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "businessPhoto",
  },
  residencePhoto: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "residencePhoto",
  },
  userCheques: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "userCheques",
  },
  drivingURL: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "drivingURL",
  },
  udyamURL: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "udyamURL",
  },
  bureauURL: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "bureauURL",
  },
  sanctionLetterURL: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "sanctionLetterURL",
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "status",
  },
  //   createdAt: {
  //     type: DataTypes.DATE,
  //     allowNull: false,
  //     defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  //     field: "created_at",
  //   },
  //   updatedAt: {
  //     type: DataTypes.DATE,
  //     allowNull: false,
  //     defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  //     field: "updated_at",
  //   },
};

const options = {
  tableName: "userDocument",
  timestamps: false,
  comment: "",
  indexes: [],
};

const model = sequelize.define("UserDocumentModel", attributes, options);

module.exports = model;
