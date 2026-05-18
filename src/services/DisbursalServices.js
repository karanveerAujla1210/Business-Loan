/**
 * Disbursal Service
 * Handles loan disbursement and banking integration
 * @author MiniBusiness Loan
 */

const LoanProposal = require('../models/LoanProposal');
const Applicant = require('../models/applicant');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

class DisbursalService {
  /**
   * Initiate disbursement
   */
  async initiateDisbursement(disburseData) {
    try {
      const {
        loanID,
        customerID,
        disbursalAmount,
        bankAccountID,
        bankName,
        accountNumber,
      } = disburseData;

      // Get loan
      const loan = await LoanProposal.findOne({ where: { loanID } });
      if (!loan) {
        throw new Error('Loan not found');
      }

      if (loan.status !== 'approved') {
        throw new Error('Loan must be in approved status');
      }

      // Get applicant
      const applicant = await Applicant.findOne({ where: { customerID } });
      if (!applicant) {
        throw new Error('Applicant not found');
      }

      // Validate disbursement amount
      if (disbursalAmount > loan.amountApplied) {
        throw new Error('Disbursal amount cannot exceed applied loan amount');
      }

      // Calculate net disbursement (after processing fee)
      const processingFee = loan.processingFee || 0;
      const netDisbursement = disbursalAmount - processingFee;

      // Create UTR (Unique Transaction Reference)
      const utr = `UTR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Update loan
      await LoanProposal.update(
        {
          status: 'disbursed',
          loanApplicationStatus: 1,
          disbursementDate: new Date(),
          NetDisbursement: netDisbursement,
          outstandingBalance: disbursalAmount,
          firstDateofInstallment: this.calculateFirstEMIDate(new Date()),
          nextEMIDate: this.calculateFirstEMIDate(new Date()),
          lastDateofInstallment: this.calculateLastEMIDate(new Date(), loan.tenure),
        },
        { where: { loanID } }
      );

      logger.info('Disbursal initiated', { loanID, utr, netDisbursement });

      // TODO: Call banking API to transfer funds

      return {
        loanID,
        utr,
        disbursalAmount,
        processingFee,
        netDisbursement,
        status: 'initiated',
        message: 'Disbursal initiated successfully. Please wait for fund transfer.',
      };
    } catch (error) {
      logger.error('Failed to initiate disbursement', { error: error.message });
      throw error;
    }
  }

  /**
   * Confirm disbursement
   */
  async confirmDisbursement(loanID, utr, bankReference) {
    try {
      const loan = await LoanProposal.findOne({ where: { loanID } });
      if (!loan) {
        throw new Error('Loan not found');
      }

      await LoanProposal.update(
        {
          status: 'active',
          disbursementConfirmedDate: new Date(),
          bankReferenceNumber: bankReference,
        },
        { where: { loanID } }
      );

      logger.info('Disbursement confirmed', { loanID, utr, bankReference });
      return { status: 'confirmed', message: 'Loan disbursed successfully' };
    } catch (error) {
      logger.error('Failed to confirm disbursement', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Get disbursement status
   */
  async getDisbursementStatus(loanID) {
    try {
      const loan = await LoanProposal.findOne({ where: { loanID } });
      if (!loan) {
        throw new Error('Loan not found');
      }

      return {
        loanID,
        status: loan.status,
        disbursementDate: loan.disbursementDate,
        disbursementAmount: loan.amountApplied,
        processingFee: loan.processingFee,
        netDisbursement: loan.NetDisbursement,
        bankReference: loan.bankReferenceNumber,
      };
    } catch (error) {
      logger.error('Failed to get disbursement status', { loanID, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate first EMI date
   */
  calculateFirstEMIDate(disbursementDate) {
    const date = new Date(disbursementDate);
    date.setDate(date.getDate() + 30); // 30 days grace period
    return date;
  }

  /**
   * Calculate last EMI date
   */
  calculateLastEMIDate(startDate, tenureMonths) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + tenureMonths);
    return date;
  }

  /**
   * Validate disbursement eligibility
   */
  async validateDisbursementEligibility(loanID) {
    try {
      const loan = await LoanProposal.findOne({ where: { loanID } });
      if (!loan) {
        throw new Error('Loan not found');
      }

      const validations = {
        isApproved: loan.status === 'approved',
        hasEsign: loan.isEsignCompleted === true,
        noBlockages: true,
      };

      const canDisburse = Object.values(validations).every((v) => v === true);

      return {
        canDisburse,
        validations,
        message: canDisburse ? 'Eligible for disbursement' : 'Not eligible for disbursement',
      };
    } catch (error) {
      logger.error('Failed to validate disbursal eligibility', { loanID, error: error.message });
      throw error;
    }
  }
}

module.exports = new DisbursalService();
};

// Main function
export const sendEncryptedRequest = async (
  beneAccNo,
  beneIFSC,
  amount,
  lead,
  refId
) => {
  try {
    const ref_no = refId;
    let data = {
      tranRefNo: ref_no,
    };
    logger.warn(`Initiate Auto Disbursal API LEAD-ID${lead.id} , ${count++}`);
    const timestamp = getCurrentTimestamp();

    const formattedAmount = parseFloat(amount).toFixed(2);
    console.log("Formatted Amount -->", formattedAmount);
    const requestParams = {
      localTxnDtTime: timestamp,
      beneAccNo: "123456041", // beneAccNo,
      beneIFSC: "NPCI0000001", //beneIFSC,
      amount: "1.00", // formattedAmount,
      tranRefNo: ref_no,
      paymentRef: "IMPSTransferP2A",
      senderName: "Pratik Mundhe",
      mobile: "9999988888",
      retailerCode: "rcode",
      passCode: "447c4524c9074b8c97e3a3c40ca7458d",
      bcID: "IBCKer00055",
    };

    console.log(
      "<<========Request Params=========>>",
      JSON.stringify(requestParams)
    );

    // AES session key and IV
    const sessionKey = generateRandom16Digit();
    const iv = generateRandom16Digit();

    // Public key encryption
    const publicKeyPath = path.join(process.cwd(), "certs", "public_key.pem");
    const publicKey = fs.readFileSync(publicKeyPath, "utf8");
    console.log(" ------------- BANK PUBLIC---------->", publicKey);

    const encryptedKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(sessionKey)
    );

    // AES encrypt request data
    const cipher = crypto.createCipheriv(
      "aes-128-cbc",
      Buffer.from(sessionKey, "utf8"),
      Buffer.from(iv, "utf8")
    );
    let encryptedData = cipher.update(
      JSON.stringify(requestParams),
      "utf8",
      "base64"
    );
    encryptedData += cipher.final("base64");

    // Construct request body
    const requestBody = {
      requestId: `req_${Date.now()}`,
      encryptedKey: encryptedKey.toString("base64"),
      iv: Buffer.from(iv, "utf8").toString("base64"),
      encryptedData,
      oaepHashingAlgorithm: "NONE",
      service: "",
      clientInfo: "",
      optionalParam: "",
    };

    console.log("<<========Final Request Body=========>>", requestBody);

    const url = process.env.ICICI_BANK_COMPOSITE_API;
    console.log("--->", url);
    const headers = {
      "cache-control": "no-cache",
      accept: "application/json",
      "content-type": "application/json",
      apikey: process.env.ICICI_API_KEY,
      "x-priority": "0100",
    };

    logger.warn(
      `Request of Auto Disbursal API LEAD-ID --->${lead?.id} ,  count :${count}`
    );

    const response = await axios.post(url, requestBody, { headers });
    // console.log("<<========Encrypted Response=========>>", response.data);
    logger.warn(
      `Response of Auto Disbursal API LEAD-ID${
        lead?.id
      } , Response : ${JSON.stringify(response?.data)}  ,
      count :${count}`
    );

    console.log("Hii----- 22222222");
    // Decrypt response
    const encryptedKeyBuffer = Buffer.from(
      response?.data?.encryptedKey,
      "base64"
    );
    const tempEncryptedKeyPath = path.join(process.cwd(), "encrypted_key.bin");
    fs.writeFileSync(tempEncryptedKeyPath, encryptedKeyBuffer);

    const privateKeyPath = path.join(process.cwd(), "certs", "private.key");
    console.log("private key ----->", privateKeyPath);
    const opensslCommand = `openssl rsautl -decrypt -inkey "${privateKeyPath}" -in "${tempEncryptedKeyPath}"`;
    const { stdout: decryptedKey } = await exec(opensslCommand);
    const decryptedSessionKey = decryptedKey.trim();

    const encryptedResponseData = Buffer.from(
      response?.data?.encryptedData,
      "base64"
    );
    const responseIv = encryptedResponseData.slice(0, 16);
    const encryptedPayload = encryptedResponseData.slice(16);

    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      Buffer.from(decryptedSessionKey, "utf8"),
      responseIv
    );
    let decryptedData = decipher.update(encryptedPayload, undefined, "utf8");
    decryptedData += decipher.final("utf8");

    console.log(
      "<<========Decrypted Response=========>>",
      JSON.parse(decryptedData)
    );

    // dummy response
    /*
     {
      ActCode: '0',
      Response: 'Transaction Successful',
      BankRRN: '512911028888',
      BeneName: 'Prem Kushum',
      success: true,
      TransRefNo: '202505090531104F2TTU'
    }
    */
    const parsedData = JSON.parse(decryptedData);
    data = {
      ...parsedData,
    };

    // 997 and 501 error code for
    // condition for pending payment
    if (!parsedData?.success || parsedData?.ActCode !== "0") {
      const errorCode = parsedData?.ActCode;
      if (errorCode == "997" || errorCode == "501") {
        logger.warn(
          `Auto Disbursal API LEAD-ID${
            lead?.id
          } , Pending Status: ${JSON.stringify(parsedData)}`
        );

        data.status = "PENDING";
        return data;
      } else {
        logger.warn(
          `Auto Disbursal API LEAD-ID${
            lead?.id
          } , Failed Status: ${JSON.stringify(parsedData)}`
        );
        data.status = "FAILED";
        return data;
      }
    }

    // for sucess condition
    if (parsedData?.ActCode == "0") {
      data.status = "SUCCESS";
      return data;
    }

    // fallback condition
    data.status = "FAILED";
    return data;
  } catch (error) {
    // Axios error handling
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorCode = error.response?.data?.errorCode;
      logger.warn(
        `Auto Disbursal API LEAD-ID${lead?.id} , In Catch Block Status Code: ${statusCode} ,Error Code :${errorCode}`
      );

      if (statusCode === 501 || errorCode === "501") {
        return {
          success: false,
          status: "PENDING",
          message: errorMap["501"],
        };
      }

      return {
        success: false,
        status: "FAILED",
        message: errorMap[errorCode],
      };
    }

    // Fallback error handler
    const knownErrorCode = Object.keys(errorMap).find((code) =>
      error.message.includes(code)
    );
    return {
      success: false,
      status: "FAILED",
      errorCode: knownErrorCode || "UNKNOWN_ERROR",
      message: knownErrorCode ? errorMap[knownErrorCode] : error.message,
    };
  }
};
