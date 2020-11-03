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
      const requiredProps = [
        ['postFile', 'A video or photo is required', true]
      ];

      const { hasMissingProps, propErrors } = isBodyMissingProps(requiredProps, req.body);

      if (hasMissingProps) {
        next({
          name: "ValidationError",
          errors: propErrors,
        })
      }

    },
  ]
}
