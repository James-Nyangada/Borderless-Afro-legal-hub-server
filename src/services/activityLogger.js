const ActivityLog = require('../models/ActivityLog');

/**
 * Logs an activity to the database.
 * @param {String} type - The type of activity (e.g., 'post', 'comment', 'subscriber', 'submission')
 * @param {String} text - The description of the activity
 */
const logActivity = async (type, text) => {
  try {
    await ActivityLog.create({ type, text });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
