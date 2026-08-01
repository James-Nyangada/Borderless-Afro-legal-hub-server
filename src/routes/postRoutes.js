const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../middlewares/authMiddleware'); // For protect/restrict

const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'editor', 'author'),
    postController.createPost
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'editor', 'author'),
    postController.updatePost
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'editor'),
    postController.deletePost
  );

module.exports = router;
