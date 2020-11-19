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
// const { multerMiddleware: multerCloudinaryMiddleware, cloudinary } = require("@/middleware/multerCloudinary");
const { multerS3Middleware } = require("@/middleware/multerS3");
const CloudFrontSigner = require('aws-sdk').CloudFront.Signer;

const postGetSignedUrl = (fileKey, millisecondsExpiration = 60000) => {
  const privateKeyString = process.env.CLOUDFRONT_PRIVATE_KEY_STRING ? JSON.parse(process.env.CLOUDFRONT_PRIVATE_KEY_STRING) : '';
  const cloudFrontSigner = new CloudFrontSigner(process.env.CLOUDFRONT_KEY_PAIR_ID, privateKeyString)
  const cloudFrontSignedUrl = cloudFrontSigner.getSignedUrl({
    url: `${process.env.CLOUDFRONT_DOMAIN_NAME}/${fileKey}`,
    expires: Math.floor((Date.now() + millisecondsExpiration)/1000),
  });
  return cloudFrontSignedUrl;
};

module.exports = {
  postGetSignedUrl,
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
          return Post.find(postFindQuery).sort({ "createdAt": -1 }).populate('user', ['username', 'id', 'firstName', 'lastName', 'imageFile'])
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
          debugger;
          return res.json({ success: true, post: { ...req.post.toJSON(), url: postGetSignedUrl(req.post.file.get('key')) }, creator: { id: req.post.user.id, firstName: req.post.user.firstName || '', lastName: req.post.user.lastName || '', username: req.post.user.username || '', imageFile: req.post.user.imageFile } })
        })
        .catch(next)
      }
      debugger;
      // return here, since the creator is attempting to read their post hence
      // no need to check for a subscription
      return res.json({ success: true, post: { ...req.post.toJSON(), url: postGetSignedUrl(req.post.file.get('key')) }, creator: { id: req.post.user.id, firstName: req.post.user.firstName || '', lastName: req.post.user.lastName || '', username: req.post.user.username || '', imageFile: req.post.user.imageFile } })
    },
  ],
  /**
   * create a new image post
   */
  create: [
    (req, res, next) => {
      return multerS3Middleware.single('file')(req, res, (err) => {
        debugger;
        if (err || !req.file) {
          debugger;
          return next(err || Error("We weren't able to create your post right now."));
        }
        return next();
      });
    },
    function(req, res, next) {
      debugger;
      const post = new Post({
        user: req.user.id,
        title: req.body.title,
        description: req.body.description,
        file: req.file,
      });

      return post.save().then(post => {
        return res.json({ success: true, post: { ...post.jsonSerialize(), url: postGetSignedUrl(req.file.key, 60000)}});
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
