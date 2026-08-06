const express = require('express');
const router  = express.Router();
const { getDashboardStats, getRecentActivity, getChartData } = require('../controllers/dashboardController');
const { protect }  = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

router.get('/stats',    protect, roleAuth('librarian', 'admin'), getDashboardStats);
router.get('/activity', protect, roleAuth('librarian', 'admin'), getRecentActivity);
router.get('/charts',   protect, roleAuth('librarian', 'admin'), getChartData);

module.exports = router;
