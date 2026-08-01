const Post = require('../models/Post');
const Subscriber = require('../models/Subscriber');
const ContactSubmission = require('../models/ContactSubmission');
const ActivityLog = require('../models/ActivityLog');
const catchAsync = require('../utils/catchAsync');

// Helper to format timeago
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

exports.getDashboardData = catchAsync(async (req, res, next) => {
  // 1. Get stats
  const publishedPostsCount = await Post.countDocuments({ status: 'published' });
  const draftPostsCount = await Post.countDocuments({ status: { $in: ['draft', 'scheduled'] } });
  const subscribersCount = await Subscriber.countDocuments({ status: 'active' });
  const contactSubmissionsCount = await ContactSubmission.countDocuments();

  // 2. Get recent activity
  const recentActivitiesRaw = await ActivityLog.find().sort('-createdAt').limit(10);
  
  const recentActivity = recentActivitiesRaw.map((activity, index) => ({
    id: activity._id.toString(),
    type: activity.type,
    text: activity.text,
    time: timeSince(activity.createdAt)
  }));

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalPublishedPosts: publishedPostsCount,
        totalDraftPosts: draftPostsCount,
        totalSubscribers: subscribersCount,
        contactFormSubmissions: contactSubmissionsCount
      },
      recentActivity
    }
  });
});
