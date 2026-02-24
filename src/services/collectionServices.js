const Sequelize = require("sequelize");
const { Op, QueryTypes } = require("sequelize");
const { sequelize: SEQUELIZE } = require("../config/database");
const { createPaymentQr } = require("../utils/Razorpay");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const MessageHelper = require("../helpers/MessageHelper");
const { logger } = require("../utils/logger");
const RepaymentTransactionUPI = require("../models/repaymentTransactionUPI");
const moment = require("moment");
const socket = require("../config/socket");

// Temporary event tracking (replace with DB in production)
const processedEvents = new Set();

module.exports = {
  getBranchCollData: async ({ EmployeeID }) => {
    try {
      const results = await SEQUELIZE.query(
        `
          SELECT BM.branchName, CONCAT(AP.firstName,' ',AP.middleName,' ',AP.lastName) AS name,
          RS.CustomerID, AP.phoneNumber, InstallmentNumber, DueDate, Principal, Interest,
          RS.EMI, Principle_Coll, Interest_Coll, CollectionAmt, Collection_Date, StaffID,
          ABD.businessAddress
          FROM RepaymentSchedule RS
          INNER JOIN LoanProposal LP ON RS.CustomerID = LP.LoanID
          INNER JOIN Applicant AP ON LP.customerID = AP.customerID
          INNER JOIN branchMaster BM ON AP.branchID = BM.branchID
          INNER JOIN applicantBusinessDetails ABD ON AP.customerID = ABD.customerID
          WHERE DueDate = '2025-06-27'
          AND LP.disbursementDate IS NOT NULL
          AND LP.SETTLEMENTDATE IS NULL
        `,
        {
          replacements: { EmployeeID },
          type: QueryTypes.SELECT,
        }
      );

      //'2025-06-27'  '${moment(new Date()).format("YYYY-MM-DD")}'

      return results;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  createPaymentQR: async ({
    EmployeeID,
    customerID,
    loanId,
    amount,
    installmentNumber,
  }) => {
    try {
      return await createPaymentQr({
        EmployeeID,
        customerID,
        loanId,
        amount,
        installmentNumber,
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  handleQRWebhook: async ({ eventId, signature, rawBody }) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

      // 1. ✅ Validate Signature
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      console.log("STEP 3", expectedSignature !== signature);
      if (expectedSignature !== signature) {
        return MessageHelper.SIGNATURE_MISMATCHED;
      }

      // 2. 🔁 Handle Duplicate Events
      if (processedEvents.has(eventId)) {
        console.log("Duplicate event ignored:", eventId);
        return { status: "duplicate" };
      }

      const event = JSON.parse(rawBody);
      console.log("✅ Received Event:", event.event);

      // 3. 🧠 Add Event Logic
      switch (event.event) {
        case "payment.captured": {
          const payment = event.payload.payment.entity;

          if (payment.method !== "upi_qr") {
            console.log("⚠️ Skipping non-QR payment:", payment.method);
            return { status: "ignored" };
          }

          console.log("✅ QR Payment Received:", payment.id);
          // Emit to frontend
          socket.getIO().emit("paymentStatusUpdate", {
            orderId,
            status,
            amount,
            paidAmount,
            customerID,
          });
          // Process only QR-based payment here
          break;
        }

        case "order.paid": {
          console.log("✅ Order Paid:", event.payload.order.entity);
          break;
        }

        default:
          console.log("ℹ️ Unhandled Event:", event.event);
      }

      // 4. ✅ Mark event as processed
      processedEvents.add(eventId);

      return {
        status: "processed",
        event: event.event,
      };
    } catch (error) {
      console.log("Webhook Error:", error.message);
      return false;
    }
  },
  handleUniversalWebhook: async ({ eventId, signature, rawBody }) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET_UNIVERSAL;

      // 1. ✅ Signature Validation
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      logger.info(
        "expectedSignature !== signature",
        expectedSignature !== signature,
        expectedSignature,
        signature
      );
      if (expectedSignature !== signature) {
        console.warn("❌ Signature mismatch");
        return MessageHelper.SIGNATURE_MISMATCHED;
      }

      // 2. 🔁 Check for Duplicate
      if (processedEvents.has(eventId)) {
        console.log("⚠️ Duplicate event ignored:", eventId);
        return { status: "duplicate" };
      }

      const event = JSON.parse(rawBody);
      const eventType = event.event;
      console.log("📦 Event received:", eventType);

      // 3. 🧠 Handle Events
      switch (eventType) {
        case "payment.captured": {
          const payment = event.payload.payment.entity;

          const {
            id: paymentId,
            order_id: orderId,
            amount,
            currency,
            method,
            status,
            notes = {},
          } = payment;

          console.log("✅ Payment Captured:", {
            paymentId,
            orderId,
            amount,
            currency,
            method,
            status,
            notes,
          });
          await RepaymentTransactionUPI.update(
            {
              paymentID: paymentId,
              paymentMethod: method,
              status,
              paidAmount: amount / 100,
              amountDue: 0,
            },
            {
              where: {
                amount: amount,
                orderID: orderId,
              },
            }
          );

          break;
        }

        case "order.paid": {
          const order = event.payload.order.entity;

          const {
            id: orderId,
            amount_paid,
            amount_due,
            status,
            notes = {},
          } = order;

          console.log("✅ Order Paid:", {
            orderId,
            amount_paid,
            status,
            notes,
          });

          // Optional: Update order-level status if needed

          break;
        }

        default:
          console.log("ℹ️ Unhandled Event Type:", eventType);
      }

      // 4. ✅ Mark Event as Processed
      processedEvents.add(eventId);

      return {
        status: "processed",
        event: eventType,
      };
    } catch (error) {
      console.error("🔴 Webhook Error:", error.message);
      return {
        status: "error",
        error: error.message,
      };
    }
  },

  createOrder: async ({ amount, notes = {}, customerID, loanID }) => {
    try {
      const ORDER_OPTIONS = {
        amount: amount * 100, // Amount in paise
        currency: "INR",
        receipt: `${loanID}${Date.now()}`,
        payment_capture: 1, // Auto capture payment
        notes,
      };
      const order = await razorpay.orders.create(ORDER_OPTIONS);
      if (order) {
        const {
          amount,
          amount_due,
          amount_paid,
          attempts,
          created_at,
          currency,
          entity,
          id,
          notes,
          offer_id,
          receipt,
          status,
        } = order;
        const timestamp = created_at; // seconds
        const createdAtFormatted = new Date(timestamp * 1000).toISOString(); // 🔁 convert to ISO string

        const newTransaction = await RepaymentTransactionUPI.create({
          orderID: id,
          customerID: customerID,
          loanID: loanID,
          created_at: createdAtFormatted,
          amount: amount,
          amountDue: amount_due,
          paidAmount: amount_paid,
          paymentCountReceived: attempts,
          receipt: receipt, // or use new Date("2025-06-26T12:30:00Z") if exact
          status: status,
          initiatedBy: customerID,
        });

        console.log("✅ UPI Transaction Created:", newTransaction.toJSON());
      }
      return order;
    } catch (error) {
      console.log("Error while creating order", error);
    }
  },
};
// payment.order_id === 'order_QlqFYT7XEFPFBa'

// payment.amount === 100

// payment.status === "captured"
