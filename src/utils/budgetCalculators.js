/**
 * Pure calculation functions for budget operations
 */

export const calculateTotalIncome = (budget) => {
  return budget.reserves + budget.tuition + budget.fundraising;
};

export const calculateTotalExpenses = (budget) => {
  return budget.variableCosts + budget.fixedCosts;
};

export const calculateBalance = (income, expenses) => {
  return income - expenses;
};

export const isBalanced = (balance, threshold = 100) => {
  return Math.abs(balance) < threshold;
};

export const calculateNetTuition = (incomeItems) => {
  return (incomeItems.tuition || 0) - incomeItems.scholarships;
};

export const calculateStaffSalariesTotal = (expenseDetails) => {
  return expenseDetails.staffSalaries.beforeSemester +
         expenseDetails.staffSalaries.duringSemester;
};

export const calculateOtherExpensesTotal = (expenseDetails) => {
  const { rent, food, legalAccountingInsurance, suppliesSubscriptions,
          it, travel, otherOverhead } = expenseDetails.otherExpenses;
  return rent + food + legalAccountingInsurance + suppliesSubscriptions +
         it + travel + otherOverhead;
};

export const calculateDuringSemesterTotal = (duringDetails) => {
  return Object.values(duringDetails).reduce((sum, item) =>
    sum + (item.quantity * item.rate), 0
  );
};

export const calculateRentTotal = (rentDetails) => {
  return Object.values(rentDetails).reduce((sum, val) => sum + val, 0);
};

export const valuesApproximatelyEqual = (a, b, epsilon = 0.01) => {
  return Math.abs(a - b) < epsilon;
};
