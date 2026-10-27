const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getCalendarData
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAnalytics);
router.get('/calendar', getCalendarData);

module.exports = router;
