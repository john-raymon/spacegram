const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  title: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: String,
  deleted: Boolean,
  format: String,
  images: {
    type: Map,
    of: {
      url: String,
      public_id: { type: String, index: true }
    },
    default: new Map()
  },
});

PostSchema.methods.JsonSerialize = function() {
  const {
    id,
    title,
    images,
    deleted,
    description,
  } = this;

  return {
    id,
    title,
    images,
    deleted,
    description,
  };
}

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
