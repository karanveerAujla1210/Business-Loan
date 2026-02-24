module.exports = {
  createURL: {
    phone: {
      isLength: {
        errorMessage: "Invalid Mobile no",
        options: { min: 10, max: 10 },
      },
    },
    name: {
      notEmpty: {
        errorMessage: "Name is Required",
      },
      isLength: {
        options: { min: 2, max: 50 },
        errorMessage: "Name must be between 5 and 50 characters",
      },
    },
    redirectURL: {
      notEmpty: {
        errorMessage: "Redirect URL is required",
      },
      isLength: {
        options: { min: 10, max: 500 },
        errorMessage: "Redirect URL must be between 10 and 500 characters",
      },
      matches: {
        options: [/^(https?:\/\/)/],
        errorMessage: "Redirect URL must start with http:// or https://",
      },
      // isURL: {
      //   errorMessage: "Redirect URL must be a valid URL",
      // },
    },
  },

  processDigilockerData: {
    digilocker_client_id: {
      isLength: {
        errorMessage: "Invalid digilocker_client_id ",
        options: { min: 30, max: 100 },
      },
    },
    customerNumber: {
      notEmpty: {
        errorMessage: "Phone number is required",
      },
      isLength: {
        errorMessage: "Phone number must be 10 digits",
        options: { min: 10, max: 10 },
      },
      isNumeric: {
        errorMessage: "Phone number must be numeric",
      },
    },
  },

  updateApplicantAdditionalData: {
    maritalStatus: {
      notEmpty: {
        errorMessage: "Marital status is required",
      },
      isLength: {
        errorMessage: "Marital status must be between 3 and 20 characters",
        options: { min: 3, max: 20 },
      },
    },
    relation: {
      notEmpty: {
        errorMessage: "Relation is required",
      },
      isLength: {
        errorMessage: "Relation must be between 3 and 30 characters",
        options: { min: 3, max: 30 },
      },
    },

    firstReferenceName: {
      notEmpty: {
        errorMessage: "First reference name is required",
      },
      isLength: {
        errorMessage:
          "First reference name must be between 3 and 50 characters",
        options: { min: 3, max: 50 },
      },
    },
    firstReferenceRelation: {
      notEmpty: {
        errorMessage: "First reference relation is required",
      },
      isLength: {
        errorMessage:
          "First reference relation must be between 3 and 30 characters",
        options: { min: 3, max: 30 },
      },
    },
    firstReferenceContact: {
      notEmpty: {
        errorMessage: "First reference contact is required",
      },
      isLength: {
        errorMessage: "Contact must be 10 digits",
        options: { min: 10, max: 10 },
      },
      isNumeric: {
        errorMessage: "First reference contact must be numeric",
      },
    },
    secondReferenceName: {
      notEmpty: {
        errorMessage: "Second reference name is required",
      },
      isLength: {
        errorMessage:
          "Second reference name must be between 3 and 50 characters",
        options: { min: 3, max: 50 },
      },
    },
    secondReferenceRelation: {
      notEmpty: {
        errorMessage: "Second reference relation is required",
      },
      isLength: {
        errorMessage:
          "Second reference relation must be between 3 and 30 characters",
        options: { min: 3, max: 30 },
      },
    },
    secondReferenceContact: {
      notEmpty: {
        errorMessage: "Second reference contact is required",
      },
      isLength: {
        errorMessage: "Contact must be 10 digits",
        options: { min: 10, max: 10 },
      },
      isNumeric: {
        errorMessage: "Second reference contact must be numeric",
      },
    },
    phoneNumber: {
      notEmpty: {
        errorMessage: "Phone number is required",
      },
      isLength: {
        errorMessage: "Phone number must be 10 digits",
        options: { min: 10, max: 10 },
      },
      isNumeric: {
        errorMessage: "Phone number must be numeric",
      },
    },
  },

  fetchCibilReport: {
    pan: {
      matches: {
        options: [/^[A-Z]{5}[0-9]{4}[A-Z]$/],
        errorMessage: "PAN must be in the format: ABCDE1234F",
      },
      isLength: {
        options: { min: 10, max: 10 },
        errorMessage: "PAN must be exactly 10 characters",
      },
    },
  },
  initiateBankStatement: {
    fileNo: {
      isLength: {
        options: { min: 5, max: 10 },
        errorMessage: "fileNo is Required",
      },
    },
  },
  checkBSAStatus: {
    fileNo: {
      isLength: {
        options: { min: 5, max: 10 },
        errorMessage: "fileNo is Required",
      },
    },
    requestId: {
      isLength: {
        options: { min: 5, max: 30 },
        errorMessage: "requestId is Required",
      },
    },
  },
  processBankStatement: {
    fileNo: {
      isLength: {
        options: { min: 5, max: 10 },
        errorMessage: "fileNo is Required",
      },
    },
    docId: {
      isLength: {
        options: { min: 5, max: 100 },
        errorMessage: "docId is Required",
      },
    },
    requestId: {
      isLength: {
        options: { min: 5, max: 100 },
        errorMessage: "requestId is Required",
      },
    },
    status: {
      isLength: {
        options: { min: 5, max: 50 },
        errorMessage: "status is Required",
      },
    },
  },
  fetchPendigCams: {
    postingBranch: {
      isLength: {
        options: { min: 1, max: 10 },
        errorMessage: "postingBranch is Required",
      },
    },
  },
  getAddress: {
    latitude: {
      isLength: {
        options: { min: 5, max: 50 },
        errorMessage: "latitude is Required",
      },
    },
    longitude: {
      isLength: {
        options: { min: 5, max: 50 },
        errorMessage: "longitude is Required",
      },
    },
  },
};
