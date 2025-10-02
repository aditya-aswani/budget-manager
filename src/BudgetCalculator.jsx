import React, { useState, useEffect } from 'react';
import { Lock, Unlock, DollarSign, Users, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

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
    reserves: false,
    tuition: false,
    fundraising: false,
    variableCosts: false,
    fixedCosts: false,
    // Individual item locks
    food: false,
    staffSalaries: false,
    scholarships: false,
    rent: false,
    utilities: false,
    insurance: false,
    maintenance: false
  });

  // Dropdown expansion states
  const [expanded, setExpanded] = useState({
    variableCosts: false,
    fixedCosts: false
  });


  // Update budget totals when line items change
  useEffect(() => {
    const variableTotal = Object.values(variableItems).reduce((sum, val) => sum + val, 0);
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
    newItems[item] = value;

    if (locks.variableCosts) {
      // If variable costs total is locked, adjust other unlocked items
      const diff = value - variableItems[item];
      const unlockedItems = Object.keys(variableItems).filter(k => k !== item && !locks[k]);

      if (unlockedItems.length > 0) {
        const adjustment = diff / unlockedItems.length;
        unlockedItems.forEach(k => {
          newItems[k] = Math.max(0, variableItems[k] - adjustment);
        });
      }
    }

    setVariableItems(newItems);
  };

  // Function to update fixed cost items
  const updateFixedItem = (item, value) => {
    const newItems = { ...fixedItems };
    newItems[item] = value;

    if (locks.fixedCosts) {
      // If fixed costs total is locked, adjust other unlocked items
      const diff = value - fixedItems[item];
      const unlockedItems = Object.keys(fixedItems).filter(k => k !== item && !locks[k]);

      if (unlockedItems.length > 0) {
        const adjustment = diff / unlockedItems.length;
        unlockedItems.forEach(k => {
          newItems[k] = Math.max(0, fixedItems[k] - adjustment);
        });
      }
    }

    setFixedItems(newItems);
  };

  // Function to update budget while respecting locks
  const updateBudget = (component, value) => {
    const newBudget = { ...budget };
    newBudget[component] = value;

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
          newBudget.reserves = Math.max(0, budget.reserves + shareReserves);
        }
        if (!locks.tuition && incomeLocked < 2) {
          const shareTuition = incomeAdjustment / (3 - incomeLocked);
          newBudget.tuition = Math.max(0, budget.tuition + shareTuition);
        }
        if (!locks.fundraising && incomeLocked < 2) {
          const shareFundraising = incomeAdjustment / (3 - incomeLocked);
          newBudget.fundraising = Math.max(0, budget.fundraising + shareFundraising);
        }
      }

      // Adjust expense side
      const expenseLocked = countLocks('expense');
      if (expenseLocked < 2) {
        const expenseAdjustment = diff / 2;
        if (!locks.variableCosts && !locks.fixedCosts) {
          newBudget.variableCosts = Math.max(0, budget.variableCosts + expenseAdjustment * 0.67);
          newBudget.fixedCosts = Math.max(0, budget.fixedCosts + expenseAdjustment * 0.33);

          // Update line items proportionally
          if (budget.variableCosts > 0) {
            const variableRatio = newBudget.variableCosts / budget.variableCosts;
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * variableRatio)])
            ));
          } else if (newBudget.variableCosts > 0) {
            // If old total was 0, distribute new value evenly
            const numItems = Object.keys(variableItems).length;
            const perItem = newBudget.variableCosts / numItems;
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k]) => [k, perItem])
            ));
          }

          if (budget.fixedCosts > 0) {
            const fixedRatio = newBudget.fixedCosts / budget.fixedCosts;
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * fixedRatio)])
            ));
          } else if (newBudget.fixedCosts > 0) {
            // If old total was 0, distribute new value evenly
            const numItems = Object.keys(fixedItems).length;
            const perItem = newBudget.fixedCosts / numItems;
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k]) => [k, perItem])
            ));
          }
        } else if (!locks.variableCosts) {
          newBudget.variableCosts = Math.max(0, budget.variableCosts + expenseAdjustment);
          if (budget.variableCosts > 0) {
            const ratio = newBudget.variableCosts / budget.variableCosts;
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
            ));
          } else if (newBudget.variableCosts > 0) {
            const numItems = Object.keys(variableItems).length;
            const perItem = newBudget.variableCosts / numItems;
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k]) => [k, perItem])
            ));
          }
        } else if (!locks.fixedCosts) {
          newBudget.fixedCosts = Math.max(0, budget.fixedCosts + expenseAdjustment);
          if (budget.fixedCosts > 0) {
            const ratio = newBudget.fixedCosts / budget.fixedCosts;
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
            ));
          } else if (newBudget.fixedCosts > 0) {
            const numItems = Object.keys(fixedItems).length;
            const perItem = newBudget.fixedCosts / numItems;
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
            newBudget[c] = Math.max(0, budget[c] - adjustment);
          });
        }
      } else {
        // Total is not locked, update it
        newBudget.total = incomeSum;
        // Keep expenses in sync
        const expenseSum = newBudget.variableCosts + newBudget.fixedCosts;
        if (expenseSum !== newBudget.total) {
          if (!locks.variableCosts && !locks.fixedCosts) {
            const diff = newBudget.total - expenseSum;
            newBudget.variableCosts += diff * 0.67;
            newBudget.fixedCosts += diff * 0.33;

            // Update line items
            if (budget.variableCosts > 0) {
              const variableRatio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * variableRatio)])
              ));
            } else if (newBudget.variableCosts > 0) {
              const numItems = Object.keys(variableItems).length;
              const perItem = newBudget.variableCosts / numItems;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }

            if (budget.fixedCosts > 0) {
              const fixedRatio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * fixedRatio)])
              ));
            } else if (newBudget.fixedCosts > 0) {
              const numItems = Object.keys(fixedItems).length;
              const perItem = newBudget.fixedCosts / numItems;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          } else if (!locks.variableCosts) {
            newBudget.variableCosts = newBudget.total - newBudget.fixedCosts;
            if (budget.variableCosts > 0) {
              const ratio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
              ));
            } else if (newBudget.variableCosts > 0) {
              const numItems = Object.keys(variableItems).length;
              const perItem = newBudget.variableCosts / numItems;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          } else if (!locks.fixedCosts) {
            newBudget.fixedCosts = newBudget.total - newBudget.variableCosts;
            if (budget.fixedCosts > 0) {
              const ratio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
              ));
            } else if (newBudget.fixedCosts > 0) {
              const numItems = Object.keys(fixedItems).length;
              const perItem = newBudget.fixedCosts / numItems;
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
          newBudget[otherComponent] = Math.max(0, budget[otherComponent] - diff);

          // Update line items for the adjusted component
          if (otherComponent === 'variableCosts') {
            if (budget.variableCosts > 0) {
              const ratio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
              ));
            } else if (newBudget.variableCosts > 0) {
              const numItems = Object.keys(variableItems).length;
              const perItem = newBudget.variableCosts / numItems;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          } else {
            if (budget.fixedCosts > 0) {
              const ratio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
              ));
            } else if (newBudget.fixedCosts > 0) {
              const numItems = Object.keys(fixedItems).length;
              const perItem = newBudget.fixedCosts / numItems;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k]) => [k, perItem])
              ));
            }
          }
        }
      } else {
        // Total is not locked, update it
        newBudget.total = expenseSum;
        // Keep income in sync
        const incomeSum = newBudget.reserves + newBudget.tuition + newBudget.fundraising;
        if (incomeSum !== newBudget.total) {
          const diff = newBudget.total - incomeSum;
          const unlockedIncome = ['reserves', 'tuition', 'fundraising'].filter(c => !locks[c]);

          if (unlockedIncome.length > 0) {
            const adjustment = diff / unlockedIncome.length;
            unlockedIncome.forEach(c => {
              newBudget[c] = Math.max(0, budget[c] + adjustment);
            });
          }
        }
      }

      // Update line items when total changes
      if (component === 'variableCosts') {
        if (budget.variableCosts > 0) {
          const ratio = value / budget.variableCosts;
          setVariableItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
          ));
        } else if (value > 0) {
          const numItems = Object.keys(variableItems).length;
          const perItem = value / numItems;
          setVariableItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k]) => [k, perItem])
          ));
        }
      } else {
        if (budget.fixedCosts > 0) {
          const ratio = value / budget.fixedCosts;
          setFixedItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
          ));
        } else if (value > 0) {
          const numItems = Object.keys(fixedItems).length;
          const perItem = value / numItems;
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


  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
            <label className="text-lg font-semibold text-green-800">
              Total Budget: {formatCurrency(budget.total)}
            </label>
            <button
              onClick={() => toggleLock('total')}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              {locks.total ? <Lock className="text-red-500" /> : <Unlock className="text-gray-400" />}
            </button>
          </div>
          <input
            type="range"
            min="50000"
            max="500000"
            step="5000"
            value={budget.total}
            onChange={(e) => updateBudget('total', Number(e.target.value))}
            disabled={locks.total}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* Income Components */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-700">Income Sources</h3>

            {/* Reserves */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">
                  Reserves: {formatCurrency(budget.reserves)}
                </label>
                <button
                  onClick={() => toggleLock('reserves')}
                  className="p-1 rounded bg-white shadow-sm"
                >
                  {locks.reserves ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="1000"
                value={budget.reserves}
                onChange={(e) => updateBudget('reserves', Number(e.target.value))}
                disabled={locks.reserves}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Tuition */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">
                  Tuition: {formatCurrency(budget.tuition)}
                </label>
                <button
                  onClick={() => toggleLock('tuition')}
                  className="p-1 rounded bg-white shadow-sm"
                >
                  {locks.tuition ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="300000"
                step="1000"
                value={budget.tuition}
                onChange={(e) => updateBudget('tuition', Number(e.target.value))}
                disabled={locks.tuition}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Fundraising */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">
                  Fundraising: {formatCurrency(budget.fundraising)}
                </label>
                <button
                  onClick={() => toggleLock('fundraising')}
                  className="p-1 rounded bg-white shadow-sm"
                >
                  {locks.fundraising ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="1000"
                value={budget.fundraising}
                onChange={(e) => updateBudget('fundraising', Number(e.target.value))}
                disabled={locks.fundraising}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="font-semibold text-blue-800">
                Total Income: {formatCurrency(budget.reserves + budget.tuition + budget.fundraising)}
              </p>
            </div>
          </div>

          {/* Expense Components */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-orange-700">Expenses</h3>

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
                  <label className="font-medium">
                    Variable Costs: {formatCurrency(budget.variableCosts)}
                  </label>
                </div>
                <button
                  onClick={() => toggleLock('variableCosts')}
                  className="p-1 rounded bg-white shadow-sm"
                >
                  {locks.variableCosts ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="300000"
                step="1000"
                value={budget.variableCosts}
                onChange={(e) => updateBudget('variableCosts', Number(e.target.value))}
                disabled={locks.variableCosts}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />

              {/* Variable Cost Line Items */}
              {expanded.variableCosts && (
                <div className="mt-3 space-y-2 pl-6 border-l-2 border-orange-200">
                  {/* Food */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Food: {formatCurrency(variableItems.food)}</span>
                        <button
                          onClick={() => toggleLock('food')}
                          className="p-0.5 rounded bg-white shadow-sm"
                        >
                          {locks.food ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100000"
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
                        <span className="text-sm">Staff Salaries: {formatCurrency(variableItems.staffSalaries)}</span>
                        <button
                          onClick={() => toggleLock('staffSalaries')}
                          className="p-0.5 rounded bg-white shadow-sm"
                        >
                          {locks.staffSalaries ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200000"
                        step="1000"
                        value={variableItems.staffSalaries}
                        onChange={(e) => updateVariableItem('staffSalaries', Number(e.target.value))}
                        disabled={locks.staffSalaries}
                        className="w-full h-1 bg-orange-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Scholarships */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Scholarships: {formatCurrency(variableItems.scholarships)}</span>
                        <button
                          onClick={() => toggleLock('scholarships')}
                          className="p-0.5 rounded bg-white shadow-sm"
                        >
                          {locks.scholarships ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100000"
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
                  <label className="font-medium">
                    Fixed Costs: {formatCurrency(budget.fixedCosts)}
                  </label>
                </div>
                <button
                  onClick={() => toggleLock('fixedCosts')}
                  className="p-1 rounded bg-white shadow-sm"
                >
                  {locks.fixedCosts ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="1000"
                value={budget.fixedCosts}
                onChange={(e) => updateBudget('fixedCosts', Number(e.target.value))}
                disabled={locks.fixedCosts}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />

              {/* Fixed Cost Line Items */}
              {expanded.fixedCosts && (
                <div className="mt-3 space-y-2 pl-6 border-l-2 border-orange-200">
                  {/* Rent */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Rent: {formatCurrency(fixedItems.rent)}</span>
                        <button
                          onClick={() => toggleLock('rent')}
                          className="p-0.5 rounded bg-white shadow-sm"
                        >
                          {locks.rent ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100000"
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
                        <span className="text-sm">Utilities: {formatCurrency(fixedItems.utilities)}</span>
                        <button
                          onClick={() => toggleLock('utilities')}
                          className="p-0.5 rounded bg-white shadow-sm"
                        >
                          {locks.utilities ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50000"
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
                        <span className="text-sm">Insurance: {formatCurrency(fixedItems.insurance)}</span>
                        <button
                          onClick={() => toggleLock('insurance')}
                          className="p-0.5 rounded bg-white shadow-sm"
                        >
                          {locks.insurance ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50000"
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
                        <span className="text-sm">Maintenance: {formatCurrency(fixedItems.maintenance)}</span>
                        <button
                          onClick={() => toggleLock('maintenance')}
                          className="p-0.5 rounded bg-white shadow-sm"
                        >
                          {locks.maintenance ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50000"
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
          <p className="text-lg font-semibold">
            Budget Balance: {Math.abs((budget.reserves + budget.tuition + budget.fundraising) - (budget.variableCosts + budget.fixedCosts)) < 100 ?
              <span className="text-green-600">✓ Balanced</span> :
              <span className="text-red-600">⚠ Unbalanced by {formatCurrency(Math.abs((budget.reserves + budget.tuition + budget.fundraising) - (budget.variableCosts + budget.fixedCosts)))}</span>
            }
          </p>
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
