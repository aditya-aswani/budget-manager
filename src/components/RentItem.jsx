import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import BudgetItem from './BudgetItem';

const RentItem = ({
  total,
  locked,
  onToggleLock,
  onChange,
  disabled,
  locks,
  onToggleLockItem,
  rentDetails,
  onRentDetailsChange
}) => {
  const [expanded, setExpanded] = useState(false);

  const items = rentDetails || {
    csCohort2Program: 3333,
    alumniProgram: 3333,
    donorRetreat: 3334
  };

  const handleItemChange = (key, value) => {
    // Just call the parent handler - logic is now in useExpenseDetails
    if (onRentDetailsChange) {
      onRentDetailsChange(key, value);
    }
  };

  const percentage = ((total) / 200000) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #ffedd5 ${percentage}%, #ffedd5 100%)`
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 hover:bg-orange-100 rounded"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <span className="text-sm">
              Rent: ${total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onToggleLock}
            className="p-0.5 rounded bg-white shadow-sm"
          >
            {locked ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={200000}
          step={1000}
          value={total}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled || locked}
          style={sliderStyle}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        />

        {/* Nested items */}
        {expanded && (
          <div className="mt-2 ml-4 space-y-2 pl-3 border-l-2 border-orange-200">
            <BudgetItem
              label="CS Cohort 2 Program"
              value={items.csCohort2Program}
              min={0}
              max={50000}
              step={100}
              locked={locks?.csCohort2Program || false}
              onToggleLock={() => onToggleLockItem('csCohort2Program')}
              onChange={(val) => handleItemChange('csCohort2Program', val)}
              disabled={disabled}
              color="orange"
            />
            <BudgetItem
              label="Alumni Program"
              value={items.alumniProgram}
              min={0}
              max={50000}
              step={100}
              locked={locks?.alumniProgram || false}
              onToggleLock={() => onToggleLockItem('alumniProgram')}
              onChange={(val) => handleItemChange('alumniProgram', val)}
              disabled={disabled}
              color="orange"
            />
            <BudgetItem
              label="Donor Retreat"
              value={items.donorRetreat}
              min={0}
              max={50000}
              step={100}
              locked={locks?.donorRetreat || false}
              onToggleLock={() => onToggleLockItem('donorRetreat')}
              onChange={(val) => handleItemChange('donorRetreat', val)}
              disabled={disabled}
              color="orange"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RentItem;
