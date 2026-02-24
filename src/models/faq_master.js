const { DataTypes } = require('sequelize');
const { sequelize } = require("../config/database");
const attributes = {
	id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: null,
		primaryKey: true,
		autoIncrement: true,
		comment: 'Primary Key',
		field: 'id'
	},
	question: {
		type: DataTypes.STRING(255),
		allowNull: false,
		defaultValue: null,
		field: 'question'
	},
	answer: {
		type: DataTypes.TEXT(),
		allowNull: false,
		comment: null,
		field: 'answer'
	},
	parentId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		defaultValue: null,
		field: 'parent_id'
	},
	status: {
		type: DataTypes.ENUM('1', '0'),
		allowNull: true,
		defaultValue: '0',
		field: 'status'
	},
	type: {
		type: DataTypes.STRING(10),
		allowNull: false,
		field: 'type'
	},
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: sequelize?.literal('CURRENT_TIMESTAMP'),
		field: 'created_at'
	},
	updatedAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: sequelize?.literal('CURRENT_TIMESTAMP'),
		autoIncrement: false,
		comment: null,
		field: 'updated_at'
	}
};

const options = {
	tableName: 'faq_master',
	timestamps: false,
	comment: '',
	indexes: []
};

const model = sequelize?.define('faqModel', attributes, options);

module.exports = model;
