const ContactSubmission = require('../models/ContactSubmission');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../services/emailService');
const { addContactToList } = require('../services/brevoService');
const { logActivity } = require('../services/activityLogger');


exports.submitContact = catchAsync(async (req, res, next) => {
  const newSubmission = await ContactSubmission.create(req.body);

  await logActivity('submission', `New contact form submission from ${newSubmission.name}`);

  // Send email to Ian/Admin
  try {
    await sendEmail({
      to: process.env.COMPANY_EMAIL,
      subject: `New Contact Submission: ${req.body.subject}`,
      html: `
        <h3>New Contact Submission</h3>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Subject:</strong> ${req.body.subject}</p>
        <p><strong>Message:</strong><br/> ${req.body.message}</p>
      `
    });
  } catch (err) {
    console.error('Failed to send notification email', err);
    // Don't fail the request if email fails, but log it
  }

  // Add to Brevo list so they get the welcome email
  if (req.body.email) {
    await addContactToList(req.body.email, req.body.name);
  }

  res.status(201).json({
    status: 'success',
    data: {
      submission: newSubmission
    }
  });
});

exports.getAllSubmissions = catchAsync(async (req, res, next) => {
  const submissions = await ContactSubmission.find().sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: submissions.length,
    data: {
      submissions
    }
  });
});

exports.updateSubmissionStatus = catchAsync(async (req, res, next) => {
  const submission = await ContactSubmission.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      submission
    }
  });
});
