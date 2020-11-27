const mongoose = require("mongoose");

const PostSchema = mongoose.Schema(
  {
    title: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: String,
    deleted: Boolean,
    format: String,
    file: {
      type: Map,
      default: new Map()
    },
    thumbnailFile: {
      type: Map,
      default: null,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

PostSchema.methods.jsonSerialize = function() {
  const {
    id,
    title,
    file,
    deleted,
    description,
    likes,
  } = this;

  return {
    id,
    title,
    file,
    deleted,
    description,
    likes,
  };
}

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
