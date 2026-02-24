/**
 * This function used to contain User Api request Schema
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
module.exports = {
  updateNotificationStatus: {
    notificationStatus: {
      // in: ['body'],
      isLength: {
        errorMessage: "Notification status is missing",
        options: { min: 1 },
      },
    },
  },
};
