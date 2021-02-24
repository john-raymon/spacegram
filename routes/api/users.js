const express = require('express');
const router = express.Router();
const service = require('@/services/users');
const middleware = require('@/middleware');
const User = require('@/models/User');
const ObjectId = require('mongoose').Types.ObjectId;

router.param(':userId', function(req, res, next, userId) {
  let isValidObjectId = true;
  try {
    ObjectId(userId);
  }
  catch(e) {
    isValidObjectId = false;
  }
  return User.findOne({ $or: [
    {
      _id: isValidObjectId ? userId : null,
      suspendedCreator: false || undefined
    },
    {
      username: userId,
      suspendedCreator: false || undefined
    }]
  })
    .exec()
    .then((user) => {
      if (!user) {
        return res.sendStatus(404);
      }
      req.fetchedUser = user;
      return next();
    })
    .catch(next);
})

router.post('/', ...service.create);

router.get('/subscriptions', middleware.requireAuthUser, ...service.getSubscriptionsForCreator);

router.post('/stripe/dashboard-link', middleware.requireAuthUser, ...service.createStripeLoginLink)
// update a user
router.patch('/', middleware.requireAuthUser, ...service.update)

router.get('/', middleware.requireAuthUser, function(req, res, next) {
  return res.json({
    user: req.user.authSerialize(accessToken = false),
  })
});

router.get('/:userId', middleware.requireAuthUser, function(req, res, next) {
  return res.json({
    user: req.fetchedUser.serialize(),
  })
});

// fetch all of creator user's post, authorizing only the creator or a subscriber user
// if the user is not logged in, we just return the creator profile information
router.get('/:creatorUserId/posts', middleware.optionalRequireAuthUser, ...service.getAllPostsForACreator)

// subscribe to a creator, sending over a stripe token
router.post('/:creatorUserId/subscribe', middleware.requireAuthUser, ...service.subscribeToAUser);

// return to an authenticated user their following (subscribed to subscriptions) and followers (subscribers)
router.get('/followers-following', middleware.requireAuthUser, ...service.aggregateFollowersFollowingList)

router.post('/login', ...service.login);

router.get('/logout', (req, res, next) => {
  req.logOut();
  req.session.destroy();
  res.json({ success: true })
});

router.post('/stripe/oauth', middleware.requireAuthUser, ...service.createOAuthLink);

// redirect uri
router.get('/stripe/token', middleware.requireAuthUser, ...service.handleRedirectUri);

module.exports = router;
