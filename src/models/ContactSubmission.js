const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Submission must have a name']
    },
    email: {
      type: String,
      required: [true, 'Submission must have an email']
    },
    subject: {
      type: String,
      required: [true, 'Submission must have a subject']
    },
    message: {
      type: String,
      required: [true, 'Submission must have a message']
    },
    status: {
      type: String,
      enum: ['new', 'read', 'responded', 'archived'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
);

const ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);
module.exports = ContactSubmission;
