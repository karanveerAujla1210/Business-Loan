import MessageHelper from "../helpers/MessageHelper";
import HTTP_STATUS from "../helpers/httpStatus";
import UserBankStatement from "../models/userBankStatement";
import { logger } from "../utils/logger";
const resParams = require("../config/params");

const Applicant = require("../models/applicant");
const UserDocumentModel = require("../models/userDocument");

export const disbursed = asyncHandler(async (req, res) => {
  const { customerID } = req?.body;
  const params = { ...resParams };

  try {
    logger.info("Starting loan disbursal process");
    // Destructure frequently used values
    const user = await Applicant.findOne({
      where: {
        customerID: customerID,
      },
    });

    if (!user) {
      params.message = MessageHelper.USER_NOT_FOUND;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }

    // Fetch sanction data
    const sanction = await UserDocumentModel.findOne({
      where: { customerID, status: null, sanctionLetterURL: null },
    });
    console.log("Sanction found:", sanction);

    logger.info("checls PASS ----------------");
    // Prepare core data
    const leadId = lead.id;
    const pan = lead.pan;
    const customerId = lead.customer_id;
    const netDisbursal = sanction.net_disbursal;

    // Check existing disbursal
    console.log("Checking existing disbursal for lead:", leadId);
    const existingDisbursal = await prisma.disbursal.findUnique({
      where: { lead_id: leadId },
      select: { id: true, is_disbursed: true, status: true },
    });
    console.log("Existing disbursal:", existingDisbursal);

    if (existingDisbursal?.is_disbursed) {
      console.log("Payment already processed for lead:", leadId);
      params.message = MessageHelper.PAYEMNT_ALREADY_COMPLETED;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }
    if (existingDisbursal?.status) {
      if (existingDisbursal?.status == "PENDING") {
        throw new ResponseError(
          400,
          "YOUR PAYMENT IS IN PENDING STATE",
          `YOUR PAYMENT IS IN PENDING STATE ${lead.lead_no}`
        );
      }
      if (existingDisbursal?.status == "FAILED") {
        throw new ResponseError(
          400,
          "YOUR PAYMENT IS IN FAILED STATE",
          `YOUR PAYMENT IS IN FAILED STATE ${lead.lead_no}`
        );
      }
    }

    logger.info("Double check PASS ----------------");
    const bank_Details = await UserBankStatement.findOne({
      where: {
        customerID,
      },
    });

    if (!bank_Details?.accountNumber) {
      params.message = MessageHelper.USER_ACCOUNT_NUMBER_NOT_AVLBL;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }
    if (!bank_Details?.ifsc_code) {
      params.message = MessageHelper.USER_IFSC_NOT_AVLBL;
      response.status(HTTP_STATUS.OK).send(params);
      return;
    }
    // if (!bank_Details?.branch_name) {
    //   throw new ResponseError(
    //     400,
    //     "YOUR branch_name not found in DB ",
    //     `YOUR branch_name not found in DB ${lead.lead_no}`
    //   );
    // }

    // if (!sanction?.remarks) {
    //   throw new ResponseError(
    //     400,
    //     "Transacion Reference No. not found",
    //     `Transacion Reference No. not found ${lead.lead_no}`
    //   );
    // }

    logger.info("Bank check PASS ----------------");
    // Initialize HDFC Bank Client
    const client = new HdfcBankClient();

    // Get OAuth token
    let access_token;
    try {
      logger.info("Before Access Token ----------------");
      const tokenResponse = await client.generateOAuthToken();
      access_token = tokenResponse?.access_token;
      logger.info("After Access Token ----------------");
      if (!access_token) {
        params.message = MessageHelper.BANK_TOKEN_NOT_AVLBL;
        response.status(HTTP_STATUS.OK).send(params);
        return;
      }
    } catch (error) {
      logger.info("Catch block of  Access Token ----------------");
      params.message = MessageHelper.BANK_TOKEN_NOT_AVLBL;
      response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }

    // Prepare payment payload
    const formattedAmount = parseFloat(netDisbursal).toFixed(2);
    const paymentPayload = {
      LOGIN_ID: "APIUSER",
      INPUT_GCIF: "DEVAASHCX",
      TRANSFER_TYPE_DESC: "IMPS",
      BENE_BANK: bank_Details.bank_name,
      INPUT_DEBIT_AMOUNT: formattedAmount,
      INPUT_VALUE_DATE: new Date().toLocaleDateString("en-GB"),
      TRANSACTION_TYPE: "SINGLE",
      INPUT_DEBIT_ORG_ACC_NO: "99909927031995",
      INPUT_BUSINESS_PROD: "VENDBUS01",
      BENE_ID: "",
      BENE_ACC_NAME: user.full_name,
      BENE_ACC_NO: bank_Details.bank_acc_no,
      BENE_TYPE: "ADHOC",
      BENE_BRANCH: bank_Details.branch_name || "",
      BENE_IDN_CODE: bank_Details.ifsc_code,
      PAYMENT_REF_NO: sanction.remarks,
    };

    // Make payment API call
    let bank_response;
    try {
      logger.info("Before Initialise payment ----------------");
      bank_response = await client.initiatePayment(
        paymentPayload,
        access_token
      );
      //  "CBX_API_REF_NO": "202505160545125BMEGE",
      //   "Transaction": "Accepted"
      // if (!bank_response?.Transaction || bank_response.Transaction !== "Accepted") {
      //   throw new ResponseError(
      //     400,
      //     "Payment Failed or Pending Due to some reason.",
      //     `Payment Failed or Pending Due to some reason. ${bank_response?.Transaction || "Unknown"}`
      //   );
      // }
      logger.info("Ater Initialise payment ----------------");
    } catch (error) {
      logger.info("Catch block of Initialise payment ----------------");
      // If it's already a ResponseError, throw it directly
      if (error instanceof ResponseError) {
        throw error;
      }

      throw new ResponseError(
        400,
        "Bank payment failed",
        `Bank payment failed ${lead.lead_no} : ${user.pan} : ${error.message}`
      );
    }

    // If we reach here, payment was successful
    // Start database transaction
    await prisma.$transaction(
      async (tx) => {
        logger.info("In transaction  ----------------");
        const disbursalData = {
          payable_account: "99909927031995",
          payment_mode: "AUTO_DISBURSED",
          amount: netDisbursal,
          disbursal_date: new Date(),
          loan_amount: sanction.net_disbursal,
          repayment_date: sanction.repayment_date,
          repayment_amount: sanction.repayment_amount,
          roi: sanction.roi,
          tenure: sanction.tenure,
          pan,
          is_disbursed: true,
          sanction_id: sanction.id,
          loan_no: sanction.loan_no,
          status: bank_response?.Transaction,
        };

        logger.info("after disbursalData  ----------------");
        // Create or update disbursal record
        const disbursement = existingDisbursal
          ? await tx.disbursal.update({
              where: { id: existingDisbursal.id },
              data: disbursalData,
            })
          : await tx.disbursal.create({
              data: { ...disbursalData, lead_id: leadId },
            });

        logger.info("after disbursement  ----------------", disbursement);
        // Create transaction history
        const transactionHistory = await tx.transaction_History.create({
          data: {
            lead_id: leadId,
            pan: pan,
            transaction_pre_response: bank_response,
            transaction_request: paymentPayload,
            loan_no: sanction?.loan_no,
            payable_account: "99909927031995",
            bank_name: "DEV AASHISH CAPITALS PVT. LTD",
            ifsc: "HDFC0001721",
            payment_mode: "AUTO_DISBURSED",
            disbursal_id: disbursement.id,
            sanction_id: sanction.id,
            amount: netDisbursal,
          },
        });
        logger.info(
          "After transaction  HDFC ----------------",
          transactionHistory
        );
        // Update all related records
        await Promise.all([
          tx.sanction.update({
            where: { loan_no: lead?.loan_no },
            data: { is_disbursed: true },
          }),
          tx.collection.create({
            data: {
              customer_id: customerId,
              pan: user.pan,
              lead_id: leadId,
              loan_no: sanction.loan_no,
              received_amount: 0,
              collection_active: true,
            },
          }),
          tx.disbursal.update({
            where: {
              id: disbursement.id,
            },
            data: {
              transaction_history_id: transactionHistory.id,
            },
          }),
          tx.payment.create({
            data: {
              pan: user.pan,
              lead_id: leadId,
              loan_no: sanction.loan_no,
              lead_no: lead.lead_no,
            },
          }),
          tx.lead.update({
            where: { id: leadId },
            data: {
              is_disbursed: true,
              lead_stage: LEAD_STAGE.DISBURSED,
            },
          }),
          // tx.api_Logs.create({
          //   data: {
          //     pan,
          //     api_type: "BANK_AUTO_DISBURSAL",
          //     api_provider: 1,
          //     api_request: paymentPayload,
          //     api_response: bank_response,
          //     api_status: true,
          //     customer_id: user.id,
          //     lead_id: lead.id,
          //   }
          // }),
          tx.lead_Logs.create({
            data: {
              customer_id: customerId,
              lead_id: leadId,
              pan: user.pan,
              remarks: `Amount: ${netDisbursal} disbursed successfully. by 999`,
            },
          }),
        ]);
      },
      { timeout: 120000 }
    );

    logger.info("Afeter Prisma transaction  ----------------");
    // After successful disbursal and before Credgenics
    logger.info("Loan disbursed successfully, sending data to Credgenics", {
      loanNo: sanction?.loan_no,
      pan: user.pan,
      leadId: lead.id,
    });

    // Send data to Credgenics with enhanced error handling
    try {
      logger.info("Sending data to Credgenics", {
        loan_no: sanction?.loan_no,
        pan: user.pan,
      });
      const credgenicsResult = await sendDataToCredgenics(sanction?.loan_no);

      if (!credgenicsResult.success) {
        logger.error("Failed to send data to Credgenics", {
          loan_no: sanction?.loan_no,
          pan: user.pan,
          error: credgenicsResult.message,
        });

        // Create lead log for Credgenics failure
        await prisma.lead_Logs.create({
          data: {
            customer_id: user.id,
            lead_id: lead.id,
            pan: user.pan,
            remarks: `Credgenics Integration Failed: ${
              credgenicsResult.message || "Unknown error"
            }`,
          },
        });
      } else {
        logger.info("Successfully sent data to Credgenics", {
          loan_no: sanction?.loan_no,
          pan: user.pan,
        });

        // Create lead log for Credgenics success
        await prisma.lead_Logs.create({
          data: {
            customer_id: user.id,
            lead_id: lead.id,
            pan: user.pan,
            remarks: "Data successfully sent to Credgenics",
          },
        });
        await prisma.disbursal.update({
          where: { lead_id: lead.id },
          data: { is_data_sent: true },
        });
      }
    } catch (credgenicsError) {
      logger.error("Error while sending data to Credgenics", {
        loan_no: sanction?.loan_no,
        pan: user.pan,
        error: credgenicsError?.message,
      });

      // Create lead log for unexpected Credgenics error
      await prisma.lead_Logs.create({
        data: {
          customer_id: user.id,
          lead_id: lead.id,
          pan: user.pan,
          remarks: `Credgenics Integration Error: ${
            credgenicsError?.message || "Unexpected error occurred"
          }`,
        },
      });
    }

    // Enhanced response
    return res.status(200).json({
      success: true,
      message: "Loan disbursed successfully",
    });
  } catch (error) {
    params.data = error;
    params.message = error.message;
    response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    // Log the error for debugging
    logger.error("Disbursal Error", error);
    console.error("Disbursal Error:", error);

    // If it's already a ResponseError, throw it directly
    if (error instanceof ResponseError) {
      logger.error("Disbursal failed", error);
      throw error;
    }

    // Otherwise, wrap it in a ResponseError
    throw new ResponseError(400, "Disbursal failed", `Disbursal failed`);
  }
});
