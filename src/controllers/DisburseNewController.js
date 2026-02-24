const { sendEncryptedRequest } = require("../services/disrbursal");
const { Op, Sequelize } = require("sequelize");
const MessageHelper = require("../helpers/MessageHelper");
const HTTP_STATUS = require("../helpers/httpStatus");
const UserBankStatement = require("../models/userBankStatement");
const { logger } = require("../utils/logger");
const LoanProposal = require("../models/LoanProposal");
const resParams = require("../config/params");
const Transaction = require("../models/TransactionModal");
const Applicant = require("../models/applicant");
const moment = require("moment");
const crypto = require("crypto");
const disbursed = async (req, response) => {
  const { customerID, paymentMode } = req?.body;
  const params = { ...resParams };
  let count = 1000;
  logger.warn(`Starting disbursed function ${count++}`);
  logger.warn(`Starting transaction ${count++}`);
  logger.warn("Starting disbursed function");
  logger.warn("Starting transaction");

  try {
    logger.warn("Starting loan disbursal process");
    // Destructure frequently used values
    const user = await Applicant.findOne({
      where: {
        customerID: customerID,
        isLeadRejected: 0,
        leadRejectionDate: null,
      },
    });

    if (!user) {
      params.status = false;
      params.message = MessageHelper.USER_NOT_FOUND;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }
    if (
      user &&
      user?.loanApplicationStatus > 8 &&
      user?.loanApplicationStatus != 9
    ) {
      params.status = false;
      params.message = MessageHelper.LOAN_ALREADY_DISBURSED;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }

    logger.warn("USER FOUND FOR DISBURSEMENT", customerID);

    const sanction = await LoanProposal.findOne({
      attributes: ["NetDisbursement", "loanID"],
      where: {
        customerID,
        status: 0,
        isEsignCompleted: 1,
        disbursementDate: null,
        SettlementDate: null,
      },
    });
    logger.warn("SANCTION :--", sanction);

    if (!sanction) {
      params.status = false;
      params.message = MessageHelper.DISBRSMNT_AMT_NOT_FOUND;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }
    // console.log("Sanction found:", sanction);
    const { NetDisbursement, loanID } = sanction;

    logger.warn("DISBURSEMENt AMOUNT:--", customerID, NetDisbursement, loanID);

    // Prepare core data
    const leadId = loanID;
    const pan = user.panNumber;

    logger.warn("Double check PASS ----------------", pan);
    console.log("Double check PASS ----------------", pan);
    const bank_Details = await UserBankStatement.findOne({
      attributes: [
        "accountHolderName",
        "bankName",
        "accountNumber",
        "ifscCode",
      ],
      where: {
        customerID,
        status: 1,
      },
    });
    console.log("Bank check PASS 111----------------", bank_Details);
    if (!bank_Details?.accountNumber) {
      params.message = MessageHelper.USER_ACCOUNT_NUMBER_NOT_AVLBL;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }
    if (!bank_Details?.ifscCode) {
      params.message = MessageHelper.USER_IFSC_NOT_AVLBL;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }
    const { accountHolderName, bankName, accountNumber, ifscCode } =
      bank_Details;

    logger.warn("Bank check PASS ----------------");
    console.log(
      "Bank check PASS ----------------",
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode
    );

    function generateTransactionId(length = 6) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomPart = "";
      const bytes = crypto.randomBytes(length);

      for (let i = 0; i < length; i++) {
        randomPart += chars[bytes[i] % chars.length];
      }

      const now = new Date();
      const timestamp =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0") +
        String(now.getMilliseconds()).padStart(3, "0"); // Adds more precision

      return (timestamp + randomPart).toUpperCase();
    }

    const refId = generateTransactionId();
    logger.warn(
      `REFERENCE ID--> IN SANCTION CONTROLLER : ${count++} -->`,
      refId
    );
    const res = await Transaction.create({
      customerID: customerID,
      loanID: loanID,
      transactionID: refId,
      accountNumber: accountNumber,
      ifsc: ifscCode,
      accountHolderName: accountHolderName,
      amountTransfer: NetDisbursement,
      utrNumber: null,
      paymentMode,
      paymentStatus: "Pending",
      status: null,
    });

    console.log("res_____ Transaction", res);
    // .then((data) => {
    //   console.log(
    //     "Transaction created with status Pending:",
    //     +" " + customerID + " " + data
    //   );
    // })
    // .catch((error) => {
    //   console.error("Error creating transaction:", error);
    // });

    // call the ICICI bank API
    const bank_response = await sendEncryptedRequest(
      accountNumber,
      ifscCode,
      NetDisbursement,
      leadId,
      refId,
      paymentMode,
      accountHolderName
    );
    logger.warn(
      `Auto Disbursal API reponse in Sanction Controller Bank Response: ${count++} , ${JSON.stringify(
        bank_response
      )}`
    );

    if (paymentMode === "RTGS" || paymentMode === "NEFT") {
      if (bank_response?.RESPONSE === "FAILURE") {
        const { MESSAGE, ERRORCODE, RESPONSECODE, STATUS } = bank_response;
        await Transaction.update(
          {
            paymentStatus: STATUS,
            status: 0,
            errorMessage: MESSAGE,
            errorCode: ERRORCODE,
            updatedOn: Sequelize.literal("GETDATE()"),
            responseCode: RESPONSECODE,
          },
          {
            where: {
              customerID: customerID,
              loanID: loanID,
              transactionID: refId,
            },
          }
        );
        params.status = false;
        params.message = `PAYMENT  ${bank_response?.status}  AT BANK RESPONSE`;
        return response.status(HTTP_STATUS.BAD_REQUEST).send(params);
      } else {
        const {
          CORP_ID,
          USER_ID,
          AGGR_ID,
          AGGR_NAME,
          REQID,
          STATUS,
          UTRNUMBER,
        } = bank_response;
        await Transaction.update(
          {
            paymentStatus: STATUS,
            utrNumber: UTRNUMBER,
            status: 1,
            updatedOn: Sequelize.literal("GETDATE()"), // ✅ Correct: no space
          },
          {
            where: {
              customerID: customerID,
              loanID: loanID,
              transactionID: refId,
            },
          }
        );
      }
      logger.warn(
        `Auto Disbursal API reponse in Sanction Controller Sucessfully Execute: ${count++}`
      );
    }
    if (paymentMode === "IMPS") {
      if (!bank_response?.success) {
        params.data = bank_response;
        params.status = false;
        params.message = `PAYMENT  ${bank_response?.status}  AT BANK RESPONSE`;
        return response.status(HTTP_STATUS.BAD_REQUEST).send(params);
      }
      const { BankRRN } = bank_response;
      await Transaction.update(
        {
          paymentStatus: "Success",
          utrNumber: BankRRN,
          status: 1,
          updatedOn: Sequelize.literal("GETDATE()"), // ✅ Correct: no space
        },
        {
          where: {
            customerID: customerID,
            loanID: loanID,
            transactionID: refId,
          },
        }
      );
    }
    await LoanProposal.update(
      {
        status: 1,
        disbursementDate: Sequelize.literal("GETDATE()"),
      },
      {
        where: {
          customerID,
          status: 0,
          isEsignCompleted: 1,
          disbursementDate: null,
          SettlementDate: null,
        },
      }
    );

    await Applicant.update(
      {
        loanApplicationStatus: 10,
        pendingReason: `Loan Disbursed on - ${moment(new Date()).format(
          "DD-MM-YYYY"
        )}`,
      },
      {
        where: {
          customerID,
        },
      }
    );

    params.status = true;
    params.data = bank_response;
    params.message = MessageHelper.SUCCESS;
    return response.status(HTTP_STATUS.OK).send(params);
  } catch (error) {
    console.log(error);
    params.status = false;
    params.message = error.message;
    response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
  }
};

module.exports = { disbursed };
