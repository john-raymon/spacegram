const express = require("express");
const router = express.Router();
const Post = require("@/models/Post");
const middleware = require('@/middleware');
const service = require("@/services/posts");

// callback trigger for postId param
router.param(":postId", function(req, res, next, postId) {
  return Post.findById(postId)
    .populate('user')
    .exec()
    .then(function(post) {
      if (!post) {
        return res.sendStatus(404);
      }
      req.post = post;
      return next();
    })
    .catch(next);
});

// Create a post, uploading a video/image file to Cloudinary
router.post('/', middleware.sessionRequireUser, ...service.create);

// Read a post, only giving authorization to the
router.get('/:postId', middleware.sessionRequireUser, ...service.read);

module.exports = router;
