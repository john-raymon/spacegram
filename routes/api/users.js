const express = require('express');
const router = express.Router();
const service = require('@/services/users');
const middleware = require('@/middleware');

router.post('/', ...service.create);

router.get('/', middleware.sessionRequireUser, function(req, res, next) {
  return res.json({
    user: req.user.authSerialize(),
  })
})

router.post('/login', ...service.login);

router.get('/logout', (req, res, next) => {
  req.logOut();
  req.session.destroy();
  res.json({ success: true })
});

module.exports = router;
