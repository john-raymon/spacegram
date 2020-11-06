const express = require('express');
const router = express.Router();
const service = require('@/services/users');
const middleware = require('@/middleware');
const User = require('@/models/User');

router.param(':creatorUserId', function(req, res, next, creatorUserId) {
  return User.findOne({
    _id: creatorUserId,
    suspendedCreator: false || undefined
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

router.get('/', middleware.sessionRequireUser, function(req, res, next) {
  return res.json({
    user: req.user.authSerialize(),
  })
});

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
