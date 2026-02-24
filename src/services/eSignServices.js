const URL_CONSTANTS = require("../config/constants");

const axios = require("axios");
const ResponseError = require("../utils/ResponseError.js");
const { transferFromUrlToS3 } = require("./digilockerServices.js");
const UserDocumentModel = require("../models/userDocument.js");
const Applicant = require("../models/applicant.js");
const ESignLog = require("../models/EsignLog.js");
const LoanProposal = require("../models/LoanProposal.js");

// e-Sign Step 1
const esignInitAPI = async (user, callback_url) => {
  try {
    const { firstName, middleName, lastName, phoneNumber, emailID } = user;

    const full_name = [firstName, middleName, lastName]
      .filter((name) => !!name && name.trim() !== "")
      .join(" ");

    const myHeaders = new Headers();
    myHeaders.append("Authorization", process.env.DIGITAP_PROD_KEY);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      uniqueId: `${phoneNumber}`,
      signers: [
        {
          email: `${emailID}`,
          location: "",
          mobile: `${phoneNumber}`,
          name: `${full_name}`,
        },
      ],
      reason: "Mini Business Loan Agreement",
      templateId: "ESIG27635265",
      fileName: `Loan_Agreement_${phoneNumber}.pdf`,
      multiSignerDocId: "",
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(
      `${process.env.DIGITAP_PROD_BASE_URL}/v1/generate-esign`, // ✅ Corrected URL
      requestOptions
    );

    const text = await response.text();

    // ✅ Safe JSON parsing
    let result = {};
    if (text) {
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Response was not valid JSON:", text);
        throw new ResponseError(500, "Invalid JSON returned from Digitap");
      }
    } else {
      throw new ResponseError(
        response.status,
        "Empty response from Digitap API"
      );
    }

    console.log("Digitap eSign Response:", result);

    if (result.code === "200") {
      return result;
    } else {
      return false;
    }
  } catch (error) {
    console.log("esignInit API Error:", error);

    if (error.response) {
      throw new ResponseError(
        error.response.status || 500,
        error.response.data?.error || "Third-Party API returned an error"
      );
    } else {
      throw new ResponseError(
        500,
        error.message || "Failed to connect to Third-Party API"
      );
    }
  }
};

const getUploadUrlAPI = async ({ file, url }) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/pdf");

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: file,
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    console.log("Upload successful. Status:", response.status);

    return true;
  } catch (error) {
    console.error("Get Upload API URL Error:", error);

    throw new ResponseError(
      error.status || 500,
      error.message || "Failed to upload file to S3"
    );
  }
};

const downloadSingedDocUrl = async (document_id, customerID, proposalId) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append(
      "authorization",
      process.env.DIGITAP_PROD_KEY
    );
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ docId: document_id });

    const response = await fetch(
      "https://api.digitap.ai/ent/v1/get-esign-doc",
      {
        method: "POST",
        headers: myHeaders,
        body: raw,
      }
    );

    const result = await response.json();
    console.log("Signed document response:", result);

    // Check if eSign doc URL is returned
    if (result?.code === "200" && result?.model?.url) {
      const esignDoc = await transferFromUrlToS3(result?.model?.url);

      if (!esignDoc?.Location) throw new Error("Failed to upload to S3");

      // Update UserDocumentModel
      await UserDocumentModel.update(
        {
          sanctionLetterURL: esignDoc.Location,
        },
        {
          where: {
            customerID,
            status: null,
          },
        }
      );

      // Update Applicant
      await Applicant.update(
        {
          pendingReason: "ESIGN COMPLETED SUCCESS FULLY",
          loanApplicationStatus: 9,
        },
        {
          where: {
            customerID,
            isLeadRejected: 0,
          },
        }
      );

      // Update LoanProposal
      await LoanProposal.update(
        {
          isEsignCompleted: 1,
        },
        {
          where: {
            customerID,
            isEsignCompleted: 0,
          },
        }
      );

      // Update ESignLog
      await ESignLog.update(
        {
          status: 1,
        },
        {
          where: {
            customerID,
            status: null,
            loanProposalID: proposalId,
          },
        }
      );

      return true;
    }

    // If the API response wasn't successful
    return false;
  } catch (error) {
    console.log("getSingedDocUrl API Error:", error);

    throw new ResponseError(
      error.status || 500,
      error.message || "Failed to fetch eSign doc"
    );
  }
};

// const downloadSingedDocUrl = async (document_id, customerID, proposalId) => {
//   try {
//     const myHeaders = new Headers();
//     myHeaders.append(
//       "authorization",
//       "NDY2Nzc4MTA6OG9LbmVrczRVZU9IUzVKSFJOb0tOV2llbVB6MWU4Q2c="
//     );
//     myHeaders.append("Content-Type", "application/json");

//     const raw = JSON.stringify({
//       docId: "a3840ae9-4d23-44ef-840a-e94d2324effb",
//     });

//     const requestOptions = {
//       method: "POST",
//       headers: myHeaders,
//       body: raw,
//       redirect: "follow",
//     };

//     const response = await fetch(
//       "https://api.digitap.ai/ent/v1/get-esign-doc",
//       requestOptions
//     );
//     const result = await response.json();
//     console.log("Signed document response:", result);

//     if (result?.code == 200 && result?.model?.url) {
//       const esignDoc = await transferFromUrlToS3(result?.model?.url);
//       if (esignDoc) {
//         const resp = await UserDocumentModel.update(
//           {
//             sanctionLetterURL: esignDoc?.Location ? esignDoc?.Location : null,
//           },
//           {
//             where: {
//               customerID: customerID,
//               status: null,
//             },
//           }
//         );

//         if (resp) {
//           await Applicant.update(
//             {
//               pendingReason: "ESIGN COMPLETED SUCCESS FULLY",
//               loanApplicationStatus: 9,
//             },
//             {
//               where: {
//                 customerID: customerID,
//                 isLeadRejected: 0,
//               },
//             }
//           );
//           await LoanProposal.update(
//             {
//               isEsignCompleted: 1,
//             },
//             {
//               where: {
//                 customerID,
//                 isEsignCompleted: 0,
//               },
//             }
//           );
//           await ESignLog.update(
//             {
//               status: 1,
//             },
//             {
//               where: {
//                 customerID,
//                 status: null,
//                 loanProposalID: proposalId,
//               },
//             }
//           );
//           return true;
//         }
//       }
//     }
//     return { apiRequest: config, apiResponse: response.data };
//   } catch (error) {
//     console.log("getSingedDocUrl API Error : ", error);
//     if (error.response) {
//       throw new ResponseError(
//         error.response.status || 500,
//         error.response.data?.error || "Third-Party API returned an error"
//       );
//     } else {
//       throw new ResponseError(
//         500,
//         error.message || "Failed to connect to Third-Party API"
//       );
//     }
//   }
// }; //SUREPASS API
const getSingedDocUrl = async (document_id) => {
  try {
    // Prepare request payload (if required by API body)
    // Construct full URL with path parameter
    const url = `${URL_CONSTANTS.ESIGN_GET_SIGNED_DOC_API_URL}/${document_id}`;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: url,
      headers: {
        Authorization: process.env.SUREPASS_PROD_RICHCREDIT_ACCESS_KEY,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.request(config);
    return response;
  } catch (error) {
    console.log("getSingedDocUrl API Error : ", error);
    if (error.response) {
      throw new ResponseError(
        error.response.status || 500,
        error.response.data?.error || "Third-Party API returned an error"
      );
    } else {
      throw new ResponseError(
        500,
        error.message || "Failed to connect to Third-Party API"
      );
    }
  }
}; //SUREPASS API

module.exports = {
  esignInitAPI,
  getUploadUrlAPI,
  getSingedDocUrl,
  downloadSingedDocUrl,
};
