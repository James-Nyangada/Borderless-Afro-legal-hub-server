const Comment = require('../models/Comment');
const { logActivity } = require('../services/activityLogger');

// PUBLIC ENDPOINTS

// Get all approved comments for a specific post
exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId, status: 'approved' })
      .sort('-createdAt')
      .select('-email'); // Hide email from public responses

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: {
        comments
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create a new comment or reply
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { name, email, text, replyTo } = req.body;

    if (!name || !email || !text) {
      return res.status(400).json({ status: 'fail', message: 'Please provide name, email, and text' });
    }

    const newComment = await Comment.create({
      post: postId,
      name,
      email,
      text,
      replyTo: replyTo || undefined
    });

    // Remove email from response before sending back to client
    const commentResponse = newComment.toObject();
    delete commentResponse.email;

    await logActivity('comment', `New comment by ${name}`);

    res.status(201).json({
      status: 'success',
      data: {
        comment: commentResponse
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Toggle like on a comment
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    const incrementValue = action === 'unlike' ? -1 : 1;
    
    const comment = await Comment.findByIdAndUpdate(
      id,
      { $inc: { likes: incrementValue } },
      { new: true, runValidators: true }
    ).select('-email');

    if (!comment) {
      return res.status(404).json({ status: 'fail', message: 'Comment not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        comment
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Increment report on a comment
exports.reportComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndUpdate(
      id,
      { $inc: { reports: 1 } },
      { new: true, runValidators: true }
    ).select('-email');

    if (!comment) {
      return res.status(404).json({ status: 'fail', message: 'Comment not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Comment reported successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ADMIN ENDPOINTS

// Get all comments for admin dashboard (sort by reports then date)
exports.getAdminComments = async (req, res) => {
  try {
    // Sort so reported comments are at the top, then newest
    const comments = await Comment.find()
      .populate('post', 'title')
      .sort({ reports: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: {
        comments
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get reported comments count (for admin sidebar badge)
exports.getReportedCommentsCount = async (req, res) => {
  try {
    const count = await Comment.countDocuments({ reports: { $gt: 0 }, status: 'approved' });
    res.status(200).json({
      status: 'success',
      data: {
        count
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update comment status (hide/approve)
exports.updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'hidden'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status' });
    }

    // If approving a reported comment, optionally we could reset reports to 0, 
    // but the request was just to change visibility. We'll reset reports to 0 so it clears the warning.
    const updateData = { status };
    if (status === 'approved') {
      updateData.reports = 0;
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!comment) {
      return res.status(404).json({ status: 'fail', message: 'Comment not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        comment
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({ status: 'fail', message: 'Comment not found' });
    }

    // Also delete any replies to this comment
    await Comment.deleteMany({ replyTo: id });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
