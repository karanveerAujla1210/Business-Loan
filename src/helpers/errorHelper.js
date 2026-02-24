const { validationResult } = require('express-validator');
module.exports = {
	 /**
	 * This function used to Check validation in API request 
	 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
	 */
	checkError: async request => {
		const errors = validationResult(request);
		if (!errors.isEmpty()) {
			const err = [];
			errors.array().forEach(error => {
				err.push(error.msg);
			});
			return err;
		}
	}
};
