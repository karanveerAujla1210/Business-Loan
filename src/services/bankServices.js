const { data } = require("../config/params");
const User = require("../models/user");
const UserBankAccount = require("../models/user_bank_account");
const URL_CONSTANTS = require("../config/constants");
const { ResponseError } = require("../utils/ResponseError");
const Applicant = require("../models/applicant");
const OtpHelper = require("../helpers/OtpHelper");
const { default: axios } = require("axios");
const UserBankStatement = require("../models/userBankStatement");
const UserBSALog = require("../models/userBSALog");
const StatementMasterServices = require("../models/statementServicesMaster");
const BannersModal = require("../models/BannersModel");
const MessageHelper = require("../helpers/MessageHelper");
const { nameSimilarity } = require("../utils/NameMatch");
const PaymentFrequency = require("../models/PaymentFrequency");
const CAM = require("../models/CAM");
const CustomerDocuments = require("../models/userDocument");
const { parse, isValid, differenceInDays } = require("date-fns");
const UserBankStatementABB = require("../models/CustomerBankDetailsABB");

module.exports = {
  /**
   * This function used to Add Bank accounts
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  addBank: async (data, idUser) => {
    data.idUser = idUser;
    const attributes = [
      "id",
      "idUser",
      "accountHolderName",
      "accountNumber",
      "bankName",
      "securityCode",
      "isDefault",
      "status",
    ];
    const user = await User.findOne({ where: { idUser } });
    const { profileStatus } = user.dataValues;
    const acc = await UserBankAccount.findAll({
      where: { idUser: idUser },
    });
    const unique = await UserBankAccount.findOne({
      where: { accountNumber: data.accountNumber, idUser: idUser },
    });
    if (unique) {
      return "Account Already added for the current user";
    } else {
      if (acc.length === 0) {
        data.isDefault = 1;
        await User.update(
          {
            profileStatus: `${profileStatus + "bank"}`,
          },
          { where: { idUser } }
        );
      } else if (acc.length >= 1) {
        data.isDefault = 0;
      }
      const newAcc = await UserBankAccount.create(data);
      return await UserBankAccount.findOne({
        attributes,
        where: { id: newAcc.id },
      });
    }
  },
  /**
   * This function used to Update User Bank account
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  updateUserBank: async (data, idUser, id) => {
    data.idUser = idUser;
    return await UserBankAccount.update(data, { where: { id: id } });
  },
  /**
   * This function used to Delete Bank accounts
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  deleteUserBankAccount: async (id) => {
    return await UserBankAccount.update({ status: "0" }, { where: { id: id } });
  },
  /**
   * This function used to Get All Bank accounts
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */

  getAllBankAccounts: async () => {
    return await UserBankAccount.findAll({ where: { status: 1 } });
  },
  /**
   * This function used to All User Bank accounts
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getUserBankAccount: async (idUser) => {
    return await UserBankAccount.findAll({
      where: { idUser: idUser, status: 1 },
    });
  },
  /**
   * This function used to Bank account by ID
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  getUserBankAccountById: async (accountId) => {
    return await UserBankAccount.findAll({
      where: { id: accountId, status: 1 },
    });
  },
  /**
   * This function used to Set default Bank accounts
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  setDefaultBankAccount: async (accountId, idUser) => {
    const account = await UserBankAccount.update(
      { isDefault: 0 },
      { where: { idUser: idUser } }
    );
    return await UserBankAccount.update(
      { isDefault: 1 },
      { where: { id: accountId } }
    );
  },
  getStatementOptions: async () => {
    return await StatementMasterServices.findAll({
      where: {
        status: 1,
      },
    });
  },
  getRepaymentFrequency: async () => {
    return await PaymentFrequency.findAll({
      where: {
        status: 1,
      },
    });
  },

  getBanners: async () => {
    return await BannersModal.findAll({
      attributes: ["imageURL"],
      where: {
        status: 1,
      },
    });
  },
  initiateBankStatement: async ({
    fileNo,
    bank,
    defaultScreen,
    accountType,
    idUser,
  }) => {
    try {
      const dt = await Applicant.findOne({
        where: {
          customerID: fileNo,
          isLeadRejected: 0,
        },
      });
      if (!dt) {
        return MessageHelper.LEAD_REJECTED;
      }
      const payloadData = {
        fileNo: fileNo,
        name: dt?.firstName,
        accountType: accountType,
        bank: bank,
        contactNo: dt.phoneNumber,
        defaultScreen: defaultScreen,
        callbackURL:
          "https://backend.minibusinessloan.com/api/v1/sourcing/process-bank-statement",
        callbackAuthToken:
          "Bearer 0b45c9e7f3f25ea55fc33c1f8b6dd1d1cbb6fffbf08aa4c79a78088a7b379da2",
      };

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("auth-token", process.env.NOVAL_PATTERN_AUTH_KEY);
      const raw = JSON.stringify(payloadData);
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const response = await fetch(
        URL_CONSTANTS.INITIATE_BANK_STATEMENT,
        requestOptions
      );
      const result = await response.json();
      if (result.status == "Pending") {
        await Applicant.update(
          { pendingReason: "BANK STATEMENT PROCESS INITIATED" },
          {
            where: {
              customerID: fileNo,
            },
          }
        );
        await UserBSALog.create({
          customerID: fileNo,
          requestID: result?.requestId,
          tempURL: result?.tempUrl,
          status: result?.status,
          fileNumber: result?.fileNo,
          accountType: result?.accountType,
          userEmailID: dt?.emailID,
        });
        // if (idUser?.includes("MBLA")) {
        await OtpHelper.sendEmailBankStatement(
          dt?.emailID,
          dt?.firstName,
          result?.tempUrl
        );
        // }
        return result;
      }
      return false;
    } catch (error) {
      console.error("INITIATE BSA API Error:", error);
    }
  },

  checkBSAStatus: async ({ fileNo, requestId }) => {
    try {
      return await UserBSALog.findOne({
        where: {
          fileNumber: fileNo,
          requestID: requestId,
        },
      });
    } catch (error) {
      console.error("Send OTP API Error:", error);
    }
  },

  processBankStatement: async ({ docId, fileNo, requestId }) => {
    try {
      const dt = await Applicant.findOne({
        where: {
          customerID: fileNo,
        },
      });

      let data = docId;

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.PROCESS_BANK_STATEMENT,
        headers: {
          "auth-token": process.env.NOVAL_PATTERN_AUTH_KEY,
          "Content-Type": "text/plain",
        },
        data: data,
      };

      const downloadResponse = await axios.request(config);
      console.log(
        "____________downloadResponse______________",
        downloadResponse?.data
      );

      if (downloadResponse?.data?.status === "Rejected") {
        await UserBSALog.update(
          {
            userBSAStatus: `Wrong file upload-${downloadResponse?.data?.message}`,
          },
          {
            where: { customerID: fileNo, requestID: requestId },
          }
        );
        return MessageHelper.BSA_REJECTED;
      }
      if (!downloadResponse?.data?.data || !downloadResponse?.data?.data[0]) {
        await UserBSALog.update(
          {
            userBSAStatus: `Invalid or missing bank details in the response`,
          },
          {
            where: { customerID: fileNo, requestID: requestId },
          }
        );
        return MessageHelper.BSA_INVALID_OR_MISSING_DETAILS;
      }

      const bankDetails = downloadResponse?.data?.data[0];

      const {
        bankName,
        bankFullName,
        branchName,
        accountNumber,
        ifscCode,
        accountType,
        accountName,
        periodStart,
        periodEnd,
        address,
        email,
        camAnalysisData,
        mobileNumber,
        panNumber,
        monthsEvaluated,
        documentType,
        lastCustomerTransactionDate,
      } = bankDetails;
      // Possible date formats (add more if needed)
      const possibleFormats = [
        "dd/MM/yyyy",
        "MM/dd/yyyy",
        "yyyy-MM-dd",
        "dd-MM-yyyy",
        "MM-dd-yyyy",
      ];

      function parseFlexibleDate(dateStr) {
        for (let format of possibleFormats) {
          const parsedDate = parse(dateStr, format, new Date());
          if (isValid(parsedDate)) {
            return parsedDate;
          }
        }
        throw new Error("Invalid date format");
      }

      let date;
      // try {
      date = parseFlexibleDate(periodEnd);
      // } catch (err) {
      //   console.error(err.message);
      //   process.exit(1);
      // }

      const currentDate = new Date();
      const diffDays = differenceInDays(currentDate, date);

      console.log(`Difference in days: ${diffDays}`);
      if (monthsEvaluated < 3) {
        await UserBSALog.update(
          {
            userBSAStatus: MessageHelper.BSA_INVALID_STMT_PERIOD,
          },
          {
            where: { customerID: fileNo, requestID: requestId },
          }
        );
        return MessageHelper.BSA_INVALID_STMT_PERIOD;
      }

      if (diffDays > 40) {
        await UserBSALog.update(
          {
            userBSAStatus: MessageHelper.BSA_OLD_STMT_ERROR,
          },
          {
            where: { customerID: fileNo, requestID: requestId },
          }
        );
        return MessageHelper.BSA_OLD_STMT_ERROR;
      }

      const { firstName, middleName, lastName } = dt;
      const full_name = [firstName, middleName, lastName]
        .filter((name) => !!name && name.trim() !== "")
        .join(" ");

      if (
        bankName &&
        accountNumber &&
        ifscCode &&
        camAnalysisData &&
        accountName
      ) {
        const {
          odCcLimit,
          inwardReturnCount,
          outwardReturnCount,
          inwardReturnAmount,
          outwardReturnAmount,
          totalNetCredits,
          averageBalance,
          customAverageBalance,
          customAverageBalanceLastThreeMonth,
          averageBalanceLastThreeMonth,
          averageBalanceLastSixMonth,
          averageBalanceLastTwelveMonth,
          averageReceiptLastSixMonth,
          averageReceiptLastTwelveMonth,
          salaryCreditCountLastThreeMonth,
          salaryCreditCountLastSixMonth,
          minBalanceLastThreeMonth,
          minBalanceLastSixMonth,
          minBalanceChargeCountLastSixMonth,
          camAnalysisMonthly,
        } = camAnalysisData;
        // const data = camAnalysisMonthly[camAnalysisMonthly?.length - 2];
        const data = camAnalysisMonthly?.filter(
          (item) => item?.month != "Grand Total"
        );
        console.log("______camAnalysisMonthly_____", data);
        const bsaUser = await UserBankStatement.findOne({
          where: {
            customerID: fileNo,
          },
        });
        console.log(data?.length, "bsaUser____ STEP 1", bsaUser);
        if (!bsaUser) {
          await UserBankStatement.update(
            { status: 0 },
            {
              where: { customerID: fileNo },
            }
          );
          const newStatement = await UserBankStatement.create({
            customerID: fileNo,
            bankName: bankFullName,
            accountNumber: accountNumber,
            accountHolderName: accountName,
            ifscCode: ifscCode,
            bankBranchName: branchName,
            periodStart: periodStart,
            periodEnd: periodEnd,
            addressInBank: address,
            email: email,
            mobileNumber: mobileNumber,
            panNumber: panNumber,
            monthsEvaluated: monthsEvaluated,
            documentType: documentType,
            lastCustomerTransactionDate: lastCustomerTransactionDate,
            odCcLimit,
            inwardReturnCount,
            outwardReturnCount,
            inwardReturnAmount,
            outwardReturnAmount,
            totalNetCredits,
            averageBalance,
            customAverageBalance,
            customAverageBalanceLastThreeMonth,
            averageBalanceLastThreeMonth,
            averageBalanceLastSixMonth,
            averageBalanceLastTwelveMonth,
            averageReceiptLastSixMonth,
            averageReceiptLastTwelveMonth,
            salaryCreditCountLastThreeMonth,
            salaryCreditCountLastSixMonth,
            minBalanceLastThreeMonth,
            minBalanceLastSixMonth,
            minBalanceChargeCountLastSixMonth,
          });
          // console.log("newStatement______", newStatement);
          if (newStatement) {
            const newBankStatement = await UserBankStatement.findOne({
              where: {
                customerID: fileNo,
              },
            });
            for (let i = data?.length - 1; i >= 0; i--) {
              await UserBankStatementABB.create({
                balanceOn5th: data[i]?.customDayBalances?.["5"],
                balanceOn10th: data[i]?.customDayBalances?.["10"],
                balanceOn15th: data[i]?.customDayBalances?.["15"],
                balanceOn20th: data[i]?.customDayBalances?.["20"],
                balanceOn25th: data[i]?.customDayBalances?.["25"],
                bankStatementID: newBankStatement?.ID,
                customerID: fileNo,
              });
            }
            const res = nameSimilarity(accountName, full_name);
            if (res > 50) {
              await Applicant.update(
                {
                  loanApplicationStatus: 6,
                  pendingReason: "BSA COMPLETED",
                },
                {
                  where: {
                    customerID: fileNo,
                  },
                }
              );
              await UserBSALog.update(
                {
                  userBSAStatus: `SUCCESS`,
                },
                {
                  where: { customerID: fileNo, requestID: requestId },
                }
              );
              return true;
            } else {
              await UserBSALog.update(
                {
                  userBSAStatus: MessageHelper.BSA_NAME_MISMATCH,
                },
                {
                  where: { customerID: fileNo, requestID: requestId },
                }
              );
              await Applicant.update(
                {
                  pendingReason: `BSA Pending Reason: ${MessageHelper.BSA_NAME_MISMATCH}`,
                },
                {
                  where: {
                    customerID: fileNo,
                  },
                }
              );
              return MessageHelper.BSA_NAME_MISMATCH;
            }
          }
        } else {
          const newStatement = await UserBankStatement.update(
            {
              bankName: bankFullName,
              accountNumber: accountNumber,
              accountHolderName: accountName,
              ifscCode: ifscCode,
              bankBranchName: branchName,
              periodStart: periodStart,
              periodEnd: periodEnd,
              addressInBank: address,
              email: email,
              mobileNumber: mobileNumber,
              panNumber: panNumber,
              monthsEvaluated: monthsEvaluated,
              documentType: documentType,
              lastCustomerTransactionDate: lastCustomerTransactionDate,
              odCcLimit,
              inwardReturnCount,
              outwardReturnCount,
              inwardReturnAmount,
              outwardReturnAmount,
              totalNetCredits,
              averageBalance,
              customAverageBalance,
              customAverageBalanceLastThreeMonth,
              averageBalanceLastThreeMonth,
              averageBalanceLastSixMonth,
              averageBalanceLastTwelveMonth,
              averageReceiptLastSixMonth,
              averageReceiptLastTwelveMonth,
              salaryCreditCountLastThreeMonth,
              salaryCreditCountLastSixMonth,
              minBalanceLastThreeMonth,
              minBalanceLastSixMonth,
              minBalanceChargeCountLastSixMonth,
              balanceOn5th: data?.customDayBalances?.["5"],
              balanceOn10th: data?.customDayBalances?.["10"],
              balanceOn15th: data?.customDayBalances?.["15"],
              balanceOn20th: data?.customDayBalances?.["20"],
              balanceOn25th: data?.customDayBalances?.["25"],
            },
            {
              where: {
                customerID: fileNo,
              },
            }
          );
          console.log(data?.length, "bsaUser____ STEP 2", bsaUser);
          if (newStatement) {
            const res = nameSimilarity(accountName, full_name);
            if (res > 50) {
              for (let i = data?.length - 1; i >= 0; i--) {
                await UserBankStatementABB.create({
                  balanceOn5th: data[i]?.customDayBalances?.["5"],
                  balanceOn10th: data[i]?.customDayBalances?.["10"],
                  balanceOn15th: data[i]?.customDayBalances?.["15"],
                  balanceOn20th: data[i]?.customDayBalances?.["20"],
                  balanceOn25th: data[i]?.customDayBalances?.["25"],
                  bankStatementID: bsaUser?.ID,
                  customerID: fileNo,
                });
              }
              await Applicant.update(
                {
                  loanApplicationStatus: 6,
                  pendingReason: "BSA COMPLETED",
                },
                {
                  where: {
                    customerID: fileNo,
                  },
                }
              );
              await UserBSALog.update(
                {
                  userBSAStatus: `SUCCESS`,
                },
                {
                  where: { customerID: fileNo, requestID: requestId },
                }
              );
              return true;
            } else {
              await UserBSALog.update(
                {
                  userBSAStatus: MessageHelper.BSA_NAME_MISMATCH,
                },
                {
                  where: { customerID: fileNo, requestID: requestId },
                }
              );
              await Applicant.update(
                {
                  pendingReason: `BSA Pending Reason: ${MessageHelper.BSA_NAME_MISMATCH}`,
                },
                {
                  where: {
                    customerID: fileNo,
                  },
                }
              );
              return MessageHelper.BSA_NAME_MISMATCH;
            }
          }
        }
      } else {
        let val;

        if (!bankName) {
          val =
            "BSA Pending Reason: Bank Name is missing in the bank statement ";
        }
        if (!accountNumber) {
          val =
            "BSA Pending Reason: Account Number is missing in the bank statement ";
        }
        if (!ifscCode) {
          val = "BSA Pending Reason: IFSC is missing in the bank statement ";
        }
        if (!accountName) {
          val =
            "BSA Pending Reason: Account Holder Name is missing in the bank statement ";
        }
        await UserBSALog.update(
          {
            userBSAStatus: val,
          },
          {
            where: { customerID: fileNo, requestID: requestId },
          }
        );
        return MessageHelper.BSA_INVALID_OR_MISSING_DETAILS;
      }
    } catch (error) {
      console.log("error", error);
      //   if (error.response) {
      //     throw new ResponseError(
      //       error.response.status || 500,
      //       error.response.data?.error || "Third-Party API returned an error"
      //     );
      //   } else {
      //     throw new ResponseError(
      //       500,
      //       error.message || "Failed to connect to Third-Party API"
      //     );
      //   }
    }
  },

  submitCamData: async (data) => {
    try {
      const {
        customerID,
        dailySales,
        businessRunningDays,
        monthlyTurnover,
        annualTurnOver,
        businessVintage,
        existingMonthlyObligations,
        loanAmountApplied,
        noOfEMI,
        perDayCashFlow,
        stockInventory,
        netBusinessTurnOver,
        businessRent,
        expensesCost,
        businessMargin,
        noOfStaff,
        salary,
        otherIncome,
        householdExpenses,
        netIncomeAfterExpenses,
        netDisposableIncome,
        recommendedBy,
        recommendedDate,
        businessImg,
        idUser
      } = data;
      const camRecord = await CAM.create({
        customerID,
        dailySales,
        businessRunningDays,
        monthlyTurnover,
        annualTurnOver,
        businessVintage,
        existingMonthlyObligations,
        loanAmountApplied,
        noOfEMI,
        perDayCashFlow,
        stockInventory,
        netBusinessTurnOver,
        businessRent,
        expensesCost,
        businessMargin,
        noOfStaff,
        salary,
        otherIncome,
        householdExpenses,
        netIncomeAfterExpenses,
        netDisposableIncome,
        recommendedBy,
        recommendedDate,
        status: 1,
        entryBy:idUser
      });
      if (camRecord) {
        await CustomerDocuments.update(
          {
            businessPhoto: businessImg,
          },
          {
            where: {
              customerID: data?.customerID,
            },
          }
        );
        await Applicant.update(
          {
            loanApplicationStatus: 7,
            pendingReason: "CAM data submitted by the Credit Analyst",
          },
          {
            where: {
              customerID: data?.customerID,
            },
          }
        );
        return camRecord;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error submitting CAM data:", error);
      throw error;
    }
  },
};
