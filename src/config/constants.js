/**
 * This file contain all the constant value used across the application
 * @author Mini Business Loan <mohitkumar.webdev@gmail.com>
 */

const devMode = {
  PROD: "https://kyc-api.surepass.io/api/v1/",
  UAT: "https://sandbox.surepass.io/api/v1/",
};

const baseUrl = devMode[process.env.DEV] || devMode.PROD;
const constant = {
  CREATE_DIGILOCKER_URL: `${baseUrl}digilocker/initialize`,
  CHECK_DIGILOCKER_STATUS_URL: `${baseUrl}digilocker/status`,

  SEND_OTP_URL: `${baseUrl}telecom/generate-otp`,
  VERIFY_OTP_URL: `${baseUrl}telecom/submit-otp`,
  FETCH_DIGILOCKER_DOCUEMNTS_URL: `${baseUrl}digilocker/list-documents`,
  FETCH_DOCUEMNTS_DOWNLOAD_URL: `${baseUrl}digilocker/download-document`,
  FETCH_BUREAU_URL: `${baseUrl}credit-report-v2/fetch-report`,
  FETCH_CIBIL_BUREAU_URL: `${baseUrl}credit-report-cibil/fetch-report`,
  FETCH_CIBIL_BUREAU_PDF_URL: `${baseUrl}credit-report-cibil/fetch-report-pdf`,
  FETCH_BUREAU_PDF_URL: `${baseUrl}credit-report-v2/fetch-pdf-report`,

  FETCH_CO_APP_PAN_URL: `${baseUrl}pan/pan-comprehensive`,
  FETCH_ELECTRICITY_URL: `${baseUrl}utility/electricity/`,
  FETCH_GSTIN_URL: `${baseUrl}corporate/gstin`,
  FETCH_ITR_URL: `${baseUrl}corporate/gstin`,
  SEND_UDYAM_OTP_URL: `${baseUrl}udyam-otp/send-otp`,
  VERIFY_UDYAM_OTP_URL: `${baseUrl}udyam-otp/submit-otp`,
  ESIGN_INIT_API: `${baseUrl}esign/initialize`,
  ESIGN_GET_UPLOAD_LINK_API_URL: `${baseUrl}esign/get-upload-link`,
  ESIGN_GET_SIGNED_DOC_API_URL: `${baseUrl}esign/get-signed-document`,

  INITIATE_BANK_STATEMENT: "https://cartbi.com/api/generateNetBankingRequest",
  PROCESS_BANK_STATEMENT: "https://cartbi.com/api/downloadFile",
};

module.exports = constant;
