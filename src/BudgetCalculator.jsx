import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Calculator, Users, ChevronDown, ChevronUp } from 'lucide-react';
import BudgetSlider from './components/BudgetSlider';
import BudgetItem from './components/BudgetItem';
import StaffSalaries from './components/StaffSalaries';
import { formatCurrency } from './utils/budgetHelpers';

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
    reserves: true, // Locked by default
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
    maintenance: false,
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
    variableCosts: false,
    fixedCosts: false
  });

  // Update budget totals when line items change
  useEffect(() => {
    const variableTotal = Object.values(variableItems).reduce((sum, val) => sum + val, 0);
    const fixedTotal = Object.values(fixedItems).reduce((sum, val) => sum + val, 0);

    setBudget(prev => {
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

    if (component === 'total') {
      const diff = value - budget.total;
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

      const expenseLocked = countLocks('expense');
      if (expenseLocked < 2) {
        const expenseAdjustment = diff / 2;
        if (!locks.variableCosts && !locks.fixedCosts) {
          newBudget.variableCosts = Math.max(0, budget.variableCosts + expenseAdjustment * 0.67);
          newBudget.fixedCosts = Math.max(0, budget.fixedCosts + expenseAdjustment * 0.33);

          if (budget.variableCosts > 0) {
            const variableRatio = newBudget.variableCosts / budget.variableCosts;
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * variableRatio)])
            ));
          }

          if (budget.fixedCosts > 0) {
            const fixedRatio = newBudget.fixedCosts / budget.fixedCosts;
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * fixedRatio)])
            ));
          }
        } else if (!locks.variableCosts) {
          newBudget.variableCosts = Math.max(0, budget.variableCosts + expenseAdjustment);
          if (budget.variableCosts > 0) {
            const ratio = newBudget.variableCosts / budget.variableCosts;
            setVariableItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
            ));
          }
        } else if (!locks.fixedCosts) {
          newBudget.fixedCosts = Math.max(0, budget.fixedCosts + expenseAdjustment);
          if (budget.fixedCosts > 0) {
            const ratio = newBudget.fixedCosts / budget.fixedCosts;
            setFixedItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
            ));
          }
        }
      }
    } else if (['reserves', 'tuition', 'fundraising'].includes(component)) {
      const incomeSum = newBudget.reserves + newBudget.tuition + newBudget.fundraising;

      if (locks.total) {
        const diff = incomeSum - budget.total;
        const otherComponents = ['reserves', 'tuition', 'fundraising'].filter(c => c !== component && !locks[c]);

        if (otherComponents.length > 0) {
          const adjustment = diff / otherComponents.length;
          otherComponents.forEach(c => {
            newBudget[c] = Math.max(0, budget[c] - adjustment);
          });
        }
      } else {
        newBudget.total = incomeSum;
        const expenseSum = newBudget.variableCosts + newBudget.fixedCosts;
        if (expenseSum !== newBudget.total) {
          if (!locks.variableCosts && !locks.fixedCosts) {
            const diff = newBudget.total - expenseSum;
            newBudget.variableCosts += diff * 0.67;
            newBudget.fixedCosts += diff * 0.33;

            if (budget.variableCosts > 0) {
              const variableRatio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * variableRatio)])
              ));
            }

            if (budget.fixedCosts > 0) {
              const fixedRatio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * fixedRatio)])
              ));
            }
          } else if (!locks.variableCosts) {
            newBudget.variableCosts = newBudget.total - newBudget.fixedCosts;
            if (budget.variableCosts > 0) {
              const ratio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
              ));
            }
          } else if (!locks.fixedCosts) {
            newBudget.fixedCosts = newBudget.total - newBudget.variableCosts;
            if (budget.fixedCosts > 0) {
              const ratio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
              ));
            }
          }
        }
      }
    } else if (['variableCosts', 'fixedCosts'].includes(component)) {
      const expenseSum = newBudget.variableCosts + newBudget.fixedCosts;

      if (locks.total) {
        const diff = expenseSum - budget.total;
        const otherComponent = component === 'variableCosts' ? 'fixedCosts' : 'variableCosts';

        if (!locks[otherComponent]) {
          newBudget[otherComponent] = Math.max(0, budget[otherComponent] - diff);

          if (otherComponent === 'variableCosts') {
            if (budget.variableCosts > 0) {
              const ratio = newBudget.variableCosts / budget.variableCosts;
              setVariableItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
              ));
            }
          } else {
            if (budget.fixedCosts > 0) {
              const ratio = newBudget.fixedCosts / budget.fixedCosts;
              setFixedItems(prev => Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
              ));
            }
          }
        }
      } else {
        newBudget.total = expenseSum;
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

      if (component === 'variableCosts') {
        if (budget.variableCosts > 0) {
          const ratio = value / budget.variableCosts;
          setVariableItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
          ));
        }
      } else {
        if (budget.fixedCosts > 0) {
          const ratio = value / budget.fixedCosts;
          setFixedItems(prev => Object.fromEntries(
            Object.entries(prev).map(([k, v]) => [k, Math.max(0, v * ratio)])
          ));
        }
      }
    }

    setBudget(newBudget);
  };

  const toggleLock = (component) => {
    setLocks(prev => ({ ...prev, [component]: !prev[component] }));
  };

  const toggleExpanded = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate budget balance
  const income = budget.reserves + budget.tuition + budget.fundraising;
  const expenses = budget.variableCosts + budget.fixedCosts;
  const balance = income - expenses;
  const isBalanced = Math.abs(balance) < 100;

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
        <BudgetSlider
          label="Total Budget"
          value={budget.total}
          min={50000}
          max={500000}
          step={5000}
          locked={locks.total}
          onToggleLock={() => toggleLock('total')}
          onChange={(val) => updateBudget('total', val)}
          color="green"
          size="lg"
        />

        {/* Income Section - Full Width */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Income Sources</h3>

          <BudgetSlider
            label="Reserves"
            value={budget.reserves}
            min={0}
            max={200000}
            step={1000}
            locked={locks.reserves}
            onToggleLock={() => toggleLock('reserves')}
            onChange={(val) => updateBudget('reserves', val)}
            color="blue"
          />

          <BudgetSlider
            label="Tuition"
            value={budget.tuition}
            min={0}
            max={300000}
            step={1000}
            locked={locks.tuition}
            onToggleLock={() => toggleLock('tuition')}
            onChange={(val) => updateBudget('tuition', val)}
            color="blue"
          />

          <BudgetSlider
            label="Fundraising"
            value={budget.fundraising}
            min={0}
            max={200000}
            step={1000}
            locked={locks.fundraising}
            onToggleLock={() => toggleLock('fundraising')}
            onChange={(val) => updateBudget('fundraising', val)}
            color="blue"
          />

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="font-semibold text-blue-800">
              Total Income: {formatCurrency(income)}
            </p>
          </div>
        </div>

        {/* Expenses Section - Full Width */}
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
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${(budget.variableCosts / 300000) * 100}%, #ffedd5 ${(budget.variableCosts / 300000) * 100}%, #ffedd5 100%)`
              }}
              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />

            {/* Variable Cost Line Items */}
            {expanded.variableCosts && (
              <div className="mt-3 space-y-2 pl-6 border-l-2 border-orange-200">
                <BudgetItem
                  label="Food"
                  value={variableItems.food}
                  min={0}
                  max={100000}
                  step={500}
                  locked={locks.food}
                  onToggleLock={() => toggleLock('food')}
                  onChange={(val) => updateVariableItem('food', val)}
                />

                <StaffSalaries
                  total={variableItems.staffSalaries}
                  locked={locks.staffSalaries}
                  onToggleLock={() => toggleLock('staffSalaries')}
                  onChange={(val) => updateVariableItem('staffSalaries', val)}
                  locks={locks}
                  onToggleLockItem={toggleLock}
                />

                <BudgetItem
                  label="Scholarships"
                  value={variableItems.scholarships}
                  min={0}
                  max={100000}
                  step={500}
                  locked={locks.scholarships}
                  onToggleLock={() => toggleLock('scholarships')}
                  onChange={(val) => updateVariableItem('scholarships', val)}
                />
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
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${(budget.fixedCosts / 200000) * 100}%, #ffedd5 ${(budget.fixedCosts / 200000) * 100}%, #ffedd5 100%)`
              }}
              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />

            {/* Fixed Cost Line Items */}
            {expanded.fixedCosts && (
              <div className="mt-3 space-y-2 pl-6 border-l-2 border-orange-200">
                <BudgetItem
                  label="Rent"
                  value={fixedItems.rent}
                  min={0}
                  max={100000}
                  step={500}
                  locked={locks.rent}
                  onToggleLock={() => toggleLock('rent')}
                  onChange={(val) => updateFixedItem('rent', val)}
                />

                <BudgetItem
                  label="Utilities"
                  value={fixedItems.utilities}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks.utilities}
                  onToggleLock={() => toggleLock('utilities')}
                  onChange={(val) => updateFixedItem('utilities', val)}
                />

                <BudgetItem
                  label="Insurance"
                  value={fixedItems.insurance}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks.insurance}
                  onToggleLock={() => toggleLock('insurance')}
                  onChange={(val) => updateFixedItem('insurance', val)}
                />

                <BudgetItem
                  label="Maintenance"
                  value={fixedItems.maintenance}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks.maintenance}
                  onToggleLock={() => toggleLock('maintenance')}
                  onChange={(val) => updateFixedItem('maintenance', val)}
                />
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-orange-100 rounded-lg">
            <p className="font-semibold text-orange-800">
              Total Expenses: {formatCurrency(expenses)}
            </p>
          </div>
        </div>

        {/* Balance Check with Deficit/Surplus */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-lg font-semibold">
            {isBalanced ? (
              <span className="text-green-600">✓ Budget Balanced</span>
            ) : balance > 0 ? (
              <>
                <span className="text-blue-600">Budget Surplus: {formatCurrency(balance)}</span>
                <span className="block text-sm text-gray-600 mt-1">
                  Surplus goes to next Contemplative Semester
                </span>
              </>
            ) : (
              <span className="text-red-600">Budget Deficit: {formatCurrency(Math.abs(balance))}</span>
            )}
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
          <li>• Staff Salaries has nested items with Before/During Semester breakdown</li>
          <li>• During Semester items show Total = Rate × Quantity for detailed planning</li>
          <li>• Lock the category total and adjust line items to redistribute within that category</li>
          <li>• The equation automatically balances when you change values</li>
        </ul>
      </div>
    </div>
  );
};

export default BudgetCalculator;
