/**
 * This file contain all the constant value used across the application
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */

const devMode = {
  PROD: "https://kyc-api.surepass.io/api/v1/",
  UAT: "https://sandbox.surepass.io/api/v1/",
};

const constant = {
  CREATE_DIGILOCKER_URL: `${devMode[process.env.DEV]}digilocker/initialize`,
  CHECK_DIGILOCKER_STATUS_URL: `${devMode[process.env.DEV]}digilocker/status`,

  SEND_OTP_URL: `${devMode[process.env.DEV]}telecom/generate-otp`,
  VERIFY_OTP_URL: `${devMode[process.env.DEV]}telecom/submit-otp`,
  FETCH_DIGILOCKER_DOCUEMNTS_URL: `${
    devMode[process.env.DEV]
  }digilocker/list-documents`,
  FETCH_DOCUEMNTS_DOWNLOAD_URL: `${
    devMode[process.env.DEV]
  }digilocker/download-document`,
  FETCH_BUREAU_URL: `${devMode[process.env.DEV]}credit-report-v2/fetch-report`,
  FETCH_CIBIL_BUREAU_URL: `${
    devMode[process.env.DEV]
  }credit-report-cibil/fetch-report`,
  FETCH_CIBIL_BUREAU_PDF_URL: `${
    devMode[process.env.DEV]
  }credit-report-cibil/fetch-report-pdf`,
  FETCH_BUREAU_PDF_URL: `${
    devMode[process.env.DEV]
  }credit-report-v2/fetch-pdf-report`,

  FETCH_CO_APP_PAN_URL: `${devMode[process.env.DEV]}pan/pan-comprehensive`,
  FETCH_ELECTRICITY_URL: `${devMode[process.env.DEV]}utility/electricity/`,
  FETCH_GSTIN_URL: `${devMode[process.env.DEV]}corporate/gstin`,
  FETCH_ITR_URL: `${devMode[process.env.DEV]}corporate/gstin`,
  SEND_UDYAM_OTP_URL: `${devMode[process.env.DEV]}udyam-otp/send-otp`,
  VERIFY_UDYAM_OTP_URL: `${devMode[process.env.DEV]}udyam-otp/submit-otp`,
  // E-SIGN API's
  ESIGN_INIT_API: `${devMode[process.env.DEV]}esign/initialize`,
  ESIGN_GET_UPLOAD_LINK_API_URL: `${
    devMode[process.env.DEV]
  }esign/get-upload-link`,
  ESIGN_GET_SIGNED_DOC_API_URL: `${
    devMode[process.env.DEV]
  }esign/get-signed-document`,

  INITIATE_BANK_STATEMENT: "https://cartbi.com/api/generateNetBankingRequest",
  PROCESS_BANK_STATEMENT: "https://cartbi.com/api/downloadFile",
};
module.exports = constant;
