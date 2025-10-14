import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExpensesSection from './ExpensesSection';

describe('ExpensesSection', () => {
  const defaultProps = {
    budget: {
      variableCosts: 120000,
      fixedCosts: 80000
    },
    expenseItems: {
      staffSalaries: 120000,
      otherExpenses: 80000
    },
    expenseDetails: {
      staffSalaries: {
        beforeSemester: 60000,
        duringSemester: 60000,
        duringDetails: {
          leadsOtherRoles: { quantity: 2, rate: 5000 },
          residentialFaculty: { quantity: 2, rate: 5000 },
          ras: { quantity: 2, rate: 5000 },
          retreatTeacher: { quantity: 1, rate: 5000 },
          daylongVisitingTeacher: { quantity: 1, rate: 5000 },
          weeklongVisitingTeacher: { quantity: 2, rate: 5000 },
          headCook: { quantity: 1, rate: 5000 },
          assistantCook: { quantity: 1, rate: 5000 }
        }
      },
      otherExpenses: {
        rent: 10000,
        food: 10000,
        legalAccountingInsurance: 10000,
        suppliesSubscriptions: 10000,
        it: 10000,
        travel: 10000,
        otherOverhead: 10000,
        rentDetails: {
          csCohort2Program: 3333,
          alumniProgram: 3333,
          donorRetreat: 3334
        }
      }
    },
    locks: {},
    updateExpenseItem: vi.fn(),
    updateOtherExpenseItem: vi.fn(),
    updateRentDetails: vi.fn(),
    updateStaffBeforeSemester: vi.fn(),
    updateStaffDuringSemester: vi.fn(),
    updateDuringDetail: vi.fn(),
    toggleLock: vi.fn(),
    setExpenseItems: vi.fn()
  };

  it('should render expenses heading', () => {
    render(<ExpensesSection {...defaultProps} />);
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('should render staff salaries component', () => {
    render(<ExpensesSection {...defaultProps} />);
    expect(screen.getByText(/Staff Salaries:/)).toBeInTheDocument();
    expect(screen.getByText('$120,000')).toBeInTheDocument();
  });

  it('should render other expenses component', () => {
    render(<ExpensesSection {...defaultProps} />);
    expect(screen.getByText(/Other Expenses:/)).toBeInTheDocument();
    expect(screen.getByText('$80,000')).toBeInTheDocument();
  });

  it('should render total expenses', () => {
    render(<ExpensesSection {...defaultProps} />);
    expect(screen.getByText(/Total Expenses:/)).toBeInTheDocument();
    expect(screen.getByText('$200,000')).toBeInTheDocument();
  });

  it('should have orange styling', () => {
    const { container } = render(<ExpensesSection {...defaultProps} />);
    expect(container.querySelector('.text-orange-700')).toBeInTheDocument();
    expect(container.querySelector('.bg-orange-100')).toBeInTheDocument();
  });

  it('should calculate total expenses correctly', () => {
    const props = {
      ...defaultProps,
      budget: {
        variableCosts: 150000,
        fixedCosts: 100000
      }
    };
    render(<ExpensesSection {...props} />);
    expect(screen.getByText('$250,000')).toBeInTheDocument();
  });

  it('should render both expense sliders', () => {
    render(<ExpensesSection {...defaultProps} />);
    const sliders = screen.getAllByRole('slider');
    // Staff Salaries + Other Expenses = 2 sliders minimum
    expect(sliders.length).toBeGreaterThanOrEqual(2);
  });

  it('should pass correct props to StaffSalaries', () => {
    render(<ExpensesSection {...defaultProps} />);
    expect(screen.getByText('$120,000')).toBeInTheDocument();
  });

  it('should pass correct props to OtherExpenses', () => {
    render(<ExpensesSection {...defaultProps} />);
    expect(screen.getByText('$80,000')).toBeInTheDocument();
  });

  it('should handle total expenses EditableNumber', () => {
    render(<ExpensesSection {...defaultProps} />);
    const totalExpenses = screen.getByText('$200,000');
    expect(totalExpenses).toBeInTheDocument();
  });

  it('should display all expense components', () => {
    render(<ExpensesSection {...defaultProps} />);

    // Check both expense sources are present
    expect(screen.getByText(/Staff Salaries:/)).toBeInTheDocument();
    expect(screen.getByText(/Other Expenses:/)).toBeInTheDocument();
    expect(screen.getByText(/Total Expenses:/)).toBeInTheDocument();
  });

  it('should handle zero expenses', () => {
    const props = {
      ...defaultProps,
      budget: {
        variableCosts: 0,
        fixedCosts: 0
      },
      expenseItems: {
        staffSalaries: 0,
        otherExpenses: 0
      }
    };
    render(<ExpensesSection {...props} />);
    const zeroValues = screen.getAllByText('$0');
    expect(zeroValues.length).toBeGreaterThan(0);
  });
});
