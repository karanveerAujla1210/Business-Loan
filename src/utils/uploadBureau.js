const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  });

module.exports = {
  uploadBureau: async ({ rawData }) => {
    try {
      // 1. Clean the escaped HTML
      const decodedHtml = rawData
        .replace(/\\r\\n/g, "")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

      // 2. Generate PDF with Puppeteer
    //   const browser = await puppeteer.launch();
      const  browser = await puppeteer.launch({
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
      const page = await browser.newPage();

      await page.setContent(decodedHtml, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });

      await browser.close();

      // 3. Upload PDF to S3
      const filename = `bureau-reports/${uuidv4()}.pdf`;

      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_S3_BUCKET, // your S3 bucket name
          Key: filename,
          Body: pdfBuffer,
          ContentType: "application/pdf"
        })
        .promise();

      // 4. Return the S3 URL
      console.log("✅ Uploaded to S3:", uploadResult.Location);
    
      return {
        status: true,
        message: "PDF created and uploaded",
        fileUrl: uploadResult.Location,
      };
    } catch (error) {
      console.error("Error in uploadBureau:", error);
      return {
        status: false,
        message: "Failed to create/upload PDF",
        error: error.message,
      };
    }
  },
};
