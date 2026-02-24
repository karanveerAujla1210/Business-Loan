const path = require("path");
const FormData = require("form-data");
const resParams = require("../config/params");
const HTTP_STATUS = require("../helpers/httpStatus");
const MessageHelper = require("../helpers/MessageHelper");
const errorHelper = require("../helpers/errorHelper");
const {
  esignInitAPI,
  getUploadUrlAPI,
  downloadSingedDocUrl,
} = require("../services/eSignServices");
const { getImageBase64 } = require("../utils/imageToBase64");
const generateLoanHTML = require("../utils/sanction_loan");
const { convertHtmlToPdfBase64 } = require("../utils/generatepdf");
const OtpHelper = require("../helpers/OtpHelper");
const LoanProposal = require("../models/LoanProposal");
const Applicant = require("../models/applicant");
const ESignLog = require("../models/EsignLog");
const fetch = require("node-fetch"); // Make sure to import fetch if not globally available
const UserDocument = require("../models/userDocument");
const WhyChooseUs = require("../models/WhyChooseUs");
const {
  runGenerateRepaymentSchedule,
} = require("../services/generateRepaymnet");
const { sequelize } = require("../config/database");
const { sequelize: SEQUELIZE } = require("../config/database");
const { QueryTypes } = require("sequelize");

module.exports = {
  previewSanction: async (request, response) => {
    const params = { ...resParams };
    const idUser = request?.user?.EmployeeID || request?.user?.customerID;
    const {
      customerID,
      callbackUrl,
      amountApplied,
      tenure,
      repaymentAmount,
      interestRate,
      processingFee,
      emi,
      netDisbursement,
    } = request?.body;

    // Check for input validation errors
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      return response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    }

    try {
      // 1. Get the user
      const user = await Applicant.findOne({
        where: { isLeadRejected: 0, customerID },
      });

      if (!user) {
        params.status = false;
        params.data = null;
        params.message = MessageHelper.USER_NOT_FOUND;
        return response.status(HTTP_STATUS.OK).send(params);
      }

      // 2. Fetch existing proposal
      let proposal = await LoanProposal.findOne({
        attributes: [
          "customerID",
          "loanID",
          "amountApplied",
          "interestRate",
          "tenure",
        ],
        where: {
          customerID,
          SettlementDate: null,
          disbursementDate: null,
        },
      });

      // 3. Call eSign API
      const eSignResponse = await esignInitAPI(user, callbackUrl);
      console.log("eSignResponse", eSignResponse);
      if (eSignResponse?.code !== "200") {
        params.status = false;
        params.message = MessageHelper.SUREPASS_URL_ERROR;
        return response.status(HTTP_STATUS.OK).send(params);
      }

      const { docId, url: esignUrl } = eSignResponse.model;

      // 4. Update or Create Proposal + ESignLog
      if (proposal) {
        await LoanProposal.update(
          {
            amountApplied: parseInt(amountApplied),
            tenure: parseInt(tenure),
            repaymentAmount: parseInt(repaymentAmount),
            interestRate: parseFloat(interestRate),
            processingFee: parseInt(processingFee),
            EMI: parseInt(emi),
            NetDisbursement: parseInt(netDisbursement),
          },
          {
            where: {
              customerID,
              isEsignCompleted: 0,
            },
          }
        );

        await ESignLog.update(
          { documentID: docId },
          {
            where: {
              loanProposalID: proposal.loanID,
              customerID,
            },
          }
        );
      } else {
        proposal = await LoanProposal.create({
          customerID,
          isEsignCompleted: 0,
          amountApplied: parseInt(amountApplied),
          tenure: parseInt(tenure),
          repaymentAmount: parseInt(repaymentAmount),
          interestRate: parseFloat(interestRate),
          processingFee: parseInt(processingFee),
          EMI: parseInt(emi),
          NetDisbursement: parseFloat(netDisbursement),
          LoanCycle: 1,
          status: 0,
        });

        await ESignLog.create({
          documentID: docId,
          loanProposalID: proposal.loanID,
          customerID,
        });
      }

      // 5. Final proposal fetch with updated data
      const finalProposal = await LoanProposal.findOne({
        attributes: [
          "customerID",
          "loanID",
          "amountApplied",
          "interestRate",
          "tenure",
        ],
        where: {
          customerID,
          SettlementDate: null,
          disbursementDate: null,
        },
      });

      if (!finalProposal) {
        params.status = false;
        params.data = finalProposal;
        params.message = MessageHelper.USER_DATA_MISSING;
        return response.status(HTTP_STATUS.OK).send(params);
      }

      // 6. Generate repayment schedule
      const repaymentSchedule = await runGenerateRepaymentSchedule(
        finalProposal
      );

      // 7. Get data for PDF
      const [result] = await SEQUELIZE.query(
        `
        SELECT A.customerID AS loanAccountNo, CONCAT(A.firstName,' ',A.middleName,' ',A.lastName) AS customerName,
               LP.amountApplied AS sanctionedAmount, LP.loanID AS loanNo, LP.firstDateofInstallment,
               ABD.businessName, ABD.businessAddress, ABD.businessNature, ABD.businessPurpose AS loanPurpose,
               CM.APR, BM.branchName AS branch, BM.address AS branchAddress,
               A.combinedAddress AS borrower1Address1, A.pincode AS borrower1Pin,
               CONCAT(CA.firstName,' ',CA.middleName,' ',CA.lastName) AS borrower2Name, CA.combinedAddress, CA.pincode AS borrower2Pin,
               LP.NetDisbursement,
               dbo.NumberToWords(LP.NetDisbursement) AS loanAmountWords,
               dbo.NumberToWords(LP.amountApplied) AS loanSanctionAmountWords
        FROM Applicant A
        LEFT JOIN Co_Applicant CA ON A.customerID=CA.customerID
        LEFT JOIN branchMaster BM ON A.branchName=BM.branchName
        LEFT JOIN LoanProposal LP ON A.customerID=LP.customerID
        LEFT JOIN applicantBusinessDetails ABD ON A.customerID=ABD.customerID
        LEFT JOIN CAM CM ON A.customerID=CM.customerID
        WHERE A.customerID = :customerID
        `,
        {
          replacements: { customerID },
          type: QueryTypes.SELECT,
        }
      );

      // 8. Generate HTML & PDF
      const sanctionHtml = await generateLoanHTML({
        repaymentSchedule,
        data: result,
      });
      if (!sanctionHtml) throw new Error("Failed to generate HTML");

      const pdfBase64 = await convertHtmlToPdfBase64(sanctionHtml);
      if (!pdfBase64) throw new Error("Failed to generate PDF");

      const pdfBuffer = Buffer.from(pdfBase64, "base64");

      // 9. Upload PDF to external service
      const uploadUrlResponse = await getUploadUrlAPI({
        file: pdfBuffer,
        url: esignUrl,
      });

      if (!uploadUrlResponse) throw new Error("Failed to get upload URL");

      // 10. Generate eSign redirect URL
      const successURL = callbackUrl;
      const failureURL = `https://minibusinessloan.com/esignfailure`;
      const FINAL_SIGN_URL = `https://sdk.digitap.ai/e-sign/templateesignprocess.html?docId=${docId}&redirect_url=${successURL}&error_url=${failureURL}`;

      // 11. Optional: send email to customer
      if (idUser?.includes("MBLA")) {
        const { firstName, middleName, lastName, emailID } = user;
        const full_name = [firstName, middleName, lastName]
          .filter(Boolean)
          .join(" ");
        await OtpHelper.sendEmailSanctionLetter(
          emailID,
          full_name,
          FINAL_SIGN_URL
        );
      }

      // 12. Return final response
      params.data = {
        document_id: docId,
        signUrl: FINAL_SIGN_URL,
      };
      params.message = MessageHelper.SUCCESS;
      return response.status(HTTP_STATUS.OK).send(params);
    } catch (error) {
      console.error("PreviewSanction Error:", error);
      params.data = error;
      params.message = error.message || MessageHelper.SOMETHING_WENT_WRONG;
      return response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
    }
  },

  //   previewSanction: async (request, response) => {
  //     const params = { ...resParams };
  //     const idUser = request?.user?.EmployeeID || request?.user?.customerID;
  //     const {
  //       customerID,
  //       callbackUrl,
  //       amountApplied,
  //       tenure,
  //       repaymentAmount,
  //       interestRate,
  //       processingFee,
  //       emi,
  //       netDisbursement,
  //     } = request?.body;

  //     const err = await errorHelper.checkError(request);
  //     if (err) {
  //       params.message = err;
  //       response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
  //       return;
  //     }

  //     try {
  //       const user = await Applicant.findOne({
  //         where: {
  //           isLeadRejected: 0,
  //           customerID: customerID,
  //         },
  //       });

  //       if (!user) {
  //         params.status = false;
  //         params.data = null;
  //         params.message = MessageHelper.USER_NOT_FOUND;
  //         response.status(HTTP_STATUS.OK).send(params);
  //         return;
  //       }

  //       const proposal = await LoanProposal.findOne({
  //         attributes: [
  //           "customerID",
  //           "loanID",
  //           "amountApplied",
  //           "interestRate",
  //           "tenure",
  //         ],
  //         where: {
  //           customerID,
  //           SettlementDate: null,
  //           disbursementDate: null,
  //         },
  //       });
  //       // Initialize eSign API
  //       params.data = await esignInitAPI(user, callbackUrl);
  //       if (params.data?.code !== 200) {
  //         params.status = false;
  //         params.message = MessageHelper.SUREPASS_URL_ERROR;
  //         response.status(HTTP_STATUS.OK).send(params);
  //         return;
  //       }

  //       const docId = params?.data?.model?.docId;
  //       const esignUrl = params?.data?.model?.url;
  //       if (proposal) {
  //         await LoanProposal.update(
  //           {
  //             amountApplied: parseInt(amountApplied),
  //             tenure: parseInt(tenure),
  //             repaymentAmount: parseInt(repaymentAmount),
  //             interestRate: parseFloat(interestRate),
  //             processingFee: parseInt(processingFee),
  //             EMI: parseInt(emi),
  //             NetDisbursement: parseInt(netDisbursement),
  //           },
  //           {
  //             where: {
  //               customerID: customerID,
  //               isEsignCompleted: 0,
  //             },
  //           }
  //         );

  //         await ESignLog.update(
  //           {
  //             documentID: docId,
  //           },
  //           {
  //             where: {
  //               loanProposalID: proposal.loanID,
  //               customerID: customerID,
  //             },
  //           }
  //         );
  //       } else {
  //         const prop = await LoanProposal.create({
  //           customerID: customerID,
  //           isEsignCompleted: 0,
  //           amountApplied: parseInt(amountApplied),
  //           tenure: parseInt(tenure),
  //           repaymentAmount: parseInt(repaymentAmount),
  //           interestRate: parseFloat(interestRate),
  //           processingFee: parseInt(processingFee),
  //           EMI: parseInt(emi),
  //           NetDisbursement: parseFloat(netDisbursement),
  //           LoanCycle: 1,
  //           status: 0,
  //         });

  //         if (prop) {
  //           await ESignLog.create({
  //             documentID: docId,
  //             loanProposalID: prop.loanID,
  //             customerID: customerID,
  //           });
  //         }
  //       }

  //       const finalproposal = await LoanProposal.findOne({
  //         attributes: [
  //           "customerID",
  //           "loanID",
  //           "amountApplied",
  //           "interestRate",
  //           "tenure",
  //         ],
  //         where: {
  //           customerID,
  //           SettlementDate: null,
  //           disbursementDate: null,
  //         },
  //       });
  //       if (!finalproposal) {
  //         params.status = false;
  //         params.data = finalproposal;
  //         params.message = MessageHelper.USER_DATA_MISSING;
  //         response.status(HTTP_STATUS.OK).send(params);
  //         return;
  //       }
  //       let repaymentSchedule;
  //       if (finalproposal) {
  //         repaymentSchedule = await runGenerateRepaymentSchedule(finalproposal);
  //       }

  //       // Prepare images for PDF

  //       const results = await SEQUELIZE.query(
  //         `
  //         SELECT A.customerID AS loanAccountNo,CONCAT(A.firstName,' ',A.middleName,' ',A.lastName)customerName,LP.amountApplied AS sanctionedAmount,
  //         LP.loanID AS loanNo,LP.firstDateofInstallment,ABD.businessName,ABD.businessAddress,ABD.businessNature,ABD.businessPurpose AS loanPurpose,CM.APR,BM.branchName branch,BM.address AS branchAddress,
  //         A.combinedAddress AS borrower1Address1,A.pincode AS borrower1Pin,CONCAT(CA.firstName,' ',CA.middleName,' ',CA.lastName)borrower2Name,CA.combinedAddress,CA.pincode AS borrower2Pin,
  //         LP.NetDisbursement,dbo.NumberToWords(LP.NetDisbursement) AS loanAmountWords,dbo.NumberToWords(LP.amountApplied) AS loanSanctionAmountWords
  //         FROM Applicant A
  //         LEFT JOIN Co_Applicant CA ON A.customerID=CA.customerID
  //         LEFT JOIN branchMaster BM ON A.branchName=BM.branchName
  //         LEFT JOIN LoanProposal LP ON A.customerID=LP.customerID
  //         LEFT JOIN applicantBusinessDetails ABD ON A.customerID=ABD.customerID
  //         LEFT JOIN CAM CM ON A.customerID=CM.customerID
  //         WHERE A.customerID= '${customerID}'
  //           `,
  //         {
  //           replacements: { customerID },
  //           type: QueryTypes.SELECT,
  //         }
  //       );
  //       const payload = {
  //         repaymentSchedule,
  //         data: results[0],
  //       };

  //       const sanction_html_page = await generateLoanHTML(payload);

  //       if (!sanction_html_page) {
  //         params.status = false;
  //         params.data = sanction_html_page;
  //         params.message = MessageHelper.SUREPASS_URL_ERROR;
  //         response.status(HTTP_STATUS.OK).send(params);
  //         return;
  //       }

  //       // Convert HTML to PDF Base64 string
  //       const pdfBase64 = await convertHtmlToPdfBase64(sanction_html_page);
  //       if (!pdfBase64) {
  //         params.status = false;
  //         params.data = pdfBase64;
  //         params.message = MessageHelper.SUREPASS_URL_ERROR;
  //         response.status(HTTP_STATUS.OK).send(params);
  //         return;
  //       }

  //       // Convert base64 string to Buffer
  //       const pdfBuffer = Buffer.from(pdfBase64, "base64");

  //       // Get upload URL and fields
  //       const uploadUrlResponse = await getUploadUrlAPI({
  //         file: pdfBuffer,
  //         url: esignUrl,
  //         // client_id: docId,
  //       });

  //       if (!uploadUrlResponse) {
  //         params.status = false;
  //         params.data = uploadUrlResponse;
  //         params.message = MessageHelper.SUREPASS_URL_ERROR;
  //         response.status(HTTP_STATUS.OK).send(params);
  //         return;
  //       }

  //       // const uploadUrl = uploadUrlResponse.data.url;
  //       // const uploadFields = uploadUrlResponse.data.fields;

  //       // // Create form-data and append fields and file buffer
  //       // const formData = new FormData();
  //       // Object.entries(uploadFields).forEach(([key, value]) => {
  //       //   formData.append(key, value);
  //       // });
  //       // formData.append("file", pdfBuffer, {
  //       //   filename: "sanction_letter.pdf",
  //       //   contentType: "application/pdf",
  //       // });

  //       // // Upload the PDF to S3 URL
  //       // const uploadResponse = await fetch(uploadUrl, {
  //       //   method: "POST",
  //       //   headers: formData.getHeaders(),
  //       //   body: formData,
  //       // });

  //       // if (!uploadResponse.ok) {
  //       //   params.status = false;
  //       //   params.data = uploadResponse;
  //       //   params.message = MessageHelper.SUREPASS_URL_ERROR;
  //       //   response.status(HTTP_STATUS.OK).send(params);
  //       //   return;
  //       // }

  //       // Update or create LoanProposal and ESignLog
  //       if ((esignUrl, docId)) {
  //         // const proposal = await LoanProposal.findOne({
  //         //   where: {
  //         //     customerID: customerID,
  //         //     isEsignCompleted: 0,
  //         //   },
  //         // });
  //         // const successURL = `https://minibusinessloan.com/sanctionLetterPush?customerID=${customerID}`;
  //         const successURL = callbackUrl;
  //         const failureURL = `https://minibusinessloan.com/esignfailure`;
  //         const FINAL_SIGN_URL = `https://sdk.digitap.ai/e-sign/templateesignprocess.html?docId=${docId}&redirect_url=${successURL}&error_url=${failureURL}
  // `;
  //         // Send email with eSign URL
  //         if (idUser?.includes("MBLA")) {
  //           const { firstName, middleName, lastName, emailID } = user;
  //           const full_name = [firstName, middleName, lastName]
  //             .filter((name) => !!name && name.trim() !== "")
  //             .join(" ");
  //           await OtpHelper.sendEmailSanctionLetter(
  //             emailID,
  //             full_name,
  //             FINAL_SIGN_URL
  //           );
  //         }

  //         params.data = {
  //           document_id: docId,
  //           signUrl: FINAL_SIGN_URL,
  //         };
  //         params.message = MessageHelper.SUCCESS;
  //         response.status(HTTP_STATUS.OK).send(params);
  //       } else {
  //         params.message = MessageHelper.SOMETHING_WENT_WRONG;
  //         response.status(HTTP_STATUS.OK).send(params);
  //       }
  //     } catch (error) {
  //       console.log("error", error);
  //       params.data = error;
  //       params.message = error.message;
  //       console.log(error);
  //       response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
  //     }
  //   },

  downloadEsignSanctionLetter: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    const { customerID } = request.body;
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      const proposal = await LoanProposal.findOne({
        where: {
          customerID: customerID,
          isEsignCompleted: 0,
        },
      });
      if (!proposal) {
        params.status = false;
        params.message = "Loan Proposal ID MISSING";
        response.status(HTTP_STATUS.OK).send(params);
      }
      const esignLog = await ESignLog.findOne({
        where: {
          customerID: customerID,
          status: null,
          loanProposalID: proposal?.loanID,
        },
      });
      console.log("proposal_____", esignLog);
      if (!esignLog) {
        params.status = false;
        params.message = "Document ID MISSING";
        response.status(HTTP_STATUS.OK).send(params);
      }
      const document_id = esignLog?.documentID;
      params.data = await downloadSingedDocUrl(
        document_id,
        customerID,
        proposal?.loanID
      );
      if (params.data) {
        params.message = MessageHelper.JOB_POSTER_COUNT_FETCHED;
        response.status(HTTP_STATUS.OK).send(params);
      } else {
        params.status = false;
        params.message = MessageHelper.INTERNAL_SERVER_ERROR;
        response.status(HTTP_STATUS.OK).send(params);
      }
      try {
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  checkSanction: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    const { customerID } = request.body;
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      // const res =
      // params.data = await LoanProposal.findOne({
      //   where: {
      //     customerID: customerID,
      //     isEsignCompleted: 1,
      //   },
      // });
      params.data = await UserDocument.findOne({
        where: {
          customerID,
        },
      });
      if (params.data) {
        params.message = MessageHelper.JOB_POSTER_COUNT_FETCHED;
        response.status(HTTP_STATUS.OK).send(params);
      } else {
        params.status = false;
        params.message = MessageHelper.INTERNAL_SERVER_ERROR;
        response.status(HTTP_STATUS.OK).send(params);
      }
      try {
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
  // generateRepyament: async (request, response) => {
  //   const params = { ...resParams };
  //   const err = await errorHelper.checkError(request);
  //   const { customerID } = request.body;
  //   if (err) {
  //     params.message = err;
  //     response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
  //   } else {
  // const data = await LoanProposal.findOne({
  //   attributes: [
  //     "customerID",
  //     "loanID",
  //     "amountApplied",
  //     "interestRate",
  //     "tenure",
  //   ],
  //   where: {
  //     customerID,
  //     SettlementDate: null,
  //     disbursementDate: null,
  //   },
  // });

  // if (data) {
  //   params.data = await runGenerateRepaymentSchedule(data);
  // }

  //       params.message = MessageHelper.SUCCESS;
  //       response.status(HTTP_STATUS.OK).send(params);
  //     } else {
  //       params.status = false;
  //       params.message = MessageHelper.INTERNAL_SERVER_ERROR;
  //       response.status(HTTP_STATUS.OK).send(params);
  //     }
  //     try {
  //     } catch (error) {
  //       params.data = error;
  //       params.message = error.message;
  //       console.log(error);
  //       response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
  //     }
  //   }
  // },
  getCustomerData: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    const { customerID } = request.user;
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      const data = await Applicant.findOne({
        attributes: [
          "customerID",
          "firstName",
          "phoneNumber",
          "loanApplicationStatus",
          "panNumber",
          "emailID",
        ],
        where: {
          customerID,
        },
      });
      const document = await UserDocument.findOne({
        attributes: ["aadharUserImageURL"],
        where: {
          customerID,
          // status: 1,
        },
      });
      if (data) {
        const {
          customerID,
          firstName,
          phoneNumber,
          loanApplicationStatus,
          panNumber,
          emailID,
        } = data;
        if (document?.aadharUserImageURL) {
          params.data = {
            aadharUserImageURL: document.aadharUserImageURL,
            customerID,
            firstName,
            phoneNumber,
            loanApplicationStatus,
            emailID,
            panNumber,
          };
        } else {
          params.data = {
            aadharUserImageURL: null,
            customerID,
            firstName,
            phoneNumber,
            loanApplicationStatus,
            emailID,
            panNumber,
          };
        }
        params.message = MessageHelper.SUCCESS;
        response.status(HTTP_STATUS.OK).send(params);
      } else {
        params.status = false;
        params.message = MessageHelper.INTERNAL_SERVER_ERROR;
        response.status(HTTP_STATUS.OK).send(params);
      }
      try {
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },

  getWhyChooseUs: async (request, response) => {
    const params = { ...resParams };
    const err = await errorHelper.checkError(request);
    if (err) {
      params.message = err;
      response.status(HTTP_STATUS.NOT_ACCEPTED).send(params);
    } else {
      params.data = await WhyChooseUs.findAll({
        where: {
          status: 1,
        },
      });
      if (params.data) {
        params.message = MessageHelper.SUCCESS;
        response.status(HTTP_STATUS.OK).send(params);
      } else {
        params.status = false;
        params.message = MessageHelper.INTERNAL_SERVER_ERROR;
        response.status(HTTP_STATUS.OK).send(params);
      }
      try {
      } catch (error) {
        params.data = error;
        params.message = error.message;
        console.log(error);
        response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(params);
      }
    }
  },
};
