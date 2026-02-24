const FAQ = require("../models/faq_master");

module.exports = {
  /**
   * This function used to get FAQ from DB
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getFaqs: async ({ type }) => {
    try {
      return await FAQ.findAll(
        {
          attributes: ["id", "question", "answer", "parentId", "status"],
        },
        {
          where: {
            status: 1,
            type,
          },
        }
      );
    } catch (error) {
      console.log("Error fetching FAQ`", error);
    }
  },
};
