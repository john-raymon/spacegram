const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "beta-onlyinsta",
    allowedFormats: ['mp4', 'ogv', 'jpg', 'pdf', 'mov', '3gpp', 'avi', 'wmv', 'm3u8'],
    resource_type: "auto",
    transformation: { width: 0.7, quality: 70 },
  }
});

const multerMiddleware = multer({ storage });

module.exports = multerMiddleware;
