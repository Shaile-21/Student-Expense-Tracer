const express = require('express');
const router = express.Router();
const {
  getSavingsGoals,
  createSavingsGoal,
  depositToGoal,
  withdrawFromGoal,
  updateSavingsGoal,
  deleteSavingsGoal
} = require('../controllers/savingsGoalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSavingsGoals)
  .post(createSavingsGoal);

router.post('/:id/deposit', depositToGoal);
router.post('/:id/withdraw', withdrawFromGoal);

router.route('/:id')
  .put(updateSavingsGoal)
  .delete(deleteSavingsGoal);

module.exports = router;
