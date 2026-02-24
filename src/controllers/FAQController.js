const HTTP_STATUS = require("../helpers/httpStatus");
const resParams = require("../config/params");
const faqServices = require("../services/faqServices");
const MessageHelper = require("../helpers/MessageHelper");
module.exports = {
  /**
   * This function used to Get All saved FAQ
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getFAQs: async (request, response) => {
    const params = { ...resParams };
    const { type } = request?.body;
    try {
      params.data = await faqServices.getFaqs({ type });
	  console.log("      params.data",      params.data);
      if (params.data) {
        params.message = MessageHelper.SUCCESS;
        response.status(HTTP_STATUS.OK).send(params);
      }
    } catch (error) {
      params.data = error;
      params.message = error.message;
      response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },
};
