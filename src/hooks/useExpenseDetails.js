import { useState, useEffect, useRef } from 'react';
import { INITIAL_EXPENSE_DETAILS } from '../config/initialBudget';
import {
  calculateStaffSalariesTotal,
  calculateOtherExpensesTotal,
  calculateDuringSemesterTotal,
  calculateRentTotal,
  valuesApproximatelyEqual
} from '../utils/budgetCalculators';
import { redistributeProportionally } from '../utils/redistributors';

export const useExpenseDetails = (expenseItems, locks = {}) => {
  const [expenseDetails, setExpenseDetails] = useState(INITIAL_EXPENSE_DETAILS);

  // Update source tracking to prevent infinite loops
  const updateSourceRef = useRef(null);

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
  const updateOtherExpenseItem = (itemKey, value, locks = {}) => {
    const currentValue = expenseDetails.otherExpenses[itemKey];
    const diff = value - currentValue;

    // If Other Expenses is locked, adjust other unlocked sub-items inversely
    if (locks.otherExpenses) {
      const allKeys = Object.keys(expenseDetails.otherExpenses).filter(k => k !== 'rentDetails');
      const unlockedKeys = allKeys.filter(k => k !== itemKey && !locks[k]);

      if (unlockedKeys.length === 0) {
        alert(
          '⚠️ Cannot change ' + itemKey + ' when Other Expenses is locked and all other items are locked.\n\n' +
          'To make this change:\n' +
          '1. Unlock Other Expenses, OR\n' +
          '2. Unlock another expense item to allow redistribution'
        );
        return;
      }

      // Check if redistribution is possible
      const unlockedTotal = unlockedKeys.reduce((sum, k) => sum + expenseDetails.otherExpenses[k], 0);

      setExpenseDetails(prev => {
        const newExpenses = { ...prev.otherExpenses, [itemKey]: value };

        // Redistribute inversely among unlocked items
        unlockedKeys.forEach(k => {
          const proportion = unlockedTotal > 0 ? prev.otherExpenses[k] / unlockedTotal : 1 / unlockedKeys.length;
          const adjustment = diff * proportion;
          newExpenses[k] = Math.max(0, prev.otherExpenses[k] - adjustment);
        });

        return {
          ...prev,
          otherExpenses: newExpenses
        };
      });
    } else {
      setExpenseDetails(prev => ({
        ...prev,
        otherExpenses: {
          ...prev.otherExpenses,
          [itemKey]: value
        }
      }));
    }
  };

  const updateRentDetails = (rentKey, value, locks = {}) => {
    const currentValue = expenseDetails.otherExpenses.rentDetails[rentKey];
    const diff = value - currentValue;

    // If Rent is locked, adjust other unlocked rent sub-items inversely
    if (locks.rent) {
      const allKeys = Object.keys(expenseDetails.otherExpenses.rentDetails);
      const unlockedKeys = allKeys.filter(k => k !== rentKey && !locks[k]);

      if (unlockedKeys.length === 0) {
        alert(
          '⚠️ Cannot change ' + rentKey + ' when Rent is locked and all other rent items are locked.\n\n' +
          'To make this change:\n' +
          '1. Unlock Rent, OR\n' +
          '2. Unlock another rent item to allow redistribution'
        );
        return;
      }

      // Validation: Check if the change is possible given the locked Rent total
      const lockedRentTotal = expenseDetails.otherExpenses.rent;
      const otherItemsTotal = allKeys
        .filter(k => k !== rentKey)
        .reduce((sum, k) => sum + expenseDetails.otherExpenses.rentDetails[k], 0);

      const maxPossibleForThisItem = lockedRentTotal - otherItemsTotal + currentValue;

      if (value > maxPossibleForThisItem) {
        alert(
          '⚠️ Cannot increase ' + rentKey + ' to $' + value.toLocaleString() + '\n\n' +
          'Rent is locked at: $' + lockedRentTotal.toLocaleString() + '\n' +
          'Maximum possible for ' + rentKey + ': $' + Math.max(0, maxPossibleForThisItem).toLocaleString() + '\n\n' +
          'Other unlocked items cannot be reduced enough to accommodate this change.\n\n' +
          'To make this change:\n' +
          '1. Unlock Rent, OR\n' +
          '2. Reduce this value, OR\n' +
          '3. Unlock more items to allow redistribution'
        );
        return;
      }

      // Validate that redistribution won't make any unlocked items negative
      const unlockedTotal = unlockedKeys.reduce((sum, k) => sum + expenseDetails.otherExpenses.rentDetails[k], 0);

      if (diff > unlockedTotal) {
        alert(
          '⚠️ Cannot adjust ' + rentKey + ' by $' + diff.toLocaleString() + '\n\n' +
          'Rent is locked at: $' + expenseDetails.otherExpenses.rent.toLocaleString() + '\n' +
          'Total available in other unlocked items: $' + unlockedTotal.toLocaleString() + '\n\n' +
          'Other unlocked items cannot be reduced enough to accommodate this change.\n\n' +
          'To make this change:\n' +
          '1. Unlock Rent, OR\n' +
          '2. Reduce this value, OR\n' +
          '3. Unlock more items to allow redistribution'
        );
        return;
      }

      setExpenseDetails(prev => {
        const newRentDetails = { ...prev.otherExpenses.rentDetails, [rentKey]: value };

        // Redistribute inversely among unlocked rent items
        unlockedKeys.forEach(k => {
          const proportion = unlockedTotal > 0 ? prev.otherExpenses.rentDetails[k] / unlockedTotal : 1 / unlockedKeys.length;
          const adjustment = diff * proportion;
          newRentDetails[k] = Math.max(0, prev.otherExpenses.rentDetails[k] - adjustment);
        });

        // Recalculate rent total (should stay the same since locked)
        const newRentTotal = calculateRentTotal(newRentDetails);

        return {
          ...prev,
          otherExpenses: {
            ...prev.otherExpenses,
            rent: newRentTotal,
            rentDetails: newRentDetails
          }
        };
      });
    } else {
      // Rent is unlocked - update sub-item and recalculate rent total
      setExpenseDetails(prev => {
        const newRentDetails = {
          ...prev.otherExpenses.rentDetails,
          [rentKey]: value
        };
        const newRentTotal = calculateRentTotal(newRentDetails);

        return {
          ...prev,
          otherExpenses: {
            ...prev.otherExpenses,
            rent: newRentTotal,
            rentDetails: newRentDetails
          }
        };
      });
    }
  };

  const updateStaffBeforeSemester = (value, locks = {}) => {
    // Check if we can make this change
    if (locks.staffSalaries && locks.duringSemester) {
      alert(
        '⚠️ Cannot change Before Semester when both Staff Salaries and During Semester are locked.\n\n' +
        'To change Before Semester:\n' +
        '1. Unlock Staff Salaries, OR\n' +
        '2. Unlock During Semester'
      );
      return;
    }

    const currentBefore = expenseDetails.staffSalaries.beforeSemester;
    const diff = value - currentBefore;

    // If Staff Salaries is locked, adjust During Semester inversely
    if (locks.staffSalaries && !locks.duringSemester) {
      const newDuring = expenseDetails.staffSalaries.duringSemester - diff;

      if (newDuring < 0) {
        alert(
          '⚠️ Cannot adjust Before Semester\n\n' +
          'Staff Salaries is locked and During Semester cannot go negative.\n\n' +
          'To change Before Semester:\n' +
          '1. Unlock Staff Salaries, OR\n' +
          '2. Reduce Before Semester instead of increasing it'
        );
        return;
      }

      // Mark that During Semester is changing (so it cascades to sub-items)
      updateSourceRef.current = 'duringSemesterChanged';

      setExpenseDetails(prev => ({
        ...prev,
        staffSalaries: {
          ...prev.staffSalaries,
          beforeSemester: value,
          duringSemester: newDuring
        }
      }));
    } else {
      setExpenseDetails(prev => ({
        ...prev,
        staffSalaries: {
          ...prev.staffSalaries,
          beforeSemester: value
        }
      }));
    }
  };

  const updateStaffDuringSemester = (value, locks = {}) => {
    // Check if we can make this change
    if (locks.staffSalaries && locks.beforeSemester) {
      alert(
        '⚠️ Cannot change During Semester when both Staff Salaries and Before Semester are locked.\n\n' +
        'To change During Semester:\n' +
        '1. Unlock Staff Salaries, OR\n' +
        '2. Unlock Before Semester'
      );
      return;
    }

    const currentDuring = expenseDetails.staffSalaries.duringSemester;
    const diff = value - currentDuring;

    // Mark update source
    updateSourceRef.current = 'duringSemesterChanged';

    // If Staff Salaries is locked, adjust Before Semester inversely
    if (locks.staffSalaries && !locks.beforeSemester) {
      const newBefore = expenseDetails.staffSalaries.beforeSemester - diff;

      if (newBefore < 0) {
        alert(
          '⚠️ Cannot adjust During Semester\n\n' +
          'Staff Salaries is locked and Before Semester cannot go negative.\n\n' +
          'To change During Semester:\n' +
          '1. Unlock Staff Salaries, OR\n' +
          '2. Reduce During Semester instead of increasing it'
        );
        return;
      }

      setExpenseDetails(prev => ({
        ...prev,
        staffSalaries: {
          ...prev.staffSalaries,
          beforeSemester: newBefore,
          duringSemester: value
        }
      }));
    } else {
      setExpenseDetails(prev => ({
        ...prev,
        staffSalaries: {
          ...prev.staffSalaries,
          duringSemester: value
        }
      }));
    }
  };

  const updateDuringDetail = (role, detail, locks = {}) => {
    const currentRoleTotal = expenseDetails.staffSalaries.duringDetails[role].quantity * expenseDetails.staffSalaries.duringDetails[role].rate;
    const newRoleTotal = detail.quantity * detail.rate;
    const diff = newRoleTotal - currentRoleTotal;

    // Get all roles and unlocked roles for redistribution
    const allRoles = Object.keys(expenseDetails.staffSalaries.duringDetails);
    const unlockedRoles = allRoles.filter(r => r !== role && !locks[r]);

    if (unlockedRoles.length === 0) {
      alert(
        '⚠️ Cannot change ' + role + ' when all other During Semester items are locked.\n\n' +
        'To make this change:\n' +
        'Unlock at least one other During Semester item to allow redistribution'
      );
      return;
    }

    // If During Semester is locked, we MUST maintain its exact value
    if (locks.duringSemester) {
      // Check if the change is possible given the locked During Semester total
      const lockedDuringSemesterTotal = expenseDetails.staffSalaries.duringSemester;
      const otherRolesTotal = allRoles
        .filter(r => r !== role)
        .reduce((sum, r) => sum + (expenseDetails.staffSalaries.duringDetails[r].quantity * expenseDetails.staffSalaries.duringDetails[r].rate), 0);

      const maxPossibleForThisRole = lockedDuringSemesterTotal - otherRolesTotal + currentRoleTotal;

      if (newRoleTotal > maxPossibleForThisRole) {
        alert(
          '⚠️ Cannot increase ' + role + ' to $' + newRoleTotal.toLocaleString() + '\n\n' +
          'During Semester is locked at: $' + lockedDuringSemesterTotal.toLocaleString() + '\n' +
          'Maximum possible for ' + role + ': $' + Math.max(0, maxPossibleForThisRole).toLocaleString() + '\n\n' +
          'Other unlocked items cannot be reduced enough to accommodate this change.\n\n' +
          'To make this change:\n' +
          '1. Unlock During Semester, OR\n' +
          '2. Reduce this value, OR\n' +
          '3. Unlock more items to allow redistribution'
        );
        return;
      }

      // Validate that redistribution won't make any unlocked items negative
      const unlockedTotal = unlockedRoles.reduce((sum, r) => {
        return sum + (expenseDetails.staffSalaries.duringDetails[r].quantity * expenseDetails.staffSalaries.duringDetails[r].rate);
      }, 0);

      if (diff > unlockedTotal) {
        alert(
          '⚠️ Cannot adjust ' + role + ' by $' + diff.toLocaleString() + '\n\n' +
          'During Semester is locked at: $' + lockedDuringSemesterTotal.toLocaleString() + '\n' +
          'Total available in other unlocked items: $' + unlockedTotal.toLocaleString() + '\n\n' +
          'Other unlocked items cannot be reduced enough to accommodate this change.\n\n' +
          'To make this change:\n' +
          '1. Unlock During Semester, OR\n' +
          '2. Reduce this value, OR\n' +
          '3. Unlock more items to allow redistribution'
        );
        return;
      }

      // Redistribute inversely among unlocked roles to maintain locked During Semester total
      setExpenseDetails(prev => {
        const newDetails = { ...prev.staffSalaries.duringDetails, [role]: detail };

        const unlockedTotal = unlockedRoles.reduce((sum, r) => {
          return sum + (prev.staffSalaries.duringDetails[r].quantity * prev.staffSalaries.duringDetails[r].rate);
        }, 0);

        unlockedRoles.forEach(r => {
          const roleTotal = prev.staffSalaries.duringDetails[r].quantity * prev.staffSalaries.duringDetails[r].rate;
          const proportion = unlockedTotal > 0 ? roleTotal / unlockedTotal : 1 / unlockedRoles.length;
          const adjustment = diff * proportion;
          const newTotal = Math.max(0, roleTotal - adjustment);
          const rate = prev.staffSalaries.duringDetails[r].rate;

          newDetails[r] = {
            ...prev.staffSalaries.duringDetails[r],
            quantity: rate > 0 ? Math.max(0, Number((newTotal / rate).toFixed(2))) : 0
          };
        });

        // During Semester stays locked at its current value
        return {
          ...prev,
          staffSalaries: {
            ...prev.staffSalaries,
            duringDetails: newDetails
            // DON'T update duringSemester - it's locked!
          }
        };
      });
      return;
    }

    // During Semester is unlocked - update normally
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

      // If Staff Salaries is locked, adjust Before Semester to maintain the constraint
      let newBeforeSemester = prev.staffSalaries.beforeSemester;

      if (locks.staffSalaries && !locks.beforeSemester) {
        const duringSemesterDiff = newDuringSemesterTotal - prev.staffSalaries.duringSemester;
        newBeforeSemester = Math.max(0, prev.staffSalaries.beforeSemester - duringSemesterDiff);
      }

      return {
        ...prev,
        staffSalaries: {
          ...prev.staffSalaries,
          duringDetails: newDetails,
          duringSemester: newDuringSemesterTotal,
          beforeSemester: newBeforeSemester
        }
      };
    });
  };

  // Cascade handlers - redistribute sub-items when main slider moves
  const cascadeOtherExpensesChange = (newTotal, locks = {}) => {
    // Check which items are unlocked
    const allKeys = Object.keys(expenseDetails.otherExpenses).filter(k => k !== 'rentDetails');
    const unlockedKeys = allKeys.filter(k => !locks[k]);

    if (unlockedKeys.length === 0) {
      alert(
        '⚠️ Cannot change Other Expenses when all sub-items are locked.\n\n' +
        'To change Other Expenses:\n' +
        'Unlock at least one sub-item (Rent, Food, etc.)'
      );
      return;
    }

    // Mark that this is an Other Expenses change
    updateSourceRef.current = 'otherExpensesChanged';

    setExpenseDetails(prev => {
      const currentTotal = calculateOtherExpensesTotal(prev);

      if (valuesApproximatelyEqual(currentTotal, newTotal)) {
        return prev;
      }

      const diff = newTotal - currentTotal;
      const otherExpenses = prev.otherExpenses;

      // Redistribute proportionally among unlocked items
      const redistributed = redistributeProportionally(otherExpenses, unlockedKeys, diff);

      return {
        ...prev,
        otherExpenses: redistributed
      };
    });
  };

  const cascadeStaffSalariesChange = (newTotal, locks = {}) => {
    // Check which items are unlocked
    const unlockedItems = [];
    if (!locks.beforeSemester) unlockedItems.push('beforeSemester');
    if (!locks.duringSemester) unlockedItems.push('duringSemester');

    if (unlockedItems.length === 0) {
      alert(
        '⚠️ Cannot change Staff Salaries when both Before Semester and During Semester are locked.\n\n' +
        'To change Staff Salaries:\n' +
        '1. Unlock Before Semester, OR\n' +
        '2. Unlock During Semester'
      );
      return;
    }

    // Mark that this is a Staff Salaries change
    updateSourceRef.current = 'staffSalariesChanged';

    setExpenseDetails(prev => {
      const currentTotal = calculateStaffSalariesTotal(prev);

      if (valuesApproximatelyEqual(currentTotal, newTotal)) {
        return prev;
      }

      const diff = newTotal - currentTotal;
      const staffSalaries = prev.staffSalaries;

      // Redistribute proportionally among unlocked items
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

      // Convert back to quantity/rate (allow decimals, round to 2 places)
      const newDetails = { ...duringDetails };
      unlockedRoles.forEach(role => {
        const newTotal = redistributedTotals[role];
        const rate = duringDetails[role].rate;
        newDetails[role] = {
          ...duringDetails[role],
          quantity: rate > 0 ? Math.max(0, Number((newTotal / rate).toFixed(2))) : 0
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

  // Effect: Cascade During Semester changes to sub-items when it changes
  useEffect(() => {
    // Only cascade when During Semester changes from Staff Salaries or manual change
    if (updateSourceRef.current === 'staffSalariesChanged' || updateSourceRef.current === 'duringSemesterChanged') {
      const currentDuring = expenseDetails.staffSalaries.duringSemester;
      const currentSubItemsTotal = calculateDuringSemesterTotal(expenseDetails.staffSalaries.duringDetails);

      if (!valuesApproximatelyEqual(currentDuring, currentSubItemsTotal)) {
        const diff = currentDuring - currentSubItemsTotal;
        const duringDetails = expenseDetails.staffSalaries.duringDetails;
        const allRoles = Object.keys(duringDetails);

        // Only redistribute to unlocked roles
        const unlockedRoles = allRoles.filter(role => !locks[role]);

        if (unlockedRoles.length > 0) {
          const roleTotals = {};
          allRoles.forEach(role => {
            roleTotals[role] = duringDetails[role].quantity * duringDetails[role].rate;
          });

          const redistributedTotals = redistributeProportionally(roleTotals, unlockedRoles, diff);

          const newDetails = { ...duringDetails };
          unlockedRoles.forEach(role => {
            const newTotal = redistributedTotals[role];
            const rate = duringDetails[role].rate;
            newDetails[role] = {
              ...duringDetails[role],
              quantity: rate > 0 ? Math.max(0, Number((newTotal / rate).toFixed(2))) : 0
            };
          });

          setExpenseDetails(prev => ({
            ...prev,
            staffSalaries: {
              ...prev.staffSalaries,
              duringDetails: newDetails
            }
          }));
        }
      }

      // Clear the flag
      updateSourceRef.current = null;
    }
  }, [expenseDetails.staffSalaries.duringSemester, locks]);

  // Effect: Cascade Other Expenses changes to sub-items when it changes
  useEffect(() => {
    if (updateSourceRef.current === 'otherExpensesChanged') {
      const currentOtherExpenses = calculateOtherExpensesTotal(expenseDetails);
      const targetOtherExpenses = expenseItems?.otherExpenses;

      if (targetOtherExpenses && !valuesApproximatelyEqual(currentOtherExpenses, targetOtherExpenses)) {
        const diff = targetOtherExpenses - currentOtherExpenses;
        const allKeys = Object.keys(expenseDetails.otherExpenses).filter(k => k !== 'rentDetails');
        const unlockedKeys = allKeys.filter(k => !locks[k]);

        if (unlockedKeys.length > 0) {
          const currentValues = {};
          allKeys.forEach(k => {
            currentValues[k] = expenseDetails.otherExpenses[k];
          });

          const redistributed = redistributeProportionally(currentValues, unlockedKeys, diff);

          setExpenseDetails(prev => ({
            ...prev,
            otherExpenses: {
              ...prev.otherExpenses,
              ...redistributed
            }
          }));
        }
      }

      updateSourceRef.current = null;
    }
  }, [expenseItems?.otherExpenses, locks, expenseDetails]);

  // Effect: Cascade Rent changes to rent sub-items when it changes (from ANY source)
  useEffect(() => {
    const currentRent = calculateRentTotal(expenseDetails.otherExpenses.rentDetails);
    const targetRent = expenseDetails.otherExpenses.rent;

    // Only cascade if Rent changed and it's not from sub-items updating Rent
    if (!valuesApproximatelyEqual(currentRent, targetRent) && updateSourceRef.current !== 'rentSubItemsUpdated') {
      const diff = targetRent - currentRent;
      const allKeys = Object.keys(expenseDetails.otherExpenses.rentDetails);
      const unlockedKeys = allKeys.filter(k => !locks[k]);

      if (unlockedKeys.length > 0) {
        const currentValues = {};
        allKeys.forEach(k => {
          currentValues[k] = expenseDetails.otherExpenses.rentDetails[k];
        });

        const redistributed = redistributeProportionally(currentValues, unlockedKeys, diff);

        // Mark that we're updating from Rent → sub-items
        updateSourceRef.current = 'rentSubItemsUpdated';

        setExpenseDetails(prev => ({
          ...prev,
          otherExpenses: {
            ...prev.otherExpenses,
            rentDetails: redistributed
          }
        }));
      }
    }

    // Clear flag after processing
    if (updateSourceRef.current === 'rentSubItemsUpdated') {
      updateSourceRef.current = null;
    }
  }, [expenseDetails.otherExpenses.rent, locks]);

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
