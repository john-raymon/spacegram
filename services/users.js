/**
 * config
 */
const config = require('config');

/**
 * models
 */
const User = require('@/models/User');

/**
 * utils
 */
const isBodyMissingProps = require('@/utils/isBodyMissingProps');

/**
 * user passport
 */
const { userPassport } = require('@/config/passport');

module.exports = {
  /**
   *  create a new User resource
   */
  create: [
    function(req, res, next) {
      const requiredProps = [
        ['email', 'Your email is required'],
        ['password', 'A password is required']
      ];

      const { hasMissingProps, propErrors } = isBodyMissingProps(
        requiredProps,
        req.body
      );

      if (hasMissingProps) {
        return next({
          name: "ValidationError",
          errors: propErrors
        });
      }

      const {
        email,
        firstName,
        lastName,
        password,
        billingAddressLine,
        billingCity,
        billingState,
        billingPostalCode,
        billingCountry,
        phoneNumber,
      } = req.body;

      const billing = {
        address: {
          line1: billingAddressLine,
          city: billingCity,
          state: billingState,
          postal_code: billingPostalCode,
          country: billingCountry,
        },
      };
      // check if user email is unique
      return User.count({ email })
        .exec()
        .then(function(count) {
          if (count > 0) {
            throw {
              name: "ValidationError",
              errors: {
                email: { message: "The email is already taken" }
              }
            };
          }
          return count;
        })
        .then(() => {
          const user = new User({
            email,
            firstName,
            lastName,
            phoneNumber,
            billingAddress: billing.address,
          });

          user.setPassword(password);
          return user
            .save()
            .then(function(user) {
              return req.login(user, () => res.json({ success: true, user: user.authSerialize() }));
            })
        })
        .catch(next);
    },
  ],
  /**
   * Authenticate and login a User resource
   */
  login: [
    (req, res, next) => {
      const requiredProps = [
        ['email', 'Your email and password are required to sign in.', true],
        ['password', 'Your email and password are required to sign.', true],
      ];
      const { hasMissingProps, propErrors } = isBodyMissingProps(requiredProps, req.body);
      if (hasMissingProps) {
        return next({
          name: "ValidationError",
          errors: propErrors
        });
      }
      const { email, password } = req.body;
      return userPassport.authenticate("local", function(err, user, data) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next({ ...data, success: false });
        }
        user.lastLoginAt = Date.now();
        return user.save().then(() => {
          return req.login(user, () => res.json({ success: true, user: user.authSerialize() }));
        })
      })(req, res, next);
    },
  ],
  logout: [
    (req, res, next) => req.logout()
  ]
};
