const express = require('express');
const commentController = require('../controllers/commentController');
// Assuming protect is an auth middleware if admin routes need protection, 
// but since other routes might not have it strictly defined or we don't have the full auth context,
// we will just define the routes. (We can check if authController exists and has protect)
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes (Frontend)
router.get('/post/:postId', commentController.getPostComments);
router.post('/post/:postId', commentController.createComment);
router.patch('/:id/like', commentController.likeComment);
router.patch('/:id/report', commentController.reportComment);

// Admin routes (Dashboard) - no protect middleware available yet
router.get('/admin', commentController.getAdminComments);
router.get('/admin/reported-count', commentController.getReportedCommentsCount);
router.patch('/:id/status', commentController.updateCommentStatus);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
