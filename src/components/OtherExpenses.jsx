import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import BudgetItem from './BudgetItem';
import EditableNumber from './EditableNumber';

const OtherExpenses = ({
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
    rent: 10000,
    food: 10000,
    legalAccountingInsurance: 10000,
    suppliesSubscriptions: 10000,
    it: 10000,
    travel: 10000,
    otherOverhead: 10000
  });

  // Sync total from individual items
  useEffect(() => {
    const newTotal = Object.values(items).reduce((sum, val) => sum + val, 0);
    onChange(newTotal);
  }, [items]);

  const handleItemChange = (key, value) => {
    setItems(prev => ({ ...prev, [key]: value }));
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
          <BudgetItem
            label="Rent"
            value={items.rent}
            min={0}
            max={100000}
            step={1000}
            locked={locks?.rent || false}
            onToggleLock={() => onToggleLockItem('rent')}
            onChange={(val) => handleItemChange('rent', val)}
            disabled={disabled}
            color="orange"
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
