const express = require('express');
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each key to 5 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many login attempts. Please try again after 5 minutes.'
  },
  keyGenerator: (req) => {
    return req.body.email || 'unknown';
  }
});

const router = express.Router();

router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
