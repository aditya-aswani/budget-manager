import { useState, useEffect } from 'react';

export const useBudgetState = () => {
  // Initial state for budget components
  const [budget, setBudget] = useState({
    total: 366000,
    reserves: 50000,
    tuition: 216000,
    fundraising: 100000,
    variableCosts: 200000,
    fixedCosts: 100000
  });

  // State for income line items
  const [incomeItems, setIncomeItems] = useState({
    scholarships: 40000,
    tuition: 256000
  });

  // State for expense line items
  const [expenseItems, setExpenseItems] = useState({
    staffSalaries: 120000,
    otherExpenses: 80000
  });

  // Detailed expense breakdown
  const [expenseDetails, setExpenseDetails] = useState({
    staffSalaries: {
      beforeSemester: 60000,
      duringSemester: 60000,
      duringDetails: {
        leadsOtherRoles: { quantity: 2, rate: 5000 },
        residentialFaculty: { quantity: 2, rate: 5000 },
        ras: { quantity: 2, rate: 5000 },
        retreatTeacher: { quantity: 1, rate: 5000 },
        daylongVisitingTeacher: { quantity: 1, rate: 5000 },
        weeklongVisitingTeacher: { quantity: 2, rate: 5000 },
        headCook: { quantity: 1, rate: 5000 },
        assistantCook: { quantity: 1, rate: 5000 }
      }
    },
    otherExpenses: {
      rent: 10000,
      food: 10000,
      legalAccountingInsurance: 10000,
      suppliesSubscriptions: 10000,
      it: 10000,
      travel: 10000,
      otherOverhead: 10000,
      rentDetails: {
        csCohort2Program: 3333,
        alumniProgram: 3333,
        donorRetreat: 3334
      }
    }
  });

  // Lock states for each component
  const [locks, setLocks] = useState({
    total: false,
    reserves: true, // Locked by default
    tuition: false,
    fundraising: false,
    expenses: false,
    // Individual item locks
    staffSalaries: false,
    otherExpenses: false,
    scholarships: false,
    tuitionItem: false,
    // Staff salary sub-items
    beforeSemester: false,
    duringSemester: false,
    leadsOtherRoles: false,
    residentialFaculty: false,
    ras: false,
    retreatTeacher: false,
    daylongVisitingTeacher: false,
    weeklongVisitingTeacher: false,
    headCook: false,
    assistantCook: false
  });

  // Dropdown expansion states
  const [expanded, setExpanded] = useState({
    expenses: false,
    tuitionScholarships: false
  });

  // Sync expenseItems from expenseDetails (for PDF generation)
  useEffect(() => {
    const staffSalariesTotal = expenseDetails.staffSalaries.beforeSemester +
                               expenseDetails.staffSalaries.duringSemester;

    const otherExpensesTotal = expenseDetails.otherExpenses.rent +
                               expenseDetails.otherExpenses.food +
                               expenseDetails.otherExpenses.legalAccountingInsurance +
                               expenseDetails.otherExpenses.suppliesSubscriptions +
                               expenseDetails.otherExpenses.it +
                               expenseDetails.otherExpenses.travel +
                               expenseDetails.otherExpenses.otherOverhead;

    setExpenseItems(prev => {
      if (Math.abs(prev.staffSalaries - staffSalariesTotal) > 0.01 ||
          Math.abs(prev.otherExpenses - otherExpensesTotal) > 0.01) {
        return {
          staffSalaries: staffSalariesTotal,
          otherExpenses: otherExpensesTotal
        };
      }
      return prev;
    });
  }, [expenseDetails]);

  // Update budget totals when expense items change
  useEffect(() => {
    const expensesTotal = Object.values(expenseItems).reduce((sum, val) => sum + val, 0);

    setBudget(prev => {
      if (Math.abs(prev.variableCosts + prev.fixedCosts - expensesTotal) > 0.01) {
        return {
          ...prev,
          variableCosts: expensesTotal,
          fixedCosts: 0
        };
      }
      return prev;
    });
  }, [expenseItems]);

  // Sync budget.tuition from income sub-items
  useEffect(() => {
    const netTuition = (incomeItems.tuition || 0) - incomeItems.scholarships;
    setBudget(prev => {
      if (Math.abs(prev.tuition - netTuition) > 0.01) {
        return { ...prev, tuition: netTuition };
      }
      return prev;
    });
  }, [incomeItems.tuition, incomeItems.scholarships]);

  // Sync budget.total from income sources (only when total is not locked)
  useEffect(() => {
    if (!locks.total) {
      const calculatedTotal = budget.reserves + budget.tuition + budget.fundraising;
      setBudget(prev => {
        if (Math.abs(prev.total - calculatedTotal) > 0.01) {
          return { ...prev, total: calculatedTotal };
        }
        return prev;
      });
    }
  }, [budget.reserves, budget.tuition, budget.fundraising, locks.total]);

  // Update functions
  const updateNetTuition = (netValue) => {
    // When total budget is locked, redistribute to other unlocked income sources
    if (locks.total) {
      const currentNetTuition = budget.tuition;
      const diff = netValue - currentNetTuition;

      // Find unlocked income components
      const unlockedComponents = [];
      if (!locks.reserves) unlockedComponents.push('reserves');
      if (!locks.fundraising) unlockedComponents.push('fundraising');

      if (unlockedComponents.length > 0) {
        const adjustment = diff / unlockedComponents.length;

        // Check if any component would go negative
        let canAdjust = true;
        unlockedComponents.forEach(c => {
          if (budget[c] - adjustment < 0) {
            canAdjust = false;
          }
        });

        if (!canAdjust) {
          alert(
            '⚠️ Cannot adjust income sources to maintain locked Total Budget.\n\n' +
            'Total Budget is locked at: $' + budget.total.toLocaleString() + '\n' +
            'Other unlocked income sources cannot be reduced enough to accommodate this change.\n\n' +
            'To make this change:\n' +
            '1. Unlock Total Budget, OR\n' +
            '2. Unlock more income sources to distribute the adjustment, OR\n' +
            '3. Reduce (Tuition - Scholarships) instead of increasing it'
          );
          return;
        }

        setBudget(prev => {
          const newBudget = { ...prev, tuition: netValue };
          unlockedComponents.forEach(c => {
            newBudget[c] = Math.max(0, prev[c] - adjustment);
          });
          return newBudget;
        });
      } else {
        // No unlocked components - check if this change is valid
        const currentTotal = budget.reserves + budget.tuition + budget.fundraising;
        const newTotal = currentTotal - budget.tuition + netValue;

        if (newTotal !== budget.total) {
          const action = newTotal > budget.total ? 'increase' : 'decrease';
          alert(
            '⚠️ Cannot ' + action + ' Total Income when Total Budget is locked.\n\n' +
            'Total Budget is currently locked at: $' + budget.total.toLocaleString() + '\n' +
            'This change would make Total Income: $' + newTotal.toLocaleString() + '\n\n' +
            'All other income sources (Reserves and Fundraising) are locked, so redistribution is not possible.\n\n' +
            'To make this change:\n' +
            '1. Unlock Total Budget, OR\n' +
            '2. Unlock Reserves or Fundraising to allow redistribution'
          );
          return;
        }

        // Allow the change if it doesn't change total (should never happen, but keep for safety)
        setBudget(prev => ({ ...prev, tuition: netValue }));
      }
    } else {
      // Total not locked, just update tuition
      setBudget(prev => ({ ...prev, tuition: netValue }));
    }

    // Update the tuition item to reflect the net value
    setIncomeItems(prev => ({
      ...prev,
      tuition: netValue + prev.scholarships
    }));
  };

  const updateTuitionItem = (value) => {
    // Check if Scholarships is locked - if so, we can't change Tuition when net is locked
    if (locks.tuition && locks.scholarships) {
      alert(
        '⚠️ Cannot change Tuition when both (Tuition - Scholarships) and Scholarships are locked.\n\n' +
        'To change Tuition:\n' +
        '1. Unlock (Tuition - Scholarships), OR\n' +
        '2. Unlock Scholarships'
      );
      return;
    }

    const newItems = { ...incomeItems };
    newItems.tuition = value;

    if (locks.tuition) {
      const lockedNet = budget.tuition;
      newItems.scholarships = Math.max(0, value - lockedNet);
    } else {
      // If tuition not locked but total budget is locked, need to check redistribution
      const newNetTuition = value - newItems.scholarships;

      if (locks.total) {
        const currentNetTuition = budget.tuition;
        const diff = newNetTuition - currentNetTuition;

        // Find unlocked income components
        const unlockedComponents = [];
        if (!locks.reserves) unlockedComponents.push('reserves');
        if (!locks.fundraising) unlockedComponents.push('fundraising');

        if (unlockedComponents.length > 0) {
          const adjustment = diff / unlockedComponents.length;

          // Check if any component would go negative
          let canAdjust = true;
          unlockedComponents.forEach(c => {
            if (budget[c] - adjustment < 0) {
              canAdjust = false;
            }
          });

          if (!canAdjust) {
            alert(
              '⚠️ Cannot adjust income sources to maintain locked Total Budget.\n\n' +
              'Total Budget is locked at: $' + budget.total.toLocaleString() + '\n' +
              'Other unlocked income sources cannot be reduced enough to accommodate this change.\n\n' +
              'To make this change:\n' +
              '1. Unlock Total Budget, OR\n' +
              '2. Unlock more income sources to distribute the adjustment, OR\n' +
              '3. Reduce the Tuition value instead of increasing it'
            );
            return;
          }

          // Update budget with redistribution
          setBudget(prev => {
            const newBudget = { ...prev, tuition: newNetTuition };
            unlockedComponents.forEach(c => {
              newBudget[c] = Math.max(0, prev[c] - adjustment);
            });
            return newBudget;
          });
        } else {
          // No unlocked components - check if this change is valid
          const currentTotal = budget.reserves + budget.tuition + budget.fundraising;
          const newTotal = currentTotal - budget.tuition + newNetTuition;

          if (newTotal !== budget.total) {
            const action = newTotal > budget.total ? 'increase' : 'decrease';
            alert(
              '⚠️ Cannot ' + action + ' Total Income when Total Budget is locked.\n\n' +
              'Total Budget is currently locked at: $' + budget.total.toLocaleString() + '\n' +
              'This change would make Total Income: $' + newTotal.toLocaleString() + '\n\n' +
              'All other income sources (Reserves and Fundraising) are locked, so redistribution is not possible.\n\n' +
              'To make this change:\n' +
              '1. Unlock Total Budget, OR\n' +
              '2. Unlock Reserves or Fundraising to allow redistribution'
            );
            return;
          }

          // Allow the change if it doesn't change total (should never happen, but keep for safety)
          setBudget(prev => ({ ...prev, tuition: newNetTuition }));
        }
      }
    }

    setIncomeItems(newItems);
  };

  const updateScholarshipsItem = (value) => {
    // Check if Tuition is locked - if so, we can't change Scholarships when net is locked
    if (locks.tuition && locks.tuitionItem) {
      alert(
        '⚠️ Cannot change Scholarships when both (Tuition - Scholarships) and Tuition are locked.\n\n' +
        'To change Scholarships:\n' +
        '1. Unlock (Tuition - Scholarships), OR\n' +
        '2. Unlock Tuition'
      );
      return;
    }

    const newItems = { ...incomeItems };
    newItems.scholarships = value;

    if (locks.tuition) {
      const lockedNet = budget.tuition;
      newItems.tuition = Math.max(0, value + lockedNet);
    } else {
      // If tuition not locked but total budget is locked, need to check redistribution
      const newNetTuition = newItems.tuition - value;

      if (locks.total) {
        const currentNetTuition = budget.tuition;
        const diff = newNetTuition - currentNetTuition;

        // Find unlocked income components
        const unlockedComponents = [];
        if (!locks.reserves) unlockedComponents.push('reserves');
        if (!locks.fundraising) unlockedComponents.push('fundraising');

        if (unlockedComponents.length > 0) {
          const adjustment = diff / unlockedComponents.length;

          // Check if any component would go negative
          let canAdjust = true;
          unlockedComponents.forEach(c => {
            if (budget[c] - adjustment < 0) {
              canAdjust = false;
            }
          });

          if (!canAdjust) {
            alert(
              '⚠️ Cannot adjust income sources to maintain locked Total Budget.\n\n' +
              'Total Budget is locked at: $' + budget.total.toLocaleString() + '\n' +
              'Other unlocked income sources cannot be reduced enough to accommodate this change.\n\n' +
              'To make this change:\n' +
              '1. Unlock Total Budget, OR\n' +
              '2. Unlock more income sources to distribute the adjustment, OR\n' +
              '3. Increase the Scholarships value instead of decreasing it'
            );
            return;
          }

          // Update budget with redistribution
          setBudget(prev => {
            const newBudget = { ...prev, tuition: newNetTuition };
            unlockedComponents.forEach(c => {
              newBudget[c] = Math.max(0, prev[c] - adjustment);
            });
            return newBudget;
          });
        } else {
          // No unlocked components - check if this change is valid
          const currentTotal = budget.reserves + budget.tuition + budget.fundraising;
          const newTotal = currentTotal - budget.tuition + newNetTuition;

          if (newTotal !== budget.total) {
            const action = newTotal > budget.total ? 'increase' : 'decrease';
            alert(
              '⚠️ Cannot ' + action + ' Total Income when Total Budget is locked.\n\n' +
              'Total Budget is currently locked at: $' + budget.total.toLocaleString() + '\n' +
              'This change would make Total Income: $' + newTotal.toLocaleString() + '\n\n' +
              'All other income sources (Reserves and Fundraising) are locked, so redistribution is not possible.\n\n' +
              'To make this change:\n' +
              '1. Unlock Total Budget, OR\n' +
              '2. Unlock Reserves or Fundraising to allow redistribution'
            );
            return;
          }

          // Allow the change if it doesn't change total (should never happen, but keep for safety)
          setBudget(prev => ({ ...prev, tuition: newNetTuition }));
        }
      }
    }

    setIncomeItems(newItems);
  };

  const updateExpenseItem = (item, value) => {
    const newItems = { ...expenseItems };
    newItems[item] = value;

    if (locks.expenses) {
      const diff = value - expenseItems[item];
      const unlockedItems = Object.keys(expenseItems).filter(k => k !== item && !locks[k]);

      if (unlockedItems.length > 0) {
        const adjustment = diff / unlockedItems.length;
        unlockedItems.forEach(k => {
          newItems[k] = Math.max(0, expenseItems[k] - adjustment);
        });
      }
    }

    setExpenseItems(newItems);
  };

  const updateBudget = (component, value) => {
    if (component === 'reserves' || component === 'tuition' || component === 'fundraising') {
      // When updating an income source, maintain total budget if locked
      if (locks.total) {
        const diff = value - budget[component];

        // Find unlocked income components to adjust
        const incomeComponents = ['reserves', 'tuition', 'fundraising'];
        const unlockedComponents = incomeComponents.filter(c =>
          c !== component && !locks[c]
        );

        if (unlockedComponents.length > 0) {
          // Distribute the difference across unlocked components
          const adjustment = diff / unlockedComponents.length;

          // Check if any component would go negative
          let canAdjust = true;
          unlockedComponents.forEach(c => {
            if (budget[c] - adjustment < 0) {
              canAdjust = false;
            }
          });

          if (!canAdjust) {
            alert(
              '⚠️ Cannot adjust income sources to maintain locked Total Budget.\n\n' +
              'Total Budget is locked at: $' + budget.total.toLocaleString() + '\n' +
              'Other unlocked income sources cannot be reduced enough to accommodate this change.\n\n' +
              'To make this change:\n' +
              '1. Unlock Total Budget, OR\n' +
              '2. Unlock more income sources to distribute the adjustment, OR\n' +
              '3. Reduce this value instead of increasing it'
            );
            return;
          }

          setBudget(prev => {
            const newBudget = { ...prev, [component]: value };
            unlockedComponents.forEach(c => {
              newBudget[c] = Math.max(0, prev[c] - adjustment);
            });
            return newBudget;
          });
        } else {
          // No unlocked components - check if this change is valid
          const currentTotal = budget.reserves + budget.tuition + budget.fundraising;
          const newTotal = currentTotal - budget[component] + value;

          if (newTotal !== budget.total) {
            const action = newTotal > budget.total ? 'increase' : 'decrease';
            const componentName = component === 'reserves' ? 'Reserves' :
                                 component === 'tuition' ? '(Tuition - Scholarships)' :
                                 'Fundraising';
            alert(
              '⚠️ Cannot ' + action + ' Total Income when Total Budget is locked.\n\n' +
              'Total Budget is currently locked at: $' + budget.total.toLocaleString() + '\n' +
              'This change would make Total Income: $' + newTotal.toLocaleString() + '\n\n' +
              'All other income sources are locked, so redistribution is not possible.\n\n' +
              'To make this change:\n' +
              '1. Unlock Total Budget, OR\n' +
              '2. Unlock another income source to allow redistribution'
            );
            return;
          }

          // Allow the change if it doesn't change total (should never happen, but keep for safety)
          setBudget(prev => ({ ...prev, [component]: value }));
        }
      } else {
        // Total not locked, just update the value
        setBudget(prev => ({ ...prev, [component]: value }));
      }
    } else {
      setBudget(prev => ({ ...prev, [component]: value }));
    }
  };

  const toggleLock = (component) => {
    setLocks(prev => ({ ...prev, [component]: !prev[component] }));
  };

  const toggleExpanded = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate totals
  const income = budget.reserves + budget.tuition + budget.fundraising;
  const expenses = budget.variableCosts + budget.fixedCosts;
  const balance = income - expenses;
  const isBalanced = Math.abs(balance) < 100;

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
    updateBudget,
    toggleLock,
    toggleExpanded,
    setExpenseItems,
    setExpenseDetails
  };
};
