const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true // e.g., 'about', 'services', 'faq', 'privacy-policy', 'contact'
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const Page = mongoose.model('Page', pageSchema);
module.exports = Page;
