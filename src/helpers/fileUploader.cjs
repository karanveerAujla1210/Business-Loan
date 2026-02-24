const AWS = require('aws-sdk');

const uploadFileToS3 = async (fileBuffer, mimeType, extension) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: 'ap-south-1',
    });

    const newFileName = `bs_${Date.now().toString()}.${extension}`;

    const params = {
      Bucket: process.env.AWS_S3_PUBLIC_BUCKET,
      Key: newFileName,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          console.error('S3 Upload Error:', err);
          return reject(err);
        }
        resolve(data);
      });
    });
  } catch (e) {
    console.error('Upload Error:', e);
    throw e;
  }
}

module.exports={uploadFileToS3}