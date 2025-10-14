import React, { useState } from 'react';
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
  onToggleLockItem,
  // Controlled data from parent
  beforeSemester,
  duringSemester,
  onBeforeSemesterChange,
  onDuringSemesterChange,
  duringDetails,
  onDuringDetailsChange
}) => {
  const [expanded, setExpanded] = useState({
    main: false,
    duringSemester: false
  });

  const toggleExpanded = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
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
            onClick={() => toggleExpanded('main')}
            className="p-1 hover:bg-orange-100 rounded"
          >
            {expanded.main ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <label className="font-medium">
            Staff Salaries: <EditableNumber
              value={total}
              onChange={onChange}
              min={0}
              max={1000000}
              step={1000}
            />
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
            onChange={onBeforeSemesterChange}
            disabled={disabled}
            color="orange"
          />

          {/* During Semester with nested roles */}
          <div className="p-2 bg-orange-100 rounded">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleExpanded('duringSemester')}
                  className="p-1 hover:bg-orange-200 rounded"
                >
                  {expanded.duringSemester ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <span className="text-sm">During Semester: <EditableNumber
                  value={duringSemester}
                  onChange={onDuringSemesterChange}
                  min={0}
                  max={1000000}
                  step={1000}
                /></span>
              </div>
              <button
                onClick={() => onToggleLockItem('duringSemester')}
                className="p-0.5 rounded bg-white shadow-sm"
              >
                {locks?.duringSemester ?
                  <Lock size={12} className="text-red-500" /> :
                  <Unlock size={12} className="text-gray-400" />
                }
              </button>
            </div>

            {/* Slider for During Semester */}
            <input
              type="range"
              min={0}
              max={500000}
              step={1000}
              value={duringSemester}
              onChange={(e) => onDuringSemesterChange(Number(e.target.value))}
              disabled={disabled || locks?.duringSemester}
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${(duringSemester / 500000) * 100}%, #ffedd5 ${(duringSemester / 500000) * 100}%, #ffedd5 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50 mb-2"
            />

            {/* Individual roles */}
            {expanded.duringSemester && (
              <div className="mt-2 space-y-1 pl-4 border-l border-orange-300">
                <DuringSemesterItem
                  label="Leads & Other Roles"
                  total={duringDetails.leadsOtherRoles.quantity * duringDetails.leadsOtherRoles.rate}
                  quantity={duringDetails.leadsOtherRoles.quantity}
                  rate={duringDetails.leadsOtherRoles.rate}
                  min={0}
                  max={100000}
                  step={1000}
                  locked={locks?.leadsOtherRoles || false}
                  onToggleLock={() => onToggleLockItem('leadsOtherRoles')}
                  onTotalChange={(t) => {
                    const newQuantity = Math.round(t / duringDetails.leadsOtherRoles.rate);
                    onDuringDetailsChange('leadsOtherRoles', { ...duringDetails.leadsOtherRoles, quantity: newQuantity });
                  }}
                  onQuantityChange={(q) => onDuringDetailsChange('leadsOtherRoles', { ...duringDetails.leadsOtherRoles, quantity: q })}
                  onRateChange={(r) => onDuringDetailsChange('leadsOtherRoles', { ...duringDetails.leadsOtherRoles, rate: r })}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Residential Faculty"
                  total={duringDetails.residentialFaculty.quantity * duringDetails.residentialFaculty.rate}
                  quantity={duringDetails.residentialFaculty.quantity}
                  rate={duringDetails.residentialFaculty.rate}
                  min={0}
                  max={100000}
                  step={1000}
                  locked={locks?.residentialFaculty || false}
                  onToggleLock={() => onToggleLockItem('residentialFaculty')}
                  onTotalChange={(t) => {
                    const newQuantity = Math.round(t / duringDetails.residentialFaculty.rate);
                    onDuringDetailsChange('residentialFaculty', { ...duringDetails.residentialFaculty, quantity: newQuantity });
                  }}
                  onQuantityChange={(q) => onDuringDetailsChange('residentialFaculty', { ...duringDetails.residentialFaculty, quantity: q })}
                  onRateChange={(r) => onDuringDetailsChange('residentialFaculty', { ...duringDetails.residentialFaculty, rate: r })}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="RAs"
                  total={duringDetails.ras.quantity * duringDetails.ras.rate}
                  quantity={duringDetails.ras.quantity}
                  rate={duringDetails.ras.rate}
                  min={0}
                  max={100000}
                  step={1000}
                  locked={locks?.ras || false}
                  onToggleLock={() => onToggleLockItem('ras')}
                  onTotalChange={(t) => {
                    const newQuantity = Math.round(t / duringDetails.ras.rate);
                    onDuringDetailsChange('ras', { ...duringDetails.ras, quantity: newQuantity });
                  }}
                  onQuantityChange={(q) => onDuringDetailsChange('ras', { ...duringDetails.ras, quantity: q })}
                  onRateChange={(r) => onDuringDetailsChange('ras', { ...duringDetails.ras, rate: r })}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Retreat Teacher"
                  total={duringDetails.retreatTeacher.quantity * duringDetails.retreatTeacher.rate}
                  quantity={duringDetails.retreatTeacher.quantity}
                  rate={duringDetails.retreatTeacher.rate}
                  min={0}
                  max={100000}
                  step={1000}
                  locked={locks?.retreatTeacher || false}
                  onToggleLock={() => onToggleLockItem('retreatTeacher')}
                  onTotalChange={(t) => {
                    const newQuantity = Math.round(t / duringDetails.retreatTeacher.rate);
                    onDuringDetailsChange('retreatTeacher', { ...duringDetails.retreatTeacher, quantity: newQuantity });
                  }}
                  onQuantityChange={(q) => onDuringDetailsChange('retreatTeacher', { ...duringDetails.retreatTeacher, quantity: q })}
                  onRateChange={(r) => onDuringDetailsChange('retreatTeacher', { ...duringDetails.retreatTeacher, rate: r })}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Daylong Visiting Teacher"
                  total={duringDetails.daylongVisitingTeacher.quantity * duringDetails.daylongVisitingTeacher.rate}
                  quantity={duringDetails.daylongVisitingTeacher.quantity}
                  rate={duringDetails.daylongVisitingTeacher.rate}
                  min={0}
                  max={100000}
                  step={1000}
                  locked={locks?.daylongVisitingTeacher || false}
                  onToggleLock={() => onToggleLockItem('daylongVisitingTeacher')}
                  onTotalChange={(t) => {
                    const newQuantity = Math.round(t / duringDetails.daylongVisitingTeacher.rate);
                    onDuringDetailsChange('daylongVisitingTeacher', { ...duringDetails.daylongVisitingTeacher, quantity: newQuantity });
                  }}
                  onQuantityChange={(q) => onDuringDetailsChange('daylongVisitingTeacher', { ...duringDetails.daylongVisitingTeacher, quantity: q })}
                  onRateChange={(r) => onDuringDetailsChange('daylongVisitingTeacher', { ...duringDetails.daylongVisitingTeacher, rate: r })}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Week-long Visiting Teacher"
                  total={duringDetails.weeklongVisitingTeacher.quantity * duringDetails.weeklongVisitingTeacher.rate}
                  quantity={duringDetails.weeklongVisitingTeacher.quantity}
                  rate={duringDetails.weeklongVisitingTeacher.rate}
                  min={0}
                  max={100000}
                  step={1000}
                  locked={locks?.weeklongVisitingTeacher || false}
                  onToggleLock={() => onToggleLockItem('weeklongVisitingTeacher')}
                  onTotalChange={(t) => {
                    const newQuantity = Math.round(t / duringDetails.weeklongVisitingTeacher.rate);
                    onDuringDetailsChange('weeklongVisitingTeacher', { ...duringDetails.weeklongVisitingTeacher, quantity: newQuantity });
                  }}
                  onQuantityChange={(q) => onDuringDetailsChange('weeklongVisitingTeacher', { ...duringDetails.weeklongVisitingTeacher, quantity: q })}
                  onRateChange={(r) => onDuringDetailsChange('weeklongVisitingTeacher', { ...duringDetails.weeklongVisitingTeacher, rate: r })}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Head Cook"
                  total={duringDetails.headCook.quantity * duringDetails.headCook.rate}
                  quantity={duringDetails.headCook.quantity}
                  rate={duringDetails.headCook.rate}
                  min={0}
                  max={100000}
                  step={1000}
                  locked={locks?.headCook || false}
                  onToggleLock={() => onToggleLockItem('headCook')}
                  onTotalChange={(t) => {
                    const newQuantity = Math.round(t / duringDetails.headCook.rate);
                    onDuringDetailsChange('headCook', { ...duringDetails.headCook, quantity: newQuantity });
                  }}
                  onQuantityChange={(q) => onDuringDetailsChange('headCook', { ...duringDetails.headCook, quantity: q })}
                  onRateChange={(r) => onDuringDetailsChange('headCook', { ...duringDetails.headCook, rate: r })}
                  disabled={disabled}
                />
                <DuringSemesterItem
                  label="Assistant Cook"
                  total={duringDetails.assistantCook.quantity * duringDetails.assistantCook.rate}
                  quantity={duringDetails.assistantCook.quantity}
                  rate={duringDetails.assistantCook.rate}
                  min={0}
                  max={100000}
                  step={1000}
                  locked={locks?.assistantCook || false}
                  onToggleLock={() => onToggleLockItem('assistantCook')}
                  onTotalChange={(t) => {
                    const newQuantity = Math.round(t / duringDetails.assistantCook.rate);
                    onDuringDetailsChange('assistantCook', { ...duringDetails.assistantCook, quantity: newQuantity });
                  }}
                  onQuantityChange={(q) => onDuringDetailsChange('assistantCook', { ...duringDetails.assistantCook, quantity: q })}
                  onRateChange={(r) => onDuringDetailsChange('assistantCook', { ...duringDetails.assistantCook, rate: r })}
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
