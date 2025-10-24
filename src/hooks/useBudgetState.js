import { useState, useEffect, useRef } from 'react';
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

  // Update source tracking to prevent infinite loops
  const updateSourceRef = useRef(null);

  // Composed hooks
  const { locks, toggleLock } = useLocks();
  const {
    expenseDetails,
    setExpenseDetails,
    syncExpenseItems,
    updateOtherExpenseItem: updateOtherExpenseItemBase,
    updateRentDetails: updateRentDetailsBase,
    updateStaffBeforeSemester: updateStaffBeforeSemesterBase,
    updateStaffDuringSemester: updateStaffDuringSemesterBase,
    updateDuringDetail: updateDuringDetailBase,
    cascadeOtherExpensesChange,
    cascadeStaffSalariesChange,
    cascadeDuringSemesterChange
  } = useExpenseDetails(expenseItems, locks);

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
    if (updateSourceRef.current !== 'tuitionCascade') {
      const netTuition = calculateNetTuition(incomeItems);
      setBudget(prev => {
        if (valuesApproximatelyEqual(prev.tuition, netTuition)) {
          return prev;
        }
        return { ...prev, tuition: netTuition };
      });
    }
  }, [incomeItems.tuition, incomeItems.scholarships]);

  // Cascade budget.tuition changes to sub-items when it changes (from ANY source)
  useEffect(() => {
    const currentNet = calculateNetTuition(incomeItems);
    const newNet = budget.tuition;

    // Only cascade if net tuition changed and it's not from sub-items updating it
    if (!valuesApproximatelyEqual(currentNet, newNet) && updateSourceRef.current !== 'tuitionSubItemsUpdated') {
      const diff = newNet - currentNet;

      // Determine which sub-items to adjust
      const unlockedSubItems = [];
      if (!locks.tuitionItem) unlockedSubItems.push('tuition');
      if (!locks.scholarships) unlockedSubItems.push('scholarships');

      if (unlockedSubItems.length > 0) {
        setIncomeItems(prev => {
          const newItems = { ...prev };

          if (unlockedSubItems.length === 2) {
            // Both unlocked: distribute proportionally
            const currentTuition = prev.tuition || 0;
            const currentScholarships = prev.scholarships || 0;

            if (currentTuition + currentScholarships > 0) {
              const tuitionProportion = currentTuition / (currentTuition + currentScholarships);
              const scholarshipProportion = 1 - tuitionProportion;

              newItems.tuition = Math.max(0, currentTuition + (diff * tuitionProportion));
              newItems.scholarships = Math.max(0, currentScholarships - (diff * scholarshipProportion));
            } else {
              // Start from scratch: set tuition to net value
              newItems.tuition = Math.max(0, newNet);
              newItems.scholarships = 0;
            }
          } else if (unlockedSubItems.includes('tuition')) {
            // Only tuition unlocked: adjust tuition, keep scholarships same
            newItems.tuition = Math.max(0, newNet + prev.scholarships);
          } else if (unlockedSubItems.includes('scholarships')) {
            // Only scholarships unlocked: adjust scholarships inversely
            newItems.scholarships = Math.max(0, prev.tuition - newNet);
          }

          updateSourceRef.current = 'tuitionSubItemsUpdated';
          return newItems;
        });
      }
    }

    // Clear flag after processing
    if (updateSourceRef.current === 'tuitionSubItemsUpdated') {
      updateSourceRef.current = null;
    }
  }, [budget.tuition, locks.tuitionItem, locks.scholarships, incomeItems.tuition, incomeItems.scholarships]);

  // Sync budget.total from income sources (only when total is not locked)
  useEffect(() => {
    if (!locks.total && updateSourceRef.current !== 'totalBudget') {
      const calculatedTotal = budget.reserves + budget.tuition + budget.fundraising;
      setBudget(prev => {
        if (valuesApproximatelyEqual(prev.total, calculatedTotal)) {
          return prev;
        }
        updateSourceRef.current = 'incomeToTotal';
        return { ...prev, total: calculatedTotal };
      });
    }
    // Clear the flag after effect runs
    if (updateSourceRef.current === 'incomeToTotal') {
      updateSourceRef.current = null;
    }
  }, [budget.reserves, budget.tuition, budget.fundraising, locks.total]);

  // Cascade total budget changes to unlocked income sources
  useEffect(() => {
    if (updateSourceRef.current === 'totalBudgetChanged') {
      const currentIncome = budget.reserves + budget.tuition + budget.fundraising;
      const diff = budget.total - currentIncome;

      if (!valuesApproximatelyEqual(diff, 0)) {
        const incomeComponents = ['reserves', 'tuition', 'fundraising'];
        const unlockedComponents = incomeComponents.filter(c => !locks[c]);

        if (unlockedComponents.length > 0) {
          // Calculate proportional distribution based on current values
          const unlockedTotal = unlockedComponents.reduce((sum, c) => sum + budget[c], 0);

          setBudget(prev => {
            const newBudget = { ...prev };

            if (unlockedTotal > 0) {
              // Distribute proportionally to current values
              unlockedComponents.forEach(c => {
                const proportion = prev[c] / unlockedTotal;
                newBudget[c] = Math.max(0, prev[c] + (diff * proportion));
              });
            } else {
              // Equal distribution if all unlocked are zero
              const adjustment = diff / unlockedComponents.length;
              unlockedComponents.forEach(c => {
                newBudget[c] = Math.max(0, adjustment);
              });
            }

            updateSourceRef.current = 'totalBudget';
            return newBudget;
          });
        }
      }

      // Clear flag after cascade
      if (updateSourceRef.current === 'totalBudget') {
        updateSourceRef.current = null;
      }
    }
  }, [budget.total, locks.reserves, locks.tuition, locks.fundraising]);

  // Income update handlers
  const updateNetTuition = (netValue) => {
    if (locks.total) {
      return handleLockedTotalChange('tuition', netValue);
    }

    const currentNet = budget.tuition;
    const diff = netValue - currentNet;

    // Update budget.tuition
    setBudget(prev => ({ ...prev, tuition: netValue }));

    // Cascade to sub-items if unlocked
    const unlockedSubItems = [];
    if (!locks.tuitionItem) unlockedSubItems.push('tuition');
    if (!locks.scholarships) unlockedSubItems.push('scholarships');

    if (unlockedSubItems.length > 0 && Math.abs(diff) > 0.01) {
      setIncomeItems(prev => {
        const newItems = { ...prev };

        if (unlockedSubItems.length === 2) {
          // Both unlocked: distribute proportionally
          const currentTuition = prev.tuition || 0;
          const currentScholarships = prev.scholarships || 0;
          const subItemsTotal = currentTuition - currentScholarships;

          if (subItemsTotal > 0) {
            const tuitionProportion = currentTuition / (currentTuition + currentScholarships);
            newItems.tuition = Math.max(0, currentTuition + (diff * tuitionProportion));
            // Scholarships decreases when net increases (inverse relationship)
            newItems.scholarships = Math.max(0, newItems.tuition - netValue);
          } else {
            // Start from scratch: set tuition to net value
            newItems.tuition = Math.max(0, netValue);
            newItems.scholarships = 0;
          }
        } else if (unlockedSubItems.includes('tuition')) {
          // Only tuition unlocked: adjust tuition, keep scholarships same
          newItems.tuition = Math.max(0, netValue + prev.scholarships);
        } else if (unlockedSubItems.includes('scholarships')) {
          // Only scholarships unlocked: adjust scholarships inversely
          const currentScholarships = prev.scholarships || 0;
          newItems.scholarships = Math.max(0, currentScholarships - diff);
        }

        return newItems;
      });
    } else {
      // All locked: just maintain the relationship
      setIncomeItems(prev => ({
        ...prev,
        tuition: netValue + prev.scholarships
      }));
    }
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
    if (component === 'total') {
      // Mark that this is a manual total budget change
      updateSourceRef.current = 'totalBudgetChanged';
      setBudget(prev => ({ ...prev, total: value }));
    } else if (component === 'reserves' || component === 'tuition' || component === 'fundraising') {
      if (locks.total) {
        return handleLockedTotalChange(component, value);
      }
      setBudget(prev => ({ ...prev, [component]: value }));
    } else {
      setBudget(prev => ({ ...prev, [component]: value }));
    }
  };

  // Wrapper functions that pass locks to base functions
  const updateOtherExpenseItem = (itemKey, value) => {
    updateOtherExpenseItemBase(itemKey, value, locks);
  };

  const updateRentDetails = (rentKey, value) => {
    updateRentDetailsBase(rentKey, value, locks);
  };

  const updateStaffBeforeSemester = (value) => {
    updateStaffBeforeSemesterBase(value, locks);
  };

  const updateStaffDuringSemester = (value) => {
    updateStaffDuringSemesterBase(value, locks);
  };

  const updateDuringDetail = (role, detail) => {
    updateDuringDetailBase(role, detail, locks);
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
