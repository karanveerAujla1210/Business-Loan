const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust path if needed

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customerID: {
    type: DataTypes.STRING(50),
  },
  phoneNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  branchID: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  branchName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  middleName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  dob: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  careOf: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  maskedAadharNumber: {
    type: DataTypes.STRING(15),
    allowNull: true,
    comment: 'Masked Aadhaar (XXXX-XXXX-1234 format)',
  },
  aadharNumberEncrypted: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    comment: 'Encrypted Aadhaar number (AES-256-CBC)',
  },
  AadharNumber: {
    type: DataTypes.STRING(15),
    allowNull: true,
    comment: 'DEPRECATED: Use aadharNumberEncrypted instead',
  },
  combinedAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  house: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  street: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  landMark: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  po: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  dist: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  subDist: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  vtc: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pincode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isBlocked: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '1 if customer is blocked (fraud/default)',
  },
  isEsignCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Whether eSign has been completed',
  },
  esignDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when eSign was completed',
  },
  loanApplicationStatus: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '0=pending, 1=approved, 2=rejected, 3=under_review',
  },
  approvalDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when loan was approved',
  },
  approvedBy: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID of approving authority',
  },
  rejectedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when application was rejected',
  },
  rejectedBy: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID of rejecting authority',
  },
  panNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'PAN number (can be encrypted like Aadhaar)',
  },
  maskedPANNumber: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Masked PAN (ABCD****F format)',
  },
  panNumberEncrypted: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    comment: 'Encrypted PAN number (AES-256-CBC)',
  },
  pendingReason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },

  // Added fields
  name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Full name (consolidated)',
  },
  dependents: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Number of dependents',
  },
  maritalStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Single, Married, Divorced, Widowed',
  },
  appliedMode: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  emailID: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  religion: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  caste: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  firstReferenceName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  firstReferenceRelation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  firstReferenceContact: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  secondReferenceName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  secondReferenceRelation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  secondReferenceContact: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  relationWithCoApplicant: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  sourceBy: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  isLeadRejected: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  leadRejectionDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdOn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
};

const options = {
  tableName: "Applicant",
  timestamps: false,
  freezeTableName: true,
  comment: "",
  indexes: [],
};

const model = sequelize?.define("ApplicantModel", attributes, options);

module.exports = model;
