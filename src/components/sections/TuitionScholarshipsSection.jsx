import React from 'react';
import { Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
import BudgetItem from '../BudgetItem';
import EditableNumber from '../EditableNumber';

const TuitionScholarshipsSection = ({
  budget,
  incomeItems,
  locks,
  expanded,
  updateNetTuition,
  updateTuitionItem,
  updateScholarshipsItem,
  toggleLock,
  toggleExpanded
}) => {
  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleExpanded('tuitionScholarships')}
            className="p-1 hover:bg-blue-100 rounded"
          >
            {expanded.tuitionScholarships ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <label className="font-medium">
            (Tuition - Scholarships): <EditableNumber value={budget.tuition} onChange={updateNetTuition} min={0} max={1000000} step={1000} />
          </label>
        </div>
        <button
          onClick={() => toggleLock('tuition')}
          className="p-1 rounded bg-white shadow-sm"
        >
          {locks.tuition ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={1000000}
        step={1000}
        value={budget.tuition}
        onChange={(e) => updateNetTuition(Number(e.target.value))}
        disabled={locks.tuition}
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(budget.tuition / 1000000) * 100}%, #dbeafe ${(budget.tuition / 1000000) * 100}%, #dbeafe 100%)`
        }}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
      />

      {/* Tuition/Scholarships breakdown */}
      {expanded.tuitionScholarships && (
        <div className="mt-3 space-y-2 pl-6 border-l-2 border-blue-200">
          <BudgetItem
            label="Tuition"
            value={incomeItems.tuition || 0}
            min={0}
            max={1000000}
            step={1000}
            locked={locks.tuitionItem || false}
            onToggleLock={() => toggleLock('tuitionItem')}
            onChange={updateTuitionItem}
            color="blue"
          />

          <BudgetItem
            label="Scholarships"
            value={incomeItems.scholarships}
            min={0}
            max={1000000}
            step={500}
            locked={locks.scholarships}
            onToggleLock={() => toggleLock('scholarships')}
            onChange={updateScholarshipsItem}
            color="blue"
          />
        </div>
      )}
    </div>
  );
};

export default TuitionScholarshipsSection;
