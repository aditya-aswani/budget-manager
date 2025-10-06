import { useState, useEffect } from 'react';

export const useBudgetState = () => {
  // Initial state for budget components
  const [budget, setBudget] = useState({
    total: 300000,
    reserves: 50000,
    tuition: 150000,
    fundraising: 100000,
    variableCosts: 200000,
    fixedCosts: 100000
  });

  // State for income line items
  const [incomeItems, setIncomeItems] = useState({
    scholarships: 40000,
    tuition: 190000
  });

  // State for expense line items
  const [expenseItems, setExpenseItems] = useState({
    staffSalaries: 120000,
    otherExpenses: 80000
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

  // Update functions
  const updateNetTuition = (netValue) => {
    setIncomeItems(prev => ({
      ...prev,
      tuition: netValue + prev.scholarships
    }));
  };

  const updateTuitionItem = (value) => {
    const newItems = { ...incomeItems };
    newItems.tuition = value;

    if (locks.tuition) {
      const lockedNet = budget.tuition;
      newItems.scholarships = Math.max(0, value - lockedNet);
    }

    setIncomeItems(newItems);
  };

  const updateScholarshipsItem = (value) => {
    const newItems = { ...incomeItems };
    newItems.scholarships = value;

    if (locks.tuition) {
      const lockedNet = budget.tuition;
      newItems.tuition = Math.max(0, value + lockedNet);
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
    setBudget(prev => ({ ...prev, [component]: value }));
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
    setExpenseItems
  };
};
