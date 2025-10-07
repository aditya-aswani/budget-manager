import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import BudgetItem from './BudgetItem';
import RentItem from './RentItem';
import EditableNumber from './EditableNumber';

const OtherExpenses = ({
  total,
  locked,
  onToggleLock,
  onChange,
  disabled,
  locks,
  onToggleLockItem,
  expenseDetails,
  setExpenseDetails
}) => {
  const [expanded, setExpanded] = useState(false);
  const isUpdatingFromParent = useRef(false);

  const [items, setItems] = useState({
    rent: 10000,
    food: 10000,
    legalAccountingInsurance: 10000,
    suppliesSubscriptions: 10000,
    it: 10000,
    travel: 10000,
    otherOverhead: 10000
  });

  const [rentDetails, setRentDetails] = useState({
    csCohort2Program: 3333,
    alumniProgram: 3333,
    donorRetreat: 3334
  });

  // Sync rent from rentDetails (only when not locked)
  useEffect(() => {
    if (!locks?.rent && !isUpdatingFromParent.current) {
      const newRent = Object.values(rentDetails).reduce((sum, val) => sum + val, 0);
      if (Math.abs(newRent - items.rent) > 0.01) {
        setItems(prev => ({ ...prev, rent: newRent }));
      }
    }
  }, [rentDetails, locks?.rent]);

  // Sync local state back to expenseDetails for PDF generation
  useEffect(() => {
    if (setExpenseDetails) {
      setExpenseDetails(prev => ({
        ...prev,
        otherExpenses: {
          ...items,
          rentDetails
        }
      }));
    }
  }, [items, rentDetails, setExpenseDetails]);

  // Sync total from individual items (only when not locked)
  useEffect(() => {
    if (!locked && !isUpdatingFromParent.current) {
      const newTotal = Object.values(items).reduce((sum, val) => sum + val, 0);
      onChange(newTotal);
    }
    isUpdatingFromParent.current = false;
  }, [items, locked]);

  // Cascade changes from parent (Other Expenses total) to unlocked children
  useEffect(() => {
    if (!locked) {
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

          // If rent is unlocked and changing, cascade to its sub-items
          if (unlockedKeys.includes('rent')) {
            const unlockedTotal = unlockedKeys.reduce((sum, k) => sum + items[k], 0);
            const rentRatio = unlockedTotal > 0 ? items.rent / unlockedTotal : 1 / unlockedKeys.length;
            const rentDiff = diff * rentRatio;

            if (Math.abs(rentDiff) > 0.01) {
              const unlockedRentKeys = Object.keys(rentDetails).filter(k => !locks?.[k]);
              if (unlockedRentKeys.length > 0) {
                isUpdatingFromParent.current = true;
                setRentDetails(prev => {
                  const newRentDetails = { ...prev };
                  const unlockedRentTotal = unlockedRentKeys.reduce((sum, k) => sum + prev[k], 0);

                  unlockedRentKeys.forEach(k => {
                    const ratio = unlockedRentTotal > 0 ? prev[k] / unlockedRentTotal : 1 / unlockedRentKeys.length;
                    newRentDetails[k] = Math.max(0, prev[k] + rentDiff * ratio);
                  });

                  return newRentDetails;
                });
              }
            }
          }
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
            '⚠️ Cannot ' + action + ' Other Expenses total when it is locked.\n\n' +
            'Other Expenses is currently locked at: $' + total.toLocaleString() + '\n' +
            'This change would make the total: $' + newTotal.toLocaleString() + '\n\n' +
            'All other expense items are locked, so redistribution is not possible.\n\n' +
            'To make this change:\n' +
            '1. Unlock Other Expenses, OR\n' +
            '2. Unlock another expense item to allow redistribution'
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
            '⚠️ Cannot adjust expense items to maintain locked Other Expenses total.\n\n' +
            'Other Expenses is locked at: $' + total.toLocaleString() + '\n' +
            'Other unlocked items cannot be reduced enough to accommodate this change.\n\n' +
            'To make this change:\n' +
            '1. Unlock Other Expenses, OR\n' +
            '2. Unlock more expense items to distribute the adjustment, OR\n' +
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

  const percentage = ((total) / 1000000) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #ffedd5 ${percentage}%, #ffedd5 100%)`
  };

  return (
    <div className="mb-4 p-3 bg-orange-50 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-orange-100 rounded"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <label className="font-medium">
            Other Expenses: <EditableNumber value={total} onChange={onChange} min={0} max={1000000} step={1000} />
          </label>
        </div>
        <button
          onClick={onToggleLock}
          className="p-1 rounded bg-white shadow-sm"
        >
          {locked ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="1000000"
        step="1000"
        value={total}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled || locked}
        style={sliderStyle}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
      />

      {/* Nested items */}
      {expanded && (
        <div className="mt-3 space-y-2 pl-6 border-l-2 border-orange-300">
          <RentItem
            total={items.rent}
            locked={locks?.rent || false}
            onToggleLock={() => onToggleLockItem('rent')}
            onChange={(val) => handleItemChange('rent', val)}
            disabled={disabled}
            locks={locks}
            onToggleLockItem={onToggleLockItem}
            rentDetails={rentDetails}
            onRentDetailsChange={setRentDetails}
          />
          <BudgetItem
            label="Food"
            value={items.food}
            min={0}
            max={100000}
            step={1000}
            locked={locks?.food || false}
            onToggleLock={() => onToggleLockItem('food')}
            onChange={(val) => handleItemChange('food', val)}
            disabled={disabled}
            color="orange"
          />
          <BudgetItem
            label="Legal, Accounting, Insurance"
            value={items.legalAccountingInsurance}
            min={0}
            max={100000}
            step={1000}
            locked={locks?.legalAccountingInsurance || false}
            onToggleLock={() => onToggleLockItem('legalAccountingInsurance')}
            onChange={(val) => handleItemChange('legalAccountingInsurance', val)}
            disabled={disabled}
            color="orange"
          />
          <BudgetItem
            label="Supplies and Subscriptions"
            value={items.suppliesSubscriptions}
            min={0}
            max={100000}
            step={1000}
            locked={locks?.suppliesSubscriptions || false}
            onToggleLock={() => onToggleLockItem('suppliesSubscriptions')}
            onChange={(val) => handleItemChange('suppliesSubscriptions', val)}
            disabled={disabled}
            color="orange"
          />
          <BudgetItem
            label="IT"
            value={items.it}
            min={0}
            max={100000}
            step={1000}
            locked={locks?.it || false}
            onToggleLock={() => onToggleLockItem('it')}
            onChange={(val) => handleItemChange('it', val)}
            disabled={disabled}
            color="orange"
          />
          <BudgetItem
            label="Travel"
            value={items.travel}
            min={0}
            max={100000}
            step={1000}
            locked={locks?.travel || false}
            onToggleLock={() => onToggleLockItem('travel')}
            onChange={(val) => handleItemChange('travel', val)}
            disabled={disabled}
            color="orange"
          />
          <BudgetItem
            label="Other Overhead"
            value={items.otherOverhead}
            min={0}
            max={100000}
            step={1000}
            locked={locks?.otherOverhead || false}
            onToggleLock={() => onToggleLockItem('otherOverhead')}
            onChange={(val) => handleItemChange('otherOverhead', val)}
            disabled={disabled}
            color="orange"
          />
        </div>
      )}
    </div>
  );
};

export default OtherExpenses;
