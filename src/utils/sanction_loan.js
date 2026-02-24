const moment = require("moment");
const generateLoanHTML = ({ repaymentSchedule, data }) => {
  const {
    loanAccountNo,
    customerName,
    sanctionedAmount,
    loanNo,
    firstDateofInstallment,
    businessName,
    businessAddress,
    businessNature,
    loanPurpose,
    APR,
    branchName,
    branchAddress,
    borrower1Address1,
    borrower1Pin,
    borrower2Name,
    combinedAddress,
    borrower2Pin,
    NetDisbursement,
    loanAmountWords,
    loanSanctionAmountWords,
    branch,
  } = data;

  const dynamicData = {
    floatingInfo: "NA",
    insuranceCharges: "Nil",
    valuationFees: "Nil",
    otherCharges: "NA",
    apr: "20%",
    contingentCharges: "NA",
    otherPenalCharges: "NA",
    foreclosureCharges: "NA",
    switchingCharges: "NA",
    otherCharges2: "NA",
    placeOfExecution: "NA",
    dateOfExecution: `${moment(new Date()).format("DD-MM-YYYY")}`,
    date: `${moment(new Date()).format("DD-MM-YYYY")}`,
    loanAccountNo: loanAccountNo,
    customerName,
    sanctionedAmount,
    loanNo,
    branchAddress: branchAddress,
    borrowerName: customerName,
    borrower1Address1: borrower1Address1,
    borrower1Address2: null,
    borrower1Address3: null,
    borrower1City: null,
    borrower1Pin: borrower1Pin,
    borrower2Name: borrower2Name,
    borrower2Address1: null,
    borrower2Address2: null,
    borrower2Address3: null,
    borrower2City: null,
    borrower2Pin: borrower2Pin,
    loanAmountNumber: NetDisbursement,
    loanAmountWords: loanAmountWords,
    loanPurpose: loanPurpose,
    interestType: null,
    charges: null,
    paymentDate1: firstDateofInstallment,
  };
  const formattedAmount = "Rs. " + sanctionedAmount.toLocaleString("en-IN");
  const tableRows = repaymentSchedule
    ?.map((item, index) => {
      const validIndex = [17, 43, 69];

      // Extra condition for when the list has exactly 14 items
      const isPageBreak =
        (repaymentSchedule.length === 14 && index === 13) ||
        (repaymentSchedule.length <= 96 && validIndex.indexOf(index) !== -1);

      const row = `
      <tr>sen
        <td><span>${item.InstallmentNumber}</span></td>
        <td><span>${item.DueDate}</span></td>
        <td><span>${item.Outstanding}</span></td>
        <td><span>${item.Principal}</span></td>
        <td><span>${item.Interest}</span></td>
        <td><span>${item.EMI}</span></td>
      </tr>
    `;

      if (isPageBreak && repaymentSchedule.length != 14) {
        return (
          row +
          `
        </tbody></table>
        </div>
        <div class="content-wrapper" style="page-break-before: always">
          <table>
            <thead>
              <tr>
                <th>Instalment No.</th>
                <th>Instalment Date</th>
                <th>Outstanding Principal<br>(in Rupees)</th>
                <th>Principal<br>(in Rupees)</th>
                <th>Interest<br>(in Rupees)</th>
                <th>Instalment<br>(in Rupees)</th>
              </tr>
            </thead>
            <tbody>
      `
        );
      }

      return row;
    })
    .join("");
  console.log("firstDateofInstallment", firstDateofInstallment);
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  
    <style>
        @page {
              size: A4;
              margin: 0;
          }
          
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
    body {
        font-family: 'Poppins', 'Noto Sans', 'DejaVu Sans', 'Liberation Sans', sans-serif;
        margin: 20px;
        font-size: 14px;
        line-height: 1.5;
        color: #000;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .content-wrapper {
        padding-top: 100px; /* same or more than margin.top */
        padding-bottom: 120px; /* same or more than margin.bottom */
      }
      h2, h3 {
        margin-bottom: 0.75rem;
        font-weight: 600;
      }
      h2 {
        font-size: 1.25rem;
      }
      h3 {
        font-size: 1.1rem;
        text-decoration: underline;
        padding: 0.5rem;
        border-bottom: 1px solid black;
        margin-top: 2.5rem;
        background: #f9f9f9;
      }
      p {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      section {
        margin-bottom: 2rem;
      }
      .text-center {
        text-align: center;
      }
      .font-bold {
        font-weight: 700;
      }
      .font-semibold {
        font-weight: 600;
      }
      .border {
        border: 1px solid black;
        border-collapse: collapse;
      }
      .border-top-2 {
        border-top: 2px solid #ccc;
      }
      .border-bottom {
        border-bottom: 1px solid black;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }
      th, td {
        border: 1px solid black;
        padding: 0.3rem 0.5rem;
        vertical-align: top;
        text-align: left;
      }
      th {
        font-weight: 600;
        background: #eee;
      }
      ul {
        padding-left: 1.5rem;
        margin-top: 0;
        margin-bottom: 1rem;
      }
      .inline-block {
        display: inline-block;
      }
      .w-48 {
        width: 12rem;
        border-bottom: 1px solid black;
        margin: 0.5rem auto 0.25rem auto;
      }
      .signature-block {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 2px solid #ccc;
      }
      .signature {
        width: 48%;
        text-align: center;
      }
      .container {
        max-width: 960px;
        margin: auto;
        padding: 20px;
      }
      h1, h2, h3 {
        text-align: center;
        text-transform: uppercase;
      }
      .section {
        margin-top: 40px;
      }
      .text-center {
        text-align: center;
      }
      .font-semibold {
        font-weight: bold;
      }
      .pl-4 {
        padding-left: 20px;
      }
      .mb-4 {
        margin-bottom: 1rem;
      }
      .space-y-4 > * + * {
        margin-top: 1rem;
      }
      .space-y-3 > * + * {
        margin-top: 0.75rem;
      }
      .space-y-6 > * + * {
        margin-top: 1.5rem;
      }
      .text-justify {
        text-align: justify;
      }
    </style>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
  </head>
  <body>
  <div class="content-wrapper">
   <div class="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-200 my-10 print:shadow-none print:border-none">
    <h2 class="text-center text-lg md:text-xl font-semibold underline mb-2" id="kfsTitle">Key Facts Statement</h2>
    <div class="text-center font-medium mb-4" id="kfsPart1">1 (Interest rate and fees/charges)</div>
  
    <table class="w-full border border-gray-400 text-sm mb-6">
      <tbody>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1 w-1/2">
            1 Loan Account No.
          </td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="loanAccountNo">${loanAccountNo}</span>
          </td>
        </tr>
        <tr>
          <td class="border border-gray-400 px-2 py-1">2 Product Name</td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="productName">Mini Business Loans (100 Days)</span>
          </td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            3 Name of the Lender (NBFC)
          </td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="lenderName">Rich Credit Finance Private Limited</span>
          </td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            4 Name of the Sourcing Partner (LSP)
          </td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="lenderName">Tech Aviom Private Limited</span>
          </td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            5 Name of the Technology Partner
          </td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="lenderName">Fintech Cloud Private Limited</span>
          </td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            6 Name of the Borrower
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="customerName">
          ${customerName}</span></td>
        </tr>
        <tr>
          <td class="border border-gray-400 px-2 py-1">
            7 Sanctioned Loan amount (in Rupees)
          </td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="sanctionedAmount">${formattedAmount}</span>
          </td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            8 Disbursal schedule
          </td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="disbursalSchedule">Upfront Disbursement (After Deducting 10% Processing Fees + 18%GST)</span>
          </td>
        </tr>
        <tr>
          <td class="border border-gray-400 px-2 py-1">
            9 Loan term (days/weekly)
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="loanTerm">100 Days</span></td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            10 Interest rate (%) and type (fixed or floating or hybrid)
          </td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="interestRate">20%(fixed)</span>
          </td>
        </tr>
        <tr>
          <td class="border border-gray-400 px-2 py-1">
            11 Additional Information in case of Floating rate of interest
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="floatingInfo">NA</span></td>
        </tr>
      </tbody>
    </table>
  
    <table class="w-full border border-gray-400 text-sm mb-6">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-400 px-2 py-1">Fee/ Charges</th>
          <th class="border border-gray-400 px-2 py-1">
            One-time/ Recurring
          </th>
          <th class="border border-gray-400 px-2 py-1">
            Amount (in Rupees) or Percentage (%) as applicable
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-gray-400 px-2 py-1">
            i. Processing fees
          </td>
          <td class="border border-gray-400 px-2 py-1">One Time</td>
          <td class="border border-gray-400 px-2 py-1">
            <span id="processingFees">10% of the Sanction Amount + 18%GST</span>
          </td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            ii. Insurance charges
          </td>
          <td class="border border-gray-400 px-2 py-1">NA</td>
          <td class="border border-gray-400 px-2 py-1"><span id="insuranceCharges"></span></td>
        </tr>
        <tr>
          <td class="border border-gray-400 px-2 py-1">
            iii. Valuation fees
          </td>
          <td class="border border-gray-400 px-2 py-1">NA</td>
          <td class="border border-gray-400 px-2 py-1"><span id="valuationFees"></span></td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            iv. Any other (please specify)
          </td>
          <td class="border border-gray-400 px-2 py-1">NA</td>
          <td class="border border-gray-400 px-2 py-1"><span id="otherCharges"></span></td>
        </tr>
      </tbody>
    </table>
  
    <table class="w-full border border-gray-400 text-sm mb-6">
      <tbody>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            9 Annual Percentage Rate (APR)
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="apr">${APR}</span></td>
        </tr>

        <tr>
          <td class="border border-gray-400 px-2 py-1">
            10 Details of Contingent Charges (in Rupees or %, as applicable)
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="contingentCharges"></span></td>
        </tr>
        
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1 pl-6">
            i. Penal charges, in case of delayed payment
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="penalCharges">2% per  rate of Loan.</span></td>
        </tr>

        <tr>
          <td class="border border-gray-400 px-2 py-1 pl-6">
            ii. Other penal charges
          </td>
  
          <td class="border border-gray-400 px-2 py-1"><span id="otherPenalCharges"></span></td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1 pl-6">
            iii. Foreclosure charges
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="foreclosureCharges"></span></td>
        </tr>

        <tr>
  
          <td class="border border-gray-400 px-2 py-1 pl-6">
            iv. Charges for switching of loans from floating to fixed rate and
            vice versa
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="switchingCharges"></span></td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1 pl-6">
            v. Other charges :
          </td>
          <td class="border border-gray-400 px-2 py-1"><span id="otherCharges2"></span></td>
        </tr>
  
      </tbody>
    </table>


    <div class="content-wrapper" style="page-break-before: always">
    <div class="text-center font-medium mb-4 mt-8" >
      2 (Other qualitative information)
    </div>
    <table class="w-full border border-gray-400 text-sm mb-6">
      <tbody>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1 w-2/3">
            1 Clause of Loan agreement relating to engagement of recovery
            agents
          </td>
          <td class="border border-gray-400 px-2 py-1">Clause 6</td>
        </tr>
        <tr>
          <td class="border border-gray-400 px-2 py-1">
            2 Clause of Loan agreement which details grievance redressal
            mechanism
          </td>
          <td class="border border-gray-400 px-2 py-1">Clause 12</td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border border-gray-400 px-2 py-1">
            3 Phone number and email id of the nodal grievance redressal
            officer
          </td>
          <td class="border border-gray-400 px-2 py-1">
            grievance.redressal@richcredit.in,
            <br />
            +91 99999 99371
          </td>
        </tr>
        <tr>
          <td class="border border-gray-400 px-2 py-1">
            4 Whether the loan is, or in future maybe, subject to transfer to
            other REs or securitization.
          </td>
          <td class="border border-gray-400 px-2 py-1">Yes</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="content-wrapper" style="page-break-before: always">
      <div class="container">
      <h1>LOAN AGREEMENT</h1>
  
      <div class="space-y-6">
        <p>
          THIS LOAN AGREEMENT (hereinafter referred to as the "Agreement") is
          made as of the Effective Date (defined hereinafter) at the place and
          on the date stated in the Schedule A ("Execution Date").
        </p>
  
        <div class="text-center font-semibold">BETWEEN</div>
  
        <p class="text-justify">
          <strong>RICHCREDIT FINANCE PRIVATE LIMITED</strong>, a company
            incorporated under the Companies Act, 1956, having its registered
            office at 1/50, 2nd Floor, Ganga Apartment, Lalita Park, Laxmi Nagar,
            Delhi-110092, CIN - U65909DL1996PTC319357, acting as the Lender/Funder
            (hereinafter referred to as the "Lender" or "Funder" which expression
            shall, unless it be repugnant to the meaning or context thereof,
            include its successors in title and assigns) of the FIRST PART.
        </p>
  
        <div class="text-center font-semibold">AND</div>
  
        <p class="text-justify">
          The Borrower(s) whose name(s) and address(es) is/are stated in
            Schedule A, hereinafter referred to / collectively referred to as
            "the Borrower(s)" which expression shall, unless it be repugnant to
            the meaning or context thereof, be deemed to mean and include his/her
            legal heirs, executors and administrators of the OTHER PART;
        </p>
  
        <p>
         The both the parties shall be hereinafter individually referred to as
            "Party" and collectively as "Parties," as the context may require.
        </p>
  
        <div class="font-semibold">WHEREAS:</div>
    


    

        <div class="pl-4 space-y-3 text-justify">
          <p>
            a.  Relying upon the representations made and information provided by
              the Borrower(s) and Lender has agreed to grant the Loan subject to
              terms and conditions contained in this Agreement and Schedules
              attached hereto and the Interest which is acceptable and binding on
              the Parties to this Agreement. The Loan shall be disbursed in the
              manner stated hereinafter.
          </p>


          <p>
            b.  The Borrower(s) acknowledge(s) and accept(s) that notwithstanding
              anything to the contrary contained in this Agreement, the Loan can
              be recalled, and the entire outstanding amount (as defined
              hereinafter) would be repayable on demand at the sole discretion of
              LENDER.
          </p>
          <p>
            c. The Parties hereto are desirous of recording the terms and
              conditions in relation to the Loan to be granted by the LENDER to
              the Borrower(s) and certain other matters related thereto in the
              manner hereinafter contained.
          </p>
        </div>
  
        <div class="text-center font-semibold text-justify">
          NOW, THEREFORE, THIS AGREEMENT WITNESSETH AND MUTUALLY AGREED,
          DECLARED AND CONFIRMED BETWEEN THE PARTIES HERETO AS FOLLOWS:
        </div>
  </div>
  <div class="content-wrapper" style="page-break-before: always">
        <div class="section text-justify">
          <h2>1. DEFINITIONS</h2>
  
          <p class="mb-4 text-justify"><strong>1.1</strong> In this Agreement, unless the subject or
                context otherwise requires, the following words and expressions
                shall have the following meanings:</p>
          <div class="pl-4 space-y-3">
            <p>
              a. "Agreement" means and includes this Agreement and the
                  attachment/s annexed hereto. Agreement shall also include
                  applications, supplementary agreements, modifications,
                  alterations, addendum attachments and schedules subsequently
                  executed during the tenure of this Agreement.
            </p>
            <p>
              b."Support agent" refers to Techaviom Finance Private Limited
                  or such other entity which may be empowered by the lender for
                  sourcing of the loan files and whose assistance may be taken for
                  the collection of loans on behalf of the Lender.
            </p>
            <p>
              c. "Annual Percentage Rate (APR)" means the annual cost of
                  credit to the borrower which includes interest rate and all
                  other charges associated with the credit facility.
            </p>
            <p>
              d. "Amortization" means repayment of the loan and interest
                  thereon by way of EMIs or in any other manner determined by the
                  Lender and includes repayment of other dues, charges etc. under
                  this Agreement. The mode of amortization is more specifically
                  described and set out in the Schedule - A.
            </p>
            <p>
              e. whom the Lender has agreed to grant the loan and who will
                  receive the loan pursuant to this Agreement. The term "Borrower"
                  shall wherever the context so requires mean and be construed as
                  "Borrowers". Moreover, the term "Borrower" which expression
                  shall unless the context otherwise requires, include
                  his/her/their heirs, representatives, executors, administrators
                  and permitted assignees.
            </p>
        


        

            <p>
              f."Default Interest Rate" means the rate as stated in the
                  Schedule or as maybe amended by the LENDER from time to time at
                  which the LENDER shall compute and apply interest on all amounts
                  not paid when due for payment or reimbursement by the Borrower
                  to the LENDER.
            </p>
            <p>
              g. "Disbursement Request Form" is a Letter through which the
                 Borrower requests the Lender to release part/s or whole payment
                 of the loan amount. This form will form a of the agreement
                 and shall be binding upon the Borrower/s.
            </p>
            <p>
              h."Effective Date" means the date on which the first
                  disbursement is availed by the Borrower out of the total loan
                  sanctioned.
            </p>
            <p>
              i. "Equated Weekly Installment" (EMI) means the amount of weekly
                  payment necessary to amortize the loan with interest within such
                  period as may be determined by the Lender from time to time. The
                  term "Equated weekly Installment" shall not mean or be construed
                  as equal installments where the rate of interest to be levied is
                  agreed to be.
            </p>
          </div>
        </div>
        </div>

        <div class="content-wrapper" style="page-break-before: always">
        <div class="section text-justify">
          <h2>2. LOAN, INTEREST & AMORTISATION</h2>
          <div class="space-y-4 text-justify>
            <p><strong>2.1</strong> Pursuant to the Borrower's application and
                  based on their representations, warranties, and covenants, the
                  Lender agrees to grant, and the Borrower agrees to accept, a
                  business loan on the terms set forth in this agreement and the
                  accompanying schedule. The loan shall be disbursed in a single
                  installment at the discretion of the Lender, depending on the
                  Borrower's requirements. Disbursement will be made through bank
                  transfer, crossed cheque marked "Account Payee Only," or via
                  NEFT/RTGS. Any collection charges shall be borne by the
                  Borrower.</p>
  
            <p><strong>2.2</strong>The applicable rate of interest is
                  specified in the Schedule attached to this agreement. The
                  Borrower shall reimburse the Lender for any taxes paid or
                  payable to the government on interest. Interest shall begin to
                  accrue from the date of disbursement and will be computed on the
                  basis of a 365-day year with weekly rests. The Equated Monthly
                  Installment (EMI) includes both principal and interest.</p>
  
            <p><strong>2.3</strong> The Borrower shall repay the loan as per
                  the amortization schedule in the agreement. If disbursement is
                  delayed or advanced, EMI shall begin the month following the
                  disbursement, with the first payment typically due on the 10th.
                  The Lender reserves the right to review and reschedule the
                  repayment terms, including the tenure and EMI amount, based on
                  its sole discretion. The Borrower shall be bound by any such
                  revisions.</p>
          </div>
        </div>

        <div class="section">
          <h2>3. PRE-CONDITIONS TO DISBURSEMENT OF THE LOAN</h2>
          <p><strong>3.1</strong> The conditions precedent to the disbursement
                of the loan shall be as follows:</p>
          <div class="pl-4 space-y-3">
            <p>a.  No Event of Default, as defined under Article 6, has occurred
                  or is continuing.</p>
            <p>b.  No extraordinary or unforeseen circumstances exist that would
                  render the Borrower's performance under this Agreement
                  impossible or impracticable.</p>
            <p>c.The Borrower has executed and delivered a money bond or
                  demand promissory note in favour of the Lender, if so required.</p>
                  <p>d. The Borrower has provided satisfactory evidence that there
                  are no pending or threatened legal proceedings, investigations,
                  or actions which may materially affect the Borrower's financial
                  condition or the validity and enforceability of any transaction
                  documents executed in connection with this Agreement.</p>
          </div>
        </div>
        </div>
        <div class="content-wrapper" style="page-break-before: always;">
        <h2>4. GENERAL COVENANTS OF THE BORROWER</h2>
      
        <h3 class="font-poppins">4.1 Affirmative Covenants</h3>
        <div class="pl-4 space-y-3 text-justify">
          <p>
            a. The Borrower shall utilize the loan strictly for the purposes specified in Schedule A and as stated in the loan
            application. Any change in the Borrower's employment, business, or profession must be communicated to the Lender
            within seven days. Additionally, the Borrower must notify the Lender in writing of any material circumstances that
            may impact the Borrower's ability to repay the loan.
          </p>
      
          <p>
            b. The Borrower shall provide, upon request, all relevant information and documents concerning their financial
            condition. The Lender is authorized to conduct credit inquiries, disclose the Borrower's loan-related information
            to regulatory authorities, credit bureaus, or other third parties, and inspect the Borrower's financial records.
            The Borrower agrees to perform any actions or execute any documents reasonably required by the Lender in relation
            to the Agreement.
          </p>
      
          <p>
            c. In the event of default, the Lender reserves the right to disclose or publish details of such default in any
            form it deems fit. The Borrower also confirms that they are not involved in any material litigation or aware of
            any facts that could give rise to such proceedings.
          </p>
        </div>
      
        <h3 class="font-poppins">4.2 Negative Covenants</h3>
        <div class="pl-4 text-justify">
          <p>
            Without the prior written consent of the Lender, the Borrower shall not obtain or repay any other loan or credit
            facility, act as guarantor or surety for others, or close any bank account used for repayment under this
            Agreement. If the Borrower plans to leave India for employment, business, or long-term stay, they must provide
            prior written notice to the Lender and settle the loan as directed.
          </p>
        </div>
      </div>
      
          <div class="content-wrapper" style="page-break-before: always">

          <h2 class="h5 font-poppins mb-4"><b>5. BORROWER'S WARRANTIES AND INDEMNITY</b></h2>

          <div class="mb-4 text-justify">
            <h3 class="font-poppins">5.1 Borrower's Warranties and Undertakings</h3>
          
            <div class="ps-3">
              <p class="mb-3">
                a. The Borrower confirms that all information provided in the loan application and any related documents is accurate and genuine, and the Lender may verify originals at any time.
              </p>
          
              <p class="mb-3">
                b. The Borrower acknowledges compliance with the Lender's Know Your Customer (KYC) policy, confirming that all personal and financial information disclosed is true, correct, and complete.
              </p>
          
              <p class="mb-3">
                c. The Borrower agrees to disclose all relevant facts about their assets and confirms that all public dues, including taxes, are fully paid with no outstanding arrears.
              </p>
          
              <p class="mb-3">
                d. The Borrower commits to staying informed of the Lender's policies and acknowledges that dishonoring or stopping cheque payments is both a civil and criminal offense. Furthermore, the Borrower agrees to promptly reimburse all payments, fees, costs, duties, or charges incurred by the Lender on their behalf.
              </p>
            </div>

            <p class="text-justify">
              <strong>5.2</strong> The Borrower undertakes to indemnify and hold the Lender harmless against any losses, damages, costs, or claims arising from any breach of this Agreement, including false representations, warranties, or non-compliance with laws by the Borrower or their agents. The Borrower agrees to pay any such claims immediately upon demand, without dispute, within seven working days.
            </p>
          </div>
          
          </div>
          <div class="content-wrapper" style="page-break-before: always;">
          <section>
            <h2 class="h5 font-poppins mb-4"><b>6. EVENTS OF DEFAULTS & REMEDIES OF THE LENDER</b></h2>
        
            <div class="mb-4 text-justify">
              <p><strong>6.1</strong> The following shall constitute events of default under this Agreement:</p>
        
              <div class="ps-3 space-y-3">
                <p>
                  a. <strong>Non-Payment:</strong> Failure to pay any EMI, interest, or other amounts due under this Agreement or any other related agreements, when due or upon demand by the Lender.
                </p>
        
                <p>
                  b. <strong>Covenant Breach:</strong> Failure to perform any covenant, condition, or obligation under this Agreement or any other agreement with the Lender, continuing for more than 30 days after written notice.
                </p>
        
                <p>
                  c. <strong>Fraudulent Documents:</strong> Submission of false or fraudulent documents to obtain the loan.
                </p>
        
                <p>
                  d. <strong>Misleading Information:</strong> Providing materially incorrect or misleading information in the loan application or breaching any warranty under this Agreement.
                </p>
        
                <p>
                  e. <strong>Failure to Provide Information:</strong> Not furnishing requested information or documents as required by the Lender.
                </p>
        
                <p>
                  f. <strong>Dishonor of Payment Instruments:</strong> Dishonor of any post-dated cheques (PDCs), irrevocable receipts (IRCs), or other cheques, or instructions to stop payment or not to deposit such instruments.
                </p>
        
                <p>
                  g. <strong>Security Issues:</strong> If any security for the loan becomes invalid, ineffective, or is challenged by the Borrower or any third party.
                </p>
        
                <p>
                  h. <strong>Marital Dispute:</strong> In cases of joint loans to spouses, occurrence of divorce or marital dispute may be treated as an event of default at the Lender's sole discretion.
                </p>
        
                <p>
                  i. <strong>Inability to Pay Debts and Insolvency:</strong> Reasonable grounds to believe the Borrower is unable to pay debts when due, or admission of such inability, or initiation of recovery or insolvency proceedings against the Borrower.
                </p>
        
                <p>
                  j. <strong>Employment-Related Default:</strong> If the Borrower is employed and opts for any employer-provided scheme, resigns, retires before superannuation, or if the employer terminates the Borrower's employment for any reason.
                </p>
              </div>
        
              <p >
                <strong>6.2</strong> Upon the occurrence of an Event of Default, the Lender shall have the right to recall the entire outstanding loan amount, including all accrued interest, fees, costs, charges, and any other sums payable by the Borrower, which shall become immediately due and payable.
              </p>
            </div>
          </section>
        </div>
        
  <div class="content-wrapper" style="page-break-before: always">

  <section>
    <h2 class="h5 fw-poppins  mb-4"><b>7. WAIVER</b></h2>
  
    <p>
      Any delay or failure by the Lender to exercise any right, power, or remedy under this Agreement or related documents shall not constitute a waiver or diminish such right, power, or remedy. Similarly, any action, inaction, or acquiescence by the Lender with respect to any default shall not affect its rights in relation to other defaults.
    </p>
  </section>
  <section>
    <h2 className="text-lg font-semibold mb-4"><b>8. TERMINATION</b></h2>
    <div className="space-y-3 text-justify">
      <p>
        <strong>8.1</strong> This Agreement shall remain in full force and effect
        until all outstanding amounts are fully repaid and all obligations of the
        Borrower and/or Guarantor are duly performed and discharged.
      </p><br>
      <p>
        <strong>8.2</strong> Notwithstanding any contrary provisions in this
        Agreement or related documents, the Lender may terminate this Agreement at
        its sole discretion by providing the Borrower with seven (7) days' written
        notice, upon which all outstanding amounts shall become immediately
        payable.
      </p>
    </div>
  </section>
  
  <section>
    <h2 className="text-lg font-poppins text-justify mb-4"><b>9. SET OFF AND GENERAL LIEN</b></h2>
    <p>
      The Lender may set off and appropriate any monies, securities, deposits, or
      other assets of the Borrower held by the Lender, in any account or form, to
      settle any outstanding amounts under this Agreement. The Borrower
      irrevocably waives any right of set-off, counterclaim, deduction,
      withholding, or adjustment against payments due to the Lender.
    </p>
  </section>
  
  <section>
    <h2 className="text-lg font-poppins text-justify mb-4"><b>10. EFFECTIVE DATE OF AGREEMENT</b></h2>
    <p>
      This Agreement shall become effective and binding upon both the Borrower and
      the Lender from the date of its execution. It shall remain in force until
      all amounts due and payable by the Borrower under this Agreement are fully
      repaid to the satisfaction of the Lender.
    </p>
  </section>
  
  <section>
      <h2 className="text-lg font-poppins text-justify mb-4"> <b>11. MISCELLANEOUS</b></h2>
  
    <div className="space-y-4">
      <h3 className="font-poppins">11.1 Schedules and Amendments</h3>
      <div className="space-y-3 text-justify pl-4">
        <p>
          a. The Schedules attached to this Agreement shall be deemed to form an
          integral hereof as though fully incorporated herein.
        </p><br>
    
        <p>
          b. Any amendments, modifications, or revisions to this Agreement,
          including its Schedules or any collateral documents, shall be valid only
          if made in writing.
        </p><br>
      </div>
      </div>
      <div class="content-wrapper" style="page-break-before: always;">
      <section>
        <h3 class="font-poppins text-justify mt-6 mb-3"><b>11.2 Inspection, Assignment, and Disclosure</b></h3>
        <div class="space-y-3 text-justify pl-4">
          <p>a. The Borrower shall permit the Lender and its authorized representatives, including those of any approved third-party institutions, to inspect its books of accounts and other loan-related records at any reasonable time.</p>
          <p>b. The Borrower expressly agrees that the Lender shall have the absolute right, without any prior notice or consent from the Borrower, to sell, transfer, assign, or securitize, wholly or partially, its rights, title, and interest in the Loan and any security created thereunder.</p>
          <p>c. The Lender shall be entitled to disclose all relevant information regarding the Borrower and the Loan—including default data—to Credit Information Bureaus such as CIBIL and other agencies authorized by the RBI.</p>
        </div>
    
        <h3 class="font-poppins text-justify mt-6 mb-3"><b>11.3 Costs and Expenses</b></h3>
        <div class="space-y-3 text-justify pl-4">
          <p>a. The Borrower agrees to pay all costs and expenses, including legal fees on a full indemnity basis, incurred by the Lender in connection with the preparation, enforcement, and realization of this Agreement.</p>
          <p>b. All stamp duties, taxes, levies, penalties, or charges imposed by any competent authority in connection with the Loan or this Agreement shall be borne solely by the Borrower. If the Lender makes such payments on the Borrower's behalf, those amounts shall be treated as part of the Loan and shall accrue interest accordingly.</p>
          <p>c. The Lender shall be entitled to charge interest on the aforementioned costs and charges as per the terms of this Agreement.</p>
        </div>
    
        <p class="mt-4 text-justify"><strong>11.4</strong> The Borrower authorizes the Lender to set off any credit balances of the Borrower against any amounts due under this Agreement or any other facility availed by the Borrower from the Lender. This right shall be unaffected by any circumstance and shall remain valid regardless of the closure of accounts.</p>
    
        <p class="mt-4 text-justify"><strong>11.5</strong> All loans or credit facilities obtained or to be obtained by the Borrower from any source, other than normal working capital facilities from its bankers, shall be subject to the prior written approval of the Lender and shall remain subordinate to the Loan under this Agreement.</p>
        <p class="text-justify"><strong>11.6</strong> If any provision of this Agreement is held to be illegal, invalid, or unenforceable, such provision shall be severable, and the remainder of the Agreement shall continue in full force and effect. The parties shall endeavor to amend such provision to best reflect their original intent in a legally enforceable manner.</p>
    
        </section>
    </div>
    
    <div class="content-wrapper" style="page-break-before: always;">
      <section>
  
        <p class="text-justify font-poppins mt-4"><strong>11.7 Engagement of Specialized Agencies</strong></p>
        <div class="pl-4 space-y-2 text-justify">
          <p>a. The Lender may engage third-party agencies to perform tasks under this Agreement.</p>
          <p>b. The Borrower acknowledges that the terms of this Agreement are subject to prevailing market and economic conditions. The Lender reserves the right to renegotiate or terminate the arrangement if such conditions materially change.</p>
        </div>
    
        <p class="mt-4 text-justify"><strong>11.8</strong> All notices, communications, or documents shall be in English and delivered to the addresses specified herein or such other address notified in writing. Notices may be delivered by hand, registered post, courier, or email (supported by a physical copy sent via registered post or courier).</p>
    
        <p class="mt-4 text-justify font-poppins"><strong>11.9 Confirmations by the Borrower</strong></p>
        <div class="pl-4 space-y-2 text-justify">
          <p>a. Documents may be returned by the Lender to any of the Borrowers, notwithstanding contrary instructions.</p>
          <p>b. The Lender is not obliged to return any documents until the Loan is fully repaid.</p>
          <p>c. If the Borrower is illiterate or unable to read English, this Agreement has been explained in a vernacular language understood by the Borrower.</p>
          <p>d. The Sanction Letter is an integral part of this Agreement unless inconsistent with its provisions.</p>
        </div>
    
        <p class="mt-4 text-justify"><strong>11.10</strong> This Agreement and the documents executed contemporaneously constitute the entire agreement. In case of conflict between this Agreement and the Sanction Letter or Loan Application, this Agreement shall prevail.</p>
    
        <p class="mt-4 text-justify"><strong>11.11</strong> If any of this Agreement is deemed invalid or unenforceable, such invalidity shall not affect the remaining provisions, which shall continue in full force. Invalid provisions shall be replaced with valid ones closely reflecting the original intent.</p>
        <p class="text-justify"><strong>11.12</strong> Each right under this Agreement is independent, cumulative, and in addition to other rights. Exercising any right shall not constitute a waiver of any other rights.</p>
    
        <p class="mt-4 text-justify"><strong>11.13</strong> The Borrower shall execute and deliver any documents or actions required by the Lender to secure repayment obligations at any time during the term or after termination of this Agreement.</p>
    
        <p class="mt-4 text-justify"><strong>11.14</strong> Time is of the essence in respect of all payment and performance obligations of the Borrower under this Agreement.</p>
    
        <p class="mt-4 text-justify"><strong>11.15</strong> No variation of this Agreement or any related Schedules or Annexures shall be valid unless made in writing and signed by duly authorized representatives of both Parties.</p>
     
        </section>
    </div>

    
    <div class="content-wrapper" style="page-break-before: always;">
    <section>
      <h2 class="h5 font-poppins mb-2">12. GRIEVANCE REDRESSAL</h2>
  
      <div class="mb-2">
        <h3 class="font-poppins">12.1 Grievance Redressal Matrix</h3>
  
        <div class="mb-4 space-y-2">
          <div>
            <p class="font-poppins text-justify">Level 1</p>
            <p class="ps-3 text-justify">
              The customer may post his/her complaint to the branch office or write to us under 'Customer Care' section of our website: <strong>www.richcredit.in</strong> or <strong>supports@richcredit.in</strong>
            </p>
          </div>
          <div>
            <p class="font-poppins text-justify">Level 2</p>
            <p class="ps-3 text-justify">
              If the customer is not satisfied with the resolution provided by Customer Care, he/she may post their complaint to The Grievance Redressal Officer at <strong>grievanceredressal@richcredit.in</strong>.
            </p>
          </div>
          <div>
            <p class="font-poppins text-justify">Level 3</p>
            <p class="ps-3 text-justify">
              If the customer is not satisfied with the resolution provided by the Grievance Redressal Officer, he/she may contact the Compliance/Nodal Officer at <strong>info@richcredit.in</strong>.
            </p>
          </div>
          <div>
            <p class="font-poppins text-justify">Level 4</p>
            <p class="ps-3 text-justify">
              If the customer is not satisfied with the resolution provided by the Compliance/Nodal Officer, he/she may post their complaint to the Ombudsman at <strong>arman@techaviom.in</strong>.
            </p>
          </div>
  
          <div class="mt-4 p-3 bg-light rounded" style="page-break-inside: avoid;">
            <p class="font-poppins mb-2 text-justify">Alternatively, customers may write to The Grievance Redressal Officer at:</p>
            <div class="ps-3">
              <p><strong>RICHCREDIT FINANCE PRIVATE LIMITED,</strong></p>
              <p>1/50, 2nd Floor, Ganga Apartment, Lalita Park, Laxmi Nagar, Delhi-110092</p>
              <p class="mt-2 small fst-italic text-justify">
                Note: Please mention 'Grievance Redressal' on the top of the envelope.
              </p>
            </div>
          </div>
  
          <div class="mt-4" style="page-break-inside: avoid;">
            <p class="font-poppins text-justify">Level 5</p>
            <p class="ps-3 text-justify">
              In case of non-addressal of the complaint to the customer's satisfaction within a reasonable period from the above quarters, the customer may approach Reserve Bank of India at the address given below:
            </p>
            <div class="ps-4 text-justify">
              <p>
                C/o Reserve Bank of India, Sansad Marg, New Delhi<br />
                STD Code: 011 &nbsp;&nbsp; Tel. No. 23715393
              </p>
            </div>
          </div>
        </div>
  
        <p class="mt-4 text-justify">
          <strong>12.2</strong> In case the customer is not satisfied with the response or resolution within 21 working days for NBFC-related complaints, they may appeal to the NBFC Ombudsman at:
        </p>
      </div>
    </section>
  </div>
  
  <div class="content-wrapper" style="page-break-before: always;">
    <section>
      <div class="ps-3 p-3 bg-light rounded" style="page-break-inside: avoid;">
        <p class="font-poppins text-justify"><strong>Address of NBFC Ombudsman</strong></p>
        <p class="text-justify">C/o Reserve Bank of India, Sansad Marg, New Delhi - 110001</p>
        <p class="text-justify">STD Code: 011 &nbsp;&nbsp; Tel. No. 23724856 &nbsp;&nbsp; Fax No. 23725218 - 19</p>
        <p class="text-justify">Email: <strong>nbfconewdelhi@rbi.org.in</strong></p>
      </div>
  
      <h2 class="text-lg font-semibold mb-4 mt-6">13. ARBITRATION</h2>
      <div class="space-y-3 text-justify">
        <p><strong>13.1</strong> Any dispute in connection with the interpretation, performance, or termination of this agreement shall be referred for Arbitration under the Arbitration and Conciliation Act, 1996 (as amended), before a sole Arbitrator appointed by the Lender.</p>
        <p><strong>13.2</strong> Arbitration proceedings shall be conducted in Delhi in English language.</p>
        <p><strong>13.3</strong> The Arbitral award shall be final and binding. The Arbitrator shall provide written reasons. Parties agree to be bound thereby.</p>
      </div>
    </section>
  
    <section>
      <h2 class="text-lg font-semibold mb-4 mt-6">14. ACCEPTANCE</h2>
      <div class="space-y-3 text-justify">
        <p><strong>14.1</strong> The Borrower has read the entire Agreement including the details in the Schedules.</p>
        <p><strong>14.2</strong> The Borrower agrees to be bound by all conditions including the details in the Schedule.</p>
        <p><strong>14.3</strong> The Agreement and other documents have been explained in a language known to the Borrower.</p>
        <p><strong>14.4</strong> The Lender will be a party only after verifying all conditions as per its policy.</p>
        <p><strong>14.5</strong> This Agreement shall commence upon being signed by the Lender's Authorized Officer and shall remain in force until all dues are cleared.</p>
      </div>
    </section>
  </div>
  
  <div class="content-wrapper" style="page-break-before: always;">
    <section>
      <h2 class="text-lg font-semibold mb-4">15. PENAL CHARGES</h2>
      <div class="overflow-x-auto">
        <table class="w-full border border-gray-400 text-sm">
          <tbody>
            <tr>
              <td class="border px-3 py-2 font-semibold">i.</td>
              <td class="border px-3 py-2 text-justify">Penal charges in case of delayed payment:</td>
              <td class="border px-3 py-2">Rs. 200 Per EMI</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border px-3 py-2 font-semibold">ii.</td>
              <td class="border px-3 py-2 text-justify">Other penal charges</td>
              <td class="border px-3 py-2">-</td>
            </tr>
            <tr>
              <td class="border px-3 py-2 font-semibold">iii.</td>
              <td class="border px-3 py-2 text-justify">Foreclosure charges</td>
              <td class="border px-3 py-2">5% + Applicable Tax</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border px-3 py-2 font-semibold">iv.</td>
              <td class="border px-3 py-2 text-justify">Switching loan types</td>
              <td class="border px-3 py-2">NA</td>
            </tr>
            <tr>
              <td class="border px-3 py-2 font-semibold">v.</td>
              <td class="border px-3 py-2 text-justify">Other charges</td>
              <td class="border px-3 py-2">-</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border px-3 py-2 font-semibold">vi.</td>
              <td class="border px-3 py-2 text-justify">Pre-closure statement: Nil first time, Rs. 100 thereafter</td>
              <td class="border px-3 py-2">-</td>
            </tr>
            <tr>
              <td class="border px-3 py-2 font-semibold">vii.</td>
              <td class="border px-3 py-2 text-justify">Change in loan terms: Rs. 200 per request</td>
              <td class="border px-3 py-2">-</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border px-3 py-2 font-semibold">viii.</td>
              <td class="border px-3 py-2 text-justify">Document retrieval: Rs. 200 per request</td>
              <td class="border px-3 py-2">-</td>
            </tr>
            <tr>
              <td class="border px-3 py-2 font-semibold">ix.</td>
              <td class="border px-3 py-2 text-justify">Statement of Accounts: Nil first time, Rs. 100 thereafter</td>
              <td class="border px-3 py-2">-</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border px-3 py-2 font-semibold">x.</td>
              <td class="border px-3 py-2 text-justify">Duplicate NOC: Rs. 100 per issuance</td>
              <td class="border px-3 py-2">-</td>
            </tr>
            <tr>
              <td class="border px-3 py-2 font-semibold">xi.</td>
              <td class="border px-3 py-2 text-justify">List of documents: Rs. 50 per request</td>
              <td class="border px-3 py-2">-</td>
            </tr>
            <tr class="bg-gray-50">
              <td class="border px-3 py-2 font-semibold">xii.</td>
              <td class="border px-3 py-2 text-justify">Loan AMC Charges</td>
              <td class="border px-3 py-2">NA</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  
    <section class="mt-6">
      <h2 class="text-lg font-semibold mb-2">16. JURISDICTION</h2>
      <p class="text-justify">
        Subject to the provisions of Article-12 above, it is agreed that in case of any legal dispute, the courts in Delhi shall have exclusive jurisdiction.
      </p>
    </section>
  
    <div class="flex justify-between mt-6">
      <div class="text-center">
        <p>Borrower's Signature</p>
        <div class="h-12 border-b border-black w-48 mx-auto">${customerName}</div>
      </div>
      <div class="text-center">
        <p>Lender's Signature</p>
        <div class="h-12 border-b border-black w-48 mx-auto"></div>
      </div>
    </div>
  </div>
  
    <div class="content-wrapper" style="page-break-before: always">

    <section>
      <h3>Schedule A</h3>
      <table>
        <thead>
          <tr>
            <th style="width:5%;">Item No.</th>
            <th style="width:30%;">Particulars</th>
            <th>Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1.</td>
            <td>Place of Execution of Agreement</td>
            <td><span id="placeOfExecution"></span></td>
          </tr>
          <tr>
            <td>2.</td>
            <td>Date of Execution of Agreement</td>
            <td><span id="dateOfExecution">${moment(new Date()).format(
              "DD/MM/YYYY"
            )} </span></td>
          </tr>
          <tr>
            <td>3.</td>
            <td>Address of the concerned Branch/ support Branch</td>
            <td><span id="branchAddress"></span></td>
          </tr>
          <tr>
            <td>4.</td>
            <td>Name and Address of Borrower/s</td>
            <td>
              <div style="margin-bottom: 1rem;">
                <strong>1)</strong> Name: <span id="borrower1Name">${customerName}</span><br />
                Address 1: <span id="borrower1Address1">${combinedAddress}</span><br />
                Address 2: <span id="borrower1Address2">${businessAddress}</span><br />
                Address 3: <span id="borrower1Address3"></span><br />
                City: <span id="borrower1City"></span> &nbsp;&nbsp; PIN: <span id="borrower1Pin">${borrower1Pin}</span>
              </div>
              <div>
                <strong>2)</strong> Name: <span id="borrower2Name">${borrower2Name}</span><br />
                Address 1: <span id="borrower2Address1"></span><br />
                Address 2: <span id="borrower2Address2"></span><br />
                Address 3: <span id="borrower2Address3"></span><br />
                City: <span id="borrower2City"></span> &nbsp;&nbsp; PIN: <span id="borrower2Pin">${borrower2Pin}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td>5.</td>
            <td>Loan amount (Amount in numbers and words)</td>
            <td>
              <div>Number: Rs. <span id="loanAmountNumber">₹ ${formattedAmount}</span></div>
              <div>Words: <span id="loanAmountWords">${loanSanctionAmountWords}</span></div>
            </td>
          </tr>
          <tr>
            <td>6.</td>
            <td>Purpose of the Loan</td>
            <td><span id="loanPurpose">${loanPurpose}</span></td>
          </tr>
          <tr>
            <td>7.</td>
            <td>Rate of Interest (Please tick whichever is applicable)</td>
            <td><span id="interestType"></span></td>
          </tr>
          <tr>
            <td>8.</td>
            <td>Charges and other Fees</td>
            <td><span id="charges"></span></td>
          </tr>
        </tbody>
      </table>
    </section>


    </div>

    <div class="content-wrapper" style="page-break-before: always">
    <section>
      <h3 class="text-lg font-bold mb-2">Schedule B</h3>
      <p><strong>Terms and Conditions Applicable to the Loan with Fixed Interest Rate</strong></p>

      <p class="mt-4">
        <strong>A) Computation of Interest:</strong><br />
        The Fixed Interest Rate shall be 
        <span class="border-b border-black px-2">FIXED_INTEREST_RATE 20%</span>. 
        The same shall be computed on a Weekly Rate basis. The same shall be payable on a weekly basis.
      </p>

      <p class="mt-4">
        <strong>B) Repayment of Loan and Payment of Interest:</strong><br />
        Loan and Interest shall be payable by the Borrower in the following Weekly Installments.
      </p>

      <p class="mt-4">
        The Borrower shall pay the loan installments on or before the dates mentioned above without any demand or notice from the Lender.
      </p>
    </section>
  </div>

  <div class="content-wrapper" style="page-break-before: always">
    <div class=" p-4 text-justify text-sm">
      <h2 class="text-xl font-semibold mb-4">New EMI Schedule as per Disbursal Date</h2>

      <div class="grid grid-cols-2 text-sm gap-4 mb-4">
        <div>
          <p>Loan No.: <span class="inline-block w-48 border-b border-gray-300" id="loanNo">${loanNo}</span></p>
          <p>Loan Tenure: <span class="inline-block border-b border-gray-300" id="loanTenure">100 days</span></p>
        </div>
        <div class="text-right">
          <p>Loan Amount: <span class="ml-2 border-b border-gray-300" id="loanAmount">${formattedAmount}</span></p>
          <p>EMI Start Date: <span class="ml-2 border-b border-gray-300" id="emiStartDate">${
            repaymentSchedule[0]?.DueDate
          }</span></p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse border border-black">
          <thead class="bg-gray-200">
            <tr>
              <th class="border border-black px-2 py-1">Instalment No.</th>
              <th class="border border-black px-2 py-1">Instalment Date</th>
              <th class="border border-black px-2 py-1">Outstanding Principal (₹)</th>
              <th class="border border-black px-2 py-1">Principal (₹)</th>
              <th class="border border-black px-2 py-1">Interest (₹)</th>
              <th class="border border-black px-2 py-1">Instalment (₹)</th>
            </tr>
          </thead>
          <tbody id="repaymentTableBody">
          ${tableRows}</tbody>
        </table>
      </div>

      <div class="content-wrapper" style="page-break-before: always">
      <div class="text-center">
        <p>For Richcredit Finance Pvt. Ltd.</p>
        <p class="mt-4">Authorized Signatory</p>
        <div class="flex justify-center gap-8 mt-4">
          <div>
            <label>Date:</label>
            <span id="date" class="inline-block border-b border-black px-4 min-w-[100px]">${moment(
              new Date()
            ).format("MM/DD/YYYY")}</span>
          </div>
          <div>
            <label>Place:</label>
            <span id="place" class="inline-block border-b border-black px-4 min-w-[100px]">${
              branch ? branch : "Individual"
            }</span>
          </div>
        </div>
      </div>
    
      <div class="grid grid-cols-2 gap-8 mt-6">

        <div>
          <p>Borrower Name:</p>
          <div class="h-8 border-b border-black w-64 flex items-center px-2 mt-1">
            <span id="borrowerName" class="w-full">${customerName}</span>
          </div>
    
          <p class="mt-4">Prop. of M/s:</p>
          <div class="h-8 border-b border-black w-64 flex items-center px-2 mt-1">
            <span id="propOfM" class="w-full"></span>
          </div>
        </div>
    
        <!-- Right side: Borrower Sign -->
        <div class="text-right">
          <p>Co-Borrower Sign.:</p>
          <div class="h-8 border-b border-black w-64 flex items-center justify-end px-2 mt-1 ml-auto">
            <span id="borrowerSign" class="w-full text-right">${borrower2Name}</span>
          </div>
        </div>
      </div>
    </div>
    
      </div>
    </div>
  </div>
  


      </div>
    </div>
    </div>
  </div>
  
  <script>
  
    window.addEventListener('DOMContentLoaded', function() {
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('repaymentTableBody').innerHTML = ${tableRows};
          });
      for (const key in ${dynamicData}) {
        const el = document.getElementById(key);
        if (el) el.textContent = dynamicData[key];
      }
    });
    <script src="https://cdn.tailwindcss.com">
  </script>
  
  
  </body>
  </html>
    `;
};

module.exports = generateLoanHTML;
