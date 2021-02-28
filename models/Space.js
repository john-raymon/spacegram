const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const SpaceSchema = mongoose.Schema(
  {
    title: String,
    uniqueMeetingId: {
      type: String,
      index: true,
    },
    meetingSession: {
      type: Map,
      default: null,
    },
    hasMeetingEnded: {
      type: Boolean,
      default: false,
    },
    speakersList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    moderators:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    speakerRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  }
);

SpaceSchema.plugin(uniqueValidator, { type: "mongoose-unique-validator" });

SpaceSchema.methods.jsonSerialize = function() {
  const {
    uniqueMeetingId,
    hasMeetingEnded,
    speakersList,
    creator,
    moderators
  } = this;

  return {
    uniqueMeetingId,
    hasMeetingEnded,
    speakersList,
    creator,
    moderators,
  };
};
const Space = mongoose.model("Space", SpaceSchema);

module.exports = Space;
