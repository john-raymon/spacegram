// /**
//  * config
//  */
// const config = require('config');
// /**
//  * models
//  */
// const Post = require('@/models/Post');
// const Subscription = require('@/models/Subscription');

// /**
//  * utils
//  */
// const isBodyMissingProps = require('@/utils/isBodyMissingProps');
// // const { multerMiddleware: multerCloudinaryMiddleware, cloudinary } = require("@/middleware/multerCloudinary");
// // const { multerS3Middleware, s3 } = require("@/middleware/multerS3");
// // const CloudFrontSigner = require('aws-sdk').CloudFront.Signer;

// // const postGetSignedUrl = (fileKey, millisecondsExpiration = 60000) => {
// //   const privateKeyString = process.env.CLOUDFRONT_PRIVATE_KEY_STRING ? JSON.parse(process.env.CLOUDFRONT_PRIVATE_KEY_STRING) : '';
// //   const cloudFrontSigner = new CloudFrontSigner(process.env.CLOUDFRONT_KEY_PAIR_ID, privateKeyString)
// //   const cloudFrontSignedUrl = cloudFrontSigner.getSignedUrl({
// //     url: `${process.env.CLOUDFRONT_DOMAIN_NAME}/${fileKey}`,
// //     expires: Math.floor((Date.now() + millisecondsExpiration)/1000),
// //   });
// //   return cloudFrontSignedUrl;
// // };

// const mapSignedUrlsToPost = (posts) => posts.map((post) => {
//   return { ...post.toJSON(), url: postGetSignedUrl(post.file.get('key')), thumbnailUrl: (post.thumbnailFile ? postGetSignedUrl((post.thumbnailFile && post.thumbnailFile.get('key'))) : undefined) };
// });

// module.exports = {
//   postGetSignedUrl,
//   mapSignedUrlsToPost,
//   toggleLikePost: [
//     (req, res, next) => {
//       // check if user is subscribed
//       // only give authorization to user of post
//       if (req.user.id !== req.post.user.id) {
//         return Subscription.findOne({
//           creator: req.post.user.id,
//           subscriber: req.user.id,
//           expires: {
//             $gte: new Date(),
//           }
//         })
//         .then((subscription) => {
//           if (!subscription) {
//             return next({
//               name: "ForbiddenError",
//             })
//           }
//           if (req.post.likes.includes(req.user.id)) {
//             req.post.likes.remove(req.user.id);
//           } else {
//             req.post.likes.push(req.user.id);
//           }
//           return req.post.save()
//             .then((post) => post.populate('likes',  ['username', 'id', 'firstName', 'lastName', 'imageFile']).execPopulate())
//             .then((post) => {
//               return res.json({ success: true, likes: post.likes })
//             })
//         }).catch(next);
//       }
//       if (req.post.likes.includes(req.user.id)) {
//         req.post.likes.remove(req.user.id);
//       } else {
//         req.post.likes.push(req.user.id);
//       }
//       req.post.save()
//         .then((post) => post.populate('likes',  ['username', 'id', 'firstName', 'lastName', 'imageFile']).execPopulate())
//         .then((post) => {
//           return res.json({ success: true, likes: post.likes })
//         })
//         .catch(next);
//     },
//   ],
//   getPostFeed: [
//     (req, res, next) => {
//       /**
//        * - get all subscriptions belonging to logged in user,
//        * meaning get all subscriptions with creator id's, not expired,
//        * and with the user listed as subscriber
//        * - if only subscribed to one user do not use $or operator
//        * in post query, if greater than 1 then query use the $or to select post documents with at least
//        * one of the id's, along with a sorting of -1 on the created on date to
//        *
//        */
//       return Subscription.find({
//           subscriber: req.user.id,
//           expires: {
//             $gte: new Date(),
//           }
//         })
//         .exec()
//         .then((following) => {
//           if (!following.length) {
//             return res.json({
//               success: true,
//               message: "You're not subscribed to any creators.",
//               postFeed: [],
//             })
//           }
//           const postFindQuery = following.length > 1 ? ({ $or: following.map(s => ({ user: s.creator })) }) : ({  user: following[0].creator });
//           return Post.find(postFindQuery).sort({ "createdAt": -1 })
//           .populate('user', ['username', 'id', 'firstName', 'lastName', 'imageFile'])
//           .populate('likes', ['username', 'id', 'firstName', 'lastName', 'imageFile'])
//           .exec()
//             .then((posts) => {
//               return res.json({
//                 success: true,
//                 postFeed: mapSignedUrlsToPost(posts),
//               })
//             });
//         }).catch(next);
//     },
//   ],
//   /**
//    * TODO: add ability for followers to have access to the read
//    * post endpoint for a user they follow.
//    */
//   read: [
//     (req, res, next) => {
//       // only give authorization to user of post
//       if (req.user.id !== req.post.user.id) {
//         return Subscription.findOne({
//           creator: req.post.user.id,
//           subscriber: req.user.id,
//           expires: {
//             $gte: new Date(),
//           }
//         })
//         .then((subscription) => {
//           if (!subscription) {
//             return next({
//               name: "ForbiddenError",
//             })
//           }
//           return req.post.populate('likes', ['username', 'id', 'firstName', 'lastName', 'imageFile']).execPopulate();
//         })
//         .then((post) => {
//           return res.json({ success: true, post: { ...post.toJSON(), url: postGetSignedUrl(post.file.get('key')) }, creator: { id: post.user.id, firstName: post.user.firstName || '', lastName: post.user.lastName || '', username: post.user.username || '', imageFile: post.user.imageFile } })
//         })
//         .catch(next)
//       }
//       return req.post.populate('likes', ['username', 'id', 'firstName', 'lastName', 'imageFile']).execPopulate()
//         .then((post) => {
//           return res.json({ success: true, post: { ...post.toJSON(), url: postGetSignedUrl(post.file.get('key')) }, creator: { id: post.user.id, firstName: post.user.firstName || '', lastName: post.user.lastName || '', username: post.user.username || '', imageFile: post.user.imageFile } })
//         })
//         .catch(next);
//       // return here, since the creator is attempting to read their post hence
//       // no need to check for a subscription
//     },
//   ],
//   /**
//    * create a new image post
//    */
//   create: [
//     (req, res, next) => {
//       return multerS3Middleware.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnailFile', maxCount: 1 }])(req, res, (err) => {
//         if (err || !req.files || !(req.files.file && req.files.file.length)) {
//           return next(err || Error("We weren't able to create your post right now."));
//         }
//         req.file = req.files.file[0];
//         if (req.files.thumbnailFile) {
//           req.thumbnailFile = req.files.thumbnailFile[0];
//         }
//         return next();
//       });
//     },
//     function(req, res, next) {
//       const post = new Post({
//         user: req.user.id,
//         title: req.body.title,
//         description: req.body.description,
//         file: req.file,
//       });
//       if (req.thumbnailFile) {
//         post.thumbnailFile = req.thumbnailFile;
//       };
//       return post.save().then(post => {
//         return res.json({ success: true, post: { ...post.jsonSerialize(), url: postGetSignedUrl(req.file.key, 60000)}});
//       })
//       .catch(next)
//     },
//   ],
//   delete: [
//     (req, res, next) => {
//       // only give authorization to user of post
//       if (req.user.id !== req.post.user.id) {
//         return next({
//           name: "ForbiddenError",
//         })
//       }
//       req.post.deleted = true;
//       const fileKey = req.post.file.get('key');
//       const s3Params = {
//         Bucket: "onlyinsta-secure-assets",
//         Key: fileKey,
//       };
//       return s3.deleteObject(s3Params, function(err, data) {
//         if (err) {
//           return next(err || Error("We weren't able to delete this post right now."));
//         }
//         req.post.file = new Map();
//         req.post.deleted = true;
//         return req.post.save().then((post) => {
//           return res.json({ success: true, post: post.jsonSerialize() });
//         });
//       });
//       // multerCloudinaryMiddleware.
//     }
//   ]
// }
