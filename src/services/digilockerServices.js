const { Op, QueryTypes, where } = require("sequelize");
const sequelize = require("../config/database").MAIN_DATABASE;
const { sequelize: SEQUELIZE } = require("../config/database");
const axios = require("axios");
const URL_CONSTANTS = require("../config/constants");
const { uploadFileToS3 } = require("../helpers/fileUploader.cjs");
const mime = require("mime-types");
const { XMLParser } = require("fast-xml-parser");
const path = require("path");
const fs = require("fs");
const https = require("https");
const DigilockerRequestModel = require("../models/digilockerRequests");
const pdfParse = require("pdf-parse");
const Applicant = require("../models/applicant");
const CustomerDocuments = require("../models/userDocument");
const userServices = require("./userServices");
const OtpHelper = require("../helpers/OtpHelper");
const Co_Applicant = require("../models/CoApplicantModal");
const MessageHelper = require("../helpers/MessageHelper");
const BusinessNature = require("../models/businessNature");
const BusinessPurpose = require("../models/businessPurpose");
const ApplicantBusinessDetails = require("../models/applicantBusinessDetails");
const CustomerCCRDetails = require("../models/customerCCRDetails");
const { logger } = require("../utils/logger");
const ApiErrorLog = require("../models/ApiErroLogsModal");
const { safeStringify } = require("../utils/safeStringify");
const Employees = require("../models/staffModal");
const { sendOtpDLT } = require("../utils/sendDltOtp");
const SMS_DETAILS = require("../models/checkSmsDetails");
const moment = require("moment");
const { uploadBureau } = require("../utils/uploadBureau");

const DigiLockerService = {
  /**
   * This function used to Create URL For Clients Digilocker process
   * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
   */
  initiateDigilocker: async ({ phone, name, email, redirectURL, idUser }) => {
    try {
      const attributes = ["customerID"];
      let dt = await Applicant.findOne({
        attributes,
        where: { phoneNumber: phone, isLeadRejected: 0 },
        raw: true,
      });

      let data = {
        data: {
          prefill_options: {
            full_name: name,
            mobile_number: phone?.toString(),
            user_email: email,
          },
          expiry_minutes: 20,
          send_sms: false,
          send_email: false,
          verify_phone: false,
          verify_email: false,
          signup_flow: false,
          redirect_url: redirectURL,
          state: "test",
        },
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.CREATE_DIGILOCKER_URL,
        headers: {
          Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
        },
        data: data,
      };

      const response = await axios.request(config);
      if (response?.data?.data) {
        logger.warn(`DIGILOCKER INITIATED ${phone} ${name} ${email}`);
        const { url, client_id, token } = response?.data?.data;
        if (idUser?.includes("MBLA")) {
          await OtpHelper.sendEmailDigilockerKYC(email, name, url);
        }

        const res = await DigilockerRequestModel.create({
          userId: dt?.customerID,
          url: url,
          clientId: client_id,
          token: token,
          emailID: email,
        });
        if (res) {
          return response?.data?.data;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error Createing Url Digilocker API", error.response);
      return false;
    }
  },

  downloadDocumentsAndUpdateData: async ({
    digilocker_client_id,
    customerNumber,
  }) => {
    try {
      const attributes = ["customerID"];
      let dt = await Applicant.findOne({
        attributes,
        where: { phoneNumber: customerNumber, isLeadRejected: 0 },
        raw: true,
      });

      const docAttributes = [
        "panURL",
        "aadharURL",
        "aadharUserImageURL",
        "customerID",
      ];

      const document = await CustomerDocuments.findOne({
        docAttributes,
        where: {
          customerID: dt.customerID,
          [Op.or]: [
            { panURL: { [Op.eq]: null } },
            { aadharURL: { [Op.eq]: null } },
            { aadharUserImageURL: { [Op.eq]: null } },
          ],
        },
      });

      if (
        document &&
        document.panURL &&
        document.aadharURL &&
        document.aadharUserImageURL
      ) {
        return MessageHelper.KYC_ALREADY_PROVIDED;
      }

      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${URL_CONSTANTS.CHECK_DIGILOCKER_STATUS_URL}/${digilocker_client_id}`,
        headers: {
          Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
        },
      };

      const response = await axios.request(config);
      if (
        response?.data?.data &&
        response?.data?.success &&
        response?.data?.data?.completed &&
        response?.data?.data?.status == "completed"
      ) {
        await DigilockerRequestModel.update(
          {
            status: response?.data?.data?.status,
          },
          { where: { clientId: digilocker_client_id } }
        );
        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `${URL_CONSTANTS.FETCH_DIGILOCKER_DOCUEMNTS_URL}/${digilocker_client_id}`,
          headers: {
            Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
          },
        };

        const documentsRes = await axios.request(config);
        if (
          documentsRes?.data?.success &&
          documentsRes?.data?.data?.documents?.length >= 1
        ) {
          const { documents } = documentsRes?.data?.data;
          const aadharXMLDocument = documents?.find(
            (item) => item?.file_id !== "aadhaar" && item?.doc_type === "ADHAR"
          );
          const aadharFileDocument = documents?.find(
            (item) => item?.file_id === "aadhaar" && item?.doc_type === "ADHAR"
          );
          const panFileDocument = documents?.find(
            (item) => item?.doc_type === "PANCR"
          );
          const drivingLicenseFileDocument = documents?.find(
            (item) => item?.doc_type === "DRVLC"
          );
          if (
            aadharXMLDocument?.file_id &&
            aadharFileDocument?.file_id &&
            panFileDocument?.file_id
          ) {
            let aadharS3URL, panS3URL, drvLcS3URL;

            if (aadharXMLDocument?.file_id) {
              const aadharXMLURL =
                await DigiLockerService.downloadIndiviudalDocument({
                  digilocker_client_id,
                  file_id: aadharXMLDocument.file_id,
                  customerID: dt?.customerID,
                });
              if (!aadharXMLURL) {
                logger.warn(
                  MessageHelper.SUREPASS_URL_ERROR +
                    "DOWNLOADING AADHAR FILE XML" +
                    dt.customerID
                );
                return MessageHelper.SUREPASS_URL_ERROR;
              } else {
                const userAadharData =
                  await DigiLockerService.extractAadharDataFromXMLFile({
                    fileUrl: aadharXMLURL,
                  });
                const { Poa } =
                  userAadharData?.Certificate?.CertificateData?.KycRes?.UidData;
                const {
                  Poi: { "@_dob": dob, "@_gender": gender, "@_name": name },
                  Poa: {
                    "@_co": co,
                    "@_country": country,
                    "@_dist": dist,
                    "@_house": house,
                    "@_lm": lm,
                    "@_pc": pc,
                    "@_po": po,
                    "@_state": state,
                    "@_street": street,
                    "@_subdist": subdist,
                    "@_vtc": vtc,
                  },
                  "@_uid": uid, // <-- This is correct
                  Pht: userPhoto,
                } = userAadharData?.Certificate?.CertificateData?.KycRes
                  ?.UidData;

                const lines = [
                  [Poa["@_house"], Poa["@_street"]].filter(Boolean).join(", "),
                  [Poa["@_lm"], Poa["@_vtc"]].filter(Boolean).join(", "),
                  [Poa["@_po"], Poa["@_dist"]].filter(Boolean).join(", "),
                  [Poa["@_subdist"], Poa["@_state"], Poa["@_pc"]]
                    .filter(Boolean)
                    .join(", "),
                  Poa["@_country"],
                ];
                const names = name?.split(" ");
                const fName = names[0];
                const mName = names.length == 3 ? names[1] : null;
                const lName = names.length == 3 ? names[2] : names[1];
                const age = DigiLockerService.calculateAge(dob);
                const existingUser = await Applicant.findOne({
                  attributes: ["customerID"],
                  where: {
                    AadharNumber: uid,
                    dob,
                  },
                });
                console.log("__________________existingUser", existingUser);
                if (existingUser?.customerID) {
                  return MessageHelper.USER_ALREADY_EXIST_WITH_DIFFERENT_NUMBER;
                }

                if (dt) {
                  await Applicant.update(
                    {
                      firstName: fName,
                      middleName: mName,
                      lastName: lName,
                      dob,
                      gender,
                      careOf: co,
                      maskedAadharNumber: uid,
                      AadharNumber: uid,
                      house: house,
                      street,
                      landMark: lm,
                      po: po,
                      dist: dist,
                      subDist: subdist,
                      vtc: vtc,
                      pincode: pc,
                      state,
                      country,
                      combinedAddress: lines?.toString()?.replace(/^,/, ""),
                      pendingReason: "DIGILOCKER PROCESS STARTED BY USER",
                    },
                    {
                      where: {
                        customerID: dt.customerID,
                      },
                    }
                  );
                  if (age < 20 || age > 60) {
                    await Applicant.update(
                      {
                        isLeadRejected: 1,
                        pendingReason: `${MessageHelper.AGE_ERROR}. Customers Age is ${age}`,
                      },
                      {
                        where: {
                          customerID: dt?.customerID,
                        },
                      }
                    );
                    logger.warn(
                      MessageHelper.AGE_ERROR + "AGE VALIDATION" + dt.customerID
                    );
                    return MessageHelper.AGE_ERROR;
                  }
                  if (document?.customerID) {
                    await CustomerDocuments.update(
                      {
                        aadharUserImageURL: `data:image/jpeg;base64,${userPhoto}`,
                      },
                      {
                        where: {
                          customerID: dt.customerID,
                        },
                      }
                    );
                  } else {
                    await CustomerDocuments.create({
                      customerID: dt.customerID,
                      aadharUserImageURL: `data:image/jpeg;base64,${userPhoto}`,
                    });
                  }
                }
                // fs.unlink(userAadharData, (err) => {
                //   if (err) {
                //     console.error("File delete karte waqt error aaya:", err);
                //   } else {
                //     console.log("File safalta se delete ho gayi:", userAadharData);
                //   }
                // });
              }
            }
            if (aadharFileDocument?.file_id) {
              const aadharURL =
                await DigiLockerService.downloadIndiviudalDocument({
                  digilocker_client_id,
                  file_id: aadharFileDocument.file_id,
                  customerID: dt?.customerID,
                });
              if (!aadharURL) {
                logger.warn(
                  MessageHelper.SUREPASS_URL_ERROR +
                    "DOWNLOADING AADHAR" +
                    dt.customerID
                );
                return MessageHelper.SUREPASS_URL_ERROR;
              } else {
                aadharS3URL = await DigiLockerService.transferFromUrlToS3(
                  aadharURL
                );
              }
            }
            if (panFileDocument?.file_id) {
              const panURL = await DigiLockerService.downloadIndiviudalDocument(
                {
                  digilocker_client_id,
                  file_id: panFileDocument.file_id,
                  customerID: dt?.customerID,
                }
              );
              if (!panURL) {
                logger.warn(
                  MessageHelper.CUSTOMER_DETAILS_MISMATCH +
                    "DOWNLOADING PAN" +
                    dt.customerID
                );
                return MessageHelper.CUSTOMER_DETAILS_MISMATCH;
              } else {
                panS3URL = await DigiLockerService.transferFromUrlToS3(panURL);
                if (panS3URL) {
                  const panNo = await DigiLockerService.extractPanFromPDF(
                    panS3URL?.Location
                  );
                  if (panNo) {
                    await Applicant.update(
                      { panNumber: panNo },
                      {
                        where: {
                          phoneNumber: customerNumber,
                        },
                      }
                    );
                  }
                }
              }
            }
            if (drivingLicenseFileDocument?.file_id) {
              const drvlcURL =
                await DigiLockerService.downloadIndiviudalDocument({
                  digilocker_client_id,
                  file_id: drivingLicenseFileDocument.file_id,
                  customerID: dt?.customerID,
                });
              if (!drvlcURL) {
                logger.warn(
                  MessageHelper.SUREPASS_URL_ERROR +
                    "DOWNLOADING DRIVING LICENSE" +
                    dt.customerID
                );
                return MessageHelper.SUREPASS_URL_ERROR;
              } else {
                drvLcS3URL = await DigiLockerService.transferFromUrlToS3(
                  drvlcURL
                );
              }
            }
            // console.log({ aadharS3URL, panS3URL, drvLcS3URL });
            if (aadharS3URL || panS3URL || drvLcS3URL) {
              const attributes = ["emailID"];
              const logData = await DigilockerRequestModel.findOne({
                attributes,
                where: {
                  clientId: digilocker_client_id,
                },
              });
              await CustomerDocuments.update(
                {
                  aadharURL: aadharS3URL?.Location
                    ? aadharS3URL?.Location
                    : null,
                  panURL: panS3URL?.Location ? panS3URL?.Location : null,
                  drivingURL: drvLcS3URL?.Location
                    ? drvLcS3URL?.Location
                    : null,
                },
                { where: { customerID: dt?.customerID } }
              );
              await Applicant.update(
                {
                  pendingReason: "DIGILOCKER PROCESS COMPLETED",
                  emailID: logData.emailID,
                  loanApplicationStatus: 2,
                },
                { where: { customerID: dt?.customerID } }
              );
              logger.warn(
                "DIGILOCKER PROCESS SUCCESS",
                +" -- " + digilocker_client_id + " " + dt?.customerID
              );
              return "SUCCESS";
            } else {
              logger.warn(
                "DIGILOCKER PROCESS SUCCESS",
                +" -- " + digilocker_client_id
              );

              return "SUCCESS";
            }
          } else {
            logger.warn(
              MessageHelper.INSUFFICIENT_DOCUMENTS_PROVIDED,
              +" -- " + digilocker_client_id
            );
            return MessageHelper.INSUFFICIENT_DOCUMENTS_PROVIDED;
          }
        } else {
          return "No Documents Found";
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log("error", error);
      console.log(
        error?.response?.data?.status_code,
        error?.response?.data?.message,
        "Error downloading Digilocker documents",
        error?.response
      );
      if (
        error?.response?.data?.status_code == 400 &&
        error?.response?.data?.message?.includes("Client ID is expired")
      ) {
        return "DIGILOCKER REQUEST TIMEOUT";
      } else {
        return false;
      }
    }
  },

  downloadIndiviudalDocument: async ({
    digilocker_client_id,
    file_id,
    customerID,
  }) => {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${URL_CONSTANTS.FETCH_DOCUEMNTS_DOWNLOAD_URL}/${digilocker_client_id}/${file_id}`,
        headers: {
          Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
        },
      };
      const downloadsRes = await axios.request(config);
      if (
        downloadsRes?.data?.success &&
        downloadsRes?.data?.data?.download_url
      ) {
        return downloadsRes?.data?.data?.download_url;
      } else {
        return false;
      }
    } catch (error) {
      const statusCode = error?.response?.data?.status_code;

      // Log only if it's a server-side error
      if (statusCode === 500 && customerID) {
        await ApiErrorLog.create({
          customerID,
          apiName: "DOWNLOAD DOCUMENTS DIGILOCKER",
          apiRequest: JSON.stringify({
            client_id: digilocker_client_id,
            file_id,
          }),
          apiResponse: safeStringify(error?.response),
        });
      }
      return false;
    }
  },
  transferBureauFromUrlToS3: async (downloadUrl) => {
    try {
      const response = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
      });

      const fileBuffer = response?.data;
      const mimeType =
        response?.headers["content-type"] || "application/octet-stream";

      // Extract fallback extension from URL
      const url = new URL(downloadUrl);
      const pathname = url.pathname;
      const fallbackExtension = pathname.split(".").pop().toLowerCase(); // e.g. 'pdf'

      // Use mime.extension or fallback
      let extension = mime.extension(mimeType);

      // Fix edge cases: when mime type is missing or returns wrong like 'xml' for PDF
      if (
        !extension ||
        extension === "xml" || // known issue
        extension.length > 5 || // safety: avoid weird long ones
        !/^[a-z0-9]+$/i.test(extension) // safety: valid characters
      ) {
        extension = fallbackExtension;
      }
      console.log("fileBuffer, mimeType, extension", {
        fileBuffer,
        mimeType,
        extension,
      });
      const result = await uploadFileToS3(fileBuffer, mimeType, extension);
      return result;
    } catch (error) {
      console.error("Transfer Error:", error);
      throw error;
    }
  },

  transferFromUrlToS3: async (downloadUrl) => {
    try {
      const response = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
      });
      const fileBuffer = response?.data;
      const mimeType =
        response?.headers["content-type"] || "application/octet-stream";
      const extension = mime.extension(mimeType) || "xml"; // default fallback

      const result = await uploadFileToS3(fileBuffer, mimeType, extension);
      return result;
    } catch (error) {
      console.error("Transfer Error:", error);
      throw error;
    }
  },
  extractAadharDataFromXMLFile: async ({ fileUrl }) => {
    try {
      const outputFile = path.join(__dirname, "ADHAR_TEMP.xsl");

      return await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputFile);
        https
          .get(fileUrl, (response) => {
            response?.pipe(file);

            file.on("finish", () => {
              file.close(() => {
                try {
                  const xmlData = fs.readFileSync(outputFile, "utf-8");

                  const parser = new XMLParser({
                    ignoreAttributes: false,
                  });

                  const jsonObj = parser.parse(xmlData);
                  // ✅ Delete the file after processing
                  // fs.unlink(outputFile, (err) => {
                  //   if (err) {
                  //     console.error("Temp file delete error:", err.message);
                  //   } else {
                  //     console.log("Temp file deleted:", outputFile);
                  //   }
                  // });
                  // console.log(
                  //   "Parsed JSON:\n",
                  //   JSON.stringify(jsonObj, null, 2)
                  // );

                  resolve(jsonObj); // ✅ Return parsed JSON
                } catch (err) {
                  reject(err);
                }
              });
            });
          })
          .on("error", (err) => {
            fs.unlinkSync(outputFile);
            console.error("Error downloading file:", err.message);
            reject(err);
          });
      });
    } catch (error) {
      console.error("extractAadharDataFromXMLFile Error:", error);
      throw error;
    }
  },
  extractPanFromPDF: async (pdfUrl) => {
    try {
      // Download the PDF file
      const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });

      // Parse the PDF buffer
      const data = await pdfParse(response?.data);

      // Extract PAN using regex
      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
      const matches = data.text.match(panRegex);

      if (matches && matches.length > 0) {
        return matches[0];
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error reading PDF:", err.message);
    }
  },
  calculateAge: async (dobStr) => {
    try {
      // Normalize separator to "-"
      const normalized = dobStr.replace(/[\/.]/g, "-");
      const parts = normalized.split("-");

      let year, month, day;

      // Infer format
      if (parts[0].length === 4) {
        // yyyy-mm-dd
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[2]);
      } else if (parts[2].length === 4) {
        year = parseInt(parts[2]);
        // Heuristic: if month > 12, assume dd-mm-yyyy
        if (parseInt(parts[1]) > 12) {
          day = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
        } else {
          // Assume mm-dd-yyyy
          month = parseInt(parts[0]) - 1;
          day = parseInt(parts[1]);
        }
      } else {
        throw new Error("Unrecognized date format");
      }

      const birthDate = new Date(year, month, day);
      if (isNaN(birthDate.getTime())) {
        throw new Error("Invalid date");
      }

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();

      // Adjust age if birthday hasn't occurred yet this year
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    } catch (err) {
      console.error("Error reading PDF:", err.message);
    }
  },
  fetchCibilReport: async ({ pan }) => {
    let config;
    let user;
    try {
      const attributes = [
        "customerID",
        "firstName",
        "middleName",
        "lastName",
        "phoneNumber",
        "gender",
        "dob",
        "relationWithCoApplicant",
        "emailID",
        "vtc",
        "pincode",
        "state",
        "country",
        "combinedAddress",
      ];
      user = await Applicant.findOne({
        attributes,
        where: { panNumber: pan, isLeadRejected: 0 },
        raw: true,
      });

      if (user) {
        const GENDER = {
          M: "male",
          MALE: "male",
          F: "female",
          FEMALE: "female",
          m: "male",
          male: "male",
          f: "female",
          female: "female",
        };
        const {
          customerID,
          firstName,
          middleName,
          lastName,
          phoneNumber,
          gender,
          dob,
          relationWithCoApplicant,
          emailID,
          vtc,
          pincode,
          state,
          country,
          combinedAddress,
        } = user;

        const full_name = [firstName, middleName, lastName]
          .filter((name) => !!name && name.trim() !== "")
          .join(" ");

        logger.warn(
          "FETCHING CRIF BUREAU REPORT FOR USER",
          user?.customerID,
          full_name,
          phoneNumber,
          pan
        );
        const RELATIONS = {
          Father: "K01",
          Husband: "K02",
          Mother: "K03",
          Son: "K04",
          Daughter: "K05",
          Wife: "K06",
          Brother: "K07",
          "Mother-In-law": "K08",
          "Father-In-law": "K09",
          "Daughter-In-law": "K10",
          "Sister-In-Law": "K11",
          "Son-In-law": "K12",
          "Brother-In-law": "K13",
        };
        const STATES = {
          "Andhra Pradesh": "AP",
          "Arunachal Pradesh": "AR",
          Assam: "AS",
          Bihar: "BR",
          Chattisgarh: "CG",
          Goa: "GA",
          Gujarat: "GJ",
          Haryana: "HR",
          "Himachal Pradesh": "HP",
          "Jammu & Kashmir": "JK",
          Jharkhand: "JH",
          Karnataka: "KA",
          Kerala: "KL",
          "Madhya Pradesh": "MP",
          Maharashtra: "MH",
          Manipur: "MN",
          Meghalaya: "ML",
          Mizoram: "MZ",
          Nagaland: "NL",
          Odisha: "OR",
          Punjab: "PB",
          Rajasthan: "RJ",
          Sikkim: "SK",
          "Tamil Nadu": "TN",
          Tripura: "TR",
          Telangana: "TS",
          Uttarakhand: "UK",
          "Uttar Pradesh": "UP",
          "West Bengal": "WB",
          "Andaman & Nicobar": "AN",
          Chandigarh: "CH",
          "Dadra and Nagar Haveli": "DN",
          "Daman & Diu": "DD",
          Delhi: "DL",
          Lakshadweep: "LD",
          Pondicherry: "PY",
          "DADRA & NAGAR HAVELI AND DAMAN & DIU": "DNHDD",
          Ladakh: "LA",
        };

        let data = JSON.stringify({
          "REQUEST-FILE": {
            "HEADER-SEGMENT": {
              "PRODUCT-TYPE": "CIR PRO V2",
              "PRODUCT-VER": "2.0",
              "USER-ID": "Ajaycirpro_prd@amanfincap.com",
              "USER-PWD": "B4724C9A8DCE18EB030902094FDD295CD5B50A91",
              "REQ-MBR": "NBF0001850",
              "INQ-DT-TM": `${moment(new Date()).format("DD/MM/YYYY")}`,
              "REQ-VOL-TYPE": "C04",
              "REQ-ACTN-TYPE": "AT01",
              "AUTH-FLG": "Y",
              "AUTH-TITLE": "USER",
              "RES-FRMT": "HTML",
              "MEMBER-PREF-OVERRIDE": "N",
              "RES-FRMT-EMBD": "Y",
              "LOS-NAME": "INHOUSE",
              "LOS-VENDOR": "",
              "LOS-VERSION": "",
              "REQ-SERVICES-TYPE": "CIR",
            },
            INQUIRY: {
              "APPLICANT-SEGMENT": {
                "APPLICANT-ID": customerID ? customerID : "",
                "FIRST-NAME": firstName ? firstName : "",
                "MIDDLE-NAME": middleName ? middleName : "",
                "LAST-NAME": lastName ? lastName : firstName,
                DOB: {
                  "DOB-DT": `${moment(dob, "DD-MM-YYYY").format("DD/MM/YYYY")}`,
                  AGE: "",
                  "AGE-AS-ON": "",
                },
                RELATIONS: [
                  {
                    TYPE: RELATIONS[relationWithCoApplicant],
                    VALUE: "",
                  },
                ],
                IDS: [
                  {
                    TYPE: "ID07",
                    VALUE: pan,
                  },
                ],
                ADDRESSES: [
                  {
                    TYPE: "D04",
                    "ADDRESS-TEXT": combinedAddress ? combinedAddress : "",
                    CITY: vtc ? vtc : "",
                    STATE: STATES[state] ? STATES[state] : "",
                    LOCALITY: "",
                    PIN: pincode ? pincode : "",
                    COUNTRY: country ? country : "",
                  },
                ],
                PHONES: [
                  {
                    TYPE: "P04",
                    VALUE: phoneNumber ? phoneNumber : "",
                  },
                ],
                EMAILS: [
                  {
                    EMAIL: emailID ? emailID : "",
                  },
                ],
                "ACCOUNT-NUMBER": "",
              },
              "APPLICATION-SEGMENT": {
                "INQUIRY-UNIQUE-REF-NO": customerID,
                "CREDIT-RPT-ID": "200121CR352947808",
                "CREDIT-RPT-TRN-DT-TM": "12:00",
                "CREDIT-INQ-PURPS-TYPE": "CP06",
                "CREDIT-INQUIRY-STAGE": "COLLECTION",
                "CLIENT-CONTRIBUTOR-ID": "MFI00",
                "BRANCH-ID": "",
                "APPLICATION-ID": "",
                "ACNT-OPEN-DT": "",
                "LOAN-AMT": "",
                LTV: "",
                TERM: "",
                "LOAN-TYPE": "A68",
                "LOAN-TYPE-DESC": "",
              },
            },
          },
        });
        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://hub.crifhighmark.com/Inquiry/doGet.serviceJson/CIRProServiceSynchJson",
          headers: {
            userId: "Ajaycirpro_prd@amanfincap.com",
            password: "B4724C9A8DCE18EB030902094FDD295CD5B50A91",
            "CUSTOMER-ID": "NBF0001850",
            "Content-Type": "application/json",
            "PRODUCT-TYPE": "CIR PRO V2",
            "PRODUCT-VER": "2.0",
            "ACCESS-TOKEN": "",
            "REQ-VOL-TYPE": "C04",
          },
          data: data,
        };
        console.log("PAYLOAD", data);
        const response = await axios.request(config);
        console.log("____________", response?.data["CIR-REPORT-FILE"]);

        if (
          response?.data["CIR-REPORT-FILE"] &&
          response?.data["CIR-REPORT-FILE"]["REPORT-DATA"]
        ) {
          let credit_score;
          if (
            response?.data["CIR-REPORT-FILE"]["REPORT-DATA"]["STANDARD-DATA"][
              "SCORE"
            ][0]
          ) {
            credit_score =
              response?.data["CIR-REPORT-FILE"]["REPORT-DATA"]["STANDARD-DATA"][
                "SCORE"
              ][0]?.VALUE;
          }
          const TRADELINES =
            response?.data["CIR-REPORT-FILE"]["REPORT-DATA"]["STANDARD-DATA"][
              "TRADELINES"
            ][0]?.VALUE;

          const {
            "NUMBER-OF-ACCOUNTS": numberOfAccounts,
            "ACTIVE-ACCOUNTS": activeAccounts,
            "OVERDUE-ACCOUNTS": overdueAccounts,
            "SECURED-ACCOUNTS": securedAccounts,
            "UNSECURED-ACCOUNTS": unsecuredAccounts,
            "UNTAGGED-ACCOUNTS": untaggedAccounts,
            "TOTAL-CURRENT-BALANCE": totalCurrentBalance,
            "CURRENT-BALANCE-SECURED": currentBalanceSecured,
            "CURRENT-BALANCE-UNSECURED": currentBalanceUnsecured,
            "TOTAL-SANCTIONED-AMT": totalSanctionedAmt,
            "TOTAL-DISBURSED-AMT": totalDisbursedAmt,
            "TOTAL-AMT-OVERDUE": totalAmtOverdue,
          } = response?.data["CIR-REPORT-FILE"]["REPORT-DATA"][
            "ACCOUNTS-SUMMARY"
          ]["PRIMARY-ACCOUNTS-SUMMARY"];
          const printableData =
            response?.data["CIR-REPORT-FILE"]["PRINTABLE-REPORT"]?.CONTENT;

          console.log(printableData); // Now usable HTML
          if (printableData) {
            const pdfRes = await uploadBureau({ rawData: printableData });
            if (pdfRes.status && pdfRes.fileUrl) {
              await CustomerDocuments.update(
                {
                  bureauURL: pdfRes.fileUrl,
                },
                {
                  where: {
                    customerID: customerID,
                  },
                }
              );
            }
          }

          const activeAccount = TRADELINES?.filter(
            (item) => item["CLOSED-DT"] == ""
          );

          const totalObligation = activeAccount?.reduce((acc, curr) => {
            const obligation = parseInt(curr?.OBLIGATION) || 0;
            return acc + obligation;
          }, 0);

          const ccrDataReponse = await CustomerCCRDetails.create({
            NoOfAccounts: numberOfAccounts ? numberOfAccounts : 0,
            NoOfActiveAccounts: activeAccounts ? activeAccounts : 0,
            // NoOfWriteOffs,
            // TotalPastDue,
            // MostSevereStatusWithIn24Months,
            // SingleHighestCredit,
            // SingleHighestSanctionAmount,
            // TotalHighCredit,
            // AverageOpenBalance,
            // SingleHighestBalance,
            // NoOfPastDueAccounts,
            // NoOfZeroBalanceAccounts: zeroBalanceAccounts
            //   ? zeroBalanceAccounts
            //   : null,
            // RecentAccount,
            // OldestAccount,
            // TotalBalanceAmount:totalSanctionedAmt,
            TotalSanctionAmount: totalSanctionedAmt,
            // TotalCreditLimit,
            TotalMonthlyPaymentAmount: totalObligation ? totalObligation : 0,
            customerID: user?.customerID,
            creditScore: credit_score,
          });
          logger.info(`CIBIL REPONSE USER ${pan}`, ccrDataReponse);
          if (ccrDataReponse) {
            if (parseInt(credit_score) < 100) {
              await Applicant.update(
                {
                  pendingReason: `Lead Rejected Due to low credit score ${credit_score}`,
                  isLeadRejected: 1,
                  leadRejectionDate: new Date(),
                },
                {
                  where: {
                    panNumber: pan,
                    isLeadRejected: 0,
                    leadRejectionDate: new Date(),
                  },
                }
              );

              return MessageHelper.LEAD_REJECTED_DUE_LOW_CREDIT_SCRORE;
            } else {
              await Applicant.update(
                {
                  loanApplicationStatus: 3,
                },
                {
                  where: { panNumber: pan, isLeadRejected: 0 },
                }
              );
            }

            return true;
          }
        }
        return response?.data?.message;
      } else {
        return MessageHelper.PAN_DETAILS_NOT_AVAILABLE;
      }
    } catch (error) {
      console.log("error CIBIL BUREAU REPORT", error, error?.response?.data);
      if (error?.response?.data?.data?.credit_score == null) {
        logger.warn("NO CIBIL BUREAU REPORT AVAILABLE :--", pan);
        await Applicant.update(
          {
            loanApplicationStatus: 3,
          },
          {
            where: { panNumber: pan, isLeadRejected: 0 },
          }
        );
        return true;
      }
      if (error?.response) {
        await ApiErrorLog.create({
          customerID: user?.customerID,
          apiName: "FETCHING CIBIL BUREAU",
          apiRequest: JSON.stringify(config),
          apiResponse: safeStringify(error?.response),
        });
      }
      console.log("Error Fetching CIBIL Bureau  API", error);
      return `THIRD PARTY SUREPASS API RESPONSE :- ${error?.response?.data?.message} . Please Contact Customer Support Team`;
    }
  },
  // fetchNewCibilReport: async ({ pan }) => {
  //   let config;
  //   let user;
  //   try {
  //     const attributes = [
  //       "customerID",
  //       "firstName",
  //       "middleName",
  //       "lastName",
  //       "phoneNumber",
  //       "gender",
  //     ];
  //     user = await Applicant.findOne({
  //       attributes,
  //       where: { panNumber: pan, isLeadRejected: 0 },
  //       raw: true,
  //     });

  //     if (user) {
  //       const GENDER = {
  //         M: "male",
  //         MALE: "male",
  //         F: "female",
  //         FEMALE: "female",
  //         m: "male",
  //         male: "male",
  //         f: "female",
  //         female: "female",
  //       };
  //       const { firstName, middleName, lastName, phoneNumber, gender } = user;

  //       const full_name = [firstName, middleName, lastName]
  //         .filter((name) => !!name && name.trim() !== "")
  //         .join(" ");

  //       logger.warn(
  //         "FETCHING EQUIFAX BUREAU REPORT FOR USER",
  //         user?.customerID,
  //         full_name,
  //         phoneNumber,
  //         pan
  //       );

  //       const myHeaders = new Headers();
  //       myHeaders.append("Content-Type", "application/json");
  //       myHeaders.append("Authorization", process.env.CIBIL_BUREAU_PROD_KEY);

  //       let raw = JSON.stringify({
  //         mobile: phoneNumber,
  //         pan: pan,
  //         name: full_name,
  //         gender: GENDER[gender],
  //         consent: "Y",
  //       });

  //       const requestOptions = {
  //         method: "POST",
  //         headers: myHeaders,
  //         body: raw,
  //         redirect: "follow",
  //       };

  //       fetch(URL_CONSTANTS.FETCH_CIBIL_BUREAU_URL, requestOptions)
  //         .then((response) => response.text())
  //         .then((result) => console.log(result))
  //         .catch((error) => console.error(error));
  //       const response = await axios.request(config);
  //       if (
  //         response?.data?.status_code === 200 &&
  //         response?.data?.success &&
  //         response?.data?.message === "Success"
  //       ) {
  //         const { credit_score, credit_report } = response?.data?.data;
  //         const { CCRResponse } = credit_report;
  //         const { CIRReportDataLst } = CCRResponse;
  //         const index = CIRReportDataLst.findIndex(
  //           (item) =>
  //             item.hasOwnProperty("CIRReportData") &&
  //             item.CIRReportData &&
  //             typeof item.CIRReportData === "object" &&
  //             item.CIRReportData.hasOwnProperty("RetailAccountsSummary") &&
  //             item.CIRReportData.RetailAccountsSummary &&
  //             typeof item.CIRReportData.RetailAccountsSummary === "object"
  //         );
  //         const {
  //           NoOfAccounts,
  //           NoOfActiveAccounts,
  //           NoOfWriteOffs,
  //           TotalPastDue,
  //           MostSevereStatusWithIn24Months,
  //           SingleHighestCredit,
  //           SingleHighestSanctionAmount,
  //           TotalHighCredit,
  //           AverageOpenBalance,
  //           SingleHighestBalance,
  //           NoOfPastDueAccounts,
  //           NoOfZeroBalanceAccounts,
  //           RecentAccount,
  //           OldestAccount,
  //           TotalBalanceAmount,
  //           TotalSanctionAmount,
  //           TotalCreditLimit,
  //           TotalMonthlyPaymentAmount,
  //         } = CIRReportDataLst[index]?.CIRReportData?.RetailAccountsSummary;
  //         const ccrDataReponse = await CustomerCCRDetails.create({
  //           NoOfAccounts,
  //           NoOfActiveAccounts,
  //           NoOfWriteOffs,
  //           TotalPastDue,
  //           MostSevereStatusWithIn24Months,
  //           SingleHighestCredit,
  //           SingleHighestSanctionAmount,
  //           TotalHighCredit,
  //           AverageOpenBalance,
  //           SingleHighestBalance,
  //           NoOfPastDueAccounts,
  //           NoOfZeroBalanceAccounts,
  //           RecentAccount,
  //           OldestAccount,
  //           TotalBalanceAmount,
  //           TotalSanctionAmount,
  //           TotalCreditLimit,
  //           TotalMonthlyPaymentAmount,
  //           customerID: user?.customerID,
  //           creditScore: credit_score,
  //         });
  //         logger.info(`EQUIFAX REPONSE USER ${pan}`, ccrDataReponse);
  //         if (ccrDataReponse) {
  //           if (parseInt(credit_score) < 100) {
  //             await Applicant.update(
  //               {
  //                 pendingReason: `Lead Rejected Due to low credit score ${credit_score}`,
  //                 isLeadRejected: 1,
  //                 leadRejectionDate: new Date(),
  //               },
  //               {
  //                 where: {
  //                   panNumber: pan,
  //                   isLeadRejected: 0,
  //                   leadRejectionDate: new Date(),
  //                 },
  //               }
  //             );

  //             return MessageHelper.LEAD_REJECTED_DUE_LOW_CREDIT_SCRORE;
  //           } else {
  //             await Applicant.update(
  //               {
  //                 loanApplicationStatus: 3,
  //               },
  //               {
  //                 where: { panNumber: pan, isLeadRejected: 0 },
  //               }
  //             );
  //           }

  //           return true;
  //         }
  //       }
  //       return response?.data?.message;
  //     } else {
  //       return MessageHelper.PAN_DETAILS_NOT_AVAILABLE;
  //     }
  //   } catch (error) {
  //     console.log("error BUREAU REPORT", error, error?.response?.data);
  //     if (error?.response?.data?.data?.credit_score == "") {
  //       logger.warn("NO BUREAU REPORT AVAILABLE :--", pan);
  //       await Applicant.update(
  //         {
  //           loanApplicationStatus: 3,
  //         },
  //         {
  //           where: { panNumber: pan, isLeadRejected: 0 },
  //         }
  //       );
  //       return true;
  //     }
  //     if (error?.response) {
  //       await ApiErrorLog.create({
  //         customerID: user?.customerID,
  //         apiName: "FETCHING EQUIFAX BUREAU DIGILOCKER",
  //         apiRequest: JSON.stringify(config),
  //         apiResponse: safeStringify(error?.response),
  //       });
  //     }
  //     console.log("Error Fetching Bureau  API", error);
  //     return `THIRD PARTY SUREPASS API RESPONSE :- ${error?.response?.data?.message} . Please Contact Customer Support Team`;
  //   }
  // },
  downloadPDFBureauReport: async ({ pan, customerID }) => {
    let config;
    try {
      console.log("downloadPDFBureauReport ", pan);
      const attributes = [
        "customerID",
        "firstName",
        "middleName",
        "lastName",
        "phoneNumber",
        "gender",
      ];
      const user = await Applicant.findOne({
        attributes,
        where: { panNumber: pan, isLeadRejected: 0 },
        raw: true,
      });

      const GENDER = {
        M: "male",
        MALE: "male",
        F: "female",
        FEMALE: "female",
        m: "male",
        male: "male",
        f: "female",
        female: "female",
      };
      const { firstName, middleName, lastName, phoneNumber, gender } = user;

      const full_name = [firstName, middleName, lastName]
        .filter((name) => !!name && name.trim() !== "")
        .join(" ");

      let data = JSON.stringify({
        name: full_name,
        id_number: pan,
        id_type: "pan",
        mobile: phoneNumber,
        consent: "Y",
        gender: GENDER[gender],
      });

      config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.FETCH_BUREAU_PDF_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
        },
        data: data,
      };

      const response = await axios.request(config);
      if (
        response?.data?.status_code === 200 &&
        response?.data?.success &&
        response?.data?.message === "Success"
      ) {
        const pdfFile = await DigiLockerService.transferBureauFromUrlToS3(
          response?.data?.data?.credit_report_link
        );
        if (pdfFile) {
          await CustomerDocuments.update(
            {
              bureauURL: pdfFile?.Location ? pdfFile?.Location : null,
            },
            { where: { customerID } }
          );
          return true;
        }
      }
    } catch (error) {
      if (error?.response) {
        await ApiErrorLog.create({
          customerID,
          apiName: "FETCHING EQUIFAX BUREAU PDF",
          apiRequest: JSON.stringify(config),
          apiResponse: safeStringify(error?.response),
        });
      }
      logger.warn("ERROR WHILE DOWNLOAD BUREAU PDF REPORT", error);
    }
  },
  downloadPDFCIBILBureauReport: async ({ pan, customerID }) => {
    let config;
    try {
      // console.log("downloadPDFBureauReport ", pan);
      const attributes = [
        "customerID",
        "firstName",
        "middleName",
        "lastName",
        "phoneNumber",
        "gender",
      ];
      const user = await Applicant.findOne({
        attributes,
        where: { panNumber: pan, isLeadRejected: 0 },
        raw: true,
      });

      const GENDER = {
        M: "male",
        MALE: "male",
        F: "female",
        FEMALE: "female",
        m: "male",
        male: "male",
        f: "female",
        female: "female",
      };
      const { firstName, middleName, lastName, phoneNumber, gender } = user;

      const full_name = [firstName, middleName, lastName]
        .filter((name) => !!name && name.trim() !== "")
        .join(" ");

      let data = JSON.stringify({
        name: full_name,
        pan: pan,
        mobile: phoneNumber,
        consent: "Y",
        gender: GENDER[gender],
      });

      config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.FETCH_CIBIL_BUREAU_PDF_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.CIBIL_BUREAU_PROD_KEY,
        },
        data: data,
      };

      const response = await axios.request(config);
      if (
        response?.data?.status_code === 200 &&
        response?.data?.success &&
        response?.data?.message === "Success"
      ) {
        const pdfFile = await DigiLockerService.transferBureauFromUrlToS3(
          response?.data?.data?.credit_report_link
        );
        if (pdfFile) {
          await CustomerDocuments.update(
            {
              bureauURL: pdfFile?.Location ? pdfFile?.Location : null,
            },
            { where: { customerID } }
          );
          return true;
        }
      }
    } catch (error) {
      if (error?.response) {
        await ApiErrorLog.create({
          customerID,
          apiName: "FETCHING EQUIFAX BUREAU PDF",
          apiRequest: JSON.stringify(config),
          apiResponse: safeStringify(error?.response),
        });
      }
      logger.warn("ERROR WHILE DOWNLOAD BUREAU PDF REPORT", error);
    }
  },
  updateApplicantAdditionalDetails: async ({
    maritalStatus,
    relation,
    emailID,
    firstReferenceName,
    firstReferenceRelation,
    firstReferenceContact,
    secondReferenceName,
    secondReferenceRelation,
    secondReferenceContact,
    phoneNumber,
    houseImgRes,
  }) => {
    const attributes = ["customerID", "panNumber"];
    const applicant = await Applicant.findOne({
      attributes,
      where: { phoneNumber: phoneNumber, isLeadRejected: 0 },
      raw: true,
    });
    if (applicant) {
      const res = await Applicant.update(
        {
          maritalStatus,
          relationWithCoApplicant: relation,
          emailID,
          firstReferenceName,
          firstReferenceRelation,
          firstReferenceContact,
          secondReferenceName,
          secondReferenceRelation,
          secondReferenceContact,
          pendingReason: "ADDITIONAL INFORMATION UPDATED",
        },
        {
          where: {
            phoneNumber,
            customerID: applicant.customerID,
            isLeadRejected: 0,
          },
        }
      );

      await CustomerDocuments.update(
        {
          residencePhoto: houseImgRes,
        },
        {
          where: {
            customerID: applicant.customerID,
          },
        }
      );

      if (res) {
        return applicant;
      }
    } else {
      return "User Not Found";
    }
  },
  fetchBlockedUserByPhoneNumber: async ({ phone }) => {
    return await Applicant.findOne({
      where: {
        phoneNumber: phone?.toString(),
        isBlocked: 1,
        isLeadRejected: 0,
      },
    });
  },
  verifyCoAppPAN: async ({ pan, customerID }) => {
    try {
      const coApp = await Co_Applicant.findOne({
        where: {
          customerID,
          panNumber: pan,
        },
      });
      if (coApp) {
      }
      const myHeaders = new Headers();
      myHeaders.append("authorization", process.env.DIGITAP_PROD_KEY);
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        client_ref_num: customerID,
        pan: pan,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch(
        "https://svc.digitap.ai/validation/kyc/v1/pan_details",
        requestOptions
      );
      const result = await response.json(); // or response.text() if it's not JSON
      console.log("PAN Details Response:", result);

      if (result?.http_response_code == 200 && result.result_code == 101) {
        const {
          fullname,
          first_name,
          middle_name,
          last_name,
          aadhaar_number,
          gender,
          dob,
          aadhaar_linked,
          address,
        } = result?.result;
        const {
          building_name,
          locality,
          street_name,
          pincode,
          city,
          state,
          country,
        } = address;
        const exist = await Co_Applicant.findOne({
          where: {
            customerID,
          },
        });
        if (!exist) {
          await Co_Applicant.create({
            customerID,
            firstName: first_name,
            middleName: middle_name,
            lastName: last_name,
            dob,
            gender,
            maskedAadharNumber: aadhaar_number,
            AadharNumber: aadhaar_number,
            panNumber: pan,
            house: building_name,
            street: street_name,
            pincode,
            vtc: city,
            state,
            country,
          });
        } else {
          await Co_Applicant.update(
            {
              firstName: first_name,
              middleName: middle_name,
              lastName: last_name,
              dob,
              gender,
              maskedAadharNumber: aadhaar_number,
              AadharNumber: aadhaar_number,
              panNumber: pan,
              house: building_name,
              street: street_name,
              pincode,
              vtc: city,
              state,
              country,
            },
            {
              where: {
                customerID,
              },
            }
          );
        }

        return true;
        // return response?.data?.data;
      } else {
        // const ERROR_CODES = {
        //   102: MessageHelper.INAVLID_PAN,
        //   103:MessageHelper.INAVLID_PAN,
        // };
        return false;
      }
    } catch (error) {
      console.log("Error Verifying PAN DIGITAP API", error);
      return false;
    }
  },
  sendOTPCoApp: async ({ phone }) => {
    try {
      const min = 100000;
      const max = 999999;
      const OTP = Math.floor(Math.random() * (max - min + 1) + min);
      const msg = `Your One-Time Password (OTP) is: ${OTP} Please enter this code to complete your Mobile Number Verification. Do not share this OTP with anyone for security reasons. Thank you, Team Mini Business Loan`;

      // otp = await OtpHelper.generateMobileOtp(phone);
      const res = await sendOtpDLT(phone, OTP, msg);
      if (res !== false && typeof res === "string") {
        // const { status } = result?.data;
        // const transactionId = result?.data?.results[0]?.messageid;

        return res;
      } else {
        false;
      }
      // const otp = await OtpHelper.generateMobileOtp(phone);
      // if (otp != false) {
      //   return otp;
      // } else {
      //   false;
      // }
    } catch (error) {
      console.log("Error Createing Url Digilocker API", error.response);
      return false;
    }
  },
  verifyMobileOTPCoApp: async (dataNew) => {
    try {
      const { phone, otp, client_id, customerID } = dataNew;
      console.log(" phone, otp, client_id", phone, otp, client_id);
      const user = await SMS_DETAILS.findOne({
        where: {
          mobileNumber: phone,
          transactionID: client_id,
          OTP: otp,
          OTPVerified: 0,
        },
      });
      console.log("_____",user);
      if (user) {
        const res = await Co_Applicant.findOne({
          where: { phoneNumber: phone },
        });
        if (!res) {
          await Co_Applicant.update(
            {
              phoneNumber: phone,
            },
            {
              where: {
                customerID,
              },
            }
          );
        }

        await SMS_DETAILS.update(
          {
            OTPVerified: 1,
          },
          {
            where: {
              mobileNumber: phone,
              transactionID: client_id,
              OTP: otp,
            },
          }
        );

        return await Applicant.update(
          {
            pendingReason: "Co-Applicant's PAN and Phone Verified",
            loanApplicationStatus: 4,
          },
          {
            where: {
              customerID,
            },
          }
        );
      } else {
        return MessageHelper.INVALID_OTP;
      }
    } catch (error) {
      console.log("ERROR Verifying otp customer", error);
      return MessageHelper.SOMETHING_WENT_WRONG;
    }
  },

  validateElectricityBill: async ({ operator_code, id_number, customerID }) => {
    try {
      let data = JSON.stringify({
        id_number: id_number,
        operator_code: operator_code,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.CHECK_DIGILOCKER_STATUS_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SUREPASS_PROD_ACCESS_KEY,
        },
        data: data,
      };
      return {
        client_id: "electricity_jBxiqjAGXuymlqlbrOOb",
        customer_id: "17000346322745",
        operator_code: "MH",
        state: "maharashtra",
        full_name: "SUKHWANI",
        address: "COLONY SOLAPUR ROAD NR LAD GIRNI SHEWALWADI 412307",
        mobile: null,
        user_email: null,
        bill_amount: "1,280.00",
        bill_number: null,
        document_link: null,
      };
      //   } else if (response?.data?.status_code == 422) {
      //     return 422;
      //   } else {
      //     return false;
      //   }
    } catch (error) {
      console.log(
        "ERROR Validating electricity bill customer",
        // error,
        error.response?.data
      );
      if (error && error?.response?.data?.status_code == 422) {
        return MessageHelper.INAVLID_ELECTRICITY_BILLL;
      } else {
        return false;
      }
    }
  },
  validateGstin: async ({ gstin, customerID }) => {
    let config;
    try {
      let data = JSON.stringify({
        id_number: gstin,
      });

      config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.FETCH_GSTIN_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
        },
        data: data,
      };

      const response = await axios.request(config);
      if (response?.data.status_code == 200 && response?.data?.success) {
        const applicant = await Applicant.findOne({
          attributes: ["panNumber"],
          where: { customerID },
          raw: true,
        });
        const {
          pan_number,
          gstin: fetchedGstin,
          gstin_status,
        } = response?.data?.data;
        if (
          (pan_number == applicant.panNumber ||
            fetchedGstin?.includes(applicant.panNumber)) &&
          gstin_status?.toUpperCase()?.includes("ACTIVE")
        ) {
          return response?.data?.data;
        } else if (
          (pan_number == applicant.panNumber ||
            fetchedGstin?.includes(applicant.panNumber)) &&
          gstin_status?.toUpperCase()?.includes("INACTIVE")
        ) {
          return MessageHelper.INACTIVE_GST;
        } else {
          return MessageHelper.UNKNOWN_GST;
        }
      } else {
        return false;
      }
    } catch (error) {
      if (error?.response) {
        await ApiErrorLog.create({
          customerID,
          apiName: "FETCHING GSTIN",
          apiRequest: JSON.stringify(config),
          apiResponse: safeStringify(error?.response),
        });
      }
      console.log("ERROR DURING VERIFYING GSTIN", error?.response?.data);
      if (error && error?.response?.data?.status_code == 422) {
        return MessageHelper.INAVLID_GST;
      } else {
        return false;
      }
    }
  },
  sendOtpUdyam: async ({ registration_number, phone }) => {
    const dt = await Applicant.findOne({
      where: { phoneNumber: phone, isLeadRejected: 0 },
    });
    try {
      let data = JSON.stringify({
        registration_number: registration_number,
        mobile_number: phone,
      });
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.SEND_UDYAM_OTP_URL,
        timeout: 300000, // 15 seconds
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
        },
        data: data,
      };

      // let config = {
      //   method: "post",
      //   maxBodyLength: Infinity,
      //   url: URL_CONSTANTS.SEND_UDYAM_OTP_URL,
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
      //   },
      //   data: data,
      // };

      const response = await axios.request(config);
      if (response?.data.status_code == 200) {
        if (response?.data?.data?.client_id) {
          return response?.data?.data?.client_id;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log("ERROR DURING SENDING UDYAM OTP", error?.response?.data);

      if (dt?.customerID) {
        await ApiErrorLog.create({
          customerID: dt?.customerID,
          apiName: "SEND OTP UDYAM",
          apiRequest: JSON.stringify({
            registration_number: registration_number,
            mobile_number: phone,
          }),
          apiResponse: safeStringify(error?.response),
        });
      }

      if (error && error?.response?.data?.status_code == 422) {
        return MessageHelper.INAVLID_UDYAM;
      } else {
        return false;
      }
    }
  },
  verifyOtpUdyam: async ({ client_id, otp, customerID }) => {
    try {
      let data = JSON.stringify({
        client_id: client_id,
        otp: otp,
      });
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.VERIFY_UDYAM_OTP_URL,
        timeout: 300000, // 5 minutes
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
        },
        data: data,
      };
      const response = await axios.request(config);
      console.log("response", response);
      if (
        response?.data?.status_code == 200 &&
        response?.data?.success &&
        response?.data?.message != "Invalid OTP"
      ) {
        if (response?.data?.data) {
          const { certificate_link } = response?.data?.data;
          const udyamURL = await DigiLockerService.transferFromUrlToS3(
            certificate_link
          );
          if (udyamURL) {
            udyamURL?.Location ? udyamURL?.Location : null;
            await CustomerDocuments.update(
              {
                udyamURL: aadharS3URL?.Location ? aadharS3URL?.Location : null,
              },
              { where: { customerID } }
            );
          }
          return response?.data?.data;
        }
      } else if (response?.data?.message == MessageHelper.INVALID_OTP) {
        return MessageHelper.INVALID_OTP;
      } else {
        return false;
      }
    } catch (error) {
      console.log("ERROR DURING VERIFYING UDYAM OTP", error?.response?.data);

      // Log only if it's a server-side error
      if (customerID) {
        await ApiErrorLog.create({
          customerID,
          apiName: "VERIFY OTP UDYAM",
          apiRequest: JSON.stringify({
            client_id: client_id,
            otp: otp,
          }),
          apiResponse: safeStringify(error?.response),
        });
      }
      if (error && error?.response?.data?.status_code == 422) {
        return MessageHelper.INVALID_OTP;
      } else {
        return false;
      }
    }
  },

  validateITR: async ({ gstin, customerID }) => {
    try {
      let data = JSON.stringify({
        id_number: gstin,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: URL_CONSTANTS.FETCH_GSTIN_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SUREPASS_PROD_ACCESS_KEY,
        },
        data: data,
      };

      const response = await axios.request(config);
      if (response?.data.status_code == 200 && response?.data?.success) {
        const applicant = await Applicant.findOne({
          attributes: ["panNumber"],
          where: { customerID, isLeadRejected: 0 },
          raw: true,
        });
        const {
          pan_number,
          gstin: fetchedGstin,
          gstin_status,
        } = response?.data?.data;
        if (
          (pan_number == applicant.panNumber ||
            fetchedGstin?.includes(applicant.panNumber)) &&
          gstin_status?.toUpperCase()?.includes("ACTIVE")
        ) {
          return true;
        } else if (
          (pan_number == applicant.panNumber ||
            fetchedGstin?.includes(applicant.panNumber)) &&
          gstin_status?.toUpperCase()?.includes("INACTIVE")
        ) {
          return MessageHelper.INACTIVE_GST;
        } else {
          return MessageHelper.UNKNOWN_GST;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log("ERROR DURING VERIFYING GSTIN", error?.response?.data);
      if (error && error?.response?.data?.status_code == 422) {
        return MessageHelper.INAVLID_GST;
      } else {
        return false;
      }
    }
  },

  fetchCustomerUser: async ({ phone }) => {
    try {
      return await Applicant.findOne({
        where: {
          phoneNumber: phone,
          isLeadRejected: 0,
        },
      });
    } catch (error) {
      console.log("error", error);
      return false;
    }
  },
  fetchPendingCustomers: async ({ EmployeeID }) => {
    try {
      return await Applicant.findAll({
        where: {
          sourceBy: EmployeeID?.toString(),
          isLeadRejected: 0,
          loanApplicationStatus: {
            [Op.notIn]: [0, 6, 7, 8, 9, 10],
          },
        },
      });
    } catch (error) {
      console.log("error", error);
      return false;
    }
  },
  fetchPendingCams: async ({ branchID }) => {
    try {
      const results = await SEQUELIZE.query(
        `SELECT A.customerID, CONCAT(firstName, ' ', middleName, ' ', lastName) AS borrowerName, phoneNumber, A.createdOn, CCR.TotalMonthlyPaymentAmount, UD.aadharUserImageURL, 
        UD.aadharURL, UD.aadharUserImageURL, UD.panURL, UD.electricityBill,	UD.coAppAadharURL,	UD.coAppAadharUserImageURL,	UD.coAppPanURL,	UD.bankStatementURL, UD.businessPhoto,
        UD.drivingURL,	UD.udyamURL, UD.bureauURL, A.combinedAddress, ABD.businessAddress,UB.averageBalance
        FROM Applicant A
        LEFT JOIN userDocument UD ON A.customerID = UD.customerID
        LEFT JOIN customerCCRDetails CCR ON A.customerID = CCR.customerID
        LEFT JOIN applicantBusinessDetails ABD ON A.customerID=ABD.customerID
        LEFT JOIN userBankStatement UB ON UB.customerID=A.customerID
        WHERE loanApplicationStatus = 6
        AND isLeadRejected = 0 
        AND leadRejectionDate IS NULL
        AND branchID = :branchID`,
        {
          replacements: { branchID }, // 👈 safely inject the branchID
          type: QueryTypes.SELECT,
        }
      );

      return results;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  },
  getPendingEsign: async ({ EmployeeID, postingBranch }) => {
    try {
      const results = await SEQUELIZE.query(
        `
        SELECT A.customerID,CONCAT(firstName, ' ', middleName, ' ', lastName) AS borrower,A.phoneNumber,
        UD.aadharUserImageURL,CM.approvedLoanAmount,CM.loanAmountApplied,CM.repayment AS Tenure,CM.roi AS ROI,CM.pfWithGST AS PF,UB.accountNumber,
	    	A.loanApplicationStatus,LP.NetDisbursement
        FROM Applicant A
        LEFT JOIN LoanProposal LP ON A.customerID=LP.customerID
        INNER JOIN userDocument UD ON A.customerID=UD.customerID
        LEFT JOIN CAM CM ON A.customerID=CM.customerID 
        LEFT JOIN userBankStatement UB on a.customerID=UB.customerID
        WHERE isLeadRejected=0 AND loanApplicationStatus>=8 AND LP.disbursementDate IS NULL
        AND sourceBy=:EmployeeID
        AND branchID = :postingBranch
          `,
        {
          replacements: { EmployeeID, postingBranch }, // 👈 safely inject the branchID
          type: QueryTypes.SELECT,
        }
      );
      return results;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  },
  getUserSanction: async ({ customerID }) => {
    try {
      const results = await SEQUELIZE.query(
        `
        SELECT A.customerID,CONCAT(firstName, ' ', middleName, ' ', lastName) AS borrower,A.phoneNumber,
        UD.aadharUserImageURL,CM.approvedLoanAmount,CM.loanAmountApplied,CM.repayment AS Tenure,CM.roi AS ROI,CM.pfWithGST AS PF,UB.accountNumber,
	    	A.loanApplicationStatus,LP.NetDisbursement
        FROM Applicant A
        LEFT JOIN LoanProposal LP ON A.customerID=LP.customerID
        INNER JOIN userDocument UD ON A.customerID=UD.customerID
        LEFT JOIN CAM CM ON A.customerID=CM.customerID 
        LEFT JOIN userBankStatement UB on a.customerID=UB.customerID
        WHERE isLeadRejected=0 AND loanApplicationStatus>=8 AND LP.disbursementDate IS NULL
        AND A.customerID=:customerID
        `,
        {
          replacements: { customerID }, // 👈 safely inject the branchID
          type: QueryTypes.SELECT,
        }
      );
      return results;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  },
  fetchApprovedCAMS: async ({ EmployeeID }) => {
    try {
      const results = await SEQUELIZE.query(
        `
        SELECT A.customerID AS leadID,
        CONCAT(A.firstName, ' ', ISNULL(A.middleName, ''), ' ', A.lastName) AS name,
        C.approvedLoanAmount,CASE WHEN C.creditApprovalStatus='Approved' THEN 'CAM Approved, pending for Final Approval'
        WHEN C.creditApprovalStatus='Rejected' THEN 'CAM rejected, check in rejected cam'
        WHEN C.creditApprovalStatus='LeadBack' THEN 'CAM backed, please check in pending CAM again'
        END AS CreditStatus,C.PDremarks,C.finalApprovalDate,A.pendingReason
        FROM Applicant A
        INNER JOIN CAM C ON A.customerID=C.customerID
        WHERE A.loanApplicationStatus=7 AND C.creditApprovalStatus='Approved'
        AND entryBy=:EmployeeID
        `,
        {
          replacements: { EmployeeID }, // 👈 safely inject the branchID
          type: QueryTypes.SELECT,
        }
      );
      return results;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  },
  getRepaymentSchedule: async ({ customerID }) => {
    try {
      console.log("customerID", customerID);
      const results = await SEQUELIZE.query(
        `
        select * from RepaymentSchedule where CustomerID =(select loanID from LoanProposal where customerID = :customerID and disbursementDate is not null and SettlementDate is null)
        `,
        {
          replacements: { customerID }, // 👈 safely inject the branchID
          type: QueryTypes.SELECT,
        }
      );
      console.log("_________results", results);
      return results;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  },
  fetchRejectedCAMS: async ({ EmployeeID }) => {
    try {
      const results = await SEQUELIZE.query(
        `
        SELECT A.customerID AS leadID,
        CONCAT(A.firstName, ' ', ISNULL(A.middleName, ''), ' ', A.lastName) AS name,
        C.approvedLoanAmount,CASE WHEN C.creditApprovalStatus='Approved' THEN 'CAM Approved, pending for Final Approval'
        WHEN C.creditApprovalStatus='Rejected' THEN 'CAM rejected, check in rejected cam'
        WHEN C.creditApprovalStatus='LeadBack' THEN 'CAM backed, please check in pending CAM again'
        END AS CreditStatus,C.PDremarks,C.finalApprovalDate,A.pendingReason
        FROM Applicant A
        INNER JOIN CAM C ON A.customerID=C.customerID
        WHERE A.loanApplicationStatus=7 AND C.creditApprovalStatus='Rejected'
        AND entryBy=:EmployeeID
        `,
        {
          replacements: { EmployeeID }, // 👈 safely inject the branchID
          type: QueryTypes.SELECT,
        }
      );
      return results;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  },
  fetchBusinessNaturePurpose: async () => {
    try {
      const nature = await BusinessNature.findAll({
        where: {
          status: 1,
        },
      });
      const purpose = await BusinessPurpose.findAll({
        where: {
          status: 1,
        },
      });
      return { nature, purpose };
    } catch (error) {
      console.log("error", error);
      return false;
    }
  },
  saveBusinessDetails: async ({
    udyamNumber,
    gstNumber,
    businessName,
    businessNature,
    businessPurpose,
    businessVintage,
    businessAddress,
    staffCount,
    avgTurnover,
    electricityBill,
    customerID,
  }) => {
    try {
      await CustomerDocuments.update(
        { electricityBill },
        {
          where: { customerID },
        }
      );
      await Applicant.update(
        {
          loanApplicationStatus: 5,
          pendingReason: "CUSTOMER BUSINESS DETAILS SUBMITTED",
        },
        {
          where: { customerID },
        }
      );
      const attributes = ["customerID"];
      const business = await ApplicantBusinessDetails.findOne({
        attributes,
        where: {
          customerID,
        },
      });
      if (!business?.customerID) {
        return await ApplicantBusinessDetails.create({
          udyamNumber,
          gstNumber,
          businessName,
          businessNature,
          businessPurpose,
          businessVintage,
          businessAddress,
          staffCount,
          avgTurnover,
          customerID,
        });
      } else {
        return await ApplicantBusinessDetails.update(
          {
            udyamNumber,
            gstNumber,
            businessName,
            businessNature,
            businessPurpose,
            businessVintage,
            businessAddress,
            staffCount,
            avgTurnover,
          },
          {
            where: {
              customerID,
            },
          }
        );
      }
    } catch (error) {
      console.log("ERROR WHILE UPDATING CUSTOMER BUSINESS INFO", error);
    }
  },
  fetchCurrentUser: async ({ EmployeeID }) => {
    try {
      return await Employees.findOne({
        where: {
          EmployeeID,
          isBlocked: null,
        },
      });
    } catch (error) {
      console.log("________ERROR", error);
    }
  },
  //   fetchCompnayUpiDetails: async () => {
  //     return await UPIMasterModal.findOne({
  //       where: {
  //         IsActive: 1,
  //       },
  //     });
  //   },
};

module.exports = DigiLockerService;
