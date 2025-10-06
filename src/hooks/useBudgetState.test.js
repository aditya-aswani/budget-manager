import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBudgetState } from './useBudgetState';

describe('useBudgetState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBudgetState());

    expect(result.current.budget).toBeDefined();
    expect(result.current.budget.total).toBe(300000);
    expect(result.current.budget.reserves).toBe(50000);
    expect(result.current.budget.tuition).toBe(150000);
    expect(result.current.budget.fundraising).toBe(100000);
  });

  it('should initialize income items', () => {
    const { result } = renderHook(() => useBudgetState());

    expect(result.current.incomeItems).toBeDefined();
    expect(result.current.incomeItems.scholarships).toBe(40000);
    expect(result.current.incomeItems.tuition).toBe(190000);
  });

  it('should initialize expense items', () => {
    const { result } = renderHook(() => useBudgetState());

    expect(result.current.expenseItems).toBeDefined();
    expect(result.current.expenseItems.staffSalaries).toBe(120000);
    expect(result.current.expenseItems.otherExpenses).toBe(80000);
  });

  it('should initialize locks', () => {
    const { result } = renderHook(() => useBudgetState());

    expect(result.current.locks).toBeDefined();
    expect(Object.keys(result.current.locks).length).toBeGreaterThan(0);
  });

  it('should initialize expanded state', () => {
    const { result } = renderHook(() => useBudgetState());

    expect(result.current.expanded).toBeDefined();
  });

  it('should calculate income correctly', () => {
    const { result } = renderHook(() => useBudgetState());

    // income = reserves + tuition + fundraising
    const expectedIncome = result.current.budget.reserves + result.current.budget.tuition + result.current.budget.fundraising;
    expect(result.current.income).toBe(expectedIncome);
  });

  it('should calculate balance correctly', () => {
    const { result } = renderHook(() => useBudgetState());

    // balance = income - (variableCosts + fixedCosts)
    const expectedBalance = result.current.income - (result.current.budget.variableCosts + result.current.budget.fixedCosts);
    expect(result.current.balance).toBe(expectedBalance);
  });

  it('should determine if budget is balanced', () => {
    const { result } = renderHook(() => useBudgetState());

    const balanced = Math.abs(result.current.balance) < 100;
    expect(result.current.isBalanced).toBe(balanced);
  });

  it('should update net tuition', () => {
    const { result } = renderHook(() => useBudgetState());

    act(() => {
      result.current.updateNetTuition(200000);
    });

    expect(result.current.budget.tuition).toBe(200000);
  });

  it('should update tuition item', () => {
    const { result } = renderHook(() => useBudgetState());

    act(() => {
      result.current.updateTuitionItem(250000);
    });

    expect(result.current.incomeItems.tuition).toBe(250000);
  });

  it('should update scholarships item', () => {
    const { result } = renderHook(() => useBudgetState());

    act(() => {
      result.current.updateScholarshipsItem(50000);
    });

    expect(result.current.incomeItems.scholarships).toBe(50000);
  });

  it('should update expense item', () => {
    const { result } = renderHook(() => useBudgetState());

    act(() => {
      result.current.updateExpenseItem('staffSalaries', 150000);
    });

    expect(result.current.expenseItems.staffSalaries).toBe(150000);
  });

  it('should update budget values', () => {
    const { result } = renderHook(() => useBudgetState());

    act(() => {
      result.current.updateBudget('reserves', 75000);
    });

    expect(result.current.budget.reserves).toBe(75000);
  });

  it('should toggle lock', () => {
    const { result } = renderHook(() => useBudgetState());

    const initialLockState = result.current.locks.reserves;

    act(() => {
      result.current.toggleLock('reserves');
    });

    expect(result.current.locks.reserves).toBe(!initialLockState);
  });

  it('should toggle expanded state', () => {
    const { result } = renderHook(() => useBudgetState());

    const initialExpandedState = result.current.expanded.tuitionScholarships || false;

    act(() => {
      result.current.toggleExpanded('tuitionScholarships');
    });

    expect(result.current.expanded.tuitionScholarships).toBe(!initialExpandedState);
  });

  it('should recalculate income when reserves change', () => {
    const { result } = renderHook(() => useBudgetState());

    const initialIncome = result.current.income;

    act(() => {
      result.current.updateBudget('reserves', 100000);
    });

    expect(result.current.income).toBe(initialIncome + 50000);
  });

  it('should recalculate income when tuition changes', () => {
    const { result } = renderHook(() => useBudgetState());

    const initialIncome = result.current.income;

    act(() => {
      result.current.updateNetTuition(200000);
    });

    expect(result.current.income).toBe(initialIncome + 50000);
  });

  it('should recalculate income when fundraising changes', () => {
    const { result } = renderHook(() => useBudgetState());

    const initialIncome = result.current.income;

    act(() => {
      result.current.updateBudget('fundraising', 150000);
    });

    expect(result.current.income).toBe(initialIncome + 50000);
  });

  it('should handle setting expense items', () => {
    const { result } = renderHook(() => useBudgetState());

    act(() => {
      result.current.setExpenseItems({
        staffSalaries: 140000,
        otherExpenses: 90000
      });
    });

    expect(result.current.expenseItems.staffSalaries).toBe(140000);
    expect(result.current.expenseItems.otherExpenses).toBe(90000);
  });

  it('should maintain tuition items sum equal to budget.tuition', () => {
    const { result } = renderHook(() => useBudgetState());

    act(() => {
      result.current.updateTuitionItem(200000);
      result.current.updateScholarshipsItem(50000);
    });

    // Net tuition should update based on the items
    const netTuition = result.current.incomeItems.tuition - result.current.incomeItems.scholarships;
    expect(result.current.budget.tuition).toBe(netTuition);
  });

  it('should handle multiple sequential updates', () => {
    const { result } = renderHook(() => useBudgetState());

    act(() => {
      result.current.updateBudget('reserves', 60000);
      result.current.updateBudget('fundraising', 110000);
      result.current.updateNetTuition(160000);
    });

    expect(result.current.budget.reserves).toBe(60000);
    expect(result.current.budget.fundraising).toBe(110000);
    expect(result.current.budget.tuition).toBe(160000);
    expect(result.current.income).toBe(330000);
  });
});
