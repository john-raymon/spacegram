const express = require('express');
const router = express.Router();

const middleware = require('@/middleware');
const { createAndJoinSpace, joinSpace } = require('@/services/spaces');
const Space = require('@/models/Space');

router.param('uniqueMeetingId', (req, res, next, uniqueMeetingId) => {
  return Space.findOne({
    uniqueMeetingId: uniqueMeetingId,
  })
  .exec()
  .then((space) => {
    if (!space) {
      return next({
        name: "NotFound",
        message: "We could not locate this meeting."
      })
    }
    if (space.hasMeetingEnded) {
      return next({
        name: "BadRequest",
        message: "The meeting has ended.",
      })
    }
    req.space = space;
    return next();
  }).catch(next);
});

// create a space room and be first to join it
router.post('/', middleware.requireAuthUser, ...createAndJoinSpace);

/**
 * join an existing space
 * TODO: check in the near future if AWS Chime SDK supports
 * server-side remotely muting or remotely restricting unmuting for an attendee
 * to prevent client-side hacking of mute/unmuting functionality
 */
router.post('/:uniqueMeetingId/join', middleware.requireAuthUser, ...joinSpace);

module.exports = router;
