const { Op } = require("sequelize");
const Employees = require("../models/staffModal");
const digilockerServices = require("./digilockerServices");
const collectionServices = require("./collectionServices");

const APPLICATION_STATUS_LABELS = {
  1: "File Login",
  2: "KYC Pending",
  3: "Additional Details",
  4: "Business Details",
  5: "Awaiting CAM",
  6: "Pending CAM",
  7: "Credit Decision",
  8: "E-sign / Disbursal",
  9: "Disbursed",
  10: "Closed",
};

const toPlain = (item) => {
  if (!item) {
    return item;
  }

  if (typeof item.toJSON === "function") {
    return item.toJSON();
  }

  if (typeof item.get === "function") {
    return item.get({ plain: true });
  }

  return item;
};

const toArray = (value) => (Array.isArray(value) ? value.map(toPlain) : []);

const toNumber = (value) => {
  const number = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const getStatusLabel = (status) =>
  APPLICATION_STATUS_LABELS[Number(status)] || `Status ${status ?? "-"}`;

const buildRecentActivity = ({
  pendingCustomers,
  pendingCams,
  pendingEsign,
  approvedCams,
  rejectedCams,
  collections,
}) => {
  const items = [
    ...pendingCustomers.map((item) => ({
      id: `file-${item.customerId}`,
      type: "File Login",
      title: item.customerId,
      description: `${item.customerName} entered ${item.stageLabel}`,
      occurredAt: item.createdOn,
    })),
    ...pendingCams.map((item) => ({
      id: `cam-${item.customerId}`,
      type: "CAM Queue",
      title: item.customerId,
      description: `${item.borrowerName} is awaiting credit review`,
      occurredAt: item.createdOn,
    })),
    ...pendingEsign.map((item) => ({
      id: `esign-${item.customerId}`,
      type: "E-sign",
      title: item.customerId,
      description: `${item.borrowerName} is waiting for disbursal completion`,
      occurredAt: item.createdOn,
    })),
    ...approvedCams.map((item) => ({
      id: `approved-${item.leadId}`,
      type: "Approved CAM",
      title: item.leadId,
      description: `${item.customerName} approved for ${item.approvedLoanAmount}`,
      occurredAt: item.finalApprovalDate,
    })),
    ...rejectedCams.map((item) => ({
      id: `rejected-${item.leadId}`,
      type: "Rejected CAM",
      title: item.leadId,
      description: `${item.customerName} moved to rejected CAM queue`,
      occurredAt: item.finalApprovalDate,
    })),
    ...collections.map((item) => ({
      id: `collection-${item.loanId}-${item.installmentNumber}`,
      type: "Collections",
      title: item.loanId,
      description: `${item.customerName} has ${item.bucket.toLowerCase()} repayment due`,
      occurredAt: item.dueDate,
    })),
  ];

  return items
    .filter((item) => item.occurredAt)
    .sort((left, right) => new Date(right.occurredAt) - new Date(left.occurredAt))
    .slice(0, 8);
};

module.exports = {
  getDashboard: async ({ EmployeeID }) => {
    const currentUser = await Employees.findOne({
      where: {
        EmployeeID,
        [Op.or]: [{ isBlocked: null }, { isBlocked: 0 }],
      },
      raw: true,
    });

    if (!currentUser) {
      return false;
    }

    const postingBranch = currentUser.postingBranch || null;

    const [
      pendingCustomersRaw,
      pendingCamsRaw,
      pendingEsignRaw,
      approvedCamsRaw,
      rejectedCamsRaw,
      collectionsRaw,
    ] = await Promise.all([
      digilockerServices.fetchPendingCustomers({ EmployeeID }),
      postingBranch
        ? digilockerServices.fetchPendingCams({ branchID: postingBranch })
        : [],
      digilockerServices.getPendingEsign({ EmployeeID, postingBranch }),
      digilockerServices.fetchApprovedCAMS({ EmployeeID }),
      digilockerServices.fetchRejectedCAMS({ EmployeeID }),
      collectionServices.getBranchCollData({ EmployeeID, postingBranch }),
    ]);

    const pendingCustomers = toArray(pendingCustomersRaw).map((item) => ({
      customerId: item.customerID,
      customerName:
        [item.firstName, item.middleName, item.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || "Name not available",
      phoneNumber: item.phoneNumber || "",
      branchId: item.branchID || "",
      branchName: item.branchName || "",
      appliedMode: item.appliedMode || "",
      sourceBy: item.sourceBy || "",
      loanApplicationStatus: item.loanApplicationStatus ?? null,
      stageLabel: getStatusLabel(item.loanApplicationStatus),
      pendingReason: item.pendingReason || "No pending reason",
      createdOn: item.createdOn || null,
    }));

    const pendingCams = toArray(pendingCamsRaw).map((item) => ({
      customerId: item.customerID,
      borrowerName: item.borrowerName?.trim() || "Name not available",
      phoneNumber: item.phoneNumber || "",
      createdOn: item.createdOn || null,
      totalMonthlyPaymentAmount: toNumber(item.TotalMonthlyPaymentAmount),
      averageBalance: toNumber(item.averageBalance),
      combinedAddress: item.combinedAddress || "",
      businessAddress: item.businessAddress || "",
    }));

    const pendingEsign = toArray(pendingEsignRaw).map((item) => ({
      customerId: item.customerID,
      borrowerName: item.borrower?.trim() || "Name not available",
      phoneNumber: item.phoneNumber || "",
      approvedLoanAmount: toNumber(item.approvedLoanAmount),
      loanAmountApplied: toNumber(item.loanAmountApplied),
      tenure: item.Tenure || "",
      roi: item.ROI || "",
      pf: item.PF || "",
      accountNumber: item.accountNumber || "",
      loanApplicationStatus: item.loanApplicationStatus ?? null,
      stageLabel: getStatusLabel(item.loanApplicationStatus),
      netDisbursement: toNumber(item.NetDisbursement),
      createdOn: item.createdOn || null,
    }));

    const approvedCams = toArray(approvedCamsRaw).map((item) => ({
      leadId: item.leadID,
      customerName: item.name?.trim() || "Name not available",
      approvedLoanAmount: toNumber(item.approvedLoanAmount),
      creditStatus: item.CreditStatus || "Approved",
      remarks: item.PDremarks || "",
      pendingReason: item.pendingReason || "",
      finalApprovalDate: item.finalApprovalDate || null,
    }));

    const rejectedCams = toArray(rejectedCamsRaw).map((item) => ({
      leadId: item.leadID,
      customerName: item.name?.trim() || "Name not available",
      approvedLoanAmount: toNumber(item.approvedLoanAmount),
      creditStatus: item.CreditStatus || "Rejected",
      remarks: item.PDremarks || "",
      pendingReason: item.pendingReason || "",
      finalApprovalDate: item.finalApprovalDate || null,
    }));

    const collections = toArray(collectionsRaw).map((item) => ({
      loanId: item.loanID || item.CustomerID,
      customerId: item.applicantCustomerID || "",
      customerName: item.name?.trim() || "Name not available",
      branchName: item.branchName || "",
      phoneNumber: item.phoneNumber || "",
      installmentNumber: item.InstallmentNumber ?? null,
      dueDate: item.DueDate || null,
      principal: toNumber(item.Principal),
      interest: toNumber(item.Interest),
      emi: toNumber(item.EMI),
      collectionAmount: toNumber(item.CollectionAmt),
      bucket: item.collectionBucket || "Upcoming",
      businessAddress: item.businessAddress || "",
    }));

    const decisionQueue = [...approvedCams, ...rejectedCams]
      .sort((left, right) => new Date(right.finalApprovalDate || 0) - new Date(left.finalApprovalDate || 0))
      .slice(0, 20);

    return {
      generatedAt: new Date().toISOString(),
      currentUser: {
        employeeId: currentUser.EmployeeID,
        name: currentUser.name || "Staff user",
        mobileNumber: currentUser.mobileNumber || "",
        position: currentUser.position || "",
        department: currentUser.department || "",
        postingBranch: currentUser.postingBranch || "",
        roleAssigned: currentUser.roleAssigned || "",
      },
      summary: {
        pendingCustomersCount: pendingCustomers.length,
        pendingCamsCount: pendingCams.length,
        pendingEsignCount: pendingEsign.length,
        pendingEsignAmount: pendingEsign.reduce(
          (total, item) => total + item.approvedLoanAmount,
          0
        ),
        approvedCamsCount: approvedCams.length,
        rejectedCamsCount: rejectedCams.length,
        collectionsCount: collections.length,
        collectionsDueAmount: collections.reduce((total, item) => total + item.emi, 0),
        overdueCollectionsCount: collections.filter(
          (item) => item.bucket === "Overdue" || item.bucket === "Due Today"
        ).length,
      },
      queues: {
        pendingCustomers,
        pendingCams,
        pendingEsign,
        collections,
        approvedCams,
        rejectedCams,
        decisionQueue,
      },
      recentActivity: buildRecentActivity({
        pendingCustomers,
        pendingCams,
        pendingEsign,
        approvedCams,
        rejectedCams,
        collections,
      }),
    };
  },
};
