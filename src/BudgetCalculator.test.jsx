import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetCalculator from './BudgetCalculator';

describe('BudgetCalculator', () => {
  it('should render main heading', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText('Contemplative Semester Budget Calculator')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText('Interactive budget planning tool with dynamic relationships')).toBeInTheDocument();
  });

  it('should render budget equation heading', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText('Budget Equation')).toBeInTheDocument();
  });

  it('should render budget equation formula', () => {
    render(<BudgetCalculator />);
    const formula = screen.getAllByText(/Total Budget/);
    expect(formula.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Reserves/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tuition - Scholarships/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fundraising/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Staff Salaries/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Other Expenses/).length).toBeGreaterThan(0);
  });

  it('should render Total Budget slider', () => {
    render(<BudgetCalculator />);
    const totalBudgetLabels = screen.getAllByText(/Total Budget:/);
    expect(totalBudgetLabels.length).toBeGreaterThan(0);
  });

  it('should render Income Sources section', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText('Income Sources')).toBeInTheDocument();
  });

  it('should render Expenses section', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('should render balance indicator', () => {
    render(<BudgetCalculator />);
    // Should show either balanced, surplus, or deficit
    const text = screen.getByText(/(Budget Balanced|Budget Surplus|Budget Deficit)/);
    expect(text).toBeInTheDocument();
  });

  it('should render instructions section', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText('How to Use This Tool')).toBeInTheDocument();
  });

  it('should render multiple sliders', () => {
    render(<BudgetCalculator />);
    const sliders = screen.getAllByRole('slider');
    // Should have multiple sliders for all budget items
    expect(sliders.length).toBeGreaterThan(3);
  });

  it('should have proper layout structure', () => {
    const { container } = render(<BudgetCalculator />);
    expect(container.querySelector('.max-w-7xl')).toBeInTheDocument();
  });

  it('should render lock buttons', () => {
    render(<BudgetCalculator />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render all income line items', () => {
    render(<BudgetCalculator />);
    expect(screen.getAllByText(/Reserves:/).length).toBeGreaterThan(0);
    const tuitionLabel = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'label' && content.includes('(Tuition - Scholarships):');
    });
    expect(tuitionLabel).toBeInTheDocument();
    expect(screen.getAllByText(/Fundraising:/).length).toBeGreaterThan(0);
  });

  it('should render all expense line items', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText(/Staff Salaries:/)).toBeInTheDocument();
    expect(screen.getByText(/Other Expenses:/)).toBeInTheDocument();
  });

  it('should render Total Income', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText(/Total Income:/)).toBeInTheDocument();
  });

  it('should render Total Expenses', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText(/Total Expenses:/)).toBeInTheDocument();
  });

  it('should have gradient background', () => {
    const { container } = render(<BudgetCalculator />);
    expect(container.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
  });

  it('should render calculator icon', () => {
    const { container } = render(<BudgetCalculator />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should have instructions about sliders', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText(/Adjust any slider to see how it affects other budget components/)).toBeInTheDocument();
  });

  it('should have instructions about locking', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText(/Click the lock icon to fix a value/)).toBeInTheDocument();
  });

  it('should have instructions about dropdowns', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText(/Click the dropdown arrows to see and adjust individual line items/)).toBeInTheDocument();
  });

  it('should mention nested items in instructions', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText(/Staff Salaries has nested items/)).toBeInTheDocument();
  });

  it('should mention rate × quantity in instructions', () => {
    render(<BudgetCalculator />);
    expect(screen.getByText(/During Semester items show Total = Rate × Quantity/)).toBeInTheDocument();
  });
});
