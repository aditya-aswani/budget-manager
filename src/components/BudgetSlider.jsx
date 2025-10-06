import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import EditableNumber from './EditableNumber';

const BudgetSlider = ({
  label,
  value,
  min,
  max,
  step,
  locked,
  onToggleLock,
  onChange,
  disabled,
  color = 'orange',
  size = 'md' // sm, md, lg
}) => {
  const colorClasses = {
    orange: {
      bg: 'bg-orange-50',
      slider: 'bg-orange-200',
      gradient: '#f97316',
      gradientLight: '#ffedd5'
    },
    blue: {
      bg: 'bg-blue-50',
      slider: 'bg-blue-200',
      gradient: '#3b82f6',
      gradientLight: '#dbeafe'
    },
    green: {
      bg: 'bg-green-50',
      slider: 'bg-green-200',
      gradient: '#22c55e',
      gradientLight: '#dcfce7'
    }
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5'
  };

  const colors = colorClasses[color];
  const heightClass = sizeClasses[size];

  const percentage = ((value - min) / (max - min)) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, ${colors.gradient} 0%, ${colors.gradient} ${percentage}%, ${colors.gradientLight} ${percentage}%, ${colors.gradientLight} 100%)`
  };

  return (
    <div className={`mb-4 p-3 ${colors.bg} rounded-lg`}>
      <div className="flex justify-between items-center mb-2">
        <label className="font-medium">
          {label}: <EditableNumber value={value} onChange={onChange} min={min} max={max} step={step} />
        </label>
        <button
          onClick={onToggleLock}
          className="p-1 rounded bg-white shadow-sm"
        >
          {locked ? <Lock size={16} className="text-red-500" /> : <Unlock size={16} className="text-gray-400" />}
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
        className={`w-full ${heightClass} rounded-lg appearance-none cursor-pointer disabled:opacity-50`}
      />
    </div>
  );
};

export default BudgetSlider;
