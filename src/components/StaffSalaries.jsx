import React, { useState, useEffect } from 'react';
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

  // Sync duringSemester total from individual roles
  useEffect(() => {
    const newTotal = Object.values(duringDetails).reduce((sum, item) =>
      sum + (item.quantity * item.rate), 0
    );
    setDuringSemester(newTotal);
  }, [duringDetails]);

  // Sync parent total when children change
  useEffect(() => {
    const newTotal = beforeSemester + duringSemester;
    onChange(newTotal);
  }, [beforeSemester, duringSemester]);

  const handleDuringItemChange = (key, field, value) => {
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
            max={100000}
            step={1000}
            locked={locks?.beforeSemester || false}
            onToggleLock={() => onToggleLockItem('beforeSemester')}
            onChange={setBeforeSemester}
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
                <span className="text-sm">During Semester: <EditableNumber value={duringSemester} onChange={setDuringSemester} min={0} max={1000000} step={1000} /></span>
              </div>
            </div>

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
