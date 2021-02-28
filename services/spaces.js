/**
 * config
 */
const config = require('config');

/**
 * models
 */
const Space = require('@/models/Space');
const { v4: uuid } = require('uuid');
const isBodyMissingProps = require('@/utils/isBodyMissingProps');
const AWS = require('aws-sdk');

// set up AWS SDK with
AWS.config.credentials = new AWS.Credentials(process.env.AWSAccessKeyId, process.env.AWSSecretKey);
// the AWS Chime SDK documentation states the instance of the AWS.Chime object
// currently must be configured to us-east-1, however the actual region where the
// meetings are hosted can be configured when invoking Chime.createMeeting
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

module.exports = {
  createAndJoinSpace: [
    (req, res, next) => {
      const requiredProps = [
        ['title', 'A title for the space is required'],
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

      /**
       * TODO:
       * Should we check if this user has an active space
       * already before allowing them to create a new one?
       */
      const uniqueMeetingTitle = uuid();
      return chime.createMeeting({
          ClientRequestToken: uniqueMeetingTitle,
          ExternalMeetingId: uniqueMeetingTitle,
        })
        .promise()
        .then((chimeMeeting) => {
          const newSpace = new Space({
            uniqueMeetingId: uniqueMeetingTitle,
            title: uniqueMeetingTitle,
            meetingSession: chimeMeeting,
            creator: req.user.id,
            moderators: [req.user.id],
            speakersList: [req.user.id],
          });
          return newSpace.save();
        })
        .then((newSpace) => {
          const chimeMeeting = newSpace.meetingSession.get('Meeting');
          /**
           * note, there may be a 404, meeting not found
           * if no attendees join within 5 minutes
           * The moment CreateMeeting or CreateMeetingWithAttendees is invoked
           * and the meeting is created, the auto end policies
           * will kick in and if no one joins the meeting,
           * it will close within 5 minutes.
           * https://github.com/aws/amazon-chime-sdk-js/issues/400#issuecomment-637264882
           */
          return chime.createAttendee({
            MeetingId: chimeMeeting.MeetingId,
            ExternalUserId: req.user.id
          }).promise().then((attendee) => {
            return res.json({
              success: true,
              joinInfo: {
                meeting: chimeMeeting,
                attendee: attendee.Attendee
              },
              space: newSpace.jsonSerialize(),
            });
          })
        })
        .catch(next);
    },
  ],
  joinSpace: [
    (req, res, next) => {
      const chimeMeeting = req.space.meetingSession.get('Meeting');
      /**
       * note, there may be a 404, meeting not found
       * if no attendees join within 5 minutes
       * The moment CreateMeeting or CreateMeetingWithAttendees is invoked
       * and the meeting is created, the auto end policies
       * will kick in and if no one joins the meeting,
       * it will close within 5 minutes.
       * https://github.com/aws/amazon-chime-sdk-js/issues/400#issuecomment-637264882
       */
      return chime.createAttendee({
        MeetingId: chimeMeeting.MeetingId,
        ExternalUserId: req.user.id
      }).promise().then((attendee) => {
        return res.json({
          success: true,
          joinInfo: {
            meeting: chimeMeeting,
            attendee: attendee.Attendee
          },
          space: req.space.jsonSerialize(),
        });
      });
    },
  ],
}
