const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");

const convertHtmlToPdfBase64 = async (htmlContent) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
    });

    // Helper function to convert image to Base64
    const imageToBase64 = (imagePath) => {
      const filePath = path.resolve(__dirname, imagePath);
      const imageBuffer = fs.readFileSync(filePath);
      return imageBuffer.toString("base64");
    };

    // Load local header and footer images and convert to base64
    const headerImageBase64 = imageToBase64(
      "../../public/assets/images/Header.png"
    );
    const footerImageBase64 = imageToBase64(
      "../../public/assets/images/Footer.png"
    );

    // Launch page and set HTML content
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Define header and footer templates with embedded base64 images
    const headerTemplate = `
  <div style="margin: 0; padding: 0;">
    <img src="data:image/png;base64,${headerImageBase64}"
         style="width: 100vw; max-width: 100%; height: 60px; display: block; margin: 0 auto;" />
  </div>`;

    // const headerTemplate = `
    // <div style="width: 100%; text-align: center; font-size: 10px; color: gray;">
    //   <img src="data:image/png;base64,${headerImageBase64}"
    //   style="width: 100%; height: 60px; object-fit: cover;" />
    // </div>`;

    const footerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 10px; color: gray;">
      <img src="data:image/png;base64,${footerImageBase64}" 
      style="width: 100%; height: 60px; object-fit: cover;" />
      <br/>
      <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`;

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "80px", // Enough space for header image
        bottom: "80px", // Enough space for footer image and page number
        left: "20px",
        right: "20px",
      },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error converting HTML to PDF:", error);
    return false;
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { convertHtmlToPdfBase64 };