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
const ComplianceController = require("../controllers/ComplianceController");
const CRMController = require("../controllers/CRMController");
const { generatePrometheusMetrics } = require("../utils/prometheusMetrics");
const { requireAuthenticatedUser, requireInternalUser } = require("../middlewares/authorization");
//controllers
const AuthController = require("../controllers/AuthController");
const UserController = require("../controllers/UserController");
const FAQController = require("../controllers/FAQController");
const NotificationController = require("../controllers/NotificationController");
const JobController = require("../controllers/JobController");
const SourcingController = require("../controllers/SourcingController");

const SanctionController = require("../controllers/SanctionController");
const collectionController = require("../controllers/collectionController");

// Health check endpoint
router.get("/health", HealthController.healthCheck);

// Metrics endpoints
router.get("/metrics", requireInternalUser, MetricsController.getMetrics);
router.post("/metrics/reset", requireInternalUser, MetricsController.resetMetrics);
router.get("/metrics/prometheus", requireInternalUser, (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(generatePrometheusMetrics());
});

// Reporting endpoints
router.get("/reports/daily", ReportingController.getDailyReport);
router.get("/reports/loans", ReportingController.getLoanStatistics);
router.get("/reports/repayments", ReportingController.getRepaymentStatistics);
router.get("/reports/customers", ReportingController.getCustomerStatistics);
router.get("/crm/dashboard", CRMController.getDashboard);

// Compliance endpoints
router.get("/compliance/privacy-policy", ComplianceController.getPrivacyPolicy);
router.get("/compliance/export-data", requireAuthenticatedUser, ComplianceController.exportUserData);
router.post("/compliance/delete-data", requireAuthenticatedUser, ComplianceController.deleteUserData);
router.post("/compliance/consent", requireAuthenticatedUser, ComplianceController.consentManagement);

//Auth controller API's - DEPRECATED - Use new API endpoints below
// router.post(
//   "/auth/generate-otp-customer",
//   checkSchema(API_SCHEMA.sendMobileOTP),
//   AuthController.sendOtpCustomer
// );

// router.post(
//   "/auth/verify-otp-customer",
//   checkSchema(API_SCHEMA.verifyMobileOTPCustomer),
//   AuthController.verifyMobileOTPCustomer
// );

// router.post(
//   "/auth/verify-otp-staff",
//   checkSchema(API_SCHEMA.verifyMobileOTPCustomer),
//   AuthController.verifyMobileOTPStaff
// );

router.post("/auth/login-staff", AuthController.staffLogin);

// router.post(
//   "/auth/send-otp-staff",
//   checkSchema(API_SCHEMA.sendMobileOTPStaff),
//   AuthController.sendMobileOTPStaff
// );

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
router.get("/sourcing/get-customer-documents", SourcingController.fetchCustomerDocuments);
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

// <<<------------------------NEW SYSTEM API ROUTES------------------------------->>>

// Import new controllers
const authController = require("../controllers/authController");
const camController = require("../controllers/camController");
const loanController = require("../controllers/loanController");
const repaymentController = require("../controllers/repaymentController");
const applicantController = require("../controllers/applicantController");
const adminController = require("../controllers/adminController");
const { authenticateCustomer, authenticateStaff, authorize } = require("../middlewares/authMiddleware");

// ============== AUTHENTICATION ROUTES ==============
router.post("/api/v1/auth/send-otp", authController.sendOTP);
router.post("/api/v1/auth/verify-otp", authController.verifyOTP);
router.post("/api/v1/auth/customer/login", authController.customerLogin);
router.post("/api/v1/auth/refresh-token", authController.refreshToken);
router.post("/api/v1/auth/logout", authenticateCustomer, authController.logout);
router.get("/api/v1/auth/profile", authenticateCustomer, authController.getCurrentProfile);
router.get("/api/v1/auth/verify-token", authController.verifyToken);
router.post("/api/v1/auth/resend-otp", authController.resendOTP);
router.get("/api/v1/auth/check-phone/:phoneNumber", authController.checkPhoneAvailability);

// ============== CAM (CREDIT ASSESSMENT) ROUTES ==============
router.post("/api/v1/cam/create", authenticateStaff, authorize(['credit_officer', 'branch_manager', 'super_admin']), camController.createCAM);
router.get("/api/v1/cam/:camID", authenticateStaff, camController.getCAMById);
router.get("/api/v1/cam/customer/:customerID", authenticateCustomer, camController.getCAMByCustomer);
router.put("/api/v1/cam/:camID", authenticateStaff, authorize(['credit_officer', 'branch_manager']), camController.updateCAM);
router.post("/api/v1/cam/:camID/submit", authenticateStaff, camController.submitCAM);
router.get("/api/v1/cam/:camID/decision", authenticateStaff, camController.getApprovalDecision);
router.post("/api/v1/cam/:camID/approve", authenticateStaff, authorize(['credit_officer', 'branch_manager', 'super_admin']), camController.approveCAM);
router.post("/api/v1/cam/:camID/reject", authenticateStaff, authorize(['credit_officer', 'branch_manager', 'super_admin']), camController.rejectCAM);
router.get("/api/v1/cam/list", authenticateStaff, camController.getCAMList);
router.post("/api/v1/cam/calculate-emi", camController.calculateEMI);
router.post("/api/v1/cam/calculate-ltv", camController.calculateLTV);

// ============== LOAN ROUTES ==============
router.post("/api/v1/loans/create", authenticateCustomer, loanController.createLoan);
router.get("/api/v1/loans/:loanID", authenticateCustomer, loanController.getLoanById);
router.get("/api/v1/loans/customer/:customerID", authenticateCustomer, loanController.getCustomerLoans);
router.get("/api/v1/loans", authenticateStaff, authorize(['credit_officer', 'branch_manager', 'super_admin']), loanController.listLoans);
router.post("/api/v1/loans/:loanID/approve", authenticateStaff, authorize(['credit_officer', 'branch_manager', 'super_admin']), loanController.approveLoan);
router.post("/api/v1/loans/:loanID/reject", authenticateStaff, authorize(['credit_officer', 'branch_manager', 'super_admin']), loanController.rejectLoan);
router.get("/api/v1/loans/:loanID/status", authenticateCustomer, loanController.getLoanStatus);
router.get("/api/v1/loans/:loanID/emi-schedule", authenticateCustomer, loanController.getEMISchedule);
router.get("/api/v1/loans/:loanID/details", authenticateCustomer, loanController.getLoanDetails);
router.post("/api/v1/loans/:loanID/mark-overdue", authenticateStaff, authorize(['collection_agent', 'branch_manager', 'super_admin']), loanController.markLoanOverdue);
router.post("/api/v1/loans/:loanID/mark-npa", authenticateStaff, authorize(['branch_manager', 'super_admin']), loanController.markLoanNPA);
router.post("/api/v1/loans/:loanID/update-emi", authenticateStaff, authorize(['branch_manager', 'super_admin']), loanController.updateLoanEMI);

// ============== PAYMENT/REPAYMENT ROUTES ==============
router.post("/api/v1/payments/process", authenticateCustomer, repaymentController.processPayment);
router.get("/api/v1/payments/loan/:loanID/history", authenticateCustomer, repaymentController.getPaymentHistory);
router.get("/api/v1/payments/customer/:customerID/history", authenticateCustomer, repaymentController.getCustomerPaymentHistory);
router.get("/api/v1/payments/loan/:loanID/total-paid", authenticateCustomer, repaymentController.getTotalPaid);
router.get("/api/v1/payments/loan/:loanID/outstanding-emis", authenticateCustomer, repaymentController.getOutstandingEMIs);
router.get("/api/v1/payments/agent/:agentID/statistics", authenticateStaff, authorize(['collection_agent', 'branch_manager', 'super_admin']), repaymentController.getAgentStatistics);
router.get("/api/v1/payments/overdue-loans", authenticateStaff, authorize(['collection_agent', 'branch_manager', 'super_admin']), repaymentController.getOverdueLoans);
router.get("/api/v1/payments/receipt/:transactionID", authenticateCustomer, repaymentController.getPaymentReceipt);
router.post("/api/v1/payments/create-link", authenticateCustomer, repaymentController.createPaymentLink);
router.get("/api/v1/payments/loan/:loanID/status", authenticateCustomer, repaymentController.getLoanPaymentStatus);
router.get("/api/v1/payments/collection/dashboard", authenticateStaff, authorize(['collection_agent', 'branch_manager', 'super_admin']), repaymentController.getCollectionDashboard);

// ============== APPLICANT/CUSTOMER ROUTES ==============
router.post("/api/v1/applicant/profile", authenticateCustomer, applicantController.updateProfile);
router.get("/api/v1/applicant/profile/:customerID", authenticateCustomer, applicantController.getProfile);
router.get("/api/v1/applicant/sensitive/:customerID", authenticateCustomer, applicantController.getSensitiveInfo);
router.post("/api/v1/applicant/kyc/update", authenticateStaff, authorize(['credit_officer', 'branch_manager', 'super_admin']), applicantController.updateKYCStatus);
router.post("/api/v1/applicant/documents/upload", authenticateCustomer, applicantController.uploadDocument);
router.get("/api/v1/applicant/documents/:customerID", authenticateCustomer, applicantController.getDocuments);
router.post("/api/v1/applicant/co-applicant/add", authenticateCustomer, applicantController.addCoApplicant);
router.get("/api/v1/applicant/co-applicants/:customerID", authenticateCustomer, applicantController.getCoApplicants);
router.get("/api/v1/applicant/list", authenticateStaff, authorize(['branch_manager', 'super_admin']), applicantController.listApplicants);
router.get("/api/v1/applicant/summary/:customerID", authenticateCustomer, applicantController.getSummary);

// ============== ADMIN & REPORTING ROUTES ==============
router.get("/api/v1/admin/dashboard", authenticateStaff, authorize(['branch_manager', 'super_admin']), adminController.getDashboard);
router.get("/api/v1/admin/reports/loans", authenticateStaff, authorize(['branch_manager', 'super_admin']), adminController.getLoanReport);
router.get("/api/v1/admin/reports/customers", authenticateStaff, authorize(['branch_manager', 'super_admin']), adminController.getCustomerReport);
router.get("/api/v1/admin/reports/collection", authenticateStaff, authorize(['branch_manager', 'super_admin']), adminController.getCollectionReport);
router.get("/api/v1/admin/reports/npa-analysis", authenticateStaff, authorize(['branch_manager', 'super_admin']), adminController.getNPAAnalysis);
router.get("/api/v1/admin/reports/credit-quality", authenticateStaff, authorize(['branch_manager', 'super_admin']), adminController.getCreditQualityReport);
router.get("/api/v1/admin/reports/monthly", authenticateStaff, authorize(['branch_manager', 'super_admin']), adminController.getMonthlyReport);
router.get("/api/v1/admin/export/loans", authenticateStaff, authorize(['branch_manager', 'super_admin']), adminController.exportLoansData);
router.get("/api/v1/admin/system-health", authenticateStaff, authorize(['super_admin']), adminController.getSystemHealth);

module.exports = router;

// ChatReport.sync({ force: true })
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// 681873c9feb1f40012c6f254
