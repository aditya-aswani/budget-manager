import React, { useState, useEffect } from 'react';
import { Lock, Unlock, DollarSign, Users, Calculator, ChevronDown, ChevronUp, Settings } from 'lucide-react';

const BudgetCalculator = () => {
  // Initial state for budget components
  const [budget, setBudget] = useState({
    total: 300000,
    reserves: 50000,
    tuition: 150000,
    fundraising: 100000,
    variableCosts: 200000,
    fixedCosts: 100000
  });

  // State for variable cost line items
  const [variableItems, setVariableItems] = useState({
    food: 40000,
    staffSalaries: 120000,
    beforeSemester: 60000,
    duringSemester: 60000,
    leadsOtherRoles: 10000,
    residentialFaculty: 10000,
    ras: 10000,
    retreatTeacher: 5000,
    daylongVisitingTeacher: 5000,
    weeklongVisitingTeacher: 10000,
    headCook: 5000,
    assistantCook: 5000,
    scholarships: 40000
  });

  // State for fixed cost line items
  const [fixedItems, setFixedItems] = useState({
    rent: 60000,
    utilities: 15000,
    insurance: 10000,
    maintenance: 15000
  });

  // Lock states for each component
  const [locks, setLocks] = useState({
    total: false,
    reserves: true,
    tuition: false,
    fundraising: false,
    variableCosts: false,
    fixedCosts: false,
    // Individual item locks
    food: false,
    staffSalaries: false,
    beforeSemester: false,
    duringSemester: false,
    leadsOtherRoles: false,
    residentialFaculty: false,
    ras: false,
    retreatTeacher: false,
    daylongVisitingTeacher: false,
    weeklongVisitingTeacher: false,
    headCook: false,
    assistantCook: false,
    scholarships: false,
    rent: false,
    utilities: false,
    insurance: false,
    maintenance: false
  });

  // Dropdown expansion states
  const [expanded, setExpanded] = useState({
    variableCosts: false,
    fixedCosts: false,
    staffSalaries: false,
    duringSemester: false
  });

  // Min/Max enforcement mode ('flexible' or 'enforced')
  const [rangeMode, setRangeMode] = useState({
    total: 'flexible',
    reserves: 'flexible',
    tuition: 'flexible',
    fundraising: 'flexible',
    variableCosts: 'flexible',
    fixedCosts: 'flexible',
    food: 'flexible',
    staffSalaries: 'flexible',
    beforeSemester: 'flexible',
    duringSemester: 'flexible',
    leadsOtherRoles: 'flexible',
    residentialFaculty: 'flexible',
    ras: 'flexible',
    retreatTeacher: 'flexible',
    daylongVisitingTeacher: 'flexible',
    weeklongVisitingTeacher: 'flexible',
    headCook: 'flexible',
    assistantCook: 'flexible',
    scholarships: 'flexible',
    rent: 'flexible',
    utilities: 'flexible',
    insurance: 'flexible',
    maintenance: 'flexible'
  });

  // Min/Max values for enforced mode
  const [rangeValues, setRangeValues] = useState({
    total: { min: 50000, max: 500000 },
    reserves: { min: 0, max: 200000 },
    tuition: { min: 0, max: 300000 },
    fundraising: { min: 0, max: 200000 },
    variableCosts: { min: 0, max: 300000 },
    fixedCosts: { min: 0, max: 200000 },
    food: { min: 0, max: 100000 },
    staffSalaries: { min: 0, max: 200000 },
    beforeSemester: { min: 0, max: 100000 },
    duringSemester: { min: 0, max: 100000 },
    leadsOtherRoles: { min: 0, max: 50000 },
    residentialFaculty: { min: 0, max: 50000 },
    ras: { min: 0, max: 50000 },
    retreatTeacher: { min: 0, max: 25000 },
    daylongVisitingTeacher: { min: 0, max: 25000 },
    weeklongVisitingTeacher: { min: 0, max: 50000 },
    headCook: { min: 0, max: 25000 },
    assistantCook: { min: 0, max: 25000 },
    scholarships: { min: 0, max: 100000 },
    rent: { min: 0, max: 100000 },
    utilities: { min: 0, max: 50000 },
    insurance: { min: 0, max: 50000 },
    maintenance: { min: 0, max: 50000 }
  });

  // State to track which slider's settings are being edited
  const [editingSettings, setEditingSettings] = useState(null);


  // Update duringSemester total from sub-items
  useEffect(() => {
    const duringTotal = variableItems.leadsOtherRoles + variableItems.residentialFaculty +
                        variableItems.ras + variableItems.retreatTeacher +
                        variableItems.daylongVisitingTeacher + variableItems.weeklongVisitingTeacher +
                        variableItems.headCook + variableItems.assistantCook;
    if (variableItems.duringSemester !== duringTotal) {
      setVariableItems(prev => ({
        ...prev,
        duringSemester: duringTotal
      }));
    }
  }, [variableItems.leadsOtherRoles, variableItems.residentialFaculty, variableItems.ras,
      variableItems.retreatTeacher, variableItems.daylongVisitingTeacher, variableItems.weeklongVisitingTeacher,
      variableItems.headCook, variableItems.assistantCook]);

  // Update staff salaries total from sub-items
  useEffect(() => {
    const staffTotal = variableItems.beforeSemester + variableItems.duringSemester;
    if (variableItems.staffSalaries !== staffTotal) {
      setVariableItems(prev => ({
        ...prev,
        staffSalaries: staffTotal
      }));
    }
  }, [variableItems.beforeSemester, variableItems.duringSemester]);

  // Update budget totals when line items change
  useEffect(() => {
    const variableTotal = variableItems.food + variableItems.staffSalaries + variableItems.scholarships;
    const fixedTotal = Object.values(fixedItems).reduce((sum, val) => sum + val, 0);

    setBudget(prev => {
      // Only update if the values actually changed to avoid infinite loops
      if (prev.variableCosts !== variableTotal || prev.fixedCosts !== fixedTotal) {
        return {
          ...prev,
          variableCosts: variableTotal,
          fixedCosts: fixedTotal
        };
      }
      return prev;
    });
  }, [variableItems, fixedItems]);

  // Function to count locked items on each side
  const countLocks = (side) => {
    if (side === 'income') {
      return [locks.reserves, locks.tuition, locks.fundraising].filter(Boolean).length;
    } else {
      return [locks.variableCosts, locks.fixedCosts].filter(Boolean).length;
    }
  };

  // Function to update variable cost items
  const updateVariableItem = (item, value) => {
    const newItems = { ...variableItems };
    newItems[item] = Math.round(value);

    // If updating duringSemester total, proportionally update sub-items
    if (item === 'duringSemester') {
      const oldTotal = variableItems.leadsOtherRoles + variableItems.residentialFaculty +
                       variableItems.ras + variableItems.retreatTeacher +
                       variableItems.daylongVisitingTeacher + variableItems.weeklongVisitingTeacher +
                       variableItems.headCook + variableItems.assistantCook;
      if (oldTotal > 0) {
        const ratio = Math.round(value) / oldTotal;
        newItems.leadsOtherRoles = Math.round(variableItems.leadsOtherRoles * ratio);
        newItems.residentialFaculty = Math.round(variableItems.residentialFaculty * ratio);
        newItems.ras = Math.round(variableItems.ras * ratio);
        newItems.retreatTeacher = Math.round(variableItems.retreatTeacher * ratio);
        newItems.daylongVisitingTeacher = Math.round(variableItems.daylongVisitingTeacher * ratio);
        newItems.weeklongVisitingTeacher = Math.round(variableItems.weeklongVisitingTeacher * ratio);
        newItems.headCook = Math.round(variableItems.headCook * ratio);
        newItems.assistantCook = Math.round(variableItems.assistantCook * ratio);
      } else if (Math.round(value) > 0) {
        // If old total was 0, split evenly
        const perItem = Math.round(value / 8);
        newItems.leadsOtherRoles = perItem;
        newItems.residentialFaculty = perItem;
        newItems.ras = perItem;
        newItems.retreatTeacher = perItem;
        newItems.daylongVisitingTeacher = perItem;
        newItems.weeklongVisitingTeacher = perItem;
        newItems.headCook = perItem;
        newItems.assistantCook = perItem;
      }
    }

    // If updating staffSalaries total, proportionally update sub-items
    if (item === 'staffSalaries') {
      const oldTotal = variableItems.beforeSemester + variableItems.duringSemester;
      if (oldTotal > 0) {
        const ratio = Math.round(value) / oldTotal;
        newItems.beforeSemester = Math.round(variableItems.beforeSemester * ratio);
        newItems.duringSemester = Math.round(variableItems.duringSemester * ratio);
      } else if (Math.round(value) > 0) {
        // If old total was 0, split evenly
        newItems.beforeSemester = Math.round(value / 2);
        newItems.duringSemester = Math.round(value / 2);
      }
    }

    if (locks.variableCosts) {
      // If variable costs total is locked, adjust other unlocked items
      const diff = Math.round(value) - variableItems[item];
      const excludedKeys = ['staffSalaries', 'beforeSemester', 'duringSemester', 'leadsOtherRoles',
                            'residentialFaculty', 'ras', 'retreatTeacher', 'daylongVisitingTeacher',
                            'weeklongVisitingTeacher', 'headCook', 'assistantCook'];
      const unlockedItems = Object.keys(variableItems).filter(k =>
        k !== item && !excludedKeys.includes(k) && !locks[k]
      );

      if (unlockedItems.length > 0) {
        const adjustment = diff / unlockedItems.length;
        unlockedItems.forEach(k => {
          newItems[k] = Math.round(Math.max(0, variableItems[k] - adjustment));
        });
      }
    }

    setVariableItems(newItems);
  };

  // Function to update fixed cost items
  const updateFixedItem = (item, value) => {
    const newItems = { ...fixedItems };
    newItems[item] = Math.round(value);

    if (locks.fixedCosts) {
      // If fixed costs total is locked, adjust other unlocked items
      const diff = Math.round(value) - fixedItems[item];
      const unlockedItems = Object.keys(fixedItems).filter(k => k !== item && !locks[k]);

      if (unlockedItems.length > 0) {
        const adjustment = diff / unlockedItems.length;
        unlockedItems.forEach(k => {
          newItems[k] = Math.round(Math.max(0, fixedItems[k] - adjustment));
        });
      }
    }

    setFixedItems(newItems);
  };

  // Function to update budget while respecting locks
  const updateBudget = (component, value) => {
    const newBudget = { ...budget };
    newBudget[component] = Math.round(value);

    // Recalculate based on what's locked
    if (component === 'total') {
      // Total changed - adjust other components
      const diff = value - budget.total;

      // Adjust income side
      const incomeSum = newBudget.reserves + newBudget.tuition + newBudget.fundraising;
      const incomeLocked = countLocks('income');

      if (incomeLocked < 3) {
        const incomeAdjustment = diff / 2;
        if (!locks.reserves && incomeLocked < 2) {
          const shareReserves = incomeAdjustment / (3 - incomeLocked);
          newBudget.reserves = Math.round(Math.max(0, budget.reserves + shareReserves));
        }
        if (!locks.tuition && incomeLocked < 2) {
          const shareTuition = incomeAdjustment / (3 - incomeLocked);
          newBudget.tuition = Math.round(Math.max(0, budget.tuition + shareTuition));
        }
        if (!locks.fundraising && incomeLocked < 2) {
          const shareFundraising = incomeAdjustment / (3 - incomeLocked);
          newBudget.fundraising = Math.round(Math.max(0, budget.fundraising + shareFundraising));
        }
      }

      // Adjust expense side
      const expenseLocked = countLocks('expense');
      if (expenseLocked < 2) {
        const expenseAdjustment = diff / 2;
        if (!locks.variableCosts && !locks.fixedCosts) {
          newBudget.variableCosts = Math.round(Math.max(0, budget.variableCosts + expenseAdjustment * 0.67));
          newBudget.fixedCosts = Math.round(Math.max(0, budget.fixedCosts + expenseAdjustment * 0.33));

          // Update line items proportionally
          if (budget.variableCosts > 0) {
            const variableRatio = newBudget.variableCosts / budget.variableCosts;
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * variableRatio))])
            ));
          } else if (newBudget.variableCosts > 0) {
            // If old total was 0, distribute new value evenly
            const numItems = Object.keys(variableItems).length;
            const perItem = Math.round(newBudget.variableCosts / numItems);
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k]) => [k, perItem])
            ));
          }

          if (budget.fixedCosts > 0) {
            const fixedRatio = newBudget.fixedCosts / budget.fixedCosts;
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * fixedRatio))])
            ));
          } else if (newBudget.fixedCosts > 0) {
            // If old total was 0, distribute new value evenly
            const numItems = Object.keys(fixedItems).length;
            const perItem = Math.round(newBudget.fixedCosts / numItems);
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k]) => [k, perItem])
            ));
          }
        } else if (!locks.variableCosts) {
          newBudget.variableCosts = Math.round(Math.max(0, budget.variableCosts + expenseAdjustment));
          if (budget.variableCosts > 0) {
            const ratio = newBudget.variableCosts / budget.variableCosts;
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * ratio))])
            ));
          } else if (newBudget.variableCosts > 0) {
            const numItems = Object.keys(variableItems).length;
            const perItem = Math.round(newBudget.variableCosts / numItems);
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k]) => [k, perItem])
            ));
          }
        } else if (!locks.fixedCosts) {
          newBudget.fixedCosts = Math.round(Math.max(0, budget.fixedCosts + expenseAdjustment));
          if (budget.fixedCosts > 0) {
            const ratio = newBudget.fixedCosts / budget.fixedCosts;
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * ratio))])
            ));
          } else if (newBudget.fixedCosts > 0) {
            const numItems = Object.keys(fixedItems).length;
            const perItem = Math.round(newBudget.fixedCosts / numItems);
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k]) => [k, perItem])
            ));
          }
        }
      }
    } else if (['reserves', 'tuition', 'fundraising'].includes(component)) {
      // Income component changed
      const incomeSum = newBudget.reserves + newBudget.tuition + newBudget.fundraising;

      if (locks.total) {
        // Total is locked, adjust other income components
        const diff = incomeSum - budget.total;
        const otherComponents = ['reserves', 'tuition', 'fundraising'].filter(c => c !== component && !locks[c]);

        if (otherComponents.length > 0) {
          const adjustment = diff / otherComponents.length;
          otherComponents.forEach(c => {
            newBudget[c] = Math.round(Math.max(0, budget[c] - adjustment));
          });
        }
      } else {
        // Total is not locked, update it
        newBudget.total = Math.round(incomeSum);
        // Keep expenses in sync
        const expenseSum = newBudget.variableCosts + newBudget.fixedCosts;
        if (expenseSum !== newBudget.total) {
          if (!locks.variableCosts && !locks.fixedCosts) {
            const diff = newBudget.total - expenseSum;
            newBudget.variableCosts = Math.round(newBudget.variableCosts + diff * 0.67);
            newBudget.fixedCosts = Math.round(newBudget.fixedCosts + diff * 0.33);

            // Update line items
            if (budget.variableCosts > 0) {
              const variableRatio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * variableRatio))])
              ));
            } else if (newBudget.variableCosts > 0) {
              const numItems = Object.keys(variableItems).length;
              const perItem = Math.round(newBudget.variableCosts / numItems);
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }

            if (budget.fixedCosts > 0) {
              const fixedRatio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * fixedRatio))])
              ));
            } else if (newBudget.fixedCosts > 0) {
              const numItems = Object.keys(fixedItems).length;
              const perItem = Math.round(newBudget.fixedCosts / numItems);
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          } else if (!locks.variableCosts) {
            newBudget.variableCosts = Math.round(newBudget.total - newBudget.fixedCosts);
            if (budget.variableCosts > 0) {
              const ratio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * ratio))])
              ));
            } else if (newBudget.variableCosts > 0) {
              const numItems = Object.keys(variableItems).length;
              const perItem = Math.round(newBudget.variableCosts / numItems);
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          } else if (!locks.fixedCosts) {
            newBudget.fixedCosts = Math.round(newBudget.total - newBudget.variableCosts);
            if (budget.fixedCosts > 0) {
              const ratio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * ratio))])
              ));
            } else if (newBudget.fixedCosts > 0) {
              const numItems = Object.keys(fixedItems).length;
              const perItem = Math.round(newBudget.fixedCosts / numItems);
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          }
        }
      }
    } else if (['variableCosts', 'fixedCosts'].includes(component)) {
      // Expense component changed
      const expenseSum = newBudget.variableCosts + newBudget.fixedCosts;

      if (locks.total) {
        // Total is locked, adjust other expense component
        const diff = expenseSum - budget.total;
        const otherComponent = component === 'variableCosts' ? 'fixedCosts' : 'variableCosts';

        if (!locks[otherComponent]) {
          newBudget[otherComponent] = Math.round(Math.max(0, budget[otherComponent] - diff));

          // Update line items for the adjusted component
          if (otherComponent === 'variableCosts') {
            if (budget.variableCosts > 0) {
              const ratio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * ratio))])
              ));
            } else if (newBudget.variableCosts > 0) {
              const numItems = Object.keys(variableItems).length;
              const perItem = Math.round(newBudget.variableCosts / numItems);
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          } else {
            if (budget.fixedCosts > 0) {
              const ratio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * ratio))])
              ));
            } else if (newBudget.fixedCosts > 0) {
              const numItems = Object.keys(fixedItems).length;
              const perItem = Math.round(newBudget.fixedCosts / numItems);
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          }
        }
      } else {
        // Total is not locked, update it
        newBudget.total = Math.round(expenseSum);
        // Keep income in sync
        const incomeSum = newBudget.reserves + newBudget.tuition + newBudget.fundraising;
        if (incomeSum !== newBudget.total) {
          const diff = newBudget.total - incomeSum;
          const unlockedIncome = ['reserves', 'tuition', 'fundraising'].filter(c => !locks[c]);

          if (unlockedIncome.length > 0) {
            const adjustment = diff / unlockedIncome.length;
            unlockedIncome.forEach(c => {
              newBudget[c] = Math.round(Math.max(0, budget[c] + adjustment));
            });
          }
        }
      }

      // Update line items when total changes
      if (component === 'variableCosts') {
        if (budget.variableCosts > 0) {
          const ratio = value / budget.variableCosts;
          setVariableItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * ratio))])
          ));
        } else if (value > 0) {
          const numItems = Object.keys(variableItems).length;
          const perItem = Math.round(value / numItems);
          setVariableItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k]) => [k, perItem])
          ));
        }
      } else {
        if (budget.fixedCosts > 0) {
          const ratio = value / budget.fixedCosts;
          setFixedItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k, v]) => [k, Math.round(Math.max(0, v * ratio))])
          ));
        } else if (value > 0) {
          const numItems = Object.keys(fixedItems).length;
          const perItem = Math.round(value / numItems);
          setFixedItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k]) => [k, perItem])
          ));
        }
      }
    }

    setBudget(newBudget);
  };

  // Toggle lock for a component
  const toggleLock = (component) => {
    setLocks(prev => ({
      ...prev,
      [component]: !prev[component]
    }));
  };

  // Toggle dropdown expansion
  const toggleExpanded = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get effective min/max for a slider based on mode
  const getEffectiveRange = (component) => {
    if (rangeMode[component] === 'enforced') {
      return rangeValues[component];
    }
    // Flexible mode - use automatic ranges based on context
    const defaults = {
      total: { min: 0, max: 1000000 },
      reserves: { min: 0, max: budget.total || 500000 },
      tuition: { min: 0, max: budget.total || 500000 },
      fundraising: { min: 0, max: budget.total || 500000 },
      variableCosts: { min: 0, max: budget.total || 500000 },
      fixedCosts: { min: 0, max: budget.total || 500000 },
      food: { min: 0, max: budget.variableCosts || 200000 },
      staffSalaries: { min: 0, max: budget.variableCosts || 200000 },
      beforeSemester: { min: 0, max: variableItems.staffSalaries || 100000 },
      duringSemester: { min: 0, max: variableItems.staffSalaries || 100000 },
      leadsOtherRoles: { min: 0, max: variableItems.duringSemester || 50000 },
      residentialFaculty: { min: 0, max: variableItems.duringSemester || 50000 },
      ras: { min: 0, max: variableItems.duringSemester || 50000 },
      retreatTeacher: { min: 0, max: variableItems.duringSemester || 25000 },
      daylongVisitingTeacher: { min: 0, max: variableItems.duringSemester || 25000 },
      weeklongVisitingTeacher: { min: 0, max: variableItems.duringSemester || 50000 },
      headCook: { min: 0, max: variableItems.duringSemester || 25000 },
      assistantCook: { min: 0, max: variableItems.duringSemester || 25000 },
      scholarships: { min: 0, max: budget.variableCosts || 200000 },
      rent: { min: 0, max: budget.fixedCosts || 200000 },
      utilities: { min: 0, max: budget.fixedCosts || 200000 },
      insurance: { min: 0, max: budget.fixedCosts || 200000 },
      maintenance: { min: 0, max: budget.fixedCosts || 200000 }
    };
    return defaults[component] || { min: 0, max: 100000 };
  };

  // Toggle range mode for a component
  const toggleRangeMode = (component) => {
    setRangeMode(prev => ({
      ...prev,
      [component]: prev[component] === 'flexible' ? 'enforced' : 'flexible'
    }));
  };

  // Update range values for a component
  const updateRangeValue = (component, bound, value) => {
    setRangeValues(prev => ({
      ...prev,
      [component]: {
        ...prev[component],
        [bound]: Math.max(0, Number(value) || 0)
      }
    }));
  };


  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  // Helper function to render during semester sub-items
  const renderDuringItem = (key, label) => (
    <div className="flex items-center justify-between" key={key}>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{label}:</span>
            <input
              type="text"
              value={formatNumber(variableItems[key])}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                updateVariableItem(key, Math.max(0, Number(value) || 0));
              }}
              disabled={locks[key]}
              className="w-16 px-1 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>
          <div className="flex gap-0.5">
            <button
              onClick={() => setEditingSettings(editingSettings === key ? null : key)}
              className="p-0.5 rounded bg-white shadow-sm"
            >
              <Settings size={8} className={editingSettings === key ? 'text-blue-500' : 'text-gray-400'} />
            </button>
            <button
              onClick={() => toggleLock(key)}
              className="p-0.5 rounded bg-white shadow-sm"
            >
              {locks[key] ? <Lock size={10} className="text-red-500" /> : <Unlock size={10} className="text-gray-400" />}
            </button>
          </div>
        </div>

        {editingSettings === key && (
          <div className="mb-0.5 p-1 bg-white rounded border border-orange-200 text-xs">
            <div className="flex items-center gap-1 mb-0.5">
              <button
                onClick={() => toggleRangeMode(key)}
                className={`px-1 py-0.5 text-xs rounded ${rangeMode[key] === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Flex
              </button>
              <button
                onClick={() => toggleRangeMode(key)}
                className={`px-1 py-0.5 text-xs rounded ${rangeMode[key] === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Enforce
              </button>
            </div>
            {rangeMode[key] === 'enforced' && (
              <div className="flex gap-1 text-xs">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={rangeValues[key].min}
                  onChange={(e) => updateRangeValue(key, 'min', e.target.value)}
                  className="w-12 px-1 py-0.5 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={rangeValues[key].max}
                  onChange={(e) => updateRangeValue(key, 'max', e.target.value)}
                  className="w-12 px-1 py-0.5 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        )}

        <input
          type="range"
          min={getEffectiveRange(key).min}
          max={getEffectiveRange(key).max}
          step="100"
          value={variableItems[key]}
          onChange={(e) => updateVariableItem(key, Number(e.target.value))}
          disabled={locks[key]}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, #f97316 0%, #f97316 ${((variableItems[key] - getEffectiveRange(key).min) / (getEffectiveRange(key).max - getEffectiveRange(key).min)) * 100}%, #ffedd5 ${((variableItems[key] - getEffectiveRange(key).min) / (getEffectiveRange(key).max - getEffectiveRange(key).min)) * 100}%, #ffedd5 100%)`
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Contemplative Semester Budget Calculator
        </h1>
        <p className="text-gray-600">
          Interactive budget planning tool with dynamic relationships
        </p>
      </div>

      {/* Main Budget Equation */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Calculator className="text-blue-600" />
          Budget Equation
        </h2>

        <div className="text-center text-lg font-mono bg-gray-100 p-4 rounded-lg mb-6">
          <span className="text-green-600">Total Budget</span> =
          <span className="text-blue-600"> Reserves</span> +
          <span className="text-blue-600"> Tuition</span> +
          <span className="text-blue-600"> Fundraising</span> =
          <span className="text-orange-600"> Variable Costs</span> +
          <span className="text-orange-600"> Fixed Costs</span>
        </div>

        {/* Total Budget Control */}
        <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <label className="text-lg font-semibold text-green-800">
                Total Budget:
              </label>
              <input
                type="text"
                value={formatNumber(budget.total)}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  updateBudget('total', Math.max(0, Number(value) || 0));
                }}
                disabled={locks.total}
                className="w-32 px-2 py-1 text-center border border-green-300 rounded-lg font-semibold text-green-800 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingSettings(editingSettings === 'total' ? null : 'total')}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <Settings size={20} className={editingSettings === 'total' ? 'text-blue-500' : 'text-gray-400'} />
              </button>
              <button
                onClick={() => toggleLock('total')}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                {locks.total ? <Lock className="text-red-500" /> : <Unlock className="text-gray-400" />}
              </button>
            </div>
          </div>

          {editingSettings === 'total' && (
            <div className="mb-3 p-3 bg-white rounded-lg border border-green-300">
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium">Mode:</label>
                <button
                  onClick={() => toggleRangeMode('total')}
                  className={`px-3 py-1 text-sm rounded ${rangeMode.total === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Flexible
                </button>
                <button
                  onClick={() => toggleRangeMode('total')}
                  className={`px-3 py-1 text-sm rounded ${rangeMode.total === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Enforced
                </button>
              </div>
              {rangeMode.total === 'enforced' && (
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Min:</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={rangeValues.total.min}
                      onChange={(e) => updateRangeValue('total', 'min', e.target.value)}
                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Max:</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={rangeValues.total.max}
                      onChange={(e) => updateRangeValue('total', 'max', e.target.value)}
                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            type="range"
            min={getEffectiveRange('total').min}
            max={getEffectiveRange('total').max}
            step="5000"
            value={budget.total}
            onChange={(e) => updateBudget('total', Number(e.target.value))}
            disabled={locks.total}
            className="w-full h-3 bg-green-300 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, #86efac 0%, #86efac ${(budget.total / getEffectiveRange('total').max) * 100}%, #bbf7d0 ${(budget.total / getEffectiveRange('total').max) * 100}%, #bbf7d0 100%)`
            }}
          />
        </div>

        {/* Income Components */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Income Sources</h3>
          <div className="space-y-4">

            {/* Reserves */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Reserves:</label>
                  <input
                    type="text"
                    value={formatNumber(budget.reserves)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      updateBudget('reserves', Math.max(0, Number(value) || 0));
                    }}
                    disabled={locks.reserves}
                    className="w-28 px-2 py-0.5 text-sm text-center border border-blue-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingSettings(editingSettings === 'reserves' ? null : 'reserves')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    <Settings size={14} className={editingSettings === 'reserves' ? 'text-blue-500' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={() => toggleLock('reserves')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    {locks.reserves ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {editingSettings === 'reserves' && (
                <div className="mb-2 p-2 bg-white rounded border border-blue-300 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => toggleRangeMode('reserves')}
                      className={`px-2 py-0.5 rounded ${rangeMode.reserves === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Flexible
                    </button>
                    <button
                      onClick={() => toggleRangeMode('reserves')}
                      className={`px-2 py-0.5 rounded ${rangeMode.reserves === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Enforced
                    </button>
                  </div>
                  {rangeMode.reserves === 'enforced' && (
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <label>Min:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.reserves.min}
                          onChange={(e) => updateRangeValue('reserves', 'min', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label>Max:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.reserves.max}
                          onChange={(e) => updateRangeValue('reserves', 'max', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                type="range"
                min={getEffectiveRange('reserves').min}
                max={getEffectiveRange('reserves').max}
                step="1000"
                value={budget.reserves}
                onChange={(e) => updateBudget('reserves', Number(e.target.value))}
                disabled={locks.reserves}
                className="w-full h-2.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${(budget.reserves / getEffectiveRange('reserves').max) * 100}%, #bfdbfe ${(budget.reserves / getEffectiveRange('reserves').max) * 100}%, #bfdbfe 100%)`
                }}
              />
            </div>

            {/* Tuition */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Tuition:</label>
                  <input
                    type="text"
                    value={formatNumber(budget.tuition)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      updateBudget('tuition', Math.max(0, Number(value) || 0));
                    }}
                    disabled={locks.tuition}
                    className="w-28 px-2 py-0.5 text-sm text-center border border-blue-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingSettings(editingSettings === 'tuition' ? null : 'tuition')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    <Settings size={14} className={editingSettings === 'tuition' ? 'text-blue-500' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={() => toggleLock('tuition')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    {locks.tuition ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {editingSettings === 'tuition' && (
                <div className="mb-2 p-2 bg-white rounded border border-blue-300 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => toggleRangeMode('tuition')}
                      className={`px-2 py-0.5 rounded ${rangeMode.tuition === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Flexible
                    </button>
                    <button
                      onClick={() => toggleRangeMode('tuition')}
                      className={`px-2 py-0.5 rounded ${rangeMode.tuition === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Enforced
                    </button>
                  </div>
                  {rangeMode.tuition === 'enforced' && (
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <label>Min:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.tuition.min}
                          onChange={(e) => updateRangeValue('tuition', 'min', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label>Max:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.tuition.max}
                          onChange={(e) => updateRangeValue('tuition', 'max', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                type="range"
                min={getEffectiveRange('tuition').min}
                max={getEffectiveRange('tuition').max}
                step="1000"
                value={budget.tuition}
                onChange={(e) => updateBudget('tuition', Number(e.target.value))}
                disabled={locks.tuition}
                className="w-full h-2.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${(budget.tuition / getEffectiveRange('tuition').max) * 100}%, #bfdbfe ${(budget.tuition / getEffectiveRange('tuition').max) * 100}%, #bfdbfe 100%)`
                }}
              />
            </div>

            {/* Fundraising */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Fundraising:</label>
                  <input
                    type="text"
                    value={formatNumber(budget.fundraising)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      updateBudget('fundraising', Math.max(0, Number(value) || 0));
                    }}
                    disabled={locks.fundraising}
                    className="w-28 px-2 py-0.5 text-sm text-center border border-blue-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingSettings(editingSettings === 'fundraising' ? null : 'fundraising')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    <Settings size={14} className={editingSettings === 'fundraising' ? 'text-blue-500' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={() => toggleLock('fundraising')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    {locks.fundraising ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {editingSettings === 'fundraising' && (
                <div className="mb-2 p-2 bg-white rounded border border-blue-300 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => toggleRangeMode('fundraising')}
                      className={`px-2 py-0.5 rounded ${rangeMode.fundraising === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Flexible
                    </button>
                    <button
                      onClick={() => toggleRangeMode('fundraising')}
                      className={`px-2 py-0.5 rounded ${rangeMode.fundraising === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Enforced
                    </button>
                  </div>
                  {rangeMode.fundraising === 'enforced' && (
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <label>Min:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.fundraising.min}
                          onChange={(e) => updateRangeValue('fundraising', 'min', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label>Max:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.fundraising.max}
                          onChange={(e) => updateRangeValue('fundraising', 'max', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                type="range"
                min={getEffectiveRange('fundraising').min}
                max={getEffectiveRange('fundraising').max}
                step="1000"
                value={budget.fundraising}
                onChange={(e) => updateBudget('fundraising', Number(e.target.value))}
                disabled={locks.fundraising}
                className="w-full h-2.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${(budget.fundraising / getEffectiveRange('fundraising').max) * 100}%, #bfdbfe ${(budget.fundraising / getEffectiveRange('fundraising').max) * 100}%, #bfdbfe 100%)`
                }}
              />
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="font-semibold text-blue-800">
                Total Income: {formatCurrency(budget.reserves + budget.tuition + budget.fundraising)}
              </p>
            </div>
          </div>
        </div>

        {/* Expense Components */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-orange-700">Expenses</h3>
          <div className="space-y-4">

            {/* Variable Costs */}
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpanded('variableCosts')}
                    className="p-1 hover:bg-orange-100 rounded"
                  >
                    {expanded.variableCosts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <label className="font-medium">Variable Costs:</label>
                  <input
                    type="text"
                    value={formatNumber(budget.variableCosts)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      updateBudget('variableCosts', Math.max(0, Number(value) || 0));
                    }}
                    disabled={locks.variableCosts}
                    className="w-28 px-2 py-0.5 text-sm text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingSettings(editingSettings === 'variableCosts' ? null : 'variableCosts')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    <Settings size={14} className={editingSettings === 'variableCosts' ? 'text-blue-500' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={() => toggleLock('variableCosts')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    {locks.variableCosts ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {editingSettings === 'variableCosts' && (
                <div className="mb-2 p-2 bg-white rounded border border-orange-300 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => toggleRangeMode('variableCosts')}
                      className={`px-2 py-0.5 rounded ${rangeMode.variableCosts === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Flexible
                    </button>
                    <button
                      onClick={() => toggleRangeMode('variableCosts')}
                      className={`px-2 py-0.5 rounded ${rangeMode.variableCosts === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Enforced
                    </button>
                  </div>
                  {rangeMode.variableCosts === 'enforced' && (
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <label>Min:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.variableCosts.min}
                          onChange={(e) => updateRangeValue('variableCosts', 'min', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label>Max:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.variableCosts.max}
                          onChange={(e) => updateRangeValue('variableCosts', 'max', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                type="range"
                min={getEffectiveRange('variableCosts').min}
                max={getEffectiveRange('variableCosts').max}
                step="1000"
                value={budget.variableCosts}
                onChange={(e) => updateBudget('variableCosts', Number(e.target.value))}
                disabled={locks.variableCosts}
                className="w-full h-2.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #fb923c 0%, #fb923c ${(budget.variableCosts / getEffectiveRange('variableCosts').max) * 100}%, #fed7aa ${(budget.variableCosts / getEffectiveRange('variableCosts').max) * 100}%, #fed7aa 100%)`
                }}
              />

              {/* Variable Cost Line Items */}
              {expanded.variableCosts && (
                <div className="mt-3 space-y-2 pl-6 border-l-2 border-orange-200">
                  {/* Food */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Food:</span>
                          <input
                            type="text"
                            value={formatNumber(variableItems.food)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              updateVariableItem('food', Math.max(0, Number(value) || 0));
                            }}
                            disabled={locks.food}
                            className="w-24 px-2 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setEditingSettings(editingSettings === 'food' ? null : 'food')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            <Settings size={10} className={editingSettings === 'food' ? 'text-blue-500' : 'text-gray-400'} />
                          </button>
                          <button
                            onClick={() => toggleLock('food')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            {locks.food ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {editingSettings === 'food' && (
                        <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                          <div className="flex items-center gap-1 mb-0.5">
                            <button
                              onClick={() => toggleRangeMode('food')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.food === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Flex
                            </button>
                            <button
                              onClick={() => toggleRangeMode('food')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.food === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Enforce
                            </button>
                          </div>
                          {rangeMode.food === 'enforced' && (
                            <div className="flex gap-1 text-xs">
                              <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={rangeValues.food.min}
                                onChange={(e) => updateRangeValue('food', 'min', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={rangeValues.food.max}
                                onChange={(e) => updateRangeValue('food', 'max', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="range"
                        min={getEffectiveRange('food').min}
                        max={getEffectiveRange('food').max}
                        step="500"
                        value={variableItems.food}
                        onChange={(e) => updateVariableItem('food', Number(e.target.value))}
                        disabled={locks.food}
                        className="w-full h-1 bg-orange-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Staff Salaries */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpanded('staffSalaries')}
                            className="p-0.5 hover:bg-orange-50 rounded"
                          >
                            {expanded.staffSalaries ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <span className="text-sm">Staff Salaries:</span>
                          <input
                            type="text"
                            value={formatNumber(variableItems.staffSalaries)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              updateVariableItem('staffSalaries', Math.max(0, Number(value) || 0));
                            }}
                            disabled={locks.staffSalaries}
                            className="w-24 px-2 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setEditingSettings(editingSettings === 'staffSalaries' ? null : 'staffSalaries')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            <Settings size={10} className={editingSettings === 'staffSalaries' ? 'text-blue-500' : 'text-gray-400'} />
                          </button>
                          <button
                            onClick={() => toggleLock('staffSalaries')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            {locks.staffSalaries ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {editingSettings === 'staffSalaries' && (
                        <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                          <div className="flex items-center gap-1 mb-0.5">
                            <button
                              onClick={() => toggleRangeMode('staffSalaries')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.staffSalaries === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Flex
                            </button>
                            <button
                              onClick={() => toggleRangeMode('staffSalaries')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.staffSalaries === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Enforce
                            </button>
                          </div>
                          {rangeMode.staffSalaries === 'enforced' && (
                            <div className="flex gap-1 text-xs">
                              <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={rangeValues.staffSalaries.min}
                                onChange={(e) => updateRangeValue('staffSalaries', 'min', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={rangeValues.staffSalaries.max}
                                onChange={(e) => updateRangeValue('staffSalaries', 'max', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="range"
                        min={getEffectiveRange('staffSalaries').min}
                        max={getEffectiveRange('staffSalaries').max}
                        step="1000"
                        value={variableItems.staffSalaries}
                        onChange={(e) => updateVariableItem('staffSalaries', Number(e.target.value))}
                        disabled={locks.staffSalaries}
                        className="w-full h-1 bg-orange-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />

                      {/* Staff Salaries Sub-items */}
                      {expanded.staffSalaries && (
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-orange-100">
                          {/* Before Semester */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">Before Semester:</span>
                                  <input
                                    type="text"
                                    value={formatNumber(variableItems.beforeSemester)}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/,/g, '');
                                      updateVariableItem('beforeSemester', Math.max(0, Number(value) || 0));
                                    }}
                                    disabled={locks.beforeSemester}
                                    className="w-20 px-1 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                                  />
                                </div>
                                <div className="flex gap-0.5">
                                  <button
                                    onClick={() => setEditingSettings(editingSettings === 'beforeSemester' ? null : 'beforeSemester')}
                                    className="p-0.5 rounded bg-white shadow-sm"
                                  >
                                    <Settings size={8} className={editingSettings === 'beforeSemester' ? 'text-blue-500' : 'text-gray-400'} />
                                  </button>
                                  <button
                                    onClick={() => toggleLock('beforeSemester')}
                                    className="p-0.5 rounded bg-white shadow-sm"
                                  >
                                    {locks.beforeSemester ? <Lock size={10} className="text-red-500" /> : <Unlock size={10} className="text-gray-400" />}
                                  </button>
                                </div>
                              </div>

                              {editingSettings === 'beforeSemester' && (
                                <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <button
                                      onClick={() => toggleRangeMode('beforeSemester')}
                                      className={`px-1 py-0.5 text-xs rounded ${rangeMode.beforeSemester === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                    >
                                      Flex
                                    </button>
                                    <button
                                      onClick={() => toggleRangeMode('beforeSemester')}
                                      className={`px-1 py-0.5 text-xs rounded ${rangeMode.beforeSemester === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                    >
                                      Enforce
                                    </button>
                                  </div>
                                  {rangeMode.beforeSemester === 'enforced' && (
                                    <div className="flex gap-1 text-xs">
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Min"
                                        value={rangeValues.beforeSemester.min}
                                        onChange={(e) => updateRangeValue('beforeSemester', 'min', e.target.value)}
                                        className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                                      />
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Max"
                                        value={rangeValues.beforeSemester.max}
                                        onChange={(e) => updateRangeValue('beforeSemester', 'max', e.target.value)}
                                        className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              <input
                                type="range"
                                min={getEffectiveRange('beforeSemester').min}
                                max={getEffectiveRange('beforeSemester').max}
                                step="500"
                                value={variableItems.beforeSemester}
                                onChange={(e) => updateVariableItem('beforeSemester', Number(e.target.value))}
                                disabled={locks.beforeSemester}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                style={{
                                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${(variableItems.beforeSemester / getEffectiveRange('beforeSemester').max) * 100}%, #ffedd5 ${(variableItems.beforeSemester / getEffectiveRange('beforeSemester').max) * 100}%, #ffedd5 100%)`
                                }}
                              />
                            </div>
                          </div>

                          {/* During Semester */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleExpanded('duringSemester')}
                                    className="p-0.5 hover:bg-orange-50 rounded"
                                  >
                                    {expanded.duringSemester ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  </button>
                                  <span className="text-xs">During Semester:</span>
                                  <input
                                    type="text"
                                    value={formatNumber(variableItems.duringSemester)}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/,/g, '');
                                      updateVariableItem('duringSemester', Math.max(0, Number(value) || 0));
                                    }}
                                    disabled={locks.duringSemester}
                                    className="w-20 px-1 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                                  />
                                </div>
                                <div className="flex gap-0.5">
                                  <button
                                    onClick={() => setEditingSettings(editingSettings === 'duringSemester' ? null : 'duringSemester')}
                                    className="p-0.5 rounded bg-white shadow-sm"
                                  >
                                    <Settings size={8} className={editingSettings === 'duringSemester' ? 'text-blue-500' : 'text-gray-400'} />
                                  </button>
                                  <button
                                    onClick={() => toggleLock('duringSemester')}
                                    className="p-0.5 rounded bg-white shadow-sm"
                                  >
                                    {locks.duringSemester ? <Lock size={10} className="text-red-500" /> : <Unlock size={10} className="text-gray-400" />}
                                  </button>
                                </div>
                              </div>

                              {editingSettings === 'duringSemester' && (
                                <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <button
                                      onClick={() => toggleRangeMode('duringSemester')}
                                      className={`px-1 py-0.5 text-xs rounded ${rangeMode.duringSemester === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                    >
                                      Flex
                                    </button>
                                    <button
                                      onClick={() => toggleRangeMode('duringSemester')}
                                      className={`px-1 py-0.5 text-xs rounded ${rangeMode.duringSemester === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                    >
                                      Enforce
                                    </button>
                                  </div>
                                  {rangeMode.duringSemester === 'enforced' && (
                                    <div className="flex gap-1 text-xs">
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Min"
                                        value={rangeValues.duringSemester.min}
                                        onChange={(e) => updateRangeValue('duringSemester', 'min', e.target.value)}
                                        className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                                      />
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Max"
                                        value={rangeValues.duringSemester.max}
                                        onChange={(e) => updateRangeValue('duringSemester', 'max', e.target.value)}
                                        className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              <input
                                type="range"
                                min={getEffectiveRange('duringSemester').min}
                                max={getEffectiveRange('duringSemester').max}
                                step="500"
                                value={variableItems.duringSemester}
                                onChange={(e) => updateVariableItem('duringSemester', Number(e.target.value))}
                                disabled={locks.duringSemester}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                style={{
                                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${(variableItems.duringSemester / getEffectiveRange('duringSemester').max) * 100}%, #ffedd5 ${(variableItems.duringSemester / getEffectiveRange('duringSemester').max) * 100}%, #ffedd5 100%)`
                                }}
                              />

                              {/* During Semester Sub-items */}
                              {expanded.duringSemester && (
                                <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-orange-50">
                                  {/* Leads/other roles */}
                                  {renderDuringItem('leadsOtherRoles', 'Leads/other roles')}

                                  {/* Residential Faculty */}
                                  {renderDuringItem('residentialFaculty', 'Residential Faculty')}

                                  {/* RAs */}
                                  {renderDuringItem('ras', 'RAs')}

                                  {/* Retreat teacher */}
                                  {renderDuringItem('retreatTeacher', 'Retreat teacher')}

                                  {/* Daylong Visiting teacher */}
                                  {renderDuringItem('daylongVisitingTeacher', 'Daylong Visiting teacher')}

                                  {/* Weeklong Visiting teacher */}
                                  {renderDuringItem('weeklongVisitingTeacher', 'Weeklong Visiting teacher')}

                                  {/* Head Cook */}
                                  {renderDuringItem('headCook', 'Head Cook')}

                                  {/* Assistant Cook */}
                                  {renderDuringItem('assistantCook', 'Assistant Cook')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scholarships */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Scholarships:</span>
                          <input
                            type="text"
                            value={formatNumber(variableItems.scholarships)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              updateVariableItem('scholarships', Math.max(0, Number(value) || 0));
                            }}
                            disabled={locks.scholarships}
                            className="w-24 px-2 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setEditingSettings(editingSettings === 'scholarships' ? null : 'scholarships')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            <Settings size={10} className={editingSettings === 'scholarships' ? 'text-blue-500' : 'text-gray-400'} />
                          </button>
                          <button
                            onClick={() => toggleLock('scholarships')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            {locks.scholarships ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {editingSettings === 'scholarships' && (
                        <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                          <div className="flex items-center gap-1 mb-0.5">
                            <button
                              onClick={() => toggleRangeMode('scholarships')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.scholarships === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Flex
                            </button>
                            <button
                              onClick={() => toggleRangeMode('scholarships')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.scholarships === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Enforce
                            </button>
                          </div>
                          {rangeMode.scholarships === 'enforced' && (
                            <div className="flex gap-1 text-xs">
                              <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={rangeValues.scholarships.min}
                                onChange={(e) => updateRangeValue('scholarships', 'min', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={rangeValues.scholarships.max}
                                onChange={(e) => updateRangeValue('scholarships', 'max', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="range"
                        min={getEffectiveRange('scholarships').min}
                        max={getEffectiveRange('scholarships').max}
                        step="500"
                        value={variableItems.scholarships}
                        onChange={(e) => updateVariableItem('scholarships', Number(e.target.value))}
                        disabled={locks.scholarships}
                        className="w-full h-1 bg-orange-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Costs */}
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpanded('fixedCosts')}
                    className="p-1 hover:bg-orange-100 rounded"
                  >
                    {expanded.fixedCosts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <label className="font-medium">Fixed Costs:</label>
                  <input
                    type="text"
                    value={formatNumber(budget.fixedCosts)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      updateBudget('fixedCosts', Math.max(0, Number(value) || 0));
                    }}
                    disabled={locks.fixedCosts}
                    className="w-28 px-2 py-0.5 text-sm text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingSettings(editingSettings === 'fixedCosts' ? null : 'fixedCosts')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    <Settings size={14} className={editingSettings === 'fixedCosts' ? 'text-blue-500' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={() => toggleLock('fixedCosts')}
                    className="p-1 rounded bg-white shadow-sm"
                  >
                    {locks.fixedCosts ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {editingSettings === 'fixedCosts' && (
                <div className="mb-2 p-2 bg-white rounded border border-orange-300 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => toggleRangeMode('fixedCosts')}
                      className={`px-2 py-0.5 rounded ${rangeMode.fixedCosts === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Flexible
                    </button>
                    <button
                      onClick={() => toggleRangeMode('fixedCosts')}
                      className={`px-2 py-0.5 rounded ${rangeMode.fixedCosts === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Enforced
                    </button>
                  </div>
                  {rangeMode.fixedCosts === 'enforced' && (
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <label>Min:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.fixedCosts.min}
                          onChange={(e) => updateRangeValue('fixedCosts', 'min', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label>Max:</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={rangeValues.fixedCosts.max}
                          onChange={(e) => updateRangeValue('fixedCosts', 'max', e.target.value)}
                          className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                type="range"
                min={getEffectiveRange('fixedCosts').min}
                max={getEffectiveRange('fixedCosts').max}
                step="1000"
                value={budget.fixedCosts}
                onChange={(e) => updateBudget('fixedCosts', Number(e.target.value))}
                disabled={locks.fixedCosts}
                className="w-full h-2.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #fb923c 0%, #fb923c ${(budget.fixedCosts / getEffectiveRange('fixedCosts').max) * 100}%, #fed7aa ${(budget.fixedCosts / getEffectiveRange('fixedCosts').max) * 100}%, #fed7aa 100%)`
                }}
              />

              {/* Fixed Cost Line Items */}
              {expanded.fixedCosts && (
                <div className="mt-3 space-y-2 pl-6 border-l-2 border-orange-200">
                  {/* Rent */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Rent:</span>
                          <input
                            type="text"
                            value={formatNumber(fixedItems.rent)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              updateFixedItem('rent', Math.max(0, Number(value) || 0));
                            }}
                            disabled={locks.rent}
                            className="w-24 px-2 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setEditingSettings(editingSettings === 'rent' ? null : 'rent')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            <Settings size={10} className={editingSettings === 'rent' ? 'text-blue-500' : 'text-gray-400'} />
                          </button>
                          <button
                            onClick={() => toggleLock('rent')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            {locks.rent ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {editingSettings === 'rent' && (
                        <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                          <div className="flex items-center gap-1 mb-0.5">
                            <button
                              onClick={() => toggleRangeMode('rent')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.rent === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Flex
                            </button>
                            <button
                              onClick={() => toggleRangeMode('rent')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.rent === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Enforce
                            </button>
                          </div>
                          {rangeMode.rent === 'enforced' && (
                            <div className="flex gap-1 text-xs">
                              <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={rangeValues.rent.min}
                                onChange={(e) => updateRangeValue('rent', 'min', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={rangeValues.rent.max}
                                onChange={(e) => updateRangeValue('rent', 'max', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="range"
                        min={getEffectiveRange('rent').min}
                        max={getEffectiveRange('rent').max}
                        step="500"
                        value={fixedItems.rent}
                        onChange={(e) => updateFixedItem('rent', Number(e.target.value))}
                        disabled={locks.rent}
                        className="w-full h-1 bg-orange-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Utilities */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Utilities:</span>
                          <input
                            type="text"
                            value={formatNumber(fixedItems.utilities)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              updateFixedItem('utilities', Math.max(0, Number(value) || 0));
                            }}
                            disabled={locks.utilities}
                            className="w-24 px-2 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setEditingSettings(editingSettings === 'utilities' ? null : 'utilities')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            <Settings size={10} className={editingSettings === 'utilities' ? 'text-blue-500' : 'text-gray-400'} />
                          </button>
                          <button
                            onClick={() => toggleLock('utilities')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            {locks.utilities ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {editingSettings === 'utilities' && (
                        <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                          <div className="flex items-center gap-1 mb-0.5">
                            <button
                              onClick={() => toggleRangeMode('utilities')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.utilities === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Flex
                            </button>
                            <button
                              onClick={() => toggleRangeMode('utilities')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.utilities === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Enforce
                            </button>
                          </div>
                          {rangeMode.utilities === 'enforced' && (
                            <div className="flex gap-1 text-xs">
                              <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={rangeValues.utilities.min}
                                onChange={(e) => updateRangeValue('utilities', 'min', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={rangeValues.utilities.max}
                                onChange={(e) => updateRangeValue('utilities', 'max', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="range"
                        min={getEffectiveRange('utilities').min}
                        max={getEffectiveRange('utilities').max}
                        step="500"
                        value={fixedItems.utilities}
                        onChange={(e) => updateFixedItem('utilities', Number(e.target.value))}
                        disabled={locks.utilities}
                        className="w-full h-1 bg-orange-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Insurance:</span>
                          <input
                            type="text"
                            value={formatNumber(fixedItems.insurance)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              updateFixedItem('insurance', Math.max(0, Number(value) || 0));
                            }}
                            disabled={locks.insurance}
                            className="w-24 px-2 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setEditingSettings(editingSettings === 'insurance' ? null : 'insurance')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            <Settings size={10} className={editingSettings === 'insurance' ? 'text-blue-500' : 'text-gray-400'} />
                          </button>
                          <button
                            onClick={() => toggleLock('insurance')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            {locks.insurance ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {editingSettings === 'insurance' && (
                        <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                          <div className="flex items-center gap-1 mb-0.5">
                            <button
                              onClick={() => toggleRangeMode('insurance')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.insurance === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Flex
                            </button>
                            <button
                              onClick={() => toggleRangeMode('insurance')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.insurance === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Enforce
                            </button>
                          </div>
                          {rangeMode.insurance === 'enforced' && (
                            <div className="flex gap-1 text-xs">
                              <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={rangeValues.insurance.min}
                                onChange={(e) => updateRangeValue('insurance', 'min', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={rangeValues.insurance.max}
                                onChange={(e) => updateRangeValue('insurance', 'max', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="range"
                        min={getEffectiveRange('insurance').min}
                        max={getEffectiveRange('insurance').max}
                        step="500"
                        value={fixedItems.insurance}
                        onChange={(e) => updateFixedItem('insurance', Number(e.target.value))}
                        disabled={locks.insurance}
                        className="w-full h-1 bg-orange-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Maintenance:</span>
                          <input
                            type="text"
                            value={formatNumber(fixedItems.maintenance)}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              updateFixedItem('maintenance', Math.max(0, Number(value) || 0));
                            }}
                            disabled={locks.maintenance}
                            className="w-24 px-2 py-0.5 text-xs text-center border border-orange-300 rounded disabled:opacity-50 disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setEditingSettings(editingSettings === 'maintenance' ? null : 'maintenance')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            <Settings size={10} className={editingSettings === 'maintenance' ? 'text-blue-500' : 'text-gray-400'} />
                          </button>
                          <button
                            onClick={() => toggleLock('maintenance')}
                            className="p-0.5 rounded bg-white shadow-sm"
                          >
                            {locks.maintenance ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {editingSettings === 'maintenance' && (
                        <div className="mb-1 p-1 bg-white rounded border border-orange-200 text-xs">
                          <div className="flex items-center gap-1 mb-0.5">
                            <button
                              onClick={() => toggleRangeMode('maintenance')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.maintenance === 'flexible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Flex
                            </button>
                            <button
                              onClick={() => toggleRangeMode('maintenance')}
                              className={`px-1 py-0.5 text-xs rounded ${rangeMode.maintenance === 'enforced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              Enforce
                            </button>
                          </div>
                          {rangeMode.maintenance === 'enforced' && (
                            <div className="flex gap-1 text-xs">
                              <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={rangeValues.maintenance.min}
                                onChange={(e) => updateRangeValue('maintenance', 'min', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={rangeValues.maintenance.max}
                                onChange={(e) => updateRangeValue('maintenance', 'max', e.target.value)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="range"
                        min={getEffectiveRange('maintenance').min}
                        max={getEffectiveRange('maintenance').max}
                        step="500"
                        value={fixedItems.maintenance}
                        onChange={(e) => updateFixedItem('maintenance', Number(e.target.value))}
                        disabled={locks.maintenance}
                        className="w-full h-1 bg-orange-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="font-semibold text-orange-800">
                Total Expenses: {formatCurrency(budget.variableCosts + budget.fixedCosts)}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Check */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          {(() => {
            const totalIncome = budget.reserves + budget.tuition + budget.fundraising;
            const totalExpenses = budget.variableCosts + budget.fixedCosts;
            const difference = totalIncome - totalExpenses;

            if (Math.abs(difference) < 100) {
              return (
                <p className="text-lg font-semibold">
                  Budget Balance: <span className="text-green-600">✓ Balanced</span>
                </p>
              );
            } else if (difference < 0) {
              return (
                <div>
                  <p className="text-lg font-semibold text-red-600">
                    ⚠ Budget Deficit: {formatCurrency(Math.abs(difference))}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Total costs exceed total income
                  </p>
                </div>
              );
            } else {
              return (
                <div>
                  <p className="text-lg font-semibold text-green-600">
                    ✓ Budget Surplus: {formatCurrency(difference)}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Income exceeds costs - this surplus will be added as reserves for the next Contemplative Semester
                  </p>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <Users className="text-blue-600" />
          How to Use This Tool
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Adjust any slider to see how it affects other budget components</li>
          <li>• Click the lock icon to fix a value - other values will adjust around it</li>
          <li>• <strong>Click the dropdown arrows to see and adjust individual line items</strong></li>
          <li>• Lock the category total and adjust line items to redistribute within that category</li>
          <li>• The equation automatically balances when you change values</li>
        </ul>
      </div>
    </div>
  );
};

export default BudgetCalculator;
