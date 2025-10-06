import React from 'react';
import BudgetSlider from '../BudgetSlider';
import TuitionScholarshipsSection from './TuitionScholarshipsSection';
import EditableNumber from '../EditableNumber';

const IncomeSection = ({
  budget,
  incomeItems,
  locks,
  expanded,
  income,
  updateNetTuition,
  updateTuitionItem,
  updateScholarshipsItem,
  updateBudget,
  toggleLock,
  toggleExpanded
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-blue-700">Income Sources</h3>

      <BudgetSlider
        label="Reserves"
        value={budget.reserves}
        min={0}
        max={1000000}
        step={1000}
        locked={locks.reserves}
        onToggleLock={() => toggleLock('reserves')}
        onChange={(val) => updateBudget('reserves', val)}
        color="blue"
      />

      <TuitionScholarshipsSection
        budget={budget}
        incomeItems={incomeItems}
        locks={locks}
        expanded={expanded}
        updateNetTuition={updateNetTuition}
        updateTuitionItem={updateTuitionItem}
        updateScholarshipsItem={updateScholarshipsItem}
        toggleLock={toggleLock}
        toggleExpanded={toggleExpanded}
      />

      <BudgetSlider
        label="Fundraising"
        value={budget.fundraising}
        min={0}
        max={1000000}
        step={1000}
        locked={locks.fundraising}
        onToggleLock={() => toggleLock('fundraising')}
        onChange={(val) => updateBudget('fundraising', val)}
        color="blue"
      />

      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="font-semibold text-blue-800">
          Total Income: <EditableNumber value={income} onChange={(val) => {
            const diff = val - income;
            const unlockedIncome = ['reserves', 'tuition', 'fundraising'].filter(c => !locks[c]);
            if (unlockedIncome.length > 0) {
              const adjustment = diff / unlockedIncome.length;
              const newBudget = { ...budget };
              unlockedIncome.forEach(c => {
                newBudget[c] = Math.max(0, budget[c] + adjustment);
              });
              // Update reserves and fundraising
              if (unlockedIncome.includes('reserves')) {
                updateBudget('reserves', newBudget.reserves);
              }
              if (unlockedIncome.includes('fundraising')) {
                updateBudget('fundraising', newBudget.fundraising);
              }
              if (unlockedIncome.includes('tuition')) {
                updateNetTuition(newBudget.tuition);
              }
            }
          }} min={0} max={1000000} step={1000} />
        </p>
      </div>
    </div>
  );
};

export default IncomeSection;
