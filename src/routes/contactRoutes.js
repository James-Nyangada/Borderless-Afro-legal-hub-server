const express = require('express');
const contactController = require('../controllers/contactController');
const authController = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .post(contactController.submitContact) // Public
  .get(
    authController.protect,
    authController.restrictTo('admin', 'editor'),
    contactController.getAllSubmissions
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'editor'),
    contactController.updateSubmissionStatus
  );

module.exports = router;
