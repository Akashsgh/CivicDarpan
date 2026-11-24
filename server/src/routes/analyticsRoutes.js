const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCategoryAnalytics,
  getHotspots
} = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Analytics endpoints (available to authenticated users, authority, admin)
router.get('/summary', authenticateToken, getSummary);
router.get('/categories', authenticateToken, getCategoryAnalytics);
router.get('/hotspots', authenticateToken, getHotspots);

module.exports = router;
