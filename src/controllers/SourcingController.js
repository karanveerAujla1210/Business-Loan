/**
 * This file contain card details
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */
const resParams = require("../config/params");
const HTTP_STATUS = require("../helpers/httpStatus");
const MessageHelper = require("../helpers/MessageHelper");
const authServices = require("../services/authServices");
const errorHelper = require("../helpers/errorHelper");
const cardServices = require("../services/cardServices");
const OtpHelper = require("../helpers/OtpHelper");
const digilockerServices = require("../services/digilockerServices");
const { uploadFileToS3 } = require("../utils/uploadFilesS3");
const bankServices = require("../services/bankServices");
const UserBSALog = require("../models/userBSALog");
const DigilockerRequestModel = require("../models/digilockerRequests");
const { default: axios } = require("axios");
const BranchMaster = require("../models/BranchMaster");
module.exports = {
  /**
   * This function used to Add Payment Card
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  fetchCurrentUser: async (request, response) => {
    const params = { ...resParams };
    const { EmployeeID } = request.user;
    // console.log("___________idUser", request.user);
    const err = await errorHelper.checkError(request);

    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.fetchCurrentUser({ EmployeeID });
        if (!params.data) {
          params.message = MessageHelper.INTERNAL_SERVER_ERROR;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  fetchCurrentUserWeb: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);

    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        const { customerID, loanApplicationStatus, phoneNumber } = request.user;
        params.data = { customerID, loanApplicationStatus, phoneNumber };
        params.message = MessageHelper.SUCCESS;
        response.status(HTTP_STATUS.OK).send(params);
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  fetchCustomerUser: async (request, response) => {
    const params = { ...resParams };
    const { phone } = request?.body;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.status = false;
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.fetchCustomerUser({
          phone,
        });
        if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.INTERNAL_SERVER_ERROR;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  sendOTP: async (request, response) => {
    const params = { ...resParams };
    const { phone } = request.body;
    // const { idUser } = request.user;
    // card.idUser = idUser;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.initiateDigilocker({
          phone,
        });
        if (params.data == false) {
          params.message = MessageHelper.DIGILOCKER_URL_ERROR;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.DIGILOCKER_URL_CREATED;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  initiateDigilocker: async (request, response) => {
    const params = { ...resParams };
    const { phone, name, email, redirectURL } = request.body;
    const idUser = request?.user?.EmployeeID || request?.user?.customerID;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.initiateDigilocker({
          phone,
          name,
          email,
          redirectURL,
          idUser,
        });
        if (params.data == false) {
          params.message = MessageHelper.DIGILOCKER_URL_ERROR;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.status = false;
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  downloadDocumentsAndUpdateData: async (request, response) => {
    const params = { ...resParams };
    const { digilocker_client_id, customerNumber } = request.body;
    const idUser = request?.user?.EmployeeID || request?.user?.customerID;

    // console.log("idUser",idUser);
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.downloadDocumentsAndUpdateData({
          digilocker_client_id,
          customerNumber,
          idUser,
        });
        if (params.data == MessageHelper.AGE_ERROR) {
          params.status = false;
          params.message = MessageHelper.AGE_ERROR;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (
          params.data == MessageHelper.USER_ALREADY_EXIST_WITH_DIFFERENT_NUMBER
        ) {
          params.status = false;
          params.message =
            MessageHelper.USER_ALREADY_EXIST_WITH_DIFFERENT_NUMBER;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.CUSTOMER_DETAILS_MISMATCH) {
          params.status = false;
          params.message = MessageHelper.CUSTOMER_DETAILS_MISMATCH;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.KYC_ALREADY_PROVIDED) {
          params.status = true;
          params.message = MessageHelper.KYC_ALREADY_PROVIDED;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (
          params.data == MessageHelper.INSUFFICIENT_DOCUMENTS_PROVIDED
        ) {
          params.status = false;
          params.message = MessageHelper.INSUFFICIENT_DOCUMENTS_PROVIDED;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == "DIGILOCKER REQUEST TIMEOUT") {
          params.status = false;
          params.message = MessageHelper.DIGILOCKER_REQUEST_TIMEOUT;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == "No Documents Found") {
          params.status = false;
          params.message = MessageHelper.NO_DIGILOCKER_DOCUMENTS_FOUND;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (!params.data) {
          params.status = false;
          params.message = MessageHelper.DIGILOCKER_DOCUMENTS_PROCESSING;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.status = false;
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  updateApplicantAdditionalData: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      const validatePan = (pan) => {
        return (
          /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan) ||
          /^[A-Z]{5}[0-9]{4}[A-Z]{1,4}$/.test(pan)
        );
      };
      try {
        const data = await digilockerServices.updateApplicantAdditionalDetails(
          request.body
        );
        if (data == "User Not Found") {
          // console.log("STEP 2");
          params.status = false;
          params.message = MessageHelper.USER_NOT_FOUND;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (!data) {
          // console.log("STEP 3");
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (validatePan(data?.panNumber)) {
          // console.log("STEP 4");
          params.data = await digilockerServices.fetchCibilReport({
            pan: data?.panNumber,
          });
          if (params.data == MessageHelper.PAN_DETAILS_NOT_AVAILABLE) {
            params.status = false;
            params.message = MessageHelper.USER_NOT_FOUND;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (params.data == MessageHelper.LEAD_REJECTED) {
            params.status = false;
            params.message = MessageHelper.LEAD_REJECTED;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (!params.data) {
            params.status = false;
            params.message = MessageHelper.SOMETHING_WENT_WRONG;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (
            typeof params.data == "string" &&
            params.data?.includes("THIRD PARTY SUREPASS")
          ) {
            params.status = false;
            params.message = params.data;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (
            params.data == MessageHelper.LEAD_REJECTED_DUE_LOW_CREDIT_SCRORE
          ) {
            params.status = false;
            params.message = MessageHelper.LEAD_REJECTED_DUE_LOW_CREDIT_SCRORE;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (!params.data) {
            params.status = false;
            params.message = MessageHelper.SOMETHING_WENT_WRONG;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (params.data != true) {
            params.status = false;
            params.message = params.data;
            response.status(HTTP_STATUS.OK).send(params);
          } else {
            // await digilockerServices.downloadPDFCIBILBureauReport({
            //   pan: data?.panNumber,
            //   customerID: data?.customerID,
            // });
            params.message = MessageHelper.SUCCESS;
            response.status(HTTP_STATUS.OK).send(params);
          }
        } else {
          params.status = false;
          params.message = MessageHelper.INAVLID_PAN;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  downlaodCibilReport: async (request, response) => {
    const params = { ...resParams };
    const { pan, customerID } = request.body;

    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        // params.data = await digilockerServices.downloadPDFBureauReport({
        //   pan,
        //   customerID,
        // });
        params.data = await digilockerServices.downloadPDFCIBILBureauReport({
          pan,
          customerID,
        });
        if (!params.data) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.CIBIL_DATA_FETCHED;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  fetchCibilReport: async (request, response) => {
    const params = { ...resParams };
    const { pan } = request.body;
    // const { idUser } = request.user;
    // card.idUser = idUser;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.fetchCibilReport({
          pan,
        });
        console.log(" params.data_______", params.data);
        if (params.data == MessageHelper.PAN_DETAILS_NOT_AVAILABLE) {
          params.status = false;
          params.message = MessageHelper.PAN_DETAILS_NOT_AVAILABLE;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.INAVLID_PAN) {
          params.status = false;
          params.message = MessageHelper.INAVLID_PAN;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (
          typeof params.data == "string" &&
          params.data?.includes("THIRD PARTY SUREPASS")
        ) {
          params.status = false;
          params.message = params.data;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (
          params.data == MessageHelper.LEAD_REJECTED_DUE_LOW_CREDIT_SCRORE
        ) {
          params.status = false;
          params.message = MessageHelper.LEAD_REJECTED_DUE_LOW_CREDIT_SCRORE;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (!params.data) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data != true) {
          params.status = false;
          params.message = params.data;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == true) {
          params.message = MessageHelper.CIBIL_DATA_FETCHED;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  sendOTPCoApp: async (request, response) => {
    const params = { ...resParams };
    const { pan, phone, customerID } = request.body;
    // const { idUser } = request.user;
    // card.idUser = idUser;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        const dt = await digilockerServices.verifyCoAppPAN({ pan, customerID });
        if (dt) {
          params.data = await digilockerServices.sendOTPCoApp({
            phone,
          });
          if (params.data == false) {
            params.message = MessageHelper.SOMETHING_WENT_WRONG;
            response.status(HTTP_STATUS.OK).send(params);
          } else {
            params.data = {
              client_id: params.data,
              operator: "jio",
            };
            params.message = MessageHelper.SUCCESS;
            response.status(HTTP_STATUS.OK).send(params);
          }
        } else {
          params.message = MessageHelper.INAVLID_PAN;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  verifyOTPCoApp: async (request, response) => {
    const params = { ...resParams };
    const { phone, otp, customerID, client_id } = request.body;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.verifyMobileOTPCoApp({
          phone,
          otp,
          customerID,
          client_id,
        });
        console.log("  _________   params.data ",     params.data );
        if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.SOMETHING_WENT_WRONG) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          return response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.INVALID_OTP) {
          params.status = false;
          params.message = MessageHelper.INVALID_OTP;
          return response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  validateElectricityBill: async (request, response) => {
    const params = { ...resParams };
    const { operator_code, id_number, customerID } = request.body;
    // const { idUser } = request.user;
    // card.idUser = idUser;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.validateElectricityBill({
          operator_code,
          id_number,
          customerID,
        });
        if (params.data == MessageHelper.INAVLID_ELECTRICITY_BILLL) {
          params.message = MessageHelper.INAVLID_ELECTRICITY_BILLL;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  validateGSTIN: async (request, response) => {
    const params = { ...resParams };
    const { gstin, customerID } = request.body;
    // const { idUser } = request.user;
    // card.idUser = idUser;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.validateGstin({
          gstin,
          customerID,
        });
        if (params.data == MessageHelper.INAVLID_GST) {
          params.status = false;
          params.message = MessageHelper.INAVLID_GST;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.INACTIVE_GST) {
          params.status = false;
          params.message = MessageHelper.INACTIVE_GST;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.UNKNOWN_GST) {
          params.status = false;
          params.message = MessageHelper.UNKNOWN_GST;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  sendOtpUdyam: async (request, response) => {
    const params = { ...resParams };
    const { phone, registration_number } = request.body;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        // console.log("params.data", { phone, registration_number });
        params.data = await digilockerServices.sendOtpUdyam({
          phone,
          registration_number,
        });
        // console.log("params.data", params.data);
        if (params.data == MessageHelper.INAVLID_UDYAM) {
          params.message = MessageHelper.INAVLID_UDYAM;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  verifyOtpUdyam: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.verifyOtpUdyam(request.body);
        if (params.data == MessageHelper.INVALID_OTP) {
          params.status = false;
          params.message = MessageHelper.INVALID_OTP;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  fetchPendingCustomers: async (request, response) => {
    const params = { ...resParams };
    const { EmployeeID } = request?.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.fetchPendingCustomers({
          EmployeeID,
        });
        if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  getPendingCams: async (request, response) => {
    try {
      const params = { ...resParams };
      const err = await errorHelper.checkError(request);
      if (err) {
        params.message = err;
        response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
      } else {
        try {
          const { postingBranch } = request?.body;
          params.data = await digilockerServices.fetchPendingCams({
            branchID: postingBranch,
          });
          if (params.data == false) {
            params.message = MessageHelper.SOMETHING_WENT_WRONG;
            response.status(HTTP_STATUS.OK).send(params);
          } else {
            params.data = params.data ? params.data : [];
            params.message = MessageHelper.SUCCESS;
            response.status(HTTP_STATUS.OK).send(params);
          }
        } catch (error) {
          params.data = error;
          params.message = error.message;
          console.log(error);
          response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
        }
      }
    } catch (error) {
      console.log("ERROR ", error);
    }
  },
  getPendingEsign: async (request, response) => {
    const params = { ...resParams };
    const { EmployeeID, postingBranch } = request?.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.getPendingEsign({
          EmployeeID,
          postingBranch,
        });
        console.log("____________params.data ", params.data);
        if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.data = params.data ? params.data : [];
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  getUserSanction: async (request, response) => {
    const params = { ...resParams };
    const { customerID } = request?.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.getUserSanction({
          customerID,
        });
        if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.data = params.data ? params.data : [];
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  fetchApprovedCAMS: async (request, response) => {
    const params = { ...resParams };
    const { EmployeeID, postingBranch } = request?.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.fetchApprovedCAMS({
          EmployeeID,
          postingBranch,
        });
        if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.data = params.data ? params.data : [];
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  getRepaymentSchedule: async (request, response) => {
    const params = { ...resParams };
    const { customerID } = request?.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.getRepaymentSchedule({
          customerID,
        });
        if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.data = params.data ? params.data : [];
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },

  fetchRejectedCAMS: async (request, response) => {
    const params = { ...resParams };
    const { EmployeeID, postingBranch } = request?.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.fetchRejectedCAMS({
          EmployeeID,
          postingBranch,
        });
        if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.data = params.data ? params.data : [];
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  getUserSanction: async (request, response) => {
    const params = { ...resParams };
    const { customerID } = request?.user;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.getUserSanction({
          customerID,
        });
        // console.log("____________params.data ", params.data);
        if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.data = params.data ? params.data : [];
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  fetchBusinessNaturePurpose: async (request, response) => {
    const params = { ...resParams };

    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.fetchBusinessNaturePurpose();
        if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  saveBusinessDetails: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.saveBusinessDetails(
          request.body
        );
        if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  initiateBankStatement: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    const idUser = request?.user?.EmployeeID || request?.user?.customerID;
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await bankServices.initiateBankStatement({
          ...request?.body,
          idUser,
        });
        if (params.data == MessageHelper.LEAD_REJECTED) {
          params.status = false;
          params.message = MessageHelper.LEAD_REJECTED;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  checkBSAStatus: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await bankServices.checkBSAStatus(request.body);
        if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  processBankStatement: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      const {
        docId,
        status,
        reportFileName,
        endTime,
        fileNo,
        requestId,
        // message,
      } = request.body;
      let message = "";
      if (status === "Rejected") {
        await UserBSALog.update(
          { status },
          {
            where: { customerID: fileNo, requestID: requestId },
          }
        );
        params.status = false;
        params.message = message;
        response.status(HTTP_STATUS.OK).send(params);
      } else if (status === "Pending") {
        await UserBSALog.update(
          { status },
          {
            where: { customerID: fileNo, requestID: requestId },
          }
        );
        params.status = false;
        params.message = message;
        response.status(HTTP_STATUS.OK).send(params);
      } else if (status === "In Progress") {
        await UserBSALog.update(
          { status },
          {
            where: { customerID: fileNo, requestID: requestId },
          }
        );
        params.status = false;
        params.message = message;
        response.status(HTTP_STATUS.OK).send(params);
      } else if (status === "Processed") {
        try {
          params.data = await bankServices.processBankStatement({
            docId,
            fileNo,
            requestId,
          });
          if (params.data == MessageHelper.BSA_REJECTED) {
            params.status = false;
            params.message = MessageHelper.BSA_REJECTED;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (
            params.data == MessageHelper.BSA_INVALID_OR_MISSING_DETAILS
          ) {
            params.status = false;
            params.message = MessageHelper.BSA_INVALID_OR_MISSING_DETAILS;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (params.data == MessageHelper.BSA_OLD_STMT_ERROR) {
            params.status = false;
            params.message = MessageHelper.BSA_OLD_STMT_ERROR;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (params.data == MessageHelper.BSA_NAME_MISMATCH) {
            params.status = false;
            params.message = MessageHelper.BSA_NAME_MISMATCH;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (
            params.data == MessageHelper.BSA_INVALID_OR_MISSING_DETAILS
          ) {
            params.status = false;
            params.message = MessageHelper.BSA_INVALID_OR_MISSING_DETAILS;
            response.status(HTTP_STATUS.OK).send(params);
          } else if (params.data == false) {
            params.status = false;
            params.message = MessageHelper.SOMETHING_WENT_WRONG;
            response.status(HTTP_STATUS.OK).send(params);
          } else {
            params.message = MessageHelper.SUCCESS;
            response.status(HTTP_STATUS.OK).send(params);
          }
        } catch (error) {
          params.data = error;
          params.message = error.message;
          console.log(error);
          response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
        }
      }
    }
  },
  getStatementOptions: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await bankServices.getStatementOptions();
        if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  getRepaymentFrequency: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await bankServices.getRepaymentFrequency();
        if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  getAddress: async (request, response) => {
    const params = { ...resParams };
    const { latitude, longitude } = request.body;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        const res = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAP_API_KEY}`
        );

        if (res?.data?.status !== "OK") {
          params.message = `Geocode API Error: ${res?.data?.status}`;
          response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
          return;
        }
        const addressComponents = res?.data?.results?.[0]?.address_components;

        if (!Array.isArray(addressComponents)) {
          params.message = `Unexpected response structure`;
          response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
          return;
        }

        const postalComponent = addressComponents.find((comp) =>
          comp.types.includes("postal_code")
        );

        const pincode = postalComponent?.long_name;
        if (!pincode) {
          params.message = `Pincode not found in response for the current location`;
          response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
          return;
        }

        params.data = await BranchMaster.findOne({
          attributes: ["branchName", "zipCode"],
          where: {
            zipCode: pincode,
          },
        });

        if (!params.data) {
          params.status = false;
          params.message =
            "Currently We are not serving our service in your area.";
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  submitCamData: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    const { EmployeeID } = request.user;
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await bankServices.submitCamData({
          ...request.body,
          idUser: EmployeeID,
        });

        if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  getBanners: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await bankServices.getBanners();
        if (params.data == false) {
          params.status = false;
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  validateITR: async (request, response) => {
    const params = { ...resParams };
    const { gstin, customerID } = request.body;
    // const { idUser } = request.user;
    // card.idUser = idUser;
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      try {
        params.data = await digilockerServices.validateGstin({
          gstin,
          customerID,
        });
        if (params.data == MessageHelper.INAVLID_GST) {
          params.message = MessageHelper.INAVLID_GST;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.INACTIVE_GST) {
          params.message = MessageHelper.INACTIVE_GST;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == MessageHelper.UNKNOWN_GST) {
          params.message = MessageHelper.UNKNOWN_GST;
          response.status(HTTP_STATUS.OK).send(params);
        } else if (params.data == false) {
          params.message = MessageHelper.SOMETHING_WENT_WRONG;
          response.status(HTTP_STATUS.OK).send(params);
        } else {
          params.message = MessageHelper.SUCCESS;
          response.status(HTTP_STATUS.OK).send(params);
        }
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  uplaodFile: async (request, response) => {
    try {
      const params = { ...resParams };
      const file = request.files;
      params.data = await uploadFileToS3(file.file);
      if (params.data) {
        params.status = true;
        params.message = MessageHelper.SUCCESS;
        return response.status(HTTP_STATUS.OK).send(params); // <-- RETURN
      }
    } catch (error) {
      console.log(error);
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(error); // <-- RETURN
    }
  },
};
