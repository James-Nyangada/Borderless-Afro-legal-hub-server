const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'Comment must belong to a post']
    },
    name: {
      type: String,
      required: [true, 'Commenter must provide a name']
    },
    email: {
      type: String,
      required: [true, 'Commenter must provide an email']
    },
    text: {
      type: String,
      required: [true, 'Comment cannot be empty']
    },
    status: {
      type: String,
      enum: ['approved', 'hidden'],
      default: 'approved'
    },
    replyTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment'
    },
    likes: {
      type: Number,
      default: 0
    },
    reports: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
