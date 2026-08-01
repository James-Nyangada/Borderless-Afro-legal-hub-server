const express = require('express');
const mediaController = require('../controllers/mediaController');
const authController = require('../middlewares/authMiddleware');
const { upload } = require('../services/uploadService');

const router = express.Router();

// All media routes are protected
router.use(authController.protect);

router
  .route('/')
  .get(mediaController.getAllMedia)
  .post(
    authController.restrictTo('admin', 'editor', 'author'),
    upload.single('file'), // 'file' is the field name
    mediaController.uploadMedia
  );

router
  .route('/:id')
  .delete(
    authController.restrictTo('admin', 'editor'),
    mediaController.deleteMedia
  );

module.exports = router;
