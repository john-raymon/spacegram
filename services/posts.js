/**
 * config
 */
const config = require('config');
/**
 * models
 */
const Post = require('@/models/Post');
const Subscription = require('@/models/Subscription');

/**
 * utils
 */
const isBodyMissingProps = require('@/utils/isBodyMissingProps');
const { multerMiddleware: multerCloudinaryMiddleware, cloudinary } = require("@/middleware/multerCloudinary");
const { post } = require('../app');

module.exports = {
  getPostFeed: [
    (req, res, next) => {
      /**
       * - get all subscriptions belonging to logged in user,
       * meaning get all subscriptions with creator id's, not expired,
       * and with the user listed as subscriber
       * - if only subscribed to one user do not use $or operator
       * in post query, if greater than 1 then query use the $or to select post documents with at least
       * one of the id's, along with a sorting of -1 on the created on date to
       *
       */
      return Subscription.find({
          subscriber: req.user.id,
          expires: {
            $gte: new Date(),
          }
        })
        .exec()
        .then((following) => {
          if (!following.length) {
            return res.json({
              success: true,
              message: "You're not subscribed to any creators.",
              postFeed: [],
            })
          }
          const postFindQuery = following.length > 1 ? ({ $or: following.map(s => ({ user: s.creator })) }) : ({  user: following[0].creator });
          return Post.find(postFindQuery).sort({ "createdAt": -1 }).populate('user', ['username', 'id', 'firstName', 'lastName'])
          .exec()
            .then((posts) => {
              return res.json({
                success: true,
                postFeed: posts,
              })
            });
        }).catch(next);
    },
  ],
  /**
   * TODO: add ability for followers to have access to the read
   * post endpoint for a user they follow.
   */
  read: [
    (req, res, next) => {
      // only give authorization to user of post
      if (req.user.id !== req.post.user.id) {
        return Subscription.findOne({
          creator: req.post.user.id,
          subscriber: req.user.id,
          expires: {
            $gte: new Date(),
          }
        })
        .then((subscription) => {
          if (!subscription) {
            return next({
              name: "ForbiddenError",
            })
          }
          return res.json({ success: true, post: req.post, creator: { id: req.post.user.id, firstName: req.post.user.firstName || '', lastName: req.post.user.lastName || '', username: req.post.user.username || '' } })
        })
        .catch(next)
      }
      return res.json({ success: true, post: req.post, creator: { id: req.post.user.id, firstName: req.post.user.firstName || '', lastName: req.post.user.lastName || '', username: req.post.user.username || '' } })
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
