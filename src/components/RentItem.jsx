import React, { useState, useEffect, useRef } from 'react';
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
  const isUpdatingFromParent = useRef(false);

  const items = rentDetails || {
    csCohort2Program: 3333,
    alumniProgram: 3333,
    donorRetreat: 3334
  };

  const setItems = (updater) => {
    if (onRentDetailsChange) {
      const newItems = typeof updater === 'function' ? updater(items) : updater;
      onRentDetailsChange(newItems);
    }
  };

  // Sync total from individual items (only when not locked)
  useEffect(() => {
    if (!locked && !isUpdatingFromParent.current) {
      const newTotal = Object.values(items).reduce((sum, val) => sum + val, 0);
      onChange(newTotal);
    }
    isUpdatingFromParent.current = false;
  }, [items, locked]);

  // Cascade changes from parent (rent total) to unlocked children
  useEffect(() => {
    if (!locked && !isUpdatingFromParent.current) {
      const currentTotal = Object.values(items).reduce((sum, val) => sum + val, 0);
      if (Math.abs(total - currentTotal) > 0.01) {
        isUpdatingFromParent.current = true;
        const diff = total - currentTotal;

        // Find unlocked items
        const unlockedKeys = Object.keys(items).filter(k => !locks?.[k]);

        if (unlockedKeys.length > 0) {
          setItems(prev => {
            const newItems = { ...prev };
            const unlockedTotal = unlockedKeys.reduce((sum, k) => sum + prev[k], 0);

            // Distribute proportionally among unlocked items
            unlockedKeys.forEach(k => {
              const ratio = unlockedTotal > 0 ? prev[k] / unlockedTotal : 1 / unlockedKeys.length;
              newItems[k] = Math.max(0, prev[k] + diff * ratio);
            });

            return newItems;
          });
        }
      }
    }
  }, [total, locked]);

  const handleItemChange = (key, value) => {
    if (locked) {
      // When locked, adjust other unlocked items proportionally
      const diff = value - items[key];

      // Get unlocked items (excluding the current one being changed)
      const unlockedKeys = Object.keys(items).filter(k =>
        k !== key && !locks?.[k]
      );

      if (unlockedKeys.length === 0) {
        // No other items to adjust - check if change is valid
        const currentTotal = Object.values(items).reduce((sum, val) => sum + val, 0);
        const newTotal = currentTotal - items[key] + value;

        if (Math.abs(newTotal - total) > 0.01) {
          const action = newTotal > total ? 'increase' : 'decrease';
          alert(
            '⚠️ Cannot ' + action + ' Rent total when it is locked.\n\n' +
            'Rent is currently locked at: $' + total.toLocaleString() + '\n' +
            'This change would make the total: $' + newTotal.toLocaleString() + '\n\n' +
            'All other rent items are locked, so redistribution is not possible.\n\n' +
            'To make this change:\n' +
            '1. Unlock Rent, OR\n' +
            '2. Unlock another rent item to allow redistribution'
          );
          return;
        }

        // Allow the change if it doesn't change total (should never happen, but keep for safety)
        setItems(prev => ({ ...prev, [key]: value }));
      } else {
        // Check if redistribution is possible without making items negative
        const adjustment = diff / unlockedKeys.length;
        let canAdjust = true;
        unlockedKeys.forEach(k => {
          if (items[k] - adjustment < 0) {
            canAdjust = false;
          }
        });

        if (!canAdjust) {
          alert(
            '⚠️ Cannot adjust rent items to maintain locked Rent total.\n\n' +
            'Rent is locked at: $' + total.toLocaleString() + '\n' +
            'Other unlocked items cannot be reduced enough to accommodate this change.\n\n' +
            'To make this change:\n' +
            '1. Unlock Rent, OR\n' +
            '2. Unlock more rent items to distribute the adjustment, OR\n' +
            '3. Reduce this value instead of increasing it'
          );
          return;
        }

        // Distribute the difference across unlocked items
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
