const NotificationTypes = require('../config/notificationTypes');
const Notification = require('../models/notification');
const utilityHelper = require('../helpers/utilityHelper');
const { Op } = require('sequelize');
module.exports = {
	/**
	 * This function used to get User Notigication
	 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
	 */
	getNotifications: async (idUser, limit = 10, offset = 0) => {
		return await Notification.findAll({
			offset: offset,
			limit: limit,
			where: { idUser: idUser, readStatus: { [Op.ne]: 'deleted' } }
		});
	},
	/**
	 * This function used to Update Notification to read
	 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
	 */
	updateNotification: async (id, idUser) => {
		try {
			return await Notification.update(
				{
					readStatus: 'read'
				},
				{
					where: { idUser: idUser, id: id }
				}
			);
		} catch (error) {
			console.log(error);
		}
	},
	/**
	 * This function used to Delete Notification
	 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
	 */
	deleteNotification: async (id, idUser) => {
		try {
			return await Notification.update(
				{
					readStatus: 'deleted'
				},
				{
					where: { idUser: idUser, id: { [Op.in]: id } }
				}
			);
		} catch (error) {
			console.error(error);
		}
	}
};
