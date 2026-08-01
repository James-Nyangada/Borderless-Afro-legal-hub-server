const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'Borderless Afro Legal Hub'
    },
    logoUrl: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    },
    contactEmail: String,
    seoDefaults: {
      title: String,
      description: String
    }
  },
  {
    timestamps: true
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
