const express = require("express");
const router = express.Router();
const Post = require("@/models/Post");
const middleware = require('@/middleware');
const service = require("@/services/posts");

// callback trigger for postId param
router.param(":postId", function(req, res, next, postId) {
  return Post.findById(postId)
    .populate('user', ['username', 'id', 'firstName', 'lastName', 'imageFile']) // note: the user populated here is the creator in this context
    .exec()
    .then(function(post) {
      if (!post || post.deleted) {
        return res.sendStatus(404);
      }
      req.post = post;
      return next();
    })
    .catch(next);
});

router.post("/:postId/toggle-like", middleware.requireAuthUser, ...service.toggleLikePost)

router.get('/feed', middleware.requireAuthUser, ...service.getPostFeed)

// Create a post, uploading a video/image file to Cloudinary
router.post('/', middleware.requireAuthUser, ...service.create);

// Read a post, only giving authorization to the creator or subscriber
// TODO: add support to allow active subscribers to have read access to the endpoint
router.get('/:postId', middleware.requireAuthUser, ...service.read);

// Delete a post, and remove it's file from Cloudinary
router.delete('/:postId', middleware.requireAuthUser, ...service.delete)

module.exports = router;
