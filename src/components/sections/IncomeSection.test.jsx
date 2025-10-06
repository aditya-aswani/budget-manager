import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import IncomeSection from './IncomeSection';

describe('IncomeSection', () => {
  const defaultProps = {
    budget: {
      reserves: 50000,
      tuition: 150000,
      fundraising: 100000
    },
    incomeItems: {
      tuition: 190000,
      scholarships: 40000
    },
    locks: {},
    expanded: {},
    income: 300000,
    updateNetTuition: vi.fn(),
    updateTuitionItem: vi.fn(),
    updateScholarshipsItem: vi.fn(),
    updateBudget: vi.fn(),
    toggleLock: vi.fn(),
    toggleExpanded: vi.fn()
  };

  it('should render income sources heading', () => {
    render(<IncomeSection {...defaultProps} />);
    expect(screen.getByText('Income Sources')).toBeInTheDocument();
  });

  it('should render reserves slider', () => {
    render(<IncomeSection {...defaultProps} />);
    expect(screen.getByText(/Reserves:/)).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('should render fundraising slider', () => {
    render(<IncomeSection {...defaultProps} />);
    expect(screen.getByText(/Fundraising:/)).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
  });

  it('should render tuition-scholarships section', () => {
    render(<IncomeSection {...defaultProps} />);
    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === 'label' && content.includes('(Tuition - Scholarships):'))).toBeInTheDocument();
  });

  it('should render total income', () => {
    render(<IncomeSection {...defaultProps} />);
    expect(screen.getByText(/Total Income:/)).toBeInTheDocument();
    expect(screen.getByText('$300,000')).toBeInTheDocument();
  });

  it('should have blue styling', () => {
    const { container } = render(<IncomeSection {...defaultProps} />);
    expect(container.querySelector('.text-blue-700')).toBeInTheDocument();
    expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();
  });

  it('should render all three sliders', () => {
    render(<IncomeSection {...defaultProps} />);
    const sliders = screen.getAllByRole('slider');
    // Reserves + Tuition-Scholarships + Fundraising = 3 sliders minimum
    expect(sliders.length).toBeGreaterThanOrEqual(3);
  });

  it('should pass correct props to TuitionScholarshipsSection', () => {
    render(<IncomeSection {...defaultProps} />);
    expect(screen.getByText('$150,000')).toBeInTheDocument(); // Net tuition
  });

  it('should handle total income EditableNumber', () => {
    render(<IncomeSection {...defaultProps} />);
    const totalIncome = screen.getByText('$300,000');
    expect(totalIncome).toBeInTheDocument();
  });

  it('should display all income components', () => {
    render(<IncomeSection {...defaultProps} />);

    // Check all three income sources are present
    expect(screen.getByText(/Reserves:/)).toBeInTheDocument();
    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === 'label' && content.includes('(Tuition - Scholarships):'))).toBeInTheDocument();
    expect(screen.getByText(/Fundraising:/)).toBeInTheDocument();
    expect(screen.getByText(/Total Income:/)).toBeInTheDocument();
  });
});
