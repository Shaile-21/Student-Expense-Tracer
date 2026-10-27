const express = require('express');
const router = express.Router();
const {
  getRecurringAndPocketMoney,
  createRecurring,
  toggleRecurring,
  payRecurringNow,
  deleteRecurring
} = require('../controllers/recurringController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getRecurringAndPocketMoney)
  .post(createRecurring);

router.patch('/:id/toggle', toggleRecurring);
router.post('/:id/pay', payRecurringNow);
router.delete('/:id', deleteRecurring);

module.exports = router;
