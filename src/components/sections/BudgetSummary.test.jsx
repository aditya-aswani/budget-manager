import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetSummary from './BudgetSummary';

describe('BudgetSummary', () => {
  it('should show balanced message when balance is zero', () => {
    render(<BudgetSummary balance={0} isBalanced={true} />);
    expect(screen.getByText(/Budget Balanced/)).toBeInTheDocument();
    expect(screen.getByText(/✓/)).toBeInTheDocument();
  });

  it('should show surplus message when balance is positive', () => {
    render(<BudgetSummary balance={50000} isBalanced={false} />);
    expect(screen.getByText(/Budget Surplus: \$50,000/)).toBeInTheDocument();
    expect(screen.getByText(/Surplus goes to next Contemplative Semester/)).toBeInTheDocument();
  });

  it('should show deficit message when balance is negative', () => {
    render(<BudgetSummary balance={-30000} isBalanced={false} />);
    expect(screen.getByText(/Budget Deficit: \$30,000/)).toBeInTheDocument();
  });

  it('should apply green color for balanced budget', () => {
    const { container } = render(<BudgetSummary balance={0} isBalanced={true} />);
    const balancedText = container.querySelector('.text-green-600');
    expect(balancedText).toBeInTheDocument();
  });

  it('should apply blue color for surplus', () => {
    const { container } = render(<BudgetSummary balance={10000} isBalanced={false} />);
    const surplusText = container.querySelector('.text-blue-600');
    expect(surplusText).toBeInTheDocument();
  });

  it('should apply red color for deficit', () => {
    const { container } = render(<BudgetSummary balance={-10000} isBalanced={false} />);
    const deficitText = container.querySelector('.text-red-600');
    expect(deficitText).toBeInTheDocument();
  });

  it('should format large surplus amounts correctly', () => {
    render(<BudgetSummary balance={1234567} isBalanced={false} />);
    expect(screen.getByText(/\$1,234,567/)).toBeInTheDocument();
  });

  it('should format large deficit amounts correctly', () => {
    render(<BudgetSummary balance={-987654} isBalanced={false} />);
    expect(screen.getByText(/\$987,654/)).toBeInTheDocument();
  });

  it('should have proper styling container', () => {
    const { container } = render(<BudgetSummary balance={0} isBalanced={true} />);
    const summaryDiv = container.querySelector('.bg-gray-100.rounded-lg');
    expect(summaryDiv).toBeInTheDocument();
  });

  it('should handle edge case of very small surplus', () => {
    render(<BudgetSummary balance={1} isBalanced={false} />);
    expect(screen.getByText(/Budget Surplus: \$1/)).toBeInTheDocument();
  });

  it('should handle edge case of very small deficit', () => {
    render(<BudgetSummary balance={-1} isBalanced={false} />);
    expect(screen.getByText(/Budget Deficit: \$1/)).toBeInTheDocument();
  });
});
