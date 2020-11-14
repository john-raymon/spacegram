/**
 * config
 */
const config = require('config');

/**
 * models
 */
const User = require('@/models/User');
const Subscription = require('@/models/Subscription');
const Post = require('@/models/Post');

/**
 * utils
 */
const isBodyMissingProps = require('@/utils/isBodyMissingProps');

/**
 * user passport
 */
const { userPassport } = require('@/config/passport');

const querystring = require("querystring");
const stripe = require("stripe")(config.get('stripe.secretKey'));
const crypto = require("crypto");
const { multerMiddleware: multerCloudinaryMiddleware, cloudinary } = require("@/middleware/multerCloudinary");

/**
 * TODO: Require users to connect to express before viewing orders/subscriptions
 */
module.exports = {
  getAllPostsForACreator: [
    (req, res, next) => {
      // authorize only the creator or a subscriber
      const getAllCreatorPost = () => Post.find({
      user: req.creatorUser.id,
      }).exec().then((posts) => ({ monthlySubscriptionPriceInCents: req.creatorUser.monthlySubscriptionPriceInCents, success: true, posts, creator: { firstName: req.creatorUser.firstName || '', lastName: req.creatorUser.lastName || '', username: req.creatorUser.username || '', id: req.creatorUser.id, imageFile: req.creatorUser.imageFile }}));
      if (req.creatorUser.id === req.user.id) {
        // return creator posts to creator
        return getAllCreatorPost().then((postRes) => {
          return res.json(postRes)
        });
      } else {
        // find an active subscription to allow access to the creators posts
        return Subscription
          .findOne({
            subscriber: req.user.id,
            creator: req.creatorUser.id,
            expires: {
              $gte: new Date(),
            }
          })
          .then((subscription) => {
            if (!subscription) {
              return res.json({ creator: { monthlySubscriptionPriceInCents: req.creatorUser.monthlySubscriptionPriceInCents, firstName: req.creatorUser.firstName || '', lastName: req.creatorUser.lastName || '', username: req.creatorUser.username || '', id: req.creatorUser.id, imageFile: req.creatorUser.imageFile }, name: "ForbiddenError" })
            }
            return getAllCreatorPost().then((postRes) => {
              return res.json({...postRes, subscription })
            })
          })
          .catch(() => next({ name: "ForbiddenError" }))
      }
      /**
       * TODO: add pagination support in later version
       */
    },
  ],
  aggregateFollowersFollowingList: [
    (req, res, next) => {
      return Promise.all([
        Subscription.find({
          subscriber: req.user.id,
          expires: {
            $gte: new Date(),
          }
        }).populate('subscriber', ['username', 'id']).populate('creator', ['username', 'id', 'firstName', 'lastName', 'imageFile']).exec(),
        Subscription.find({
          creator: req.user.id,
          expires: {
            $gte: new Date(),
          }
        }).populate('creator', ['username', 'id']).populate('subscriber', ['username', 'id', 'firstName', 'lastName', 'imageFile']).exec(),
      ]).then(([following, followers]) => {
        // TODO: serialize the subscription objects using getSubscriptionObject
        /**
         * TODO: map through each list and attach
         * a user profile object including image-url, and username for following-user and follower-user
         */
        return res.json({
          success: true,
          following,
          followers,
        })
      })
      .catch(next);
    },
  ],
  subscribeToAUser: [
    (req, res, next) => {
      if (req.user.id === req.creatorUser.id) {
        return next({
          name: 'BadRequest',
          message: "Nice try, you cannot subscribe to yourself."
        })
      }
      const subscriptionConfirmationCode = crypto.randomBytes(8).toString("hex");
      // check if user is already subscribed, by querying for an active subscription with the both users subscriber/creator
      return Subscription.findOne({
        creator: req.creatorUser.id,
        subscriber: req.user.id,
        expires: {
          $gte: new Date(),
        }
      })
      .then((subscription) => {
        if (subscription) {
          throw ({
            name: "BadRequest",
            message: "You currently have an active subscription for this person's OnlyInsta."
          })
        }

        /**
         *  Begin creating unique metadata for subscription
         */
        const subscriptionMetaData = {
          subscriptionConfirmationCode,
          creatorId: req.creatorUser.id,
          subscriberId: req.user.id,
        }


        /**
         * check if creator has stripeExpressUserID
         * if so, make destination charge,
         * if not make regular non-destination charge, with a transfer to be made later
         * for this subscription when the user connects to stripe later.
         */
        if (req.creatorUser.stripeExpressUserId) {
          // make destination stripe charge
          return stripe.charges.create({
            source: process.env.development ? req.body.stripeCardToken : 'tok_visa',
            amount: req.creatorUser.monthlySubscriptionPriceInCents,
            currency: 'usd', // TODO: add support for user configurable currencies
            description: 'OnlyInsta Subscription',
            statement_descriptor: 'OnlyInsta',
            metadata: {
              ...subscriptionMetaData
            },
            // The destination parameter directs the transfer of funds from onlyinsta to creator
            transfer_data: {
              // Send the amount for the creator after collecting a 20% platform fee:
              amount: req.creatorUser.monthlySubscriptionPriceInCents * 0.8,
              destination: req.creatorUser.stripeExpressUserId,
            },
          })
        } else {
          // make regular stripe charge for now, with a corresponding transfer later
          // when the user does connect to stripe (mark this subscription with nonDestinationCharge for now
          // then hasBeenTransferred when this is queried for and transferred after Stripe Connecting)
          return stripe.charges.create({
            source: process.env.development ? req.body.stripeCardToken : 'tok_visa',
            amount: req.creatorUser.monthlySubscriptionPriceInCents,
            currency: "usd",
            description: "OnlyInsta Subscription",
            statement_descriptor: 'OnlyInsta',
            metadata: {
              ...subscriptionMetaData,
            }
          })
        }
      })
      .then((stripeChargeResponse) => {
        if (stripeChargeResponse.paid) {
          const newSubscription = new Subscription({
            subscriber: req.user.id,
            creator: req.creatorUser.id,
            priceInCents: req.creatorUser.monthlySubscriptionPriceInCents,
            stripeChargeId: stripeChargeResponse.id,
            expires: new Date(Date.now() + 31 * 24*60*60*1000),
            confirmationCode: subscriptionConfirmationCode,
            nonDestinationCharge: (req.creatorUser.stripeExpressUserId ? false : true),
            hasBeenTransferred: (req.creatorUser.stripeExpressUserId ? undefined : false),
          })
          return newSubscription
            .save()
            .then((subscription) => {
              return res.json({
                success: true,
                subscription: subscription.getSubscriptionObject()
              })
            })
        }
        return next({
          name: 'ValidationError',
          message: "We could charge your card right now. Please try again in a few minutes."
        });
      })
      .catch(next);
    }
  ],
  /**
   * begin stripe connect express OAuth on-boarding,
   * then from redirectUri we utilized the received
   * authorization_code to exchange for the user's
   * stripe_user_id
   */
  createOAuthLink: [
    (req, res, next) => {
      if (req.user.stripeExpressUserId) {
        return next({
          name: "BadRequest",
          message: "You have already connected this account to a Stripe account"
        });
      }
      return req.user.createRandomKey()
        .then(key => {
          const parameters = {
            client_id: config.get('stripe.clientId'),
            response_type: "code",
            state: key,
            scope: "read_write", // defaults to 'read_only' see https://stripe.com/docs/connect/oauth-reference
            // if not explicitly set to read_write then stripe_landing will
            // by default go to login for scope read_only and register for scope read_write.
            // we want register, since we don't expect venue owners/host to
            // initially have Stripe accounts.
            redirect_uri: config.get('baseUrl') + "/api/users/stripe/token",
            "suggested_capabilities[]": "transfers",
            "stripe_user[business_type]": "individual",
            "stripe_user[first_name]": req.user.firstName || undefined,
            "stripe_user[last_name]": req.user.lastName || undefined,
            "stripe_user[email]": req.user.email || undefined,
            "stripe_user[phone_number]": req.user.phoneNumber || undefined
            // If we're suggesting this account have the `card_payments` capability,
            // we can pass some additional fields to prefill:
            // 'suggested_capabilities[]': 'card_payments',
            // 'stripe_user[street_address]': req.user.address || undefined,
            // 'stripe_user[city]': req.user.city || undefined,
            // 'stripe_user[zip]': req.user.postalCode || undefined,
            // 'stripe_user[state]': req.user.city || undefined,
            // 'stripe_user[country]': req.user.country || undefined
          };

          console.log("Starting OAuth flow for Stripe Connect Express:", parameters);

          return res.json({
            success: true,
            redirectUrl:
              config.get('stripe.authorizeUri') +
              "?" +
              querystring.stringify(parameters)
          });
        })
    },
  ],
  /**
   * Todo: when completing the Stripe Express connection flow
   * make sure to find all non-destination charged subscriptions, and set-up
   * transfers for them.
   */
  //http://localhost:3000/api/user/stripe/token?code=ac_IKwOmijXSS2yluCRiIAxccSIokA3X9W1&state=8613ca933f43a71b15fe26b8107df4f653506a60817a49ee6e6a4eff6c52ac41392844a51cd42e903f910416bf75ec98
  handleRedirectUri: [
    (req, res, next) => {
      return User.findOne({ randomKey: req.query.state, _id: req.user.id })
        .then((user) => {
          return stripe.oauth.token({
            grant_type: 'authorization_code',
            code: req.query.code,
          }).then((response) => {
            if (!response.stripe_user_id) {
              return next({ name: 'BadRequest', ...response });
            }
            user.stripeExpressUserId = response.stripe_user_id;
            return user.save();
          })
        })
        .then((user) => {
          // after the user has finished setting stripe and received their stripe_user_id,
          // we must transfer any nonDestinationCharges made prior to this
          /**
           * TODO: set up an async job task to find all subscriptions with
           * truthy nonDestinationCharge and falsely hasBeenTransferred
           * to create a Stripe transfer for the subscription's charge
           */
          return Subscription.find({
            creator: req.user.id,
            nonDestinationCharge: true,
            hasBeenTransferred: false,
          }).exec()
            .then((subscriptions) => {
              subscriptions.forEach(subscription => {
                return stripe.transfers.create({
                  amount: user.monthlySubscriptionPriceInCents * 0.8,
                  currency: 'usd',
                  source_transaction: subscription.stripeChargeId,
                  destination: user.stripeExpressUserId,
                }).then((transfer) => {
                  subscription.hasBeenTransferred = true;
                  subscription.stripeTransferId = transfer.id;
                  return subscription.save();
                }).catch(console.log('silienty swallow this error'));
              })
              return res.json({
                success: true,
                message: "Your Stripe account has been successfully connected!"
              });
            })
        })
        .catch(next);
    }
  ],
  /**
   *  create a new User resource
   */
  create: [
    function(req, res, next) {
      const requiredProps = [
        ['email', 'Your email is required'],
        ['password', 'A password is required'],
        ['username', 'A unique username is required'],
        ['firstName', 'Your first name is required'],
        ['lastName', 'Your last name is required']
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
        username,
      } = req.body;

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
            username,
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
   * update
   */
  update: [
    (req, res, next) => {
      multerCloudinaryMiddleware.single('user-image')(req, res, (err) => {
        if (err) {
          return next(err);
        }
        return next();
      });
    },
    (req, res, next) => {
      const whitelistedKeys = ["email", "username", "firstName", "lastName"];
      // allow only white-listed keys to be assigned to the req.user document model
      for (const prop in req.body) {
        if (whitelistedKeys.includes(prop)) {
          req.user[prop] = req.body[prop];
        }
      }
      return req.user
      .save()
      .then(function(user) {
        if (req.body.password) {
          // authenticate current user's password
          if (!req.body.currentPassword || !req.user.validPassword(req.body.currentPassword)) {
            return next({
              name: 'BadRequest',
              message: 'Your password is incorrect.'
            });
          }
          // TODO: send security email to user
          req.user.setPassword(req.body.password);
          return req.user.save().then((user) => {
            req.logout();
            return res.json({
              success: true,
              user: user.authSerialize()
            });
          })
        }
        if (req.file) {
          req.user.imageFile = {
            url: req.file.path,
            public_id: req.file.filename,
            ...req.file,
          }
          return req.user.save().then((user) => {
            return res.json({
              success: true,
              user: user.authSerialize()
            });
          })
        }
        return res.json({
          success: true,
          user: user.authSerialize()
        });
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
        }).catch(next);
      })(req, res, next);
    },
  ],
  logout: [
    (req, res, next) => req.logout()
  ]
};
