const express = require('express');
const router = express.Router();
const {
  getBudgetForMonth,
  setBudget,
  getBudgetHistory
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/history', getBudgetHistory);
router.get('/month/:month', getBudgetForMonth);
router.get('/current', (req, res, next) => {
  req.params.month = new Date().toISOString().slice(0, 7);
  return getBudgetForMonth(req, res, next);
});
router.post('/', setBudget);

module.exports = router;
