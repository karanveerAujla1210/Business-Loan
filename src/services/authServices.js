const { Op } = require("sequelize");
const OtpHelper = require("../helpers/OtpHelper");
const User = require("../models/user");
const UserOtp = require("../models/user_otp");
const { createToken } = require("../helpers/jwtHelper");
const Applicant = require("../models/applicant");
const Employees = require("../models/staffModal");
const SMS_DETAILS = require("../models/CheckSmsModal");
const userServices = require("./userServices");
const MessageHelper = require("../helpers/MessageHelper");
const URL_CONSTANTS = require("../config/constants");
const { default: axios } = require("axios");
const { logger } = require("../utils/logger");
const { sendOtpDLT } = require("../utils/sendDltOtp");
//ADDED 
module.exports = {
  /**
   * This function used to login user
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  sendMobileOTPStaff: async (data) => {
    try {
      const { phone } = data;
      logger.warn("phone", phone);
      let user = await userServices.getStaffByMobile(phone);
      let res;
      if (user) {
        if (user?.EmployeeID) {
          const min = 100000;
          const max = 999999;
          const OTP = Math.floor(Math.random() * (max - min + 1) + min);
          const msg = `Your One-Time Password (OTP) is: ${OTP} Please enter this code to complete your Mobile Number Verification. Do not share this OTP with anyone for security reasons. Thank you, Team Mini Business Loan`;

          // otp = await OtpHelper.generateMobileOtp(phone);
          res = await sendOtpDLT(phone, OTP, msg);
          if (res !== false && typeof res === "string") {
            // const { status } = result?.data;
            // const transactionId = result?.data?.results[0]?.messageid;

            return res;
          } else {
            false;
          }
        }
        // else if (user?.employeeId && user?.isBlocked == 1) {
        //   logger.warn("HYY", MessageHelper.USER_BLOCKED);
        //   return MessageHelper.USER_BLOCKED;
        // }
      } else {
        return MessageHelper.USER_NOT_REGISTERED;
      }
    } catch (error) {
      logger.warn("ERROR Sending otp customer", error);
      //   throw new Error(`Error in generate OTP`);
    }
  },
  /**
   * This function used to Register User
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  sendOtpCustomer: async (
    phone,
    appliedMode,
    sourceBy = null,
    postingBranch = null,
    branchName = null
  ) => {
    try {
      console.log({ phone, appliedMode, sourceBy });
      let staff;
      let user = await userServices.getUserByMobile(phone);

      let otp;
      let res;
      const min = 100000;
      const max = 999999;
      const OTP = Math.floor(Math.random() * (max - min + 1) + min);
      // const MSG = `Your One-Time Password (OTP) is: ${OTP} Please enter this code to complete your Mobile Number Verification. Do not share this OTP with anyone for security reasons. Thank you, Team Mini Business Loan`;
      const MSG = `Your One-Time Password (OTP) is: ${OTP} Please enter this code to complete your Mobile Number Verification. Do not share this OTP with anyone for security reasons. Thank you, Team Mini Business Loan`;
      if (user === "STAFF") {
        return user;
      }
      if (user?.isLeadRejected == 1) {
        return MessageHelper.LEAD_REJECTED;
      }

      if (user && user !== "STAFF") {
        if (user?.customerID && user?.isBlocked != 1) {
          // otp = await OtpHelper.generateMobileOtp(phone);
          res = await sendOtpDLT(phone, OTP, MSG);
          if (res !== false && typeof res === "string") {
            // const { status } = result?.data;
            // const transactionId = result?.data?.results[0]?.messageid;

            return res;
          } else {
            false;
          }

          // otp = await OtpHelper.generateMobileOtp(phone);
          // if (otp != false) {
          //   return otp;
          // } else {
          //   false;
          // }
        } else if (user?.customerID && user?.isBlocked == 1) {
          return MessageHelper.USER_BLOCKED;
        }
      } else {
        if (sourceBy) {
          staff = await Employees.findOne({
            attributes: ["postingBranch", "location"],
            where: {
              EmployeeID: sourceBy,
            },
          });
          logger.warn("staff", staff);
        }
        // otp = await OtpHelper.generateMobileOtp(phone);
        res = await sendOtpDLT(phone, OTP, MSG);

        user = await Applicant.create({
          phoneNumber: phone,
          status: 1,
          sourceBy: staff?.postingBranch ? sourceBy : null,
          appliedMode: appliedMode,
          isBlocked: null,
          branchID: staff?.postingBranch ? staff?.postingBranch : "individual",
          branchName: staff?.location ? staff?.location : "individual",
        });
        if (res !== false && typeof res === "string") {
          // const { status } = result?.data;
          // const transactionId = result?.data?.results[0]?.messageid;

          return res;
        } else {
          false;
        }
        // if (otp != false) {
        //   return otp;
        // } else {
        //   false;
        // }
      }
    } catch (error) {
      logger.warn("ERROR Sending otp customer", error);
      //   throw new Error(`Error in generate OTP`);
    }
  },
  /**
   * This function used to Verify OTP Customer
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  verifyMobileOTPCustomer: async (dataNew) => {
    try {
      const { phone, otp, client_id } = dataNew;
      let user = await userServices.getUserByMobile(phone);
      logger.warn("_____USER STEP 1", user);
      const res = await SMS_DETAILS.findOne({
        where: {
          mobileNumber: phone,
          transactionID: client_id,
          OTP: otp,
          OTPVerified: 0,
        },
      });

      // let data = JSON.stringify({
      //   client_id: client_id,
      //   otp: otp,
      // });

      // let config = {
      //   method: "post",
      //   maxBodyLength: Infinity,
      //   url: URL_CONSTANTS.VERIFY_OTP_URL,
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: process.env.SUREPASS_PROD_ACCESS_KEY,
      //   },
      //   data: data,
      // };

      // const response = await axios.request(config);
      // if (response?.data?.status_code == 200) {
      if (res) {
        const userData = await Applicant.findOne({
          attributes: ["customerID", "loanApplicationStatus"],
          where: {
            phoneNumber: phone,
          },
        });
        logger.warn("_____USER STEP 2", userData);
        if (userData?.customerID && userData?.loanApplicationStatus == 0) {
          logger.warn("_____USER STEP 3", userData);
          await Applicant.update(
            { loanApplicationStatus: 1, pendingReason: "FILE LOGIN" },
            {
              where: {
                customerID: userData?.customerID,
              },
            }
          );
        }
        // if (!userData?.loanApplicationStatus) {
        //   await Applicant.update(
        //     { loanApplicationStatus: 1 },
        //     {
        //       where: {
        //         phoneNumber: phone,
        //       },
        //     }
        //   );
        // }
        const payload = {
          idUser: user?.customerID,
          phone: user?.phoneNumber,
        };

        return await createToken(payload);
      }
      // if (response?.data?.status_code != 200) {
      //   return MessageHelper.INVALID_OTP;
      // }

      if (!user) {
        return "USER NOT FOUND";
      }
    } catch (error) {
      if (error.response?.data?.status_code == 422) {
        return MessageHelper.INVALID_OTP;
      }
      if (error.response?.data?.status_code == 500) {
        return MessageHelper.SOMETHING_WENT_WRONG;
      }
      logger.warn("ERROR Sending otp customer", error?.response);
      return false;
      //   throw new Error(`Error in verifying OTP`, error);
    }
  },
  verifyMobileOTPStaff: async (dataNew) => {
    try {
      const { phone, otp, client_id } = dataNew;
      let user = await userServices.getStaffByMobile(phone);
      logger.warn("___________user", user);
      const res = await SMS_DETAILS.findOne({
        where: {
          mobileNumber: phone,
          transactionID: client_id,
          OTP: otp,
          OTPVerified: 0,
        },
      });
      console.log("res", res);
      // let data = JSON.stringify({
      //   client_id: client_id,
      //   otp: otp,
      // });

      // let config = {
      //   method: "post",
      //   maxBodyLength: Infinity,
      //   url: URL_CONSTANTS.VERIFY_OTP_URL,
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: process.env.SUREPASS_PROD_ACCESS_KEY,
      //   },
      //   data: data,
      // };

      // const response = await axios.request(config);
      // logger.warn("response", response?.data);
      // if (response?.data?.status_code == 200) {
      if (res) {
        const payload = {
          idUser: user.EmployeeID,
          phone: user.mobileNumber,
          roleAssigned: user.roleAssigned,
        };

        const token = await createToken(payload);
        return {
          token: token,
        };
      } else {
        return MessageHelper.INVALID_OTP;
      }
      // if (response?.data?.status_code != 200) {
      //   return MessageHelper.INVALID_OTP;
      // }
    } catch (error) {
      logger.warn("ERROR Verifying otp customer", error);
      if (error.response?.data?.status_code == 422) {
        return MessageHelper.INVALID_OTP;
      }
      if (error.response?.data?.status_code == 500) {
        return MessageHelper.SOMETHING_WENT_WRONG;
      }
    }
  },

  /**
   * This function used to Verify Token
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  verifyOtp: async (data, idUser) => {
    const { email, otp } = data;
    const user = await User.findOne({
      where: {
        idUser,
        emailVerifyStatus: "0",
        status: "1",
      },
      include: [
        {
          model: UserOtp,
          as: "otp",
          where: { otp },
        },
      ],
    });
    logger.warn(user);
    if (user) {
      await User.update(
        {
          emailVerifyStatus: "1",
          email: email,
          profileStatus: "email",
        },
        { where: { id: idUser, status: "1" } }
      );
      return true;
    } else {
      return false;
    }
  },
  /**
   * This function used to Verify Token
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  verifyMobileOtp: async (data) => {
    const { phone, otp } = data;
    const user = await User.findOne({
      where: { phone: phone, status: "1" },
      include: [
        {
          model: UserOtp,
          as: "otp",
          where: { otp, otpType: "mobile" },
        },
      ],
    });
    if (user) {
      const payload = {
        idUser: user.idUser,
        phone: user.phone,
      };
      const token = await createToken(payload);
      return {
        user,
        authToken: token,
      };
    } else {
      return false;
    }
  },
  /**
   * This function used to generate email OTP and send email
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  generateOtp: async (body, user) => {
    let userOtp;
    const newUser = await User.findByPk(user.idUser);
    // newUser.email = body.email;
    // newUser.save();
    const otpToken = await OtpHelper.generateOtp(body.email);
    const recentOtp = await UserOtp.findOne({
      where: { idUser: newUser.idUser },
    });
    if (recentOtp) {
      userOtp = await UserOtp.update(
        { otp: otpToken },
        { where: { idUser: newUser.idUser } }
      );
    } else {
      userOtp = await UserOtp.create({
        idUser: newUser.idUser,
        otp: otpToken,
      });
    }
    //newUser.save();
    if (userOtp) {
      return true;
    } else {
      throw new Error(`Error in generate OTP`);
    }
  },
};
