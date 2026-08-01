const Subscriber = require('../models/Subscriber');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { addContactToList } = require('../services/brevoService');
const { logActivity } = require('../services/activityLogger');


exports.subscribe = catchAsync(async (req, res, next) => {
  // Try to create or find existing (if existing but unsubscribed, re-subscribe)
  let subscriber = await Subscriber.findOne({ email: req.body.email });
  
  if (subscriber) {
    if (subscriber.status === 'unsubscribed') {
      subscriber.status = 'active';
      subscriber.source = req.body.source || 'website';
      await subscriber.save();
    } else if (subscriber.status === 'active') {
      return next(new AppError('This email address is already subscribed.', 400));
    }
  } else {
    subscriber = await Subscriber.create({
      email: req.body.email,
      source: req.body.source || 'website'
    });
  }

  // Add to Brevo List
  await addContactToList(req.body.email);

  // Log activity if it's a new subscription or re-subscription
  if (!subscriber || subscriber.status === 'active') { // Wait, the logic above has subscriber as the returned doc
    await logActivity('subscriber', `New subscriber: ${req.body.email}`);
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscriber
    }
  });
});

exports.unsubscribe = catchAsync(async (req, res, next) => {
  const subscriber = await Subscriber.findOneAndUpdate(
    { email: req.body.email },
    { status: 'unsubscribed' },
    { new: true }
  );

  if (!subscriber) {
    return next(new AppError('No subscriber found with that email', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscriber
    }
  });
});

exports.getAllSubscribers = catchAsync(async (req, res, next) => {
  const subscribers = await Subscriber.find().sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: subscribers.length,
    data: {
      subscribers
    }
  });
});
