const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileType: String,
    size: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    uploader: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;
