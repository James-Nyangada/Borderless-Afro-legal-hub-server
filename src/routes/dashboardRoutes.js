const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', dashboardController.getDashboardData);
router.get('/activities', dashboardController.getAllActivities);

module.exports = router;
