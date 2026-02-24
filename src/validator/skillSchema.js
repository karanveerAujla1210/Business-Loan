/**
 * This function used to contain Skills Api request Schema
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
module.exports = {
	addUserSkill: {
		skillIds: {
			isLength: {
				errorMessage: 'skill id is required',
				options: { min: 1 }
			}
		}
	},

	addSkill: {
		skillIds: {
			isLength: {
				errorMessage: 'skill id is required',
				options: { min: 1 }
			}
		}
	}
};
