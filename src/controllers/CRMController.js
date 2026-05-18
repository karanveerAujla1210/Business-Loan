const resParams = require("../config/params");
const HTTP_STATUS = require("../helpers/httpStatus");
const MessageHelper = require("../helpers/MessageHelper");
const errorHelper = require("../helpers/errorHelper");
const crmServices = require("../services/crmServices");

module.exports = {
  getDashboard: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);

    if (err) {
      params.status = false;
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }

    try {
      const EmployeeID = request?.user?.EmployeeID || request?.user?.idUser;
      params.data = await crmServices.getDashboard({ EmployeeID });

      if (!params.data) {
        params.status = false;
        params.message = MessageHelper.USER_NOT_REGISTERED;
        return response.status(HTTP_STATUS.OK).send(params);
      }

      params.message = MessageHelper.SUCCESS;
      return response.status(HTTP_STATUS.OK).send(params);
    } catch (error) {
      params.status = false;
      params.data = error;
      params.message = error.message;
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },
};
