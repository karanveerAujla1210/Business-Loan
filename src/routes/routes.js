const router = require("express").Router();
const { checkSchema } = require("express-validator");
const API_SCHEMA = require("../validator/apiSchema");
const USER_SCHEMA = require("../validator/userSchema");
const BANK_SCHEMA = require("../validator/bankSchema");
const SKILL_SCHEMA = require("../validator/skillSchema");
const DEVICE_TOKEN_SCHEMA = require("../validator/deviceTokenSchema");
const NOTIFICATION_SCHEMA = require("../validator/notification");
const DIGILOCKER_SCHEMA = require("../validator/digilockerSchema");
const RAZORPAY_SCHEMA = require("../validator/razorpaySchema");
const HealthController = require("../controllers/HealthController");
const MetricsController = require("../controllers/MetricsController");
const ReportingController = require("../controllers/ReportingController");
const { generatePrometheusMetrics } = require("../utils/prometheusMetrics");
//controllers
const AuthController = require("../controllers/AuthController");
const UserController = require("../controllers/UserController");
const UtilityController = require("../controllers/UtilityController");
const FAQController = require("../controllers/FAQController");
const NotificationController = require("../controllers/NotificationController");
const JobController = require("../controllers/JobController");
const SourcingController = require("../controllers/SourcingController");

const SanctionController = require("../controllers/SanctionController");
const { disbursed } = require("../controllers/DisburseNewController");
const collectionController = require("../controllers/collectionController");

// Health check endpoint
router.get("/health", HealthController.healthCheck);

// Metrics endpoints
router.get("/metrics", MetricsController.getMetrics);
router.post("/metrics/reset", MetricsController.resetMetrics);
router.get("/metrics/prometheus", (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(generatePrometheusMetrics());
});

// Reporting endpoints
router.get("/reports/daily", ReportingController.getDailyReport);
router.get("/reports/loans", ReportingController.getLoanStatistics);
router.get("/reports/repayments", ReportingController.getRepaymentStatistics);
router.get("/reports/customers", ReportingController.getCustomerStatistics);

// Compliance endpoints
router.get("/compliance/privacy-policy", ComplianceController.getPrivacyPolicy);
router.get("/compliance/export-data", ComplianceController.exportUserData);
router.post("/compliance/delete-data", ComplianceController.deleteUserData);
router.post("/compliance/consent", ComplianceController.consentManagement);

//Auth controller API's
router.post(
  "/auth/generate-otp-customer",
  checkSchema(API_SCHEMA.sendMobileOTP),
  AuthController.sendOtpCustomer
);

router.post(
  "/auth/verify-otp-customer",
  checkSchema(API_SCHEMA.verifyMobileOTPCustomer),
  AuthController.verifyMobileOTPCustomer
);

router.post(
  "/auth/verify-otp-staff",
  checkSchema(API_SCHEMA.verifyMobileOTPCustomer),
  AuthController.verifyMobileOTPStaff
);

router.post(
  "/auth/send-otp-staff",
  checkSchema(API_SCHEMA.sendMobileOTPStaff),
  AuthController.sendMobileOTPStaff
);

// router.post(
//   "/auth/verify-email",
//   checkSchema(API_SCHEMA.verifyEmail),
//   AuthController.verifyOtp
// );

// router.post(
//   "/auth/verify-mobile",
//   checkSchema(API_SCHEMA.verifyMobile),
//   AuthController.verifyMobileOtp
// );

// router.post(
//   "/auth/generate-otp",
//   checkSchema(API_SCHEMA.generateOtp),
//   AuthController.generateOtp
// );

// router.post(
// 	'/auth/verify-email-otp',
// 	checkSchema(API_SCHEMA.verifyOtp),
// 	AuthController.verifyOtp
// );
// router.post(
// 	'/auth/register',
// 	checkSchema(API_SCHEMA.registerUser),
// 	AuthController.register
// );
// router.post(
// 	'/auth/verify-email',
// 	checkSchema(API_SCHEMA.verifyEmail),
// 	AuthController.verifyOtp
// );
// router.post('/auth/login', checkSchema(API_SCHEMA.login), AuthController.login);

// router.post(
// 	'/auth/generate-otp',
// 	checkSchema(API_SCHEMA.generateOtp),
// 	AuthController.generateOtp
// );
// router.post(
// 	'/auth/verify-otp',
// 	checkSchema(API_SCHEMA.verifyOtp),
// 	AuthController.verifyOtp
// );

//User profile API's
router.delete("/user/delete", UserController.deleteUser);
router.put("/user/update-profile", UserController.updateProfile);
router.get("/user/get-user-profile", UserController.getProfile);
router.put(
  "/user/update-notification-status",
  checkSchema(USER_SCHEMA.updateNotificationStatus),
  UserController.updateUserNotificationStatus
);
//get Service Providers and Job Poster Counts
router.get(
  "/user/service-provider-counts",
  UserController.getServiceProviderCount
);
router.get("/user/job-poster-counts", UserController.getJobPosterCount);
//Bank Account API's
router.post(
  "/user/add-bank",
  checkSchema(BANK_SCHEMA.addBank),
  UserController.addUserBankAccount
);
router.put(
  "/user/update-bank/:id",
  checkSchema(BANK_SCHEMA.updateBank),
  UserController.updateUserBankAccount
);
router.delete(
  "/user/delete-bank/:id",
  checkSchema(BANK_SCHEMA.deleteBankAccount),
  UserController.deleteUserBankAccount
);
router.get("/user/get-bank-accounts", UserController.getUserBankAccount);
router.get("/user/get-bank-account/:id", UserController.getUserBankAccountById);
// router.get('/common/get-bank-accounts', UserController.getBankAccount);
router.put(
  "/user/set-default-bank/:id",
  checkSchema(BANK_SCHEMA.setDefaultBank),
  UserController.setDefaultBankAccount
);

//Skill API's
router.post(
  "/user/add-skills",
  checkSchema(SKILL_SCHEMA.addSkill),
  UserController.addUserSkills
);
router.put(
  "/user/update-skill",
  checkSchema(SKILL_SCHEMA.addUserSkill),
  UserController.updateUserSkill
);
router.get("/user/get-skill", UserController.getUserSkill);

//Get All Skills API
router.get("/common/get-skill", UserController.getAllSkill);

//Device Toke API's'
router.put(
  "/user/update-device-token",
  checkSchema(DEVICE_TOKEN_SCHEMA.updateDeviceToken),
  UserController.updateDeviceToken
);
router.delete("/user/delete-device-token/:id", UserController.deleteUserToken);
router.get("/common/get-faqs", FAQController.getFAQs);

//Notification API's'
router.get("/notification/get-all", NotificationController.getNotifications);
router.put(
  "/notification/update/:id",
  NotificationController.updateNotification
);

router.delete(
  "/notification/delete",
  checkSchema(NOTIFICATION_SCHEMA.deleteNotification),
  NotificationController.deleteNotification
);

router.get("/job/get/applicant/:id", JobController.getAllJobApplications);
// router.get('/job/application/get', JobController.getAllJobApplication);
// router.get('/job/application/get/:id', JobController.getJobApplicationById);

//  <<<------------------------TECH AVIOM API's------------------------------->>>

router.get("/sourcing/get-banners", SourcingController.getBanners);
router.post(
  "/sourcing/initiate-digilocker",
  checkSchema(DIGILOCKER_SCHEMA.createURL),
  SourcingController.initiateDigilocker
);
router.post(
  "/sourcing/process-digilocker-data",
  checkSchema(DIGILOCKER_SCHEMA.processDigilockerData),
  SourcingController.downloadDocumentsAndUpdateData
);
router.get("/get/user/details", SourcingController.fetchCurrentUser);
router.get("/get/user/details/web", SourcingController.fetchCurrentUserWeb);
router.post("/get/cutomer/details", SourcingController.fetchCustomerUser);
router.put(
  "/sourcing/update-applicant-additional-data",
  checkSchema(DIGILOCKER_SCHEMA.updateApplicantAdditionalData),
  SourcingController.updateApplicantAdditionalData
);
router.post(
  "/sourcing/fetch-cibil-report",
  checkSchema(DIGILOCKER_SCHEMA.fetchCibilReport),
  SourcingController.fetchCibilReport
);
router.post(
  "/sourcing/send-otp-co-applicant",
  checkSchema(API_SCHEMA.sendOtpCoAPP),
  SourcingController.sendOTPCoApp
);
router.post(
  "/sourcing/verify-otp-co-applicant",
  checkSchema(API_SCHEMA.verifyOtpCoAPP),
  SourcingController.verifyOTPCoApp
);

router.post(
  "/sourcing/valdiate-electricity-bill",
  checkSchema(API_SCHEMA.validateElectricityBill),
  SourcingController.validateElectricityBill
);

router.post(
  "/sourcing/valdiate-gstin",
  checkSchema(API_SCHEMA.validateGSTIN),
  SourcingController.validateGSTIN
);

router.post(
  "/sourcing/send-otp-udyam",
  checkSchema(API_SCHEMA.sendOtpUdyam),
  SourcingController.sendOtpUdyam
);

router.post(
  "/sourcing/verify-otp-udyam",
  checkSchema(API_SCHEMA.verifyOtpUdyam),
  SourcingController.verifyOtpUdyam
);

router.get(
  "/sourcing/fecth-pending-customers",
  SourcingController.fetchPendingCustomers
);

router.get(
  "/sourcing/business-nature-purpose",
  SourcingController.fetchBusinessNaturePurpose
);

router.post("/sourcing/upload-file", SourcingController.uplaodFile);

router.post(
  "/sourcing/save-business-details",
  SourcingController.saveBusinessDetails
);

router.post(
  "/sourcing/initiate-bank-statement",
  checkSchema(DIGILOCKER_SCHEMA.initiateBankStatement),
  SourcingController.initiateBankStatement
);
router.post(
  "/sourcing/check-bsa-status",
  checkSchema(DIGILOCKER_SCHEMA.checkBSAStatus),
  SourcingController.checkBSAStatus
);

router.get(
  "/sourcing/get-statement-options",
  SourcingController.getStatementOptions
);

router.get(
  "/sourcing/get-repayment-frequency",
  SourcingController.getRepaymentFrequency
);
router.post(
  "/sourcing/fetch-pending-cams",
  checkSchema(DIGILOCKER_SCHEMA.fetchPendigCams),
  SourcingController.getPendingCams
);
router.post(
  "/sourcing/pending-esign-customers",
  SourcingController.getPendingEsign
);
router.post("/sourcing/submit-cam-data", SourcingController.submitCamData);

router.post(
  "/sourcing/preview-sanction",
  checkSchema(API_SCHEMA.previewSanction),
  SanctionController.previewSanction
);
router.post(
  "/sourcing/check-sanction",
  checkSchema(API_SCHEMA.previewSanction),
  SanctionController.checkSanction
);
// router.post(
//   "/sourcing/final-dirsbursement",
//   checkSchema(API_SCHEMA.disburse),
//   disbursed
// );
// router.post(
//   "/sourcing/generate-repayment",
//   SanctionController.generateRepyament
// );

//Customers Routes
router.get("/sourcing/get-customer-data", SanctionController.getCustomerData);
router.get(
  "/sourcing/get-repayment-schedule",
  SourcingController.getRepaymentSchedule
);
router.get("/get-why-choose-us", SanctionController.getWhyChooseUs);
router.post("/get-faq", FAQController.getFAQs);
router.post(
  "/sourcing/get-user-sanction-amount",
  SourcingController.getUserSanction
);
router.get(
  "/sourcing/fetch-approved-cams",
  SourcingController.fetchApprovedCAMS
);
router.get(
  "/sourcing/fetch-rejected-cams",
  SourcingController.fetchRejectedCAMS
);

//------------------------------ COLLECTION API's ----------------------------------------

router.get(
  "/collection/fetch-branch-collection-Data",
  collectionController.getBranchCollectionData
);
router.post(
  "/collection/razorpay/create-qr",
  checkSchema(RAZORPAY_SCHEMA.createPaymentQR),
  collectionController.createPaymentQR
);


//------------------------------ COLLECTION API's Customter App ----------------------------------------
router.post(
  "/collection/razorpay/create-order",
  checkSchema(RAZORPAY_SCHEMA.createOrder),
  collectionController.createOrder
);

module.exports = router;

// ChatReport.sync({ force: true })
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// 681873c9feb1f40012c6f254
