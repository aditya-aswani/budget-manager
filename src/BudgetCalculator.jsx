import { Calculator, Users } from 'lucide-react';
import BudgetSlider from './components/BudgetSlider';
import IncomeSection from './components/sections/IncomeSection';
import ExpensesSection from './components/sections/ExpensesSection';
import BudgetSummary from './components/sections/BudgetSummary';
import { useBudgetState } from './hooks/useBudgetState';

const BudgetCalculator = () => {
  const {
    budget,
    incomeItems,
    expenseItems,
    locks,
    expanded,
    income,
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
  } = useBudgetState();

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
          <span className="text-blue-600"> (Tuition - Scholarships)</span> +
          <span className="text-blue-600"> Fundraising</span> =
          <span className="text-orange-600"> Staff Salaries</span> +
          <span className="text-orange-600"> Other Expenses</span>
        </div>

        {/* Total Budget Control */}
        <BudgetSlider
          label="Total Budget"
          value={budget.total}
          min={0}
          max={1500000}
          step={5000}
          locked={locks.total}
          onToggleLock={() => toggleLock('total')}
          onChange={(val) => updateBudget('total', val)}
          color="green"
          size="lg"
        />

        {/* Income Section */}
        <IncomeSection
          budget={budget}
          incomeItems={incomeItems}
          locks={locks}
          expanded={expanded}
          income={income}
          updateNetTuition={updateNetTuition}
          updateTuitionItem={updateTuitionItem}
          updateScholarshipsItem={updateScholarshipsItem}
          updateBudget={updateBudget}
          toggleLock={toggleLock}
          toggleExpanded={toggleExpanded}
        />

        {/* Expenses Section */}
        <ExpensesSection
          budget={budget}
          expenseItems={expenseItems}
          locks={locks}
          updateExpenseItem={updateExpenseItem}
          toggleLock={toggleLock}
          setExpenseItems={setExpenseItems}
        />

        {/* Balance Check */}
        <BudgetSummary balance={balance} isBalanced={isBalanced} />
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
