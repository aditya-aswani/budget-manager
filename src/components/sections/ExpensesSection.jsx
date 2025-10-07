import React from 'react';
import StaffSalaries from '../StaffSalaries';
import OtherExpenses from '../OtherExpenses';
import EditableNumber from '../EditableNumber';

const ExpensesSection = ({
  budget,
  expenseItems,
  expenseDetails,
  locks,
  updateExpenseItem,
  toggleLock,
  setExpenseItems,
  setExpenseDetails
}) => {
  const totalExpenses = budget.variableCosts + budget.fixedCosts;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-orange-700">Expenses</h3>

      <StaffSalaries
        total={expenseItems.staffSalaries}
        locked={locks.staffSalaries}
        onToggleLock={() => toggleLock('staffSalaries')}
        onChange={(val) => updateExpenseItem('staffSalaries', val)}
        locks={locks}
        onToggleLockItem={toggleLock}
        expenseDetails={expenseDetails}
        setExpenseDetails={setExpenseDetails}
      />

      <OtherExpenses
        total={expenseItems.otherExpenses}
        locked={locks.otherExpenses}
        onToggleLock={() => toggleLock('otherExpenses')}
        onChange={(val) => updateExpenseItem('otherExpenses', val)}
        locks={locks}
        onToggleLockItem={toggleLock}
        expenseDetails={expenseDetails}
        setExpenseDetails={setExpenseDetails}
      />

      <div className="mt-4 p-3 bg-orange-100 rounded-lg">
        <p className="font-semibold text-orange-800">
          Total Expenses: <EditableNumber value={totalExpenses} onChange={(val) => {
            const ratio = val / (totalExpenses || 1);
            setExpenseItems(prev => Object.fromEntries(
              Object.entries(prev).map(([k, v]) => [k, v * ratio])
            ));
          }} min={0} max={1000000} step={1000} />
        </p>
      </div>
    </div>
  );
};

export default ExpensesSection;
