const { logger } = require("bs-logger");
const axios = require("axios");
const qs = require("qs");
const SMS_DETAILS = require("../models/checkSmsDetails");

const DLT_ERROR_CODES = {
  100: "Message submitted with tracking ID.",
  150: "Message submitted.",
  200: "Authentication failure.",
  250: "No approved template found.",
  260: "Invalid message template.",
  350: "No more credits or account expired.",
  400: "Unicode message but type value not set.",
  500: "Blank message.",
  600: "Invalid Sender ID.",
  700: "No valid recipient number received.",
  255: "Blank TEMPLATE ID.",
  610: "Blank HEADER ID.",
  999: "Access denied. Contact service provider.",
};

const sendOtpDLT = async (phone_number, otp, msg) => {
  try {
    // ENV Validation
    console.log("__________", { phone_number, otp });
    const { NIMBUS_USER, authkey, sender, entityid, templateid, SMS_API_URL } =
      process.env;

    if (!NIMBUS_USER || !authkey || !sender || !entityid || !templateid) {
      console.log("Missing required SMS config.");
      throw new Error("Missing required SMS config.");
    }

    // const text = `Your One-Time Password (OTP) is: ${OTP} Please enter this code to complete your Mobile Number Verification. Do not share this OTP with anyone for security reasons. Thank you, Team Mini Business Loan`;
    const text = msg;

    
    const config = {
      user: NIMBUS_USER,
      authkey,
      sender,
      mobile: phone_number,
      text,
      entityid,
      templateid,
      rpt: 1,
    };

    const url = `${
      SMS_API_URL || "http://nimbusit.net/api/pushsms"
    }?${qs.stringify(config)}`;
    const response = await axios.get(url);
    const result = response.data;

    if (typeof result === "string") {
      const [codeStr] = result.split("|");
      const code = parseInt(codeStr.trim(), 10);

      if (DLT_ERROR_CODES[code] && ![100, 150].includes(code)) {
        return false;
      } else if (isNaN(code)) {
        return false;
      }
    }

    if (result?.RESPONSE?.CODE == 100 && result?.STATUS == "OK") {
      console.log("________", result, {
        mobileNumber: phone_number,
        transactionID: result?.RESPONSE?.UID,
        otp: otp,
        status: `${result.STATUS}`,
        otpVerified: 0,
      });
      await SMS_DETAILS.create({
        mobileNumber: phone_number,
        transactionID: result?.RESPONSE?.UID,
        otp: otp,
        status: `${result.STATUS}`,
        otpVerified: 0,
      });
      const client_id = result?.RESPONSE?.UID;
      return client_id;
    }
    return false;
  } catch (error) {
    console.log("____ERROR", error);
    return error.message;
  }
};

module.exports = {
  sendOtpDLT,
};
