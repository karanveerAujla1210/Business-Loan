const fs = require("fs");
const crypto = require("crypto");
const axios = require("axios");
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const dotenv = require("dotenv");
const { logger } = require("../utils/logger");

let count = 2000;
dotenv.config();
const execute = promisify(exec);

const errorMap = {
  501: "Internal exception. Please do status check after sometime",
  401: "Unauthorized. Check the API Key",
  429: "Too Many Requests. Maintain the TPS defined",
  403: "Forbidden. Check the IP address & API Key",
  997: "Bad request or internal exception. Check request packet and do status check",
  8010: "INTERNAL_SERVICE_FAILURE. Contact ICICI Tech team",
  8011: "Host Not Found. Contact ICICI Tech team",
  8012: "BACKEND_CONNECTION_TIMEOUT. Contact ICICI Tech team",
  8013: "BACKEND_READ_TIMEOUT. Contact ICICI Tech team",
  8014: "Bad URL. Contact ICICI Tech team",
  8015: "Invalid decrypted request. Contact ICICI Tech team",
  8016: "Request Decryption Failure. Check encryption and certificate",
  8017: "Request Schema Validation Failure. Contact ICICI Tech team",
  8018: "Response Schema Validation Failure. Contact ICICI Tech team",
  8019: "Response Encryption Failure. Contact ICICI Tech team",
  8099: "Blank Response from Backend. Do status check",
  8123: "Configured amount limit exceeded",
  8096: "Invalid request. Request failed",
};

// Utility to generate timestamp
const getCurrentTimestamp = () => {
  const now = new Date();
  const [yyyy, mm, dd, hh, min, ss] = [
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ].map((n) => n.toString().padStart(2, "0"));

  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
};
const generateRandom16Digit = () => {
  return crypto.randomBytes(8).toString("hex").slice(0, 16);
};

// Main function
const sendEncryptedRequest = async (
  beneAccNo,
  beneIFSC,
  amount,
  leadId,
  refId,
  paymentMode,
  accountHolderName
) => {
  try {
    const ref_no = refId;
    let data = {
      tranRefNo: ref_no,
    };
    logger.warn(
      `Initiate Auto Disbursal API With Payment Mode - ${paymentMode} LEAD-ID ${leadId} , ${count++}`
    );
    const timestamp = getCurrentTimestamp();

    const formattedAmount = parseFloat(amount).toFixed(2);
    console.log("Formatted Amount -->", formattedAmount);
    let requestParams;
    let priorityCode;
    if (paymentMode == "RTGS") {
      // RTGS DATA
      requestParams = {
        AGGRID: "MESCOMP0303",
        CORPID: "590118413",
        USERID: "AMITKUMA",
        URN: "SR270208249",
        AGGRNAME: "RICHCREDIT",
        UNIQUEID: timestamp,
        DEBITACC: "788805000047",
        CREDITACC: beneAccNo, // "000405001611",
        IFSC: beneIFSC, // "SBIN0003060",
        AMOUNT: formattedAmount,
        CURRENCY: "INR",
        TXNTYPE: "RTG",
        PAYEENAME: "PratikMundhe",
        REMARKS: "Loan Disbursement",
        WORKFLOW_REQD: "N",
        BENLEI: "",
      };

      priorityCode = "0001"; //FOR RTGS,
    }
    if (paymentMode == "NEFT") {
      //NEFT DATA
      requestParams = {
        tranRefNo: timestamp,
        amount: formattedAmount,
        senderAcctNo: "788805000047",
        beneAccNo: beneAccNo,
        beneName: accountHolderName,
        beneIFSC: beneIFSC,
        narration1: "NEFT transaction RICHCREDIT Finance",
        narration2: "",
        crpId: "590118413",
        crpUsr: "AMITKUMA",
        aggrId: "MESCOMP0303",
        aggrName: "RICHCREDIT",
        urn: "SR270208249",
        txnType: "RGS",
        WORKFLOW_RE: "N",
        //  “BENLEI”: '',
        //       WORKFLOW_RE:"N"
      };
      priorityCode = "0010"; //FOR NEFT,
    }
    if (paymentMode == "IMPS") {
      //IMPS DATA
      requestParams = {
        localTxnDtTime: timestamp,
        beneAccNo: beneAccNo,
        beneIFSC: beneIFSC,
        amount: formattedAmount,
        tranRefNo: ref_no,
        paymentRef: "IMPSTransferP2A",
        senderName: "RICH CREDIT",
        mobile: "9212147844",
        retailerCode: "rcode",
        passCode: "192cc9e219e34f04bf9e0cd992cfa00d",
        bcID: "IBCRIC01876",
        aggrId: "",
        crpId: "",
        crpUsr: "",
      };
      priorityCode = "0100"; //FOR IMPS,
    }

    // const requestParams = {
    //   localTxnDtTime: timestamp,
    //   beneAccNo:"123456041",// beneAccNo,
    //   beneIFSC: "NPCI0000001",//beneIFSC,
    //   amount: formattedAmount,
    //   tranRefNo: ref_no,
    //   paymentRef: "IMPSTransferP2A",
    //   senderName: "UY fincorp",
    //   mobile: "9896956566",
    //   retailerCode: "rcode",
    //   passCode: "0f1f8b6dcebd4e5d89f20a78a06a3c26",
    //   bcID: "IBCUY01852",
    // };

    // NEFT DATA
    // const requestParams = {
    //   localTxnDtTime: "20240113181900",
    //   beneAccNo: "123456041",
    //   beneIFSC: "NPCI0000001",
    //   amount: "1.00",
    //   tranRefNo: "IMPSTesting01",
    //   paymentRef: "IMPSTransferP2A",
    //   senderName: "Pratik Mundhe",
    //   mobile: "9999988888",
    //   retailerCode: "rcode",
    //   passCode: "447c4524c9074b8c97e3a3c40ca7458d",
    //   bcID: "IBCKer00055",
    //   aggrId: "",
    //   crpId: "",
    //   crpUsr: "",
    // };

    // NEFT DATA
    // const requestParams = {
    //   tranRefNo: "202401081032010",
    //   amount: "1.00",
    //   senderAcctNo: "000405002777",
    //   beneAccNo: "000405001611",
    //   beneName: "PratikMundhe",
    //   beneIFSC: "SBIN0003060",
    //   narration1: "NEFT transaction",
    //   narration2: "PritamGadekar",
    //   crpId: "SESPRODUCT",
    //   crpUsr: "BAN339226",
    //   aggrId: "MESCOMP0303",
    //   aggrName: "RICHCREDIT",
    //   urn: "RICHCREDIT123",
    //   txnType: "RGS",
    //   WORKFLOW_RE: "N",
    //   //  “BENLEI”: '',
    //   //       WORKFLOW_RE:"N"
    // };

    //IMPS DATA
    // const requestParams = {
    //         localTxnDtTime: timestamp,
    //   // localTxnDtTime: "20240113181900",
    //   beneAccNo: "123456041",
    //   beneIFSC: "NPCI0000001",
    //   amount: "1.00",
    //   tranRefNo: ref_no,
    //   paymentRef: "IMPSTransferP2A",
    //   senderName: "Pratik Mundhe",
    //   mobile: "9999988888",
    //   retailerCode: "rcode",
    //   passCode: "447c4524c9074b8c97e3a3c40ca7458d",
    //   bcID: "IBCKer00055",
    //   aggrId: "",
    //   crpId: "",
    //   crpUsr: "",
    // };

    console.log(
      "<<========Request Params=========>>",
      JSON.stringify(requestParams)
    );

    // AES session key and IV
    const sessionKey = generateRandom16Digit();
    const iv = generateRandom16Digit();

    // Public key encryption
    const publicKeyPath = path.join(
      process.cwd(),
      "certs",
      "public_key_prod.pem"
    );
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

    const url = process.env.ICICI_BANK_COMPOSITE_PROD_API;

    console.log("--->", url);

    const headers = {
      "cache-control": "no-cache",
      accept: "application/json",
      "content-type": "application/json",
      apikey: process.env.ICICI_BANK_COMPOSITE_API_KEY_PROD,
      "x-priority": priorityCode,
    };

    logger.warn(
      `Request of Auto Disbursal API LEAD-ID --->${leadId} ,  count :${count}`
    );

    const response = await axios.post(url, requestBody, { headers });
    // console.log("<<========Encrypted Response=========>>", response.data);
    logger.warn(
      `Response of Auto Disbursal API LEAD-ID${leadId} , Response : ${JSON.stringify(
        response?.data
      )}  ,
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
    // const opensslCommand = `openssl rsautl -decrypt -inkey "${privateKeyPath}" -in "${tempEncryptedKeyPath}"`;
    const opensslCommand = `openssl pkeyutl -decrypt -inkey "${privateKeyPath}" -in "${tempEncryptedKeyPath}"`;

    const { stdout: decryptedKey } = await execute(opensslCommand);
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

    const parsedData = JSON.parse(decryptedData);
    data = {
      ...parsedData,
    };

    if (paymentMode == "RTGS") {
      if (
        parsedData?.STATUS === "FAILURE" &&
        parsedData?.RESPONSE === "FAILURE"
      ) {
        logger.warn(
          `Auto Disbursal API LEAD-ID${leadId} , Pending Status: ${JSON.stringify(
            parsedData
          )}`
        );
        data.status = "PENDING";
        return data;
      }
      if (
        parsedData?.STATUS === "SUCCESS" &&
        parsedData?.RESPONSE === "SUCCESS"
      ) {
        data.status = "SUCCESS";
        return data;
      }
    }
    if (paymentMode == "NEFT") {
      if (
        parsedData?.STATUS === "FAILURE" &&
        parsedData?.RESPONSE === "FAILURE"
      ) {
        const errorCode = parsedData?.ERRORCODE;
        const resCode = parsedData?.ERRORCODE;
        logger.warn(
          `Auto Disbursal API LEAD-ID${leadId} , Pending Status: ${JSON.stringify(
            parsedData
          )}`
        );
        data.status = "PENDING";
        return data;
      }
      if (
        parsedData?.STATUS === "SUCCESS" &&
        parsedData?.RESPONSE === "SUCCESS"
      ) {
        data.status = "SUCCESS";
        return data;
      }
    }
    if (paymentMode == "IMPS") {
      // 997 and 501 error code for
      // condition for pending payment
      if (!parsedData?.success || parsedData?.ActCode !== "0") {
        const errorCode = parsedData?.ActCode;
        if (errorCode == "997" || errorCode == "501") {
          logger.warn(
            `Auto Disbursal API LEAD-ID${leadId} , Pending Status: ${JSON.stringify(
              parsedData
            )}`
          );

          data.status = "PENDING";
          return data;
        } else {
          logger.warn(
            `Auto Disbursal API LEAD-ID${leadId} , Failed Status: ${JSON.stringify(
              parsedData
            )}`
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
    }

    // fallback condition
    data.status = "FAILED";
    return data;
  } catch (error) {
    console.log("ERROR IN CATCH BLOCK ------->", error);
    // Axios error handling
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorCode = error.response?.data?.errorCode;
      logger.warn(
        `Auto Disbursal API LEAD-ID${leadId} , In Catch Block Status Code: ${statusCode} ,Error Code :${errorCode}`
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

module.exports = {
  getCurrentTimestamp,
  sendEncryptedRequest,
};
