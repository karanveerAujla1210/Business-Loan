const resParams = require("../config/params");
const HTTP_STATUS = require("../helpers/httpStatus");
const MessageHelper = require("../helpers/MessageHelper");
const errorHelper = require("../helpers/errorHelper");
const collectionServices = require("../services/collectionServices");

module.exports = {
  handleQRWebhook: async (request, response) => {
    const params = { ...resParams };
    console.log("STEP 1");
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }

    try {
      // 🔐 Headers for signature validation
      const signature = request.headers["x-razorpay-signature"];
      const eventId = request.headers["x-razorpay-event-id"];
      const rawBody = request.rawBody;
      console.log("STEP 2", signature, eventId, rawBody);
      // ✅ Pass everything to your service
      params.data = await collectionServices.handleQRWebhook({
        eventId,
        signature,
        rawBody,
      });

      params.message = MessageHelper.SUCCESS;
      return response.status(HTTP_STATUS.OK).send(params);
    } catch (error) {
      params.message = error.message;
      params.data = error;
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },
  handleUniversalWebhook: async (request, response) => {
    const params = { ...resParams };

    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }

    try {
      console.log("STEP 1");

      const signature = request.headers["x-razorpay-signature"];
      const eventId = request.headers["x-razorpay-event-id"];
      const rawBody = request.rawBody;

      console.log("STEP 2", {
        signature,
        eventId,
        rawBody,
      });

      params.data = await collectionServices.handleUniversalWebhook({
        eventId,
        signature,
        rawBody,
      });

      params.message = MessageHelper.SUCCESS;
      return response.status(HTTP_STATUS.OK).send(params);
    } catch (error) {
      params.message = error.message;
      params.data = error;
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },

  // 🔁 Keep other controller methods as-is
  getBranchCollectionData: async (request, response) => {
    const params = { ...resParams };
    const { EmployeeID } = request?.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }

    try {
      params.data = await collectionServices.getBranchCollData({ EmployeeID });

      if (params.data) {
        params.message = MessageHelper.SUCCESS;
        return response.status(HTTP_STATUS.OK).send(params);
      }
    } catch (error) {
      params.message = error.message;
      params.data = error;
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },

  createPaymentQR: async (request, response) => {
    const params = { ...resParams };
    const { EmployeeID } = request?.user;
    const err = await errorHelper.checkError(request);

    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }

    try {
      params.data = await collectionServices.createPaymentQR({
        EmployeeID,
        ...request.body,
      });

      if (params.data) {
        params.message = MessageHelper.SUCCESS;
        return response.status(HTTP_STATUS.OK).send(params);
      }
    } catch (error) {
      params.message = error.message;
      params.data = error;
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },
  createOrder: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);

    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }

    try {
      params.data = await collectionServices.createOrder({
        ...request.body,
      });

      if (params.data) {
        params.message = MessageHelper.SUCCESS;
        return response.status(HTTP_STATUS.OK).send(params);
      }
    } catch (error) {
      params.message = error.message;
      params.data = error;
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },
};
