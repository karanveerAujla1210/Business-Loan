const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");

async function fillPdfTemplate() {
  const pdfPath = path.join(__dirname, "../assets/sanctionLetter/sanction.pdf");

  if (!fs.existsSync(pdfPath)) {
    console.error("❌ PDF file not found:", pdfPath);
    return;
  }

  const existingPdfBytes = fs.readFileSync(pdfPath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  firstPage.drawText("Mohit Kumar", {
    x: 100,
    y: 500,
    size: 12,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(__dirname, "./output.pdf"), pdfBytes);

  console.log("✅ PDF generated!");
}

module.exports = { fillPdfTemplate };
