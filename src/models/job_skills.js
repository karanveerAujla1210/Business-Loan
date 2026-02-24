const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').MAIN_DATABASE;
const JobMaster = require('./job_master')
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
	jobId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		defaultValue: null,
		field: 'job_id',
		references: {
			model: JobMaster,
			key: 'id'
		}
	},
	skillId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		defaultValue: null,
		field: 'skill_id'
	}
};

const options = {
	tableName: 'tbl_kjobs_job_skills',
	timestamps: false,
	comment: '',
	indexes: []
};

const model = sequelize?.define('jobSkillsModel', attributes, options);
module.exports = model;
