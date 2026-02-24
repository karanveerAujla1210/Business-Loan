const fs = require("fs");
const path = require("path");

const getImageBase64 = (relativeImagePath) => {
  const imagePath = path.resolve(relativeImagePath);
  const imageData = fs.readFileSync(imagePath);
  return `data:image/png;base64,${imageData.toString("base64")}`;
};
module.exports = { getImageBase64 };
