import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { formatNumber, parseNumber } from '../utils/budgetHelpers';

const DuringSemesterItem = ({
  label,
  total,
  rate,
  quantity,
  min,
  max,
  step,
  locked,
  onToggleLock,
  onTotalChange,
  onRateChange,
  onQuantityChange,
  disabled
}) => {
  const percentage = ((total - min) / (max - min)) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #ffedd5 ${percentage}%, #ffedd5 100%)`
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span>{label}:</span>
            <input
              type="text"
              value={formatNumber(total)}
              onChange={(e) => onTotalChange(parseNumber(e.target.value))}
              disabled={disabled || locked}
              className="w-20 px-2 py-0.5 border rounded text-xs"
            />
            <span>=</span>
            <input
              type="text"
              value={formatNumber(rate)}
              onChange={(e) => onRateChange(parseNumber(e.target.value))}
              disabled={disabled || locked}
              className="w-20 px-2 py-0.5 border rounded text-xs"
            />
            <span>×</span>
            <input
              type="text"
              value={formatNumber(quantity)}
              onChange={(e) => onQuantityChange(parseNumber(e.target.value))}
              disabled={disabled || locked}
              className="w-16 px-2 py-0.5 border rounded text-xs"
            />
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
          min={min}
          max={max}
          step={step}
          value={total}
          onChange={(e) => onTotalChange(Number(e.target.value))}
          disabled={disabled || locked}
          style={sliderStyle}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        />
      </div>
    </div>
  );
};

export default DuringSemesterItem;
