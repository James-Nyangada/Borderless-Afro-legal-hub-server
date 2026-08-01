const express = require('express');
const pageController = require('../controllers/pageController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(pageController.getPages);

router
  .route('/:identifier')
  .get(pageController.getPageByIdentifier)
  .put(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    pageController.updatePage
  );

module.exports = router;
