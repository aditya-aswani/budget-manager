import { useState, useEffect } from 'react';
import { INITIAL_EXPENSE_DETAILS } from '../config/initialBudget';
import {
  calculateStaffSalariesTotal,
  calculateOtherExpensesTotal,
  calculateDuringSemesterTotal,
  calculateRentTotal,
  valuesApproximatelyEqual
} from '../utils/budgetCalculators';
import { redistributeProportionally } from '../utils/redistributors';

export const useExpenseDetails = (expenseItems) => {
  const [expenseDetails, setExpenseDetails] = useState(INITIAL_EXPENSE_DETAILS);

  // Sync expenseItems from expenseDetails (for consistency)
  const syncExpenseItems = () => {
    const staffSalariesTotal = calculateStaffSalariesTotal(expenseDetails);
    const otherExpensesTotal = calculateOtherExpensesTotal(expenseDetails);

    return {
      staffSalaries: staffSalariesTotal,
      otherExpenses: otherExpensesTotal
    };
  };

  // Update handlers
  const updateOtherExpenseItem = (itemKey, value) => {
    setExpenseDetails(prev => ({
      ...prev,
      otherExpenses: {
        ...prev.otherExpenses,
        [itemKey]: value
      }
    }));
  };

  const updateRentDetails = (newRentDetails) => {
    setExpenseDetails(prev => ({
      ...prev,
      otherExpenses: {
        ...prev.otherExpenses,
        rentDetails: newRentDetails
      }
    }));
  };

  const updateStaffBeforeSemester = (value) => {
    setExpenseDetails(prev => ({
      ...prev,
      staffSalaries: {
        ...prev.staffSalaries,
        beforeSemester: value
      }
    }));
  };

  const updateStaffDuringSemester = (value) => {
    setExpenseDetails(prev => ({
      ...prev,
      staffSalaries: {
        ...prev.staffSalaries,
        duringSemester: value
      }
    }));
  };

  const updateDuringDetail = (role, detail) => {
    setExpenseDetails(prev => {
      const newDetails = {
        ...prev.staffSalaries.duringDetails,
        [role]: detail
      };

      // Recalculate duringSemester total from sub-items
      const newDuringSemesterTotal = Object.values(newDetails).reduce(
        (sum, item) => sum + (item.quantity * item.rate),
        0
      );

      return {
        ...prev,
        staffSalaries: {
          ...prev.staffSalaries,
          duringDetails: newDetails,
          duringSemester: newDuringSemesterTotal
        }
      };
    });
  };

  // Cascade handlers - redistribute sub-items when main slider moves
  const cascadeOtherExpensesChange = (newTotal, locks = {}) => {
    setExpenseDetails(prev => {
      const currentTotal = calculateOtherExpensesTotal(prev);

      if (valuesApproximatelyEqual(currentTotal, newTotal)) {
        return prev;
      }

      const diff = newTotal - currentTotal;
      const otherExpenses = prev.otherExpenses;

      // Get all sub-item keys (excluding rentDetails which is nested)
      const subItemKeys = Object.keys(otherExpenses).filter(k => k !== 'rentDetails');
      const unlockedKeys = subItemKeys.filter(k => !locks[k]);

      if (unlockedKeys.length === 0) {
        return prev; // Can't redistribute if all items are locked
      }

      // Redistribute proportionally among unlocked items
      const currentSubTotal = subItemKeys.reduce((sum, k) => sum + otherExpenses[k], 0);
      const redistributed = redistributeProportionally(otherExpenses, unlockedKeys, diff);

      return {
        ...prev,
        otherExpenses: redistributed
      };
    });
  };

  const cascadeStaffSalariesChange = (newTotal, locks = {}) => {
    setExpenseDetails(prev => {
      const currentTotal = calculateStaffSalariesTotal(prev);

      if (valuesApproximatelyEqual(currentTotal, newTotal)) {
        return prev;
      }

      const diff = newTotal - currentTotal;
      const staffSalaries = prev.staffSalaries;

      // Check if beforeSemester and duringSemester are locked
      const unlockedItems = [];
      if (!locks.beforeSemester) unlockedItems.push('beforeSemester');
      if (!locks.duringSemester) unlockedItems.push('duringSemester');

      if (unlockedItems.length === 0) {
        return prev; // Can't redistribute if both are locked
      }

      // Redistribute proportionally
      const items = {
        beforeSemester: staffSalaries.beforeSemester,
        duringSemester: staffSalaries.duringSemester
      };
      const redistributed = redistributeProportionally(items, unlockedItems, diff);

      return {
        ...prev,
        staffSalaries: {
          ...prev.staffSalaries,
          beforeSemester: redistributed.beforeSemester,
          duringSemester: redistributed.duringSemester
        }
      };
    });
  };

  const cascadeDuringSemesterChange = (newTotal, locks = {}) => {
    setExpenseDetails(prev => {
      const currentTotal = calculateDuringSemesterTotal(prev.staffSalaries.duringDetails);

      if (valuesApproximatelyEqual(currentTotal, newTotal)) {
        return prev;
      }

      const diff = newTotal - currentTotal;
      const duringDetails = prev.staffSalaries.duringDetails;

      // Get unlocked roles
      const allRoles = Object.keys(duringDetails);
      const unlockedRoles = allRoles.filter(role => !locks[role]);

      if (unlockedRoles.length === 0) {
        alert(
          '⚠️ Cannot adjust During Semester\n\n' +
          'All sub-items are locked. To change During Semester:\n' +
          '1. Unlock at least one sub-item'
        );
        return prev;
      }

      // Calculate current totals for each role
      const roleTotals = {};
      allRoles.forEach(role => {
        roleTotals[role] = duringDetails[role].quantity * duringDetails[role].rate;
      });

      // Redistribute proportionally among unlocked roles
      const redistributedTotals = redistributeProportionally(roleTotals, unlockedRoles, diff);

      // Convert back to quantity/rate
      const newDetails = { ...duringDetails };
      unlockedRoles.forEach(role => {
        const newTotal = redistributedTotals[role];
        const rate = duringDetails[role].rate;
        newDetails[role] = {
          ...duringDetails[role],
          quantity: rate > 0 ? Math.round(newTotal / rate) : 0
        };
      });

      return {
        ...prev,
        staffSalaries: {
          ...prev.staffSalaries,
          duringDetails: newDetails,
          duringSemester: newTotal
        }
      };
    });
  };

  return {
    expenseDetails,
    setExpenseDetails,
    syncExpenseItems,
    updateOtherExpenseItem,
    updateRentDetails,
    updateStaffBeforeSemester,
    updateStaffDuringSemester,
    updateDuringDetail,
    cascadeOtherExpensesChange,
    cascadeStaffSalariesChange,
    cascadeDuringSemesterChange
  };
};
