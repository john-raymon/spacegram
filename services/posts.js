/**
 * config
 */
const config = require('config');
/**
 * models
 */
const Post = require('@/models/Post');
/**
 * utils
 */
const isBodyMissingProps = require('@/utils/isBodyMissingProps');
const multerCloudinaryMiddleware = require("@/middleware/multerCloudinary");

module.exports = {
  /**
   * TODO: add ability for followers to have access to the read
   * post endpoint for a user they follow.
   */
  read: [
    (req, res, next) => {
      // only give authorization to user of post
      if (req.user.id !== req.post.id) {
        return next({
          name: "ForbiddenError",
        })
      }
      return res.json({ success: true, post: req.post.jsonSerialize() })
    },
  ],
  /**
   * create a new image post
   */
  create: [
    multerCloudinaryMiddleware.single('postFile'),
    function(req, res, next) {

      const post = new Post({
        user: req.user.id,
        title: req.body.title,
        description: req.body.description,
        images: {
          [req.file.filename]: {
            url: req.file.path,
            public_id: req.file.filename
          }
        }
      });

      return post.save().then(post => {
        res.json({ success: true, post: post.jsonSerialize(), })
      })
      .catch(next)
    },
  ]
}
