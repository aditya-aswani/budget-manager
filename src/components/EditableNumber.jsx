import React, { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../utils/budgetHelpers';

const EditableNumber = ({ value, onChange, min = 0, max = Infinity, step = 1 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setInputValue(value.toString());
    setIsEditing(true);
  };

  const handleBlur = () => {
    const numValue = parseFloat(inputValue.replace(/[^0-9.-]/g, ''));
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="inline-block w-32 px-2 py-0.5 border border-blue-400 rounded bg-white font-medium"
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className="cursor-pointer hover:bg-blue-100 hover:border-blue-300 border border-transparent px-2 py-0.5 rounded transition-colors"
      title="Click to edit"
    >
      {formatCurrency(value)}
    </span>
  );
};

export default EditableNumber;
