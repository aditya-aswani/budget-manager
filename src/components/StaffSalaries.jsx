import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import BudgetItem from './BudgetItem';
import DuringSemesterItem from './DuringSemesterItem';
import EditableNumber from './EditableNumber';

const StaffSalaries = ({
  total,
  locked,
  onToggleLock,
  onChange,
  disabled,
  locks,
  onToggleLockItem
}) => {
  const [expanded, setExpanded] = useState({
    main: false,
    duringSemester: false
  });

  const [beforeSemester, setBeforeSemester] = useState(60000);
  const [duringSemester, setDuringSemester] = useState(60000);
  const isUpdatingFromParent = useRef(false);

  // During semester role details
  const [duringDetails, setDuringDetails] = useState({
    leadsOtherRoles: { quantity: 2, rate: 5000 },
    residentialFaculty: { quantity: 2, rate: 5000 },
    ras: { quantity: 2, rate: 5000 },
    retreatTeacher: { quantity: 1, rate: 5000 },
    daylongVisitingTeacher: { quantity: 1, rate: 5000 },
    weeklongVisitingTeacher: { quantity: 2, rate: 5000 },
    headCook: { quantity: 1, rate: 5000 },
    assistantCook: { quantity: 1, rate: 5000 }
  });

  // Sync duringSemester total from individual roles (only when not locked)
  useEffect(() => {
    if (!locks?.duringSemester) {
      const newTotal = Object.values(duringDetails).reduce((sum, item) =>
        sum + (item.quantity * item.rate), 0
      );
      setDuringSemester(newTotal);
    }
  }, [duringDetails, locks?.duringSemester]);

  // Sync parent total when children change (only when not locked)
  useEffect(() => {
    if (!locked && !isUpdatingFromParent.current) {
      const newTotal = beforeSemester + duringSemester;
      onChange(newTotal);
    }
  }, [beforeSemester, duringSemester, locked]);

  // Sync children when parent total changes (distribute to unlocked children)
  useEffect(() => {
    if (!locked) {
      const currentTotal = beforeSemester + duringSemester;
      if (Math.abs(total - currentTotal) > 0.01) {
        isUpdatingFromParent.current = true;
        const diff = total - currentTotal;

        // Determine which children are unlocked
        const beforeUnlocked = !locks?.beforeSemester;
        const duringUnlocked = !locks?.duringSemester;

        if (beforeUnlocked && duringUnlocked) {
          // Both unlocked - distribute proportionally
          const beforeRatio = currentTotal > 0 ? beforeSemester / currentTotal : 0.5;
          const duringRatio = currentTotal > 0 ? duringSemester / currentTotal : 0.5;

          setBeforeSemester(Math.max(0, beforeSemester + diff * beforeRatio));
          const newDuringSemester = Math.max(0, duringSemester + diff * duringRatio);
          setDuringSemester(newDuringSemester);

          // Also distribute to unlocked during-semester sub-items
          const duringDiff = newDuringSemester - duringSemester;
          if (Math.abs(duringDiff) > 0.01) {
            const unlockedKeys = Object.keys(duringDetails).filter(k => !locks?.[k]);
            if (unlockedKeys.length > 0) {
              setDuringDetails(prev => {
                const newDetails = { ...prev };
                const unlockedTotal = unlockedKeys.reduce((sum, k) =>
                  sum + (prev[k].quantity * prev[k].rate), 0
                );

                unlockedKeys.forEach(k => {
                  const itemTotal = prev[k].quantity * prev[k].rate;
                  const ratio = unlockedTotal > 0 ? itemTotal / unlockedTotal : 1 / unlockedKeys.length;
                  const itemDiff = duringDiff * ratio;
                  const newTotal = Math.max(0, itemTotal + itemDiff);
                  newDetails[k] = {
                    ...prev[k],
                    rate: prev[k].quantity > 0 ? newTotal / prev[k].quantity : 0
                  };
                });

                return newDetails;
              });
            }
          }
        } else if (beforeUnlocked && !duringUnlocked) {
          // Only before semester unlocked - give all diff to before semester
          setBeforeSemester(Math.max(0, beforeSemester + diff));
        } else if (!beforeUnlocked && duringUnlocked) {
          // Only during semester unlocked - give all diff to during semester
          const newDuringSemester = Math.max(0, duringSemester + diff);
          setDuringSemester(newDuringSemester);

          // Also distribute to unlocked during-semester sub-items
          const duringDiff = newDuringSemester - duringSemester;
          if (Math.abs(duringDiff) > 0.01) {
            const unlockedKeys = Object.keys(duringDetails).filter(k => !locks?.[k]);
            if (unlockedKeys.length > 0) {
              setDuringDetails(prev => {
                const newDetails = { ...prev };
                const unlockedTotal = unlockedKeys.reduce((sum, k) =>
                  sum + (prev[k].quantity * prev[k].rate), 0
                );

                unlockedKeys.forEach(k => {
                  const itemTotal = prev[k].quantity * prev[k].rate;
                  const ratio = unlockedTotal > 0 ? itemTotal / unlockedTotal : 1 / unlockedKeys.length;
                  const itemDiff = duringDiff * ratio;
                  const newTotal = Math.max(0, itemTotal + itemDiff);
                  newDetails[k] = {
                    ...prev[k],
                    rate: prev[k].quantity > 0 ? newTotal / prev[k].quantity : 0
                  };
                });

                return newDetails;
              });
            }
          }
        }
        // If both locked, do nothing

        // Reset the flag after state updates
        setTimeout(() => {
          isUpdatingFromParent.current = false;
        }, 0);
      }
    }
  }, [total, locked, locks?.beforeSemester, locks?.duringSemester]);

  const handleBeforeSemesterChange = (value) => {
    if (locked) {
      // When Staff Salaries is locked, adjust During Semester
      const diff = value - beforeSemester;
      if (!locks?.duringSemester) {
        const newDuringSemester = Math.max(0, duringSemester - diff);
        setDuringSemester(newDuringSemester);
      } else {
        // Both are locked or During Semester is locked - check if change is valid
        const currentTotal = beforeSemester + duringSemester;
        const newTotal = value + duringSemester;

        if (Math.abs(newTotal - total) > 0.01) {
          const action = newTotal > total ? 'increase' : 'decrease';
          alert(
            '⚠️ Cannot ' + action + ' Staff Salaries total when it is locked.\n\n' +
            'Staff Salaries is currently locked at: $' + total.toLocaleString() + '\n' +
            'This change would make the total: $' + newTotal.toLocaleString() + '\n\n' +
            'During Semester is locked, so redistribution is not possible.\n\n' +
            'To make this change:\n' +
            '1. Unlock Staff Salaries, OR\n' +
            '2. Unlock During Semester to allow redistribution'
          );
          return;
        }
      }
    }
    setBeforeSemester(value);
  };

  const handleDuringSemesterChange = (value) => {
    if (locked) {
      // When Staff Salaries is locked, adjust Before Semester
      const diff = value - duringSemester;
      if (!locks?.beforeSemester) {
        const newBeforeSemester = Math.max(0, beforeSemester - diff);
        setBeforeSemester(newBeforeSemester);
      } else {
        // Both are locked or Before Semester is locked - check if change is valid
        const currentTotal = beforeSemester + duringSemester;
        const newTotal = beforeSemester + value;

        if (Math.abs(newTotal - total) > 0.01) {
          const action = newTotal > total ? 'increase' : 'decrease';
          alert(
            '⚠️ Cannot ' + action + ' Staff Salaries total when it is locked.\n\n' +
            'Staff Salaries is locked at: $' + total.toLocaleString() + '\n' +
            'This change would make the total: $' + newTotal.toLocaleString() + '\n\n' +
            'Before Semester is locked, so redistribution is not possible.\n\n' +
            'To make this change:\n' +
            '1. Unlock Staff Salaries, OR\n' +
            '2. Unlock Before Semester to allow redistribution'
          );
          return;
        }
      }
    }

    // Update During Semester and distribute to unlocked sub-items
    const currentDuringTotal = Object.values(duringDetails).reduce((sum, item) =>
      sum + (item.quantity * item.rate), 0
    );
    const diff = value - currentDuringTotal;

    if (!locks?.duringSemester && Math.abs(diff) > 0.01) {
      // Find unlocked during-semester items
      const unlockedKeys = Object.keys(duringDetails).filter(k => !locks?.[k]);

      if (unlockedKeys.length > 0) {
        // Distribute the difference proportionally to unlocked items
        setDuringDetails(prev => {
          const newDetails = { ...prev };
          const unlockedTotal = unlockedKeys.reduce((sum, k) =>
            sum + (prev[k].quantity * prev[k].rate), 0
          );

          unlockedKeys.forEach(k => {
            const itemTotal = prev[k].quantity * prev[k].rate;
            const ratio = unlockedTotal > 0 ? itemTotal / unlockedTotal : 1 / unlockedKeys.length;
            const itemDiff = diff * ratio;
            const newTotal = Math.max(0, itemTotal + itemDiff);
            newDetails[k] = {
              ...prev[k],
              rate: prev[k].quantity > 0 ? newTotal / prev[k].quantity : 0
            };
          });

          return newDetails;
        });
      }
    }

    setDuringSemester(value);
  };

  const handleDuringItemChange = (key, field, value) => {
    if (locks?.duringSemester) {
      // When During Semester total is locked, redistribute to other unlocked items
      const currentItemTotal = duringDetails[key].quantity * duringDetails[key].rate;
      let newItemTotal = currentItemTotal;

      if (field === 'total') {
        newItemTotal = value;
      } else if (field === 'rate') {
        newItemTotal = value * duringDetails[key].quantity;
      } else if (field === 'quantity') {
        newItemTotal = value * duringDetails[key].rate;
      }

      const diff = newItemTotal - currentItemTotal;

      // Find unlocked items (excluding the current one being changed)
      const unlockedKeys = Object.keys(duringDetails).filter(k =>
        k !== key && !locks?.[k]
      );

      if (unlockedKeys.length === 0) {
        // No other items to adjust - check if change is valid
        const currentTotal = Object.values(duringDetails).reduce((sum, item) =>
          sum + (item.quantity * item.rate), 0
        );

        if (Math.abs(newItemTotal - currentItemTotal) > 0.01 && Math.abs(duringSemester - currentTotal) < 0.01) {
          const action = newItemTotal > currentItemTotal ? 'increase' : 'decrease';
          alert(
            '⚠️ Cannot ' + action + ' During Semester total when it is locked.\n\n' +
            'During Semester is currently locked at: $' + duringSemester.toLocaleString() + '\n\n' +
            'All other during-semester items are locked, so redistribution is not possible.\n\n' +
            'To make this change:\n' +
            '1. Unlock During Semester, OR\n' +
            '2. Unlock another during-semester item to allow redistribution'
          );
          return;
        }

        // No other items to adjust, just update this one
        setDuringDetails(prev => {
          const item = prev[key];
          const updated = { ...item };

          if (field === 'total') {
            updated.rate = value / item.quantity;
          } else if (field === 'rate') {
            updated.rate = value;
          } else if (field === 'quantity') {
            updated.quantity = value;
          }

          return { ...prev, [key]: updated };
        });
      } else {
        // Check if redistribution is possible without making items negative
        const adjustment = diff / unlockedKeys.length;
        let canAdjust = true;
        unlockedKeys.forEach(k => {
          const currentTotal = duringDetails[k].quantity * duringDetails[k].rate;
          if (currentTotal - adjustment < 0) {
            canAdjust = false;
          }
        });

        if (!canAdjust) {
          alert(
            '⚠️ Cannot adjust during-semester items to maintain locked During Semester total.\n\n' +
            'During Semester is locked at: $' + duringSemester.toLocaleString() + '\n' +
            'Other unlocked items cannot be reduced enough to accommodate this change.\n\n' +
            'To make this change:\n' +
            '1. Unlock During Semester, OR\n' +
            '2. Unlock more during-semester items to distribute the adjustment, OR\n' +
            '3. Reduce this value instead of increasing it'
          );
          return;
        }

        // Distribute the difference across unlocked items
        setDuringDetails(prev => {
          const newDetails = { ...prev };

          // Update the changed item
          const item = newDetails[key];
          const updated = { ...item };
          if (field === 'total') {
            updated.rate = value / item.quantity;
          } else if (field === 'rate') {
            updated.rate = value;
          } else if (field === 'quantity') {
            updated.quantity = value;
          }
          newDetails[key] = updated;

          // Redistribute to other unlocked items
          unlockedKeys.forEach(k => {
            const currentTotal = prev[k].quantity * prev[k].rate;
            const newTotal = Math.max(0, currentTotal - adjustment);
            newDetails[k] = {
              ...prev[k],
              rate: newTotal / prev[k].quantity
            };
          });

          return newDetails;
        });
      }
    } else {
      // During Semester not locked

      // If Staff Salaries is locked and Before Semester is locked, need to redistribute within during-semester items
      if (locked && locks?.beforeSemester) {
        const currentItemTotal = duringDetails[key].quantity * duringDetails[key].rate;
        let newItemTotal = currentItemTotal;

        if (field === 'total') {
          newItemTotal = value;
        } else if (field === 'rate') {
          newItemTotal = value * duringDetails[key].quantity;
        } else if (field === 'quantity') {
          newItemTotal = value * duringDetails[key].rate;
        }

        const diff = newItemTotal - currentItemTotal;

        // Find unlocked during-semester items (excluding the current one being changed)
        const unlockedKeys = Object.keys(duringDetails).filter(k =>
          k !== key && !locks?.[k]
        );

        if (unlockedKeys.length === 0) {
          // No other items to adjust - check if change is valid
          const currentTotal = Object.values(duringDetails).reduce((sum, item) =>
            sum + (item.quantity * item.rate), 0
          );
          const newTotal = currentTotal - currentItemTotal + newItemTotal;

          if (Math.abs(newTotal - duringSemester) > 0.01) {
            const action = newTotal > duringSemester ? 'increase' : 'decrease';
            alert(
              '⚠️ Cannot ' + action + ' During Semester total when Staff Salaries is locked.\n\n' +
              'Staff Salaries is locked at: $' + total.toLocaleString() + '\n' +
              'Before Semester is also locked, so During Semester cannot change.\n\n' +
              'All other during-semester items are locked, so redistribution is not possible.\n\n' +
              'To make this change:\n' +
              '1. Unlock Staff Salaries, OR\n' +
              '2. Unlock Before Semester, OR\n' +
              '3. Unlock another during-semester item to allow redistribution'
            );
            return;
          }

          // Allow the change if it doesn't change total (should never happen, but keep for safety)
          setDuringDetails(prev => {
            const item = prev[key];
            const updated = { ...item };

            if (field === 'total') {
              updated.rate = value / item.quantity;
            } else if (field === 'rate') {
              updated.rate = value;
            } else if (field === 'quantity') {
              updated.quantity = value;
            }

            return { ...prev, [key]: updated };
          });
        } else {
          // Check if redistribution is possible without making items negative
          const adjustment = diff / unlockedKeys.length;
          let canAdjust = true;
          unlockedKeys.forEach(k => {
            const currentTotal = duringDetails[k].quantity * duringDetails[k].rate;
            if (currentTotal - adjustment < 0) {
              canAdjust = false;
            }
          });

          if (!canAdjust) {
            alert(
              '⚠️ Cannot adjust during-semester items to maintain Staff Salaries total.\n\n' +
              'Staff Salaries is locked at: $' + total.toLocaleString() + '\n' +
              'Before Semester is also locked.\n' +
              'Other unlocked during-semester items cannot be reduced enough to accommodate this change.\n\n' +
              'To make this change:\n' +
              '1. Unlock Staff Salaries, OR\n' +
              '2. Unlock Before Semester, OR\n' +
              '3. Unlock more during-semester items to distribute the adjustment, OR\n' +
              '4. Reduce this value instead of increasing it'
            );
            return;
          }

          // Distribute the difference across unlocked during-semester items
          setDuringDetails(prev => {
            const newDetails = { ...prev };

            // Update the changed item
            const item = newDetails[key];
            const updated = { ...item };
            if (field === 'total') {
              updated.rate = value / item.quantity;
            } else if (field === 'rate') {
              updated.rate = value;
            } else if (field === 'quantity') {
              updated.quantity = value;
            }
            newDetails[key] = updated;

            // Redistribute to other unlocked during-semester items
            unlockedKeys.forEach(k => {
              const currentTotal = prev[k].quantity * prev[k].rate;
              const newTotal = Math.max(0, currentTotal - adjustment);
              newDetails[k] = {
                ...prev[k],
                rate: newTotal / prev[k].quantity
              };
            });

            return newDetails;
          });
        }
      } else {
        // Staff Salaries not locked or Before Semester is unlocked
        setDuringDetails(prev => {
          const item = prev[key];
          const updated = { ...item };

          if (field === 'total') {
            updated.rate = value / item.quantity;
          } else if (field === 'rate') {
            updated.rate = value;
          } else if (field === 'quantity') {
            updated.quantity = value;
          }

          const newDetails = { ...prev, [key]: updated };

          // If Staff Salaries is locked, adjust Before Semester to maintain total
          if (locked && !locks?.beforeSemester) {
            const newDuringTotal = Object.values(newDetails).reduce((sum, item) =>
              sum + (item.quantity * item.rate), 0
            );
            const diff = newDuringTotal - duringSemester;
            const newBeforeSemester = Math.max(0, beforeSemester - diff);

            // Update Before Semester immediately
            setTimeout(() => setBeforeSemester(newBeforeSemester), 0);
          }

          return newDetails;
        });
      }
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
            onClick={() => setExpanded(prev => ({ ...prev, main: !prev.main }))}
            className="p-1 hover:bg-orange-100 rounded"
          >
            {expanded.main ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <label className="font-medium">
            Staff Salaries: <EditableNumber value={total} onChange={onChange} min={0} max={1000000} step={1000} />
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
      {expanded.main && (
        <div className="mt-3 space-y-2 pl-6 border-l-2 border-orange-300">
          {/* Before Semester */}
          <BudgetItem
            label="Before Semester"
            value={beforeSemester}
            min={0}
            max={500000}
            step={1000}
            locked={locks?.beforeSemester || false}
            onToggleLock={() => onToggleLockItem('beforeSemester')}
            onChange={handleBeforeSemesterChange}
            disabled={disabled}
          />

          {/* During Semester */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, duringSemester: !prev.duringSemester }))}
                  className="p-0.5 hover:bg-orange-100 rounded"
                >
                  {expanded.duringSemester ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <span className="text-sm">During Semester: <EditableNumber value={duringSemester} onChange={handleDuringSemesterChange} min={0} max={1000000} step={1000} /></span>
              </div>
              <button
                onClick={() => onToggleLockItem('duringSemester')}
                className="p-0.5 rounded bg-white shadow-sm"
              >
                {locks?.duringSemester ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
              </button>
            </div>

            {/* During Semester Slider */}
            <input
              type="range"
              min="0"
              max="500000"
              step="1000"
              value={duringSemester}
              onChange={(e) => handleDuringSemesterChange(Number(e.target.value))}
              disabled={disabled || locks?.duringSemester}
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${((duringSemester) / 500000) * 100}%, #ffedd5 ${((duringSemester) / 500000) * 100}%, #ffedd5 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />

            {expanded.duringSemester && (
              <div className="mt-2 ml-4 space-y-2 pl-3 border-l-2 border-orange-300">
                <DuringSemesterItem
                  label="Leads/Other Roles"
                  total={duringDetails.leadsOtherRoles.quantity * duringDetails.leadsOtherRoles.rate}
                  rate={duringDetails.leadsOtherRoles.rate}
                  quantity={duringDetails.leadsOtherRoles.quantity}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks?.leadsOtherRoles || false}
                  onToggleLock={() => onToggleLockItem('leadsOtherRoles')}
                  onTotalChange={(val) => handleDuringItemChange('leadsOtherRoles', 'total', val)}
                  onRateChange={(val) => handleDuringItemChange('leadsOtherRoles', 'rate', val)}
                  onQuantityChange={(val) => handleDuringItemChange('leadsOtherRoles', 'quantity', val)}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Residential Faculty"
                  total={duringDetails.residentialFaculty.quantity * duringDetails.residentialFaculty.rate}
                  rate={duringDetails.residentialFaculty.rate}
                  quantity={duringDetails.residentialFaculty.quantity}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks?.residentialFaculty || false}
                  onToggleLock={() => onToggleLockItem('residentialFaculty')}
                  onTotalChange={(val) => handleDuringItemChange('residentialFaculty', 'total', val)}
                  onRateChange={(val) => handleDuringItemChange('residentialFaculty', 'rate', val)}
                  onQuantityChange={(val) => handleDuringItemChange('residentialFaculty', 'quantity', val)}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="RAs"
                  total={duringDetails.ras.quantity * duringDetails.ras.rate}
                  rate={duringDetails.ras.rate}
                  quantity={duringDetails.ras.quantity}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks?.ras || false}
                  onToggleLock={() => onToggleLockItem('ras')}
                  onTotalChange={(val) => handleDuringItemChange('ras', 'total', val)}
                  onRateChange={(val) => handleDuringItemChange('ras', 'rate', val)}
                  onQuantityChange={(val) => handleDuringItemChange('ras', 'quantity', val)}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Retreat Teacher"
                  total={duringDetails.retreatTeacher.quantity * duringDetails.retreatTeacher.rate}
                  rate={duringDetails.retreatTeacher.rate}
                  quantity={duringDetails.retreatTeacher.quantity}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks?.retreatTeacher || false}
                  onToggleLock={() => onToggleLockItem('retreatTeacher')}
                  onTotalChange={(val) => handleDuringItemChange('retreatTeacher', 'total', val)}
                  onRateChange={(val) => handleDuringItemChange('retreatTeacher', 'rate', val)}
                  onQuantityChange={(val) => handleDuringItemChange('retreatTeacher', 'quantity', val)}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Daylong Visiting Teacher"
                  total={duringDetails.daylongVisitingTeacher.quantity * duringDetails.daylongVisitingTeacher.rate}
                  rate={duringDetails.daylongVisitingTeacher.rate}
                  quantity={duringDetails.daylongVisitingTeacher.quantity}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks?.daylongVisitingTeacher || false}
                  onToggleLock={() => onToggleLockItem('daylongVisitingTeacher')}
                  onTotalChange={(val) => handleDuringItemChange('daylongVisitingTeacher', 'total', val)}
                  onRateChange={(val) => handleDuringItemChange('daylongVisitingTeacher', 'rate', val)}
                  onQuantityChange={(val) => handleDuringItemChange('daylongVisitingTeacher', 'quantity', val)}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Weeklong Visiting Teacher"
                  total={duringDetails.weeklongVisitingTeacher.quantity * duringDetails.weeklongVisitingTeacher.rate}
                  rate={duringDetails.weeklongVisitingTeacher.rate}
                  quantity={duringDetails.weeklongVisitingTeacher.quantity}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks?.weeklongVisitingTeacher || false}
                  onToggleLock={() => onToggleLockItem('weeklongVisitingTeacher')}
                  onTotalChange={(val) => handleDuringItemChange('weeklongVisitingTeacher', 'total', val)}
                  onRateChange={(val) => handleDuringItemChange('weeklongVisitingTeacher', 'rate', val)}
                  onQuantityChange={(val) => handleDuringItemChange('weeklongVisitingTeacher', 'quantity', val)}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Head Cook"
                  total={duringDetails.headCook.quantity * duringDetails.headCook.rate}
                  rate={duringDetails.headCook.rate}
                  quantity={duringDetails.headCook.quantity}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks?.headCook || false}
                  onToggleLock={() => onToggleLockItem('headCook')}
                  onTotalChange={(val) => handleDuringItemChange('headCook', 'total', val)}
                  onRateChange={(val) => handleDuringItemChange('headCook', 'rate', val)}
                  onQuantityChange={(val) => handleDuringItemChange('headCook', 'quantity', val)}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Assistant Cook"
                  total={duringDetails.assistantCook.quantity * duringDetails.assistantCook.rate}
                  rate={duringDetails.assistantCook.rate}
                  quantity={duringDetails.assistantCook.quantity}
                  min={0}
                  max={50000}
                  step={500}
                  locked={locks?.assistantCook || false}
                  onToggleLock={() => onToggleLockItem('assistantCook')}
                  onTotalChange={(val) => handleDuringItemChange('assistantCook', 'total', val)}
                  onRateChange={(val) => handleDuringItemChange('assistantCook', 'rate', val)}
                  onQuantityChange={(val) => handleDuringItemChange('assistantCook', 'quantity', val)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSalaries;
