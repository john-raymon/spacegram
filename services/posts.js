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
   * create a new image post
   */
  create: [
    multerCloudinaryMiddleware.single('postFile'),
    function(req, res, next) {
      debugger;
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
        res.json({ success: true, ...post.jsonSerialize(), })
      })
      .catch(next)
    },
  ]
}
