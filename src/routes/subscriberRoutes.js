const express = require('express');
const subscriberController = require('../controllers/subscriberController');
const authController = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .post(subscriberController.subscribe) // Public
  .get(
    authController.protect,
    authController.restrictTo('admin', 'editor'),
    subscriberController.getAllSubscribers
  );

router.post('/unsubscribe', subscriberController.unsubscribe); // Public

module.exports = router;
