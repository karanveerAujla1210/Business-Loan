/**
 * This file contain Authentication related endpoints
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
const resParams = require("../config/params");
const HTTP_STATUS = require("../helpers/httpStatus");
const MessageHelper = require("../helpers/MessageHelper");
const authServices = require("../services/authServices");
const errorHelper = require("../helpers/errorHelper");
const userServices = require("../services/userServices");
const OtpHelper = require("../helpers/OtpHelper");
module.exports = {
  /**
   * This function used to Generate Staff Phone OTP
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  generateOtp: async (request, response) => {
    const params = { ...resParams };
    const user = request.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
    try {
      params.data = await authServices.generateOtp(request.body, user);
      params.message = MessageHelper.SUCCESS;
      response.status(HTTP_STATUS.OK).send(params);
    } catch (error) {
      console.log(error);
      params.status = false;
      params.message = error.message;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
  },
  /**
   * This function used to login user
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  sendMobileOTPStaff: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.status = false;
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
    try {
      params.data = await authServices.sendMobileOTPStaff(request.body);
      console.log("      params.data", params.data, request.body);
      if (params.data == MessageHelper.USER_BLOCKED) {
        params.status = false;
        params.message = MessageHelper.USER_BLOCKED;
        return response.status(HTTP_STATUS.OK).send(params);
      } else if (params.data == MessageHelper.USER_NOT_REGISTERED) {
        params.status = false;
        params.message = MessageHelper.USER_NOT_REGISTERED;
        return response.status(HTTP_STATUS.OK).send(params);
      }
      // else if (!params.data?.client_id) {
      //   params.status = false;
      //   params.message = params.data;
      //   return response.status(HTTP_STATUS.OK).send(params);
      // }
      params.data = {
        client_id: params.data,
        operator: "jio",
      };
      console.log("FINAL SEND _OTP ", params.data);
      params.message = MessageHelper.SUCCESS;
      response.status(HTTP_STATUS.OK).send(params);
    } catch (error) {
      console.log(error);
      params.status = false;
      params.message = error.message;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
  },
  /**
   * This function used to Register
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  sendOtpCustomer: async (request, response) => {
    const params = { ...resParams };
    const { phone, appliedMode, sourceBy, postingBranch, branchName } =
      request.body;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.status = false;
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
    try {
      params.data = await authServices.sendOtpCustomer(
        phone,
        appliedMode,
        sourceBy,
        postingBranch,
        branchName
      );
      console.log("params.data", params.data);
      if (params.data == MessageHelper.LEAD_REJECTED) {
        params.status = false;
        params.message = MessageHelper.LEAD_REJECTED;
        response.status(HTTP_STATUS.OK).send(params);
      } else if (params.data == MessageHelper.USER_BLOCKED) {
        params.status = false;
        params.message = MessageHelper.USER_BLOCKED;
        return response.status(HTTP_STATUS.OK).send(params);
      } else if (params.data == "STAFF") {
        params.status = false;
        params.message = MessageHelper.STAFF_CAN_NOT_REGISTERED_AS_CUSTOMER;
        return response.status(HTTP_STATUS.OK).send(params);
      } else if (
        typeof params.data == "string" &&
        (params.data?.includes("Rate Limited") ||
          params.data?.includes("Daily OTP limit exceeded."))
      ) {
        params.status = false;
        params.message = "OTP Limit Exceeded. Please try again later.";
        return response.status(HTTP_STATUS.OK).send(params);
      } else {
        params.data = {
          client_id: params.data,
          operator: "jio",
        };
        params.message = MessageHelper.SUCCESS;
        response.status(HTTP_STATUS.OK).send(params);
      }
    } catch (error) {
      console.log(error);
      params.status = false;
      params.message = error.message;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
  },
  /**
   * This function used to verify customer otp
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  verifyMobileOTPCustomer: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.status = false;
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
    try {
      params.data = await authServices.verifyMobileOTPCustomer(request.body);
      if (params.data == MessageHelper.USER_BLOCKED) {
        params.status = false;
        params.message = MessageHelper.USER_BLOCKED;
        return response.status(HTTP_STATUS.OK).send(params);
      }
      if (params.data == MessageHelper.SOMETHING_WENT_WRONG) {
        params.status = false;
        params.message = MessageHelper.SOMETHING_WENT_WRONG;
        return response.status(HTTP_STATUS.OK).send(params);
      }
      if (params.data == MessageHelper.INVALID_OTP) {
        params.status = false;
        params.message = MessageHelper.INVALID_OTP;
        return response.status(HTTP_STATUS.OK).send(params);
      }
      params.message = MessageHelper.SUCCESS;
      response.status(HTTP_STATUS.OK).send(params);
    } catch (error) {
      console.log(error);
      params.status = false;
      params.message = error.message;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
  },
  /**
   * This function used to verify customer otp
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  verifyMobileOTPStaff: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.status = false;
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
    try {
      params.data = await authServices.verifyMobileOTPStaff(request.body);
      if (params.data == MessageHelper.USER_BLOCKED) {
        params.status = false;
        params.message = MessageHelper.USER_BLOCKED;
        return response.status(HTTP_STATUS.OK).send(params);
      }
      if (params.data == MessageHelper.SOMETHING_WENT_WRONG) {
        params.status = false;
        params.message = MessageHelper.SOMETHING_WENT_WRONG;
        return response.status(HTTP_STATUS.OK).send(params);
      }
      if (params.data == MessageHelper.INVALID_OTP) {
        params.status = false;
        params.message = MessageHelper.INVALID_OTP;
        return response.status(HTTP_STATUS.OK).send(params);
      }
      if (!params.data) {
        params.status = false;
        params.message = MessageHelper.INVALID_OTP;
        return response.status(HTTP_STATUS.OK).send(params);
      }
      params.message = MessageHelper.SUCCESS;
      response.status(HTTP_STATUS.OK).send(params);
    } catch (error) {
      console.log(error);
      params.status = false;
      params.message = error.message;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
  },
  /**
   * This function used to verify mobile OTP
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  verifyMobileOtp: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
    try {
      params.data = await authServices.verifyMobileOtp(request.body);
      if (params.data) {
        params.message = MessageHelper.MOBILE_OTP_VERIFIED;
        response.status(HTTP_STATUS.OK).send(params);
      } else {
        params.message = MessageHelper.MOBILE_OTP_VERIFICATION_FAILED;
        response.status(HTTP_STATUS.OK).send(params);
      }
    } catch (error) {
      console.log(error);
      params.status = false;
      params.message = error.message;
      response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },
  /**
   * This function used to verify email OTP
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  verifyOtp: async (request, response) => {
    const { idUser } = request.user;
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }
    try {
      params.data = await authServices.verifyOtp(request.body, idUser);
      if (params.data === false) {
        params.message = MessageHelper.OTP_VERIFICATION_FAILED;
        response.status(HTTP_STATUS.OK).send(params);
      } else {
        params.message = MessageHelper.OTP_VERIFIED;
        response.status(HTTP_STATUS.OK).send(params);
      }
    } catch (error) {
      console.log(error);
      params.status = false;
      params.message = error.message;
      response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },

  generateMobileOtp: async (request, response) => {
    const phone = request.body.phone;
    const params = { ...resParams };
    try {
      const otp = await OtpHelper.generateMobileOtp(phone);
      if (otp) {
        params.data = await authServices.registerUser(phone, otp);
      }
    } catch (e) {
      console.log("Error in user creation", e);
      params.message = error.message;
      params.data = e;
      response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },
  getLoginUser: (request, response) => {},
};
