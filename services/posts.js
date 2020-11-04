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
const { multerMiddleware: multerCloudinaryMiddleware, cloudinary } = require("@/middleware/multerCloudinary");
const { post } = require('../app');

module.exports = {
  /**
   * TODO: add ability for followers to have access to the read
   * post endpoint for a user they follow.
   */
  read: [
    (req, res, next) => {
      // only give authorization to user of post
      if (req.user.id !== req.post.user.id) {
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
    (req, res, next) => {
      multerCloudinaryMiddleware.single('file')(req, res, (err) => {
        if (err || !req.file) {
          return next(err || Error("We weren't able to create your post right now."));
        }
        return next();
      });
    },
    function(req, res, next) {
      const post = new Post({
        user: req.user.id,
        title: req.body.title,
        description: req.body.description,
        file: {
            url: req.file.path,
            public_id: req.file.filename,
            ...req.file,
        }
      });

      return post.save().then(post => {
        res.json({ success: true, post: post.jsonSerialize(), })
      })
      .catch(next)
    },
  ],
  delete: [
    (req, res, next) => {
      // only give authorization to user of post
      if (req.user.id !== req.post.user.id) {
        return next({
          name: "ForbiddenError",
        })
      }
      req.post.deleted = true;
      const public_id = req.post.file.get('filename');
      return cloudinary.uploader.destroy(public_id, { type: 'upload', resource_type: req.post.file.get("mimetype").split('/')[0] }, (error, _res) => {
        if (error || _res.result !== 'ok') {
          return next(error || Error("We weren't able to delete this post right now."));
        }
        req.post.file = {
          "public_id": null,
          "url": null,
          "originalname": null,
          "fieldname": null,
          "encoding": null,
          "mimetype": null,
          "size": null,
          "filename": null,
          "path": null,
        }
        return req.post.save().then((post) => {
          return res.json({ success: true, post: post.jsonSerialize() });
        })
      })
      // multerCloudinaryMiddleware.
    }
  ]
}
