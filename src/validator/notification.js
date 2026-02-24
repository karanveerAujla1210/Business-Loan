/**
 * This function used to contain Notifications Api request Schema
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
module.exports = {
	deleteNotification: {
		id: {
			isLength: {
				errorMessage: 'id is required',
				options: { min: 1 }
			}
		}
	}
};
