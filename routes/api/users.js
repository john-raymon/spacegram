const express = require('express');
const router = express.Router();
const service = require('@/services/users');
const middleware = require('@/middleware');
const User = require('@/models/User');
const ObjectId = require('mongoose').Types.ObjectId;

router.param(':creatorUserId', function(req, res, next, creatorUserId) {
  let isValidObjectId = true;
  try {
    ObjectId(creatorUserId);
  }
  catch(e) {
    isValidObjectId = false;
  }
  return User.findOne({ $or: [
    {
      _id: isValidObjectId ? creatorUserId : null,
      suspendedCreator: false || undefined
    },
    {
      username: creatorUserId,
      suspendedCreator: false || undefined
    }]
  })
    .exec()
    .then((user) => {
      if (!user) {
        return res.sendStatus(404);
      }
      req.creatorUser = user;
      return next();
    })
    .catch(next);
})

router.post('/', ...service.create);

router.get('/subscriptions', middleware.sessionRequireUser, ...service.getSubscriptionsForCreator);

router.post('/stripe/dashboard-link', middleware.sessionRequireUser, ...service.createStripeLoginLink)
// update a user
router.patch('/', middleware.sessionRequireUser, ...service.update)

router.get('/', middleware.sessionRequireUser, function(req, res, next) {
  return res.json({
    user: req.user.authSerialize(),
  })
});

// fetch all of creator user's post, authorizing only the creator or a subscriber user
// if the user is not logged in, we just return the creator profile information
router.get('/:creatorUserId/posts', middleware.optionalSessionRequireUser, ...service.getAllPostsForACreator)

// subscribe to a creator, sending over a stripe token
router.post('/:creatorUserId/subscribe', middleware.sessionRequireUser, ...service.subscribeToAUser);

// return to an authenticated user their following (subscribed to subscriptions) and followers (subscribers)
router.get('/followers-following', middleware.sessionRequireUser, ...service.aggregateFollowersFollowingList)

router.post('/login', ...service.login);

router.get('/logout', (req, res, next) => {
  req.logOut();
  req.session.destroy();
  res.json({ success: true })
});

router.post('/stripe/oauth', middleware.sessionRequireUser, ...service.createOAuthLink);

// redirect uri
router.get('/stripe/token', middleware.sessionRequireUser, ...service.handleRedirectUri);

module.exports = router;
