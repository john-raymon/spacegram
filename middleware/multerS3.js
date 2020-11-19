const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require("multer-s3");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS,
});

const multerS3Middleware = multer({
  storage: multerS3({
    s3,
    bucket: 'onlyinsta-secure-assets',
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});

module.exports = { multerS3Middleware, s3 };
