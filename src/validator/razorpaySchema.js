module.exports = {
  createPaymentQR: {
    loanId: {
      isLength: {
        errorMessage: "Loan Id is required",
        options: { min: 6, max: 20 },
      },
    },
    amount: {
      notEmpty: {
        errorMessage: "Amount is Required",
      },
    },
    installmentNumber: {
      notEmpty: {
        errorMessage: "installmentNumber  is required",
      },
    },
  },
  createOrder: {
    amount: {
      isLength: {
        errorMessage: "Amount is required",
        options: { min: 1, max: 10 },
      },
    },
    customerID: {
      notEmpty: {
        errorMessage: "customerID is Required",
      },
    },
    loanID:{
        notEmpty:{
            errorMessage:"loanID is required"
        }
    }
  },
};
