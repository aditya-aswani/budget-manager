import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import EditableNumber from './EditableNumber';

const BudgetItem = ({
  label,
  value,
  min,
  max,
  step,
  locked,
  onToggleLock,
  onChange,
  disabled,
  color = 'orange'
}) => {
  const colorMap = {
    orange: { primary: '#f97316', light: '#ffedd5' },
    blue: { primary: '#3b82f6', light: '#dbeafe' },
    green: { primary: '#10b981', light: '#d1fae5' }
  };

  const colors = colorMap[color] || colorMap.orange;
  const percentage = ((value - min) / (max - min)) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${percentage}%, ${colors.light} ${percentage}%, ${colors.light} 100%)`
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">{label}: <EditableNumber value={value} onChange={onChange} min={min} max={max} step={step} /></span>
          <button
            onClick={onToggleLock}
            className="p-0.5 rounded bg-white shadow-sm"
          >
            {locked ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
          </button>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled || locked}
          style={sliderStyle}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        />
      </div>
    </div>
  );
};

export default BudgetItem;
