const assert = require('assert');

console.log('🧪 Running Student Expense Tracker Calculation Unit Tests...\n');

// Test 1: Remaining Budget Calculation
function calculateRemainingBudget(limit, spent) {
  return Math.max(0, limit - spent);
}

assert.strictEqual(calculateRemainingBudget(8000, 3200), 4800, 'Remaining budget should be 4800');
assert.strictEqual(calculateRemainingBudget(5000, 6000), 0, 'Remaining budget should not go below 0');
console.log('✅ Test 1 Passed: Remaining Budget Calculation');

// Test 2: Budget 80% Warning & Exceeded Alert Logic
function getBudgetAlertStatus(spent, limit, threshold = 80) {
  if (limit <= 0) return { warning: false, exceeded: false, percentage: 0 };
  const percentage = (spent / limit) * 100;
  return {
    percentage: Number(percentage.toFixed(1)),
    warning: percentage >= threshold && percentage < 100,
    exceeded: spent > limit
  };
}

const normalStatus = getBudgetAlertStatus(5000, 10000);
assert.strictEqual(normalStatus.warning, false);
assert.strictEqual(normalStatus.exceeded, false);

const warningStatus = getBudgetAlertStatus(8500, 10000);
assert.strictEqual(warningStatus.warning, true, 'Should trigger warning at 85%');
assert.strictEqual(warningStatus.exceeded, false);

const exceededStatus = getBudgetAlertStatus(10500, 10000);
assert.strictEqual(exceededStatus.exceeded, true, 'Should trigger exceeded alert at >100%');
console.log('✅ Test 2 Passed: 80% Warning & Exceeded Alert Logic');

// Test 3: Safe Daily Spending Limit Calculation
function calculateDailySpendingLimit(remainingBudget, daysLeft) {
  if (daysLeft <= 0) return 0;
  return Math.max(0, Math.floor(remainingBudget / daysLeft));
}

assert.strictEqual(calculateDailySpendingLimit(3000, 10), 300, 'Daily limit should be ₹300');
assert.strictEqual(calculateDailySpendingLimit(450, 15), 30, 'Daily limit should be ₹30');
assert.strictEqual(calculateDailySpendingLimit(0, 10), 0, 'Daily limit should be ₹0 when no budget left');
console.log('✅ Test 3 Passed: Daily Spending Limit Calculation');

// Test 4: Savings Rate Percentage
function calculateSavingsRate(income, expense) {
  if (income <= 0) return 0;
  const savings = income - expense;
  return Number(((savings / income) * 100).toFixed(1));
}

assert.strictEqual(calculateSavingsRate(10000, 7500), 25.0, 'Savings rate should be 25%');
assert.strictEqual(calculateSavingsRate(10000, 12000), -20.0, 'Negative savings rate should be -20%');
console.log('✅ Test 4 Passed: Savings Rate Calculation');

// Test 5: Days Until Next Allowance (Pocket Money Tracker)
function getDaysUntilAllowance(currentDay, allowanceDay) {
  if (currentDay === allowanceDay) return 0;
  if (currentDay < allowanceDay) return allowanceDay - currentDay;
  // Next month (approx 30 days)
  return (30 - currentDay) + allowanceDay;
}

assert.strictEqual(getDaysUntilAllowance(5, 5), 0, 'Same day should be 0 days');
assert.strictEqual(getDaysUntilAllowance(5, 10), 5, '5th to 10th should be 5 days');
assert.strictEqual(getDaysUntilAllowance(25, 1), 6, '25th to 1st next month should be 6 days');
console.log('✅ Test 5 Passed: Pocket Money Days Remaining Logic');

console.log('\n🎉 ALL CALCULATION UNIT TESTS PASSED SUCCESSFULLY!\n');
