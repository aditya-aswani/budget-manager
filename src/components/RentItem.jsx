import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import BudgetItem from './BudgetItem';

const RentItem = ({
  total,
  locked,
  onToggleLock,
  onChange,
  disabled,
  locks,
  onToggleLockItem
}) => {
  const [expanded, setExpanded] = useState(false);

  const [items, setItems] = useState({
    csCohort2Program: 3333,
    alumniProgram: 3333,
    donorRetreat: 3334
  });

  // Sync total from individual items (only when not locked)
  useEffect(() => {
    if (!locked) {
      const newTotal = Object.values(items).reduce((sum, val) => sum + val, 0);
      onChange(newTotal);
    }
  }, [items, locked]);

  const handleItemChange = (key, value) => {
    if (locked) {
      // When locked, adjust other unlocked items proportionally
      const diff = value - items[key];

      // Get unlocked items (excluding the current one being changed)
      const unlockedKeys = Object.keys(items).filter(k =>
        k !== key && !locks?.[k]
      );

      if (unlockedKeys.length === 0) {
        // No other items to adjust, just update this one
        setItems(prev => ({ ...prev, [key]: value }));
      } else {
        // Distribute the difference across unlocked items
        const adjustment = diff / unlockedKeys.length;

        setItems(prev => {
          const newItems = { ...prev, [key]: value };
          unlockedKeys.forEach(k => {
            newItems[k] = Math.max(0, prev[k] - adjustment);
          });
          return newItems;
        });
      }
    } else {
      setItems(prev => ({ ...prev, [key]: value }));
    }
  };

  const percentage = ((total) / 100000) * 100;
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
          max={100000}
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
