const { default: axios } = require("axios");
const RepaymentTransactionHistory = require("../models/repaymentTransactionsHistory");
// const { sequelize } = require("../Config/DbConfig");
// const { Sequelize } = require("sequelize");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_vuOc5hBMLU3SA1",
  key_secret: "f2SqdBWGNVzvkpLEFMzrgU0Q",
});

const createPaymentQr = async ({
  EmployeeID,
  customerID,
  loanId,
  amount,
  installmentNumber,
}) => {
  try {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");
    const payload = {
      type: "upi_qr", // QR code type
      name: "Mini Business Loan", // Name of your business or purpose
      usage: "single_use", // single_use or multiple_use
      fixed_amount: true, // true for a fixed amount QR code
      payment_amount: amount * 100, // Amount in paise (₹100 = 10000 paise)
      description: `Installment ${installmentNumber} payment for Loan Id : ${loanId} to Mini Business Loan`,
      customer_id: "cust_QkzMYxxFgsJWaR", //  THIS IS THE TSET CUSTOMER ID "cust_Ql18dDKgceCc1q",
      close_by: Math.floor(Date.now() / 1000) + 900, // Optional: Expiry time in Unix timestamp
      notes: {
        loanId: loanId,
        // staffId: staffid,
        purpose: "Mini Business Loan Installment",
      },
    };
    console.log("__________",payload);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    };
    const response = await axios.post(
      "https://api.razorpay.com/v1/payments/qr_codes",
      payload,
      {
        headers: headers,
      }
    );

    if (response?.data?.id && response?.data?.image_url) {
      const {
        id,
        entity,
        created_at,
        type,
        payment_amount,
        status,
        description,
        fixed_amount,
        payments_amount_received,
        payments_count_received,
        customer_id,
        close_by,
        tax_invoice,
      } = response?.data;
      function convertUnixToMSSQLDate(timestamp) {
        const date = new Date(timestamp * 1000); // Convert Unix to JS Date
        return date.toISOString().slice(0, 23).replace("T", " ");
        // returns string like '2025-06-26 06:31:12.000'
      }

      const createdAt = convertUnixToMSSQLDate(created_at); // → '2025-06-26 06:31:12.000'
      const expireAt = convertUnixToMSSQLDate(close_by);

      const newEntry = await RepaymentTransactionHistory.create({
        transactionID: id,
        customerID,
        loanID: loanId,
        entity,
        fixedAmount:
          fixed_amount == true
            ? "true"
            : fixed_amount == false
            ? "false"
            : null,
        created_at: createdAt,
        type,
        status,
        description,
        amount: payment_amount,
        paymentAmountReceived: payments_amount_received,
        paymentCountReceived: payments_count_received,
        razorpayCustID: customer_id,
        expireAt: expireAt,
        initiatedBy: EmployeeID,
      });

      console.log("newEntry", newEntry);
      return response.data;
    } else {
      false;
    }

    // const qrCode = await razorpay.qrCode.create(options);
    // console.log("QR Code created successfully:", qrCode);
    // if (qrCode) {
    //   const { id, image_url } = qrCode;
    // await sequelize.query(
    //   `INSERT INTO PaymentHistory (LoanID, Amount, TxnID,GeneratedBy,PaymentURL,PaymentMode,PaymentType) VALUES (${loanId}, ${amount}, '${id}', ${staffid},'${image_url}','${paymentMode}','${paymentType}')`,
    //   { // Replace with actual values
    //     type: Sequelize.QueryTypes.INSERT, // Use INSERT for insertion queries
    //   }
    // );
    // }
    // return qrCode;
  } catch (error) {
    console.log(error);
    console.error("Error creating QR Code:", error?.response?.data);
    throw error;
  }
};

const updatePayment = async (req, res) => {
  const receivedData = req.query;
  const {
    razorpay_payment_id,
    razorpay_payment_link_id,
    razorpay_payment_link_status,
    razorpay_signature,
  } = receivedData;

  console.log("________", receivedData);
  if (receivedData) {
    await RazorpayServices.updatePayment({
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_status,
      razorpay_signature,
    });
    return res.status(200).send("Payment successfully processed.");
  }

  res.status(200).send("Payment successfully processed.");
};
// Function to create a UPI payment link
// const createPaymentLink = async ({ amount, contact, loanId, staffid, paymentMode, paymentType }) => {

//   try {
//     const options = {
//       amount: amount * 100, // Amount in paise
//       currency: "INR",
//       accept_partial: false,
//       description:
//         `EMI payment for Loan Id : ${loanId} to Subhlakshmi Finance Private Ltd`,
//       customer: {
//         contact: `+91${contact}`,
//         email: null,
//       },
//       notify: {
//         sms: true,
//         email: false,
//       },
//       reminder_enable: true,
//       callback_url: "http://103.104.73.167:3000/api/v1/update/payment",
//       callback_method: "get", // Try using 'get' instead of 'post'
//     };
//     const paymentLink = await razorpay.paymentLink.create(options);
//     console.log(paymentLink);
//     if (paymentLink) {
//       const { id, short_url } = paymentLink
//       await sequelize.query(
//         `INSERT INTO PaymentHistory (LoanID, Amount, TxnID,GeneratedBy,PaymentURL,PaymentMode,PaymentType) VALUES (${loanId}, ${amount}, '${id}', ${staffid},'${short_url}','${paymentMode}',${paymentType})`,
//         { // Replace with actual values
//           type: Sequelize.QueryTypes.INSERT, // Use INSERT for insertion queries
//         }
//       );
//     }
//     return paymentLink;
//   } catch (error) {
//     console.error("Error creating payment link:", error);
//     throw error;
//   }
// };
// const sendCashRequestApproval = async ({ amount, loanId, staffid, paymentType, branchId }) => {
//   try {

//     const id = await sequelize.query(
//       `SELECT (SELECT S.STAFFID FROM STAFF WHERE BRANCHID=BR.BRANCHID AND STAFFTYPE=1 AND STAFFLIVE=1)BM_ID FROM branchmaster BR
// INNER JOIN STAFF S ON BR.BRANCHID=S.branchid
// WHERE BR.branchid=${branchId} AND S.stafftype=1 AND stafflive=1`,
//       {
//         type: Sequelize.QueryTypes.INSERT, // Use INSERT for insertion queries
//       }
//     );

//     const requestFor = id[0][0]?.BM_ID
//     return await sequelize.query(
//       `INSERT INTO CashPaymentRequest (LoanID, Amount,PaymentType,RequestorID,RequestorFor)
//          VALUES (${loanId}, ${amount},'${paymentType}', ${staffid},${requestFor})`,
//       {
//         type: Sequelize.QueryTypes.INSERT, // Use INSERT for insertion queries
//       }
//     );
//   } catch (error) {
//     console.error("Error creating Cash Request:", error);
//     throw error;
//   }

// };
// const getCashRequestForApproval = async ({ staffid, }) => {
//   try {
//     return await sequelize.query(
//       `select  CP.Amount,CP.ApprovalDate,CP.ApprovedBy,CP.CreatedOn,CP.LoanID,CP.PaymentType,CP.RequestDate,CP.RequestID,
// CP.RequestorFor,CP.Status,S.staffname,CM.centreid,CM.cename  from CashPaymentRequest CP
// INNER JOIN
// STAFF S ON S.staffid = CP.RequestorID
// INNER JOIN
// disbursement D ON D.customerid = CP.LoanID
// INNER JOIN
// enrollment E ON E.enrollmentid = D.enrollmentid
// INNER JOIN
// centremaster CM ON CM.centreid = E.centreid AND CM.branchid = E.branchid
// WHERE CP.RequestorFor =${staffid}`,
//       {
//         type: Sequelize.QueryTypes.SELECT, // Use INSERT for insertion queries
//       }
//     );

//   } catch (error) {
//     console.error("Error creating Cash Request:", error);
//     throw error;
//   }

// };
// const updateCashRequest = async ({ staffid, status, requestId }) => {
//   try {
//     return await sequelize.query(
//       `update CashPaymentRequest set Status='${status}',ApprovalDate ='${new Date().toISOString()}',
//       UpdatedOn='${new Date().toISOString()}',ApprovedBy=${staffid} where RequestID=${requestId}`,
//       {
//         type: Sequelize.QueryTypes.UPDATE, // Use INSERT for insertion queries
//       }
//     );

//   } catch (error) {
//     console.error("Error creating Cash Request:", error);
//     throw error;
//   }

// };

module.exports = {
  // createPaymentLink,
  createPaymentQr,
  // sendCashRequestApproval,
  // getCashRequestForApproval,
  // updateCashRequest,
};
