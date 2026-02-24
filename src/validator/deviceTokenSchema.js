/**
 * This function used to contain Device Tokens Api request Schema
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
module.exports = {
	updateDeviceToken: {
		deviceId: {
			isLength: {
				errorMessage: 'device id is required',
				options: { min: 1 }
			}
		},
		fcmToken: {
			isLength: {
				errorMessage: 'fcm token is required',
				options: { min: 1 }
			}
		}
	}
};
