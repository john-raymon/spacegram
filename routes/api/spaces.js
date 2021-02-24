const express = require('express');
const router = express.Router();

router.get('/:spaceId', function(req, res, next) {
  return res.json({ success: true, space: {}});
})

module.exports = router;
