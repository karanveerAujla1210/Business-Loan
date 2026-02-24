const express = require("express");
var http = require("http");
require("dotenv").config();
const app = express();
const passport = require("passport");
const fileUpload = require("express-fileupload");
const routes = require("./src/routes/routes");
const session = require("express-session");
const authenticator = require("./src/middlewares/authenticate/");
const cors = require("cors");
const compression = require("compression");
const verifyStaticToken = require("./src/utils/verifyStaticToken");
const { checkSchema } = require("express-validator");
const DIGILOCKER_SCHEMA = require("./src/validator/digilockerSchema");
const SourcingController = require("./src/controllers/SourcingController");
const { logger, requestLogger } = require("./src/utils/logger");
const SanctionController = require("./src/controllers/SanctionController");
const API_SCHEMA = require("./src/validator/apiSchema");
const { disbursed } = require("./src/controllers/DisburseNewController");
const RazorpayController = require("./src/controllers/collectionController");
const rawBodySaver = require("./src/middlewares/rawBody");
const socket = require("./src/config/socket");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const performanceMonitor = require('./src/middlewares/performanceMonitor');
const alertManager = require('./src/utils/alertManager');
const auditTrail = require('./src/utils/auditTrail');
const notificationScheduler = require('./src/utils/notificationScheduler');
const path = require('path');

// Security middlewares
const { securityHeaders } = require("./src/middlewares/security");
const { apiLimiter, authLimiter, otpLimiter, uploadLimiter } = require("./src/middlewares/rateLimiter");
const { sanitizeInput } = require("./src/middlewares/sanitization");
const { errorHandler, notFoundHandler, uncaughtExceptionHandler, unhandledRejectionHandler } = require("./src/middlewares/errorHandler");

// Handle uncaught exceptions and unhandled rejections
uncaughtExceptionHandler();
unhandledRejectionHandler();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security headers
app.use(securityHeaders);

// Compression
app.use(compression());

// Performance monitoring
app.use(performanceMonitor.middleware());

// Audit trail
app.use(auditTrail.middleware());

// Request logging
app.use(requestLogger);

// Static files
app.use('/dashboard', express.static(path.join(__dirname, 'public')));
app.use('/analytics', express.static(path.join(__dirname, 'public')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MiniBusiness Loan API Docs'
}));

// Start notification scheduler
notificationScheduler.start();

// Periodic metrics check and alerting
setInterval(async () => {
  const metrics = performanceMonitor.getMetrics();
  await alertManager.checkThresholds(metrics);
}, 60000); // Check every minute

// ✅ Razorpay universal webhook route should come before json parsing
app.post(
  "/api/v1/razorpay/universal-webhook",
  express.json({ verify: rawBodySaver }), // ✅ preserves raw body
  RazorpayController.handleUniversalWebhook
);
app.post(
  "/api/v1/razorpay/qr-webhook",
  express.json({ verify: rawBodySaver }), // ✅ preserves raw body
  RazorpayController.handleQRWebhook
);

const allowedOrigins = [
  "http://localhost:5173",
  "https://minibuisnessloan.com",
  "https://minibusinessloan.com",
  "https://www.minibusinessloan.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'strict'
    },
  })
);
authenticator.init(app);

app.use(passport.initialize());
app.use(passport.session());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// parse application/json
app.use(express.json());

// Input sanitization
app.use(sanitizeInput);

app.use(fileUpload());

//validate secureAPI

var corsOption = {
  origin: [
    "/auth/verify-otp-customer",
    "/auth/generate-otp-customer",
    "/auth/send-otp-staff",
    "/auth/verify-otp-staff",
    "/auth/register",
    "/auth/verify-mobile",
    "/sourcing/process-bank-statement",
    "/sourcing/upload-file-web",
    "/sourcing/download-bureau-pdf",
    "/sourcing/download-sanction",
    "/sourcing/get-address",
    "/collection/update-payment",
    "/sourcing/final-dirsbursement",
    "razorpay/universal-webhook", // ✅ webhook allowed in CORS
  ],
  methods: "GET,HEAD,PUT,PATCH,POST, OPTIONS ,DELETE",
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOption));

// API routes initialization with authentication and rate limiting
app.use(
  "/api/v1",
  apiLimiter,
  passport.authenticate(["bearer", "anonymous"], { session: true }),
  (req, res, next) => {
    if (
      [
        "/auth/verify-otp-customer",
        "/auth/generate-otp-customer",
        "/auth/send-otp-staff",
        "/auth/verify-otp-staff",
        "/auth/register",
        "/auth/verify-mobile",
        "/sourcing/process-bank-statement",
        "/sourcing/upload-file-web",
        "/sourcing/download-bureau-pdf",
        "/sourcing/download-sanction",
        "/sourcing/get-address",
        "/sourcing/final-dirsbursement",
        "/razorpay/universal-webhook",
      ].includes(req.url) ||
      req.user
    ) {
      next();
    } else {
      res.status(401).send({
        status: false,
        data: [],
        message: "Not Authorized",
        api_version: "1.0",
      });
    }
  },
  routes
);

// Auth routes with strict rate limiting
app.post(
  "/api/v1/auth/generate-otp-customer",
  otpLimiter,
  checkSchema(API_SCHEMA.sendMobileOTP),
  (req, res, next) => next()
);

app.post(
  "/api/v1/auth/verify-otp-customer",
  authLimiter,
  checkSchema(API_SCHEMA.verifyMobileOTPCustomer),
  (req, res, next) => next()
);

app.post(
  "/api/v1/auth/send-otp-staff",
  otpLimiter,
  checkSchema(API_SCHEMA.sendMobileOTPStaff),
  (req, res, next) => next()
);

app.post(
  "/api/v1/auth/verify-otp-staff",
  authLimiter,
  checkSchema(API_SCHEMA.verifyMobileOTPCustomer),
  (req, res, next) => next()
);

// ✅ Correct route path with leading slash
app.post(
  "/api/v1/sourcing/process-bank-statement",
  verifyStaticToken,
  SourcingController.processBankStatement
);

app.post(
  "/api/v1/sourcing/upload-file-web",
  uploadLimiter,
  verifyStaticToken,
  SourcingController.uplaodFile
);

app.post(
  "/api/v1/sourcing/download-bureau-pdf",
  verifyStaticToken,
  SourcingController.downlaodCibilReport
);

app.post(
  "/api/v1/sourcing/get-address",
  verifyStaticToken,
  checkSchema(DIGILOCKER_SCHEMA.getAddress),
  SourcingController.getAddress
);

app.post(
  "/api/v1/sourcing/download-sanction",
  SanctionController.downloadEsignSanctionLetter
);

app.post(
  "/api/v1/sourcing/final-dirsbursement",
  checkSchema(API_SCHEMA.disburse),
  disbursed
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to API" });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const port = process.env.PORT || 3000;

var httpServer = http.createServer(app);
 socket.init(httpServer); // 👈 initialize

// const socketIo = require("socket.io")(httpServer);
// global.io = socketIo;

// global.io.on("connection", WebSocket.connection);

logger.info({ event: "init" }, "App is starting...");
//application is listening at port
httpServer.listen(port, () => {
  logger.info(`Application running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
