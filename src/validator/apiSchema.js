module.exports = {
  sendMobileOTP: {
    phone: {
      isLength: {
        errorMessage:
          "phoneNo is missing or phoneNo number must be 10 digits long",
        options: { min: 10, max: 10 },
      },
    },
    appliedMode: {
      isLength: {
        errorMessage: "appliedMode is missing",
        options: { min: 2, max: 15 },
      },
    },
  },
  sendMobileOTPStaff: {
    phone: {
      isLength: {
        errorMessage:
          "phoneNo is missing or phoneNo number must be 10 digits long",
        options: { min: 10, max: 10 },
      },
    },
  },
  verifyMobileOTPCustomer: {
    phone: {
      isLength: {
        errorMessage:
          "phone is missing or phoneNo number must be 10 digits long",
        options: { min: 9, max: 10 },
      },
    },
    otp: {
      isLength: {
        errorMessage: "OTP must be betwrrn 4-6 digits",
        options: {
          min: 4,
          max: 6,
        },
      },
    },
    client_id: {
      isLength: {
        errorMessage: "client_id is required",
        options: {
          min: 5,
          max: 50,
        },
      },
    },
  },
  sendOtpCoAPP: {
    phone: {
      notEmpty: {
        errorMessage: "Mobile number is required",
      },
      isLength: {
        options: { min: 10, max: 10 },
        errorMessage: "Mobile number must be exactly 10 digits",
      },
      matches: {
        options: [/^[6-9][0-9]{9}$/],
        errorMessage: "Invalid mobile number format",
      },
    },
    // pan: {
    //   // notEmpty: {
    //   //   errorMessage: "PAN number is required",
    //   // },
    //   isLength: {
    //     options: { min: 10, max: 15 },
    //     errorMessage: "PAN number must be exactly 10 characters",
    //   },
    //   // matches: {
    //   //   options: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/],
    //   //   errorMessage: "Invalid PAN format",
    //   // },
    // },
    // customerID: {
    //   notEmpty: {
    //     errorMessage: "customerID is required",
    //   },
    //   isLength: {
    //     options: { min: 6, max: 10 },
    //     errorMessage: "customerID must be greater than 6 characters",
    //   },
    // },
  },
  verifyOtpCoAPP: {
    phone: {
      notEmpty: {
        errorMessage: "Mobile number is required",
      },
      isLength: {
        options: { min: 10, max: 10 },
        errorMessage: "Mobile number must be exactly 10 digits",
      },
      matches: {
        options: [/^[6-9][0-9]{9}$/],
        errorMessage: "Invalid mobile number format",
      },
    },
    otp: {
      notEmpty: {
        errorMessage: "OTP is required",
      },
      isLength: {
        options: { min: 4, max: 6 },
        errorMessage: "OTP must be 4 or 6 digits",
      },
    },
    customerID: {
      notEmpty: {
        errorMessage: "customerID is required",
      },
      isLength: {
        options: { min: 6, max: 10 },
        errorMessage: "customerID must be greater than 6 characters",
      },
    },
    client_id: {
      notEmpty: {
        errorMessage: "client_id is required",
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: "client_id must be greater than 6 characters",
      },
    },
  },
  validateElectricityBill: {
    id_number: {
      notEmpty: {
        errorMessage: "Electricity Bill Number is required",
      },
      isLength: {
        options: { min: 8, max: 20 },
        errorMessage: "Bill Number must be between 8 and 20 characters",
      },
      matches: {
        // Alphanumeric with optional hyphens or slashes (modify as per format)
        options: [/^[A-Za-z0-9\-\/]+$/],
        errorMessage:
          "Bill Number must contain only letters, numbers, hyphens or slashes",
      },
    },
    operator_code: {
      notEmpty: {
        errorMessage: "operator_code is required",
      },
      isLength: {
        options: { min: 2, max: 4 },
        errorMessage: "OTP  must be between 2 - 4 characters",
      },
    },
    customerID: {
      notEmpty: {
        errorMessage: "customerID is required",
      },
      isLength: {
        options: { min: 6, max: 10 },
        errorMessage: "customerID must be greater than 6 characters",
      },
    },
  },
  validateGSTIN: {
    gstin: {
      notEmpty: {
        errorMessage: "GSTIN Number is required",
      },
      isLength: {
        options: { min: 15, max: 15 },
        errorMessage: "GSTIN must be exactly 15 characters long",
      },
      matches: {
        options: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/],
        errorMessage: "Invalid GSTIN format",
      },
    },
    customerID: {
      notEmpty: {
        errorMessage: "customerID is required",
      },
      isLength: {
        options: { min: 6, max: 10 },
        errorMessage: "customerID must be greater than 6 characters",
      },
    },
  },
  sendOtpUdyam: {
    registration_number: {
      notEmpty: {
        errorMessage: "Udyam Number is required",
      },
      isLength: {
        options: { min: 18, max: 22 },
        errorMessage: "Udyam must be minimum 18 characters long",
      },
      matches: {
        options: [/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/],
        errorMessage: "Invalid Udyam format",
      },
    },
    phone: {
      notEmpty: {
        errorMessage: "Mobile number is required",
      },
      isLength: {
        options: { min: 10, max: 10 },
        errorMessage: "Mobile number must be exactly 10 digits",
      },
      matches: {
        options: [/^[6-9][0-9]{9}$/],
        errorMessage: "Invalid mobile number format",
      },
    },
  },
  verifyOtpUdyam: {
    client_id: {
      notEmpty: {
        errorMessage: "client id is required",
      },
      isLength: {
        options: { min: 10, max: 50 },
        errorMessage: "client id must be minimum 10 characters long",
      },
    },
    customerID: {
      notEmpty: {
        errorMessage: "customerID is required",
      },
      isLength: {
        options: { min: 5, max: 50 },
        errorMessage: "customerID must be minimum 5 characters long",
      },
    },
    otp: {
      notEmpty: {
        errorMessage: "otp is required",
      },
      isLength: {
        options: { min: 6, max: 6 },
        errorMessage: "otp number must be 6 digits",
      },
    },
  },
  previewSanction: {
    customerID: {
      notEmpty: {
        errorMessage: "customerID is required",
      },
      isLength: {
        options: { min: 5, max: 20 },
        errorMessage: "customerID must be minimum 5 characters long",
      },
    },
  },
  disburse: {
    customerID: {
      notEmpty: {
        errorMessage: "customerID is required",
      },
      isLength: {
        options: { min: 5, max: 20 },
        errorMessage: "customerID must be minimum 5 characters long",
      },
    },
  },
  generateOtp: {
    email: {
      isEmail: {
        bail: true,
        errorMessage: "Incorrect email syntex",
      },
    },
  },
  generateMobileOtp: {
    mobileNo: {
      isLength: {
        errorMessage: "Invalid Mobile no",
        options: { min: 10, max: 10 },
      },
    },
  },
  login: {
    phone: {
      isLength: {
        errorMessage:
          "phoneNo is missing or phoneNo number must be 10 digits long",
        options: { min: 10, max: 10 },
      },
    },
  },
  verifyOtp: {
    email: {
      isEmail: {
        bail: true,
        errorMessage: "Incorrect email syntex",
      },
    },
    otp: {
      isLength: {
        errorMessage: "Incorrect OTP",
        options: { min: 6, max: 6 },
      },
    },
  },
  registerUser: {
    phone: {
      errorMessage: "Please enter Phone Number in 10 digits",
      isLength: {
        options: { min: 10, max: 10 },
      },
      matches: {
        options: [/^\d{10}$/],
        errorMessage: "Please enter digits",
      },
      trim: true,
    },
    userType: {
      isLength: {
        errorMessage: "userType is required",
        options: { min: 1, max: 1 },
      },
    },
  },
  verifyEmail: {
    otp: {
      isLength: {
        errorMessage: "invalid otp",
        options: { min: 6, max: 6 },
      },
    },
    email: {
      isEmail: {
        bail: true,
        errorMessage: "Email is missing or Incorrect email syntex",
      },
    },
  },
  verifyMobile: {
    otp: {
      isLength: {
        errorMessage: "invalid otp",
        options: { min: 6, max: 6 },
      },
    },
    phone: {
      isLength: {
        errorMessage: "Invalid Mobile no",
        options: { min: 10, max: 10 },
      },
    },
  },
};
