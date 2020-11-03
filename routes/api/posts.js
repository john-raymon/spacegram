const express = require("express");
const router = express.Router();
const Post = require("@/models/Post");
const middleware = require('@/middleware');
const service = require("@/services/posts");

// Create a post, uploading a video/image file to Cloudinary
router.post('/', middleware.sessionRequireUser, ...service.create);

module.exports = router;
