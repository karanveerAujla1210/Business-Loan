const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // import your sequelize instance
const moment = require("moment");
const Applicant = require("../models/applicant");

async function runGenerateRepaymentSchedule(data) {
  try {
    const { loanID, amountApplied, interestRate, tenure, customerID } = data;

    const results = await sequelize.query(
      `EXEC [dbo].[GenerateLoanRepaymentSchedule] 
        @CustomerID = :customerID,
        @LoanAmount = :loanAmount,
        @InterestRate = :interestRate,
        @PaymentType = :paymentType,
        @DisbursementDate = :disbursementDate`,
      {
        replacements: {
          customerID: loanID,
          loanAmount: amountApplied,
          interestRate: interestRate,
          paymentType: tenure == 14 ? "Weekly" : tenure == 96 ? "Daily" : null,
          disbursementDate: `${moment(new Date()).format("YYYY-MM-DD")}`, // "2025-03-20",
        },
        type: QueryTypes.SELECT,
      }
    );
    // if (results) {
    //   await Applicant.update(
    //     {
    //       loanApplicationStatus: 10,
    //       pendingReason: "LOAN AMOUNT DISBURSED",
    //     },
    //     {
    //       where: {
    //         customerID,
    //       },
    //     }
    //   );
    // }
    // console.log("Repayment Schedule:", results);
    return results;
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    throw error;
  }
}

module.exports = { runGenerateRepaymentSchedule };
