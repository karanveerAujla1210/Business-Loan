const sendEmail = require("../services/emailService");
const MessageHelper = require("../helpers/MessageHelper");
const utilityHelper = require("../helpers/utilityHelper");
const SMS_DETAILS = require("../models/checkSmsDetails");
const axios = require("axios");
const URL_CONSTANTS = require("../config/constants");

module.exports = {
  /**
   * This function used to generate OTP and send email
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  sendEmailDigilockerKYC: async (emailId, name, url) => {
    let mailDetails = {
      from: process.env.FROM,
      to: emailId,
      subject: "Digilocker Verification",
      text: `Hi ${name}, Please complete Digilocker KYC process by clicking the link below:\n\n${url}`,
    };
    let mail = await sendEmail(mailDetails);
    // if(mail){}
    console.log("mail__", mail);
    // return ;
  },
  sendEmailBankStatement: async (emailId, name, url) => {
    console.log("emailId, name, url", emailId, name, url);
    let mailDetails = {
      from: process.env.FROM,
      to: emailId,
      subject: "Eligibilty Check - Upload Bank Statement",
      text: `Hi ${name}, Please Upload your Bank Statement by clicking the link below:\n\n${url}`,
    };
    let mail = await sendEmail(mailDetails);
    console.log("mail__", mail);
    // return ;
  },
  sendEmailSanctionLetter: async (emailId, name, url) => {
    console.log("emailId, name, url", emailId, name, url);
    let mailDetails = {
      from: process.env.FROM,
      to: emailId,
      subject: "E-Sign Loan Agreement",
      text: `Hi ${name}, Please E-Sign your Sanction Letter by clicking the link below:\n\n${url}`,
    };
    let mail = await sendEmail(mailDetails);
    console.log("mail__", mail);
    // return ;
  },
  generateOtp: async (emailId) => {
    // const OTP = Math.floor(Math.random() * (max - min + 1) + min);
    const OTP = "000000";
    let mailDetails = {
      from: process.env.FROM,
      to: emailId,
      subject: "Verify OTP",
      text: `Please verify your email by clicking the link below:\n\n${url}`,
    };
    // let mail = await sendEmail(mailDetails);
    return OTP;
  },

  generateMobileOtp: async (mobileNo) => {
    try {
      let data = JSON.stringify({
        id_number: mobileNo,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.SEND_OTP_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SUREPASS_PROD_ACCESS_KEY,
        },
        data: data,
      };

      const response = await axios.request(config);

      console.log("_____response", response?.data);

      if (response?.data?.status_code == 200) {
        return response?.data?.data;
      } else if (response?.data?.status_code != 200) {
        return false;
      }
      return false;
    } catch (error) {
      console.log("ERROR", error?.response?.data);
      if (error?.response?.data?.status_code != 200) {
        return error?.response?.data?.message;
      }
    }
  },
};
