import { useState, useEffect } from 'react';
import {
  INITIAL_BUDGET,
  INITIAL_INCOME_ITEMS,
  INITIAL_EXPENSE_ITEMS,
  INITIAL_EXPANDED
} from '../config/initialBudget';
import { useLocks } from './useLocks';
import { useExpenseDetails } from './useExpenseDetails';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  isBalanced as checkIsBalanced,
  calculateNetTuition,
  valuesApproximatelyEqual
} from '../utils/budgetCalculators';
import {
  redistributeEvenly,
  getIncomeRedistributionError
} from '../utils/redistributors';

export const useBudgetState = () => {
  // Core state
  const [budget, setBudget] = useState(INITIAL_BUDGET);
  const [incomeItems, setIncomeItems] = useState(INITIAL_INCOME_ITEMS);
  const [expenseItems, setExpenseItems] = useState(INITIAL_EXPENSE_ITEMS);
  const [expanded, setExpanded] = useState(INITIAL_EXPANDED);

  // Composed hooks
  const { locks, toggleLock } = useLocks();
  const {
    expenseDetails,
    setExpenseDetails,
    syncExpenseItems,
    updateOtherExpenseItem,
    updateRentDetails,
    updateStaffBeforeSemester,
    updateStaffDuringSemester: updateStaffDuringSemesterBase,
    updateDuringDetail,
    cascadeOtherExpensesChange,
    cascadeStaffSalariesChange,
    cascadeDuringSemesterChange
  } = useExpenseDetails();

  // Sync expenseItems from expenseDetails
  useEffect(() => {
    const synced = syncExpenseItems();

    setExpenseItems(prev => {
      if (valuesApproximatelyEqual(prev.staffSalaries, synced.staffSalaries) &&
          valuesApproximatelyEqual(prev.otherExpenses, synced.otherExpenses)) {
        return prev;
      }
      return synced;
    });
  }, [expenseDetails]);

  // Update budget totals when expense items change
  useEffect(() => {
    const expensesTotal = Object.values(expenseItems).reduce((sum, val) => sum + val, 0);

    setBudget(prev => {
      if (valuesApproximatelyEqual(prev.variableCosts + prev.fixedCosts, expensesTotal)) {
        return prev;
      }
      return {
        ...prev,
        variableCosts: expensesTotal,
        fixedCosts: 0
      };
    });
  }, [expenseItems]);

  // Sync budget.tuition from income sub-items
  useEffect(() => {
    const netTuition = calculateNetTuition(incomeItems);
    setBudget(prev => {
      if (valuesApproximatelyEqual(prev.tuition, netTuition)) {
        return prev;
      }
      return { ...prev, tuition: netTuition };
    });
  }, [incomeItems.tuition, incomeItems.scholarships]);

  // Sync budget.total from income sources (only when total is not locked)
  useEffect(() => {
    if (!locks.total) {
      const calculatedTotal = budget.reserves + budget.tuition + budget.fundraising;
      setBudget(prev => {
        if (valuesApproximatelyEqual(prev.total, calculatedTotal)) {
          return prev;
        }
        return { ...prev, total: calculatedTotal };
      });
    }
  }, [budget.reserves, budget.tuition, budget.fundraising, locks.total]);

  // Income update handlers
  const updateNetTuition = (netValue) => {
    if (locks.total) {
      return handleLockedTotalChange('tuition', netValue);
    }
    setBudget(prev => ({ ...prev, tuition: netValue }));
    setIncomeItems(prev => ({
      ...prev,
      tuition: netValue + prev.scholarships
    }));
  };

  const updateTuitionItem = (value) => {
    if (locks.tuition && locks.scholarships) {
      alert(
        '⚠️ Cannot change Tuition when both (Tuition - Scholarships) and Scholarships are locked.\n\n' +
        'To change Tuition:\n' +
        '1. Unlock (Tuition - Scholarships), OR\n' +
        '2. Unlock Scholarships'
      );
      return;
    }

    const newItems = { ...incomeItems, tuition: value };

    if (locks.tuition) {
      const lockedNet = budget.tuition;
      newItems.scholarships = Math.max(0, value - lockedNet);
    } else if (locks.total) {
      const newNetTuition = value - newItems.scholarships;
      return handleLockedTotalChange('tuition', newNetTuition);
    }

    setIncomeItems(newItems);
  };

  const updateScholarshipsItem = (value) => {
    if (locks.tuition && locks.tuitionItem) {
      alert(
        '⚠️ Cannot change Scholarships when both (Tuition - Scholarships) and Tuition are locked.\n\n' +
        'To change Scholarships:\n' +
        '1. Unlock (Tuition - Scholarships), OR\n' +
        '2. Unlock Tuition'
      );
      return;
    }

    const newItems = { ...incomeItems, scholarships: value };

    if (locks.tuition) {
      const lockedNet = budget.tuition;
      newItems.tuition = Math.max(0, value + lockedNet);
    } else if (locks.total) {
      const newNetTuition = newItems.tuition - value;
      return handleLockedTotalChange('tuition', newNetTuition);
    }

    setIncomeItems(newItems);
  };

  // Helper for locked total redistribution
  const handleLockedTotalChange = (component, newValue) => {
    const currentValue = budget[component];
    const diff = newValue - currentValue;

    const incomeComponents = ['reserves', 'tuition', 'fundraising'];
    const unlockedComponents = incomeComponents.filter(c =>
      c !== component && !locks[c]
    );

    if (unlockedComponents.length > 0) {
      const adjustment = diff / unlockedComponents.length;

      const canAdjust = unlockedComponents.every(c =>
        budget[c] - adjustment >= 0
      );

      if (!canAdjust) {
        alert(
          '⚠️ Cannot adjust income sources to maintain locked Total Budget.\n\n' +
          `Total Budget is locked at: $${budget.total.toLocaleString()}\n` +
          'Other unlocked income sources cannot be reduced enough to accommodate this change.\n\n' +
          'To make this change:\n' +
          '1. Unlock Total Budget, OR\n' +
          '2. Unlock more income sources to distribute the adjustment, OR\n' +
          '3. Reduce this value instead of increasing it'
        );
        return;
      }

      setBudget(prev => {
        const newBudget = { ...prev, [component]: newValue };
        unlockedComponents.forEach(c => {
          newBudget[c] = Math.max(0, prev[c] - adjustment);
        });
        return newBudget;
      });
    } else {
      const currentTotal = budget.reserves + budget.tuition + budget.fundraising;
      const newTotal = currentTotal - currentValue + newValue;

      if (!valuesApproximatelyEqual(newTotal, budget.total)) {
        alert(getIncomeRedistributionError(budget.total, newTotal));
        return;
      }

      setBudget(prev => ({ ...prev, [component]: newValue }));
    }
  };

  // Expense update handlers
  const updateExpenseItem = (item, value) => {
    const newItems = { ...expenseItems, [item]: value };

    if (locks.expenses) {
      const diff = value - expenseItems[item];
      const unlockedItems = Object.keys(expenseItems).filter(k =>
        k !== item && !locks[k]
      );

      if (unlockedItems.length > 0) {
        const redistributed = redistributeEvenly(expenseItems, unlockedItems, diff);
        Object.assign(newItems, redistributed);
      }
    }

    setExpenseItems(newItems);

    // Cascade changes to sub-items
    if (item === 'otherExpenses') {
      cascadeOtherExpensesChange(value, locks);
    } else if (item === 'staffSalaries') {
      cascadeStaffSalariesChange(value, locks);
    }
  };

  // Budget component update
  const updateBudget = (component, value) => {
    if (component === 'reserves' || component === 'tuition' || component === 'fundraising') {
      if (locks.total) {
        return handleLockedTotalChange(component, value);
      }
      setBudget(prev => ({ ...prev, [component]: value }));
    } else {
      setBudget(prev => ({ ...prev, [component]: value }));
    }
  };

  // Wrapper for updateStaffDuringSemester with cascade logic
  const updateStaffDuringSemester = (value) => {
    // First, try to cascade the change to sub-items
    cascadeDuringSemesterChange(value, locks);

    // Also need to adjust Staff Salaries total and potentially Before Semester
    const currentStaffTotal = expenseDetails.staffSalaries.beforeSemester + expenseDetails.staffSalaries.duringSemester;
    const newStaffTotal = expenseDetails.staffSalaries.beforeSemester + value;

    // Check if we need to adjust Before Semester to maintain Staff Salaries total
    if (!locks.staffSalaries && locks.beforeSemester && !locks.duringSemester) {
      // Staff Salaries can change freely
      return;
    }

    if (locks.staffSalaries && !locks.beforeSemester) {
      // Need to adjust Before Semester to maintain Staff Salaries total
      const diff = value - expenseDetails.staffSalaries.duringSemester;
      const newBeforeSemester = expenseDetails.staffSalaries.beforeSemester - diff;

      if (newBeforeSemester < 0) {
        alert(
          '⚠️ Cannot adjust During Semester\n\n' +
          'Staff Salaries is locked and Before Semester cannot go negative.\n\n' +
          'To change During Semester:\n' +
          '1. Unlock Staff Salaries, OR\n' +
          '2. Reduce During Semester instead of increasing it'
        );
        return;
      }

      updateStaffBeforeSemester(newBeforeSemester);
    }
  };

  // Expanded state
  const toggleExpanded = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate derived values
  const income = calculateTotalIncome(budget);
  const expenses = calculateTotalExpenses(budget);
  const balance = calculateBalance(income, expenses);
  const isBalanced = checkIsBalanced(balance);

  return {
    budget,
    incomeItems,
    expenseItems,
    expenseDetails,
    locks,
    expanded,
    income,
    expenses,
    balance,
    isBalanced,
    updateNetTuition,
    updateTuitionItem,
    updateScholarshipsItem,
    updateExpenseItem,
    updateOtherExpenseItem,
    updateRentDetails,
    updateStaffBeforeSemester,
    updateStaffDuringSemester,
    updateDuringDetail,
    updateBudget,
    toggleLock,
    toggleExpanded,
    setExpenseItems,
    setExpenseDetails
  };
};
