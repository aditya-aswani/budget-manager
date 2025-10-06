import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('Contemplative Semester Budget Calculator')).toBeInTheDocument();
  });

  it('should render BudgetCalculator component', () => {
    render(<App />);
    expect(screen.getByText('Budget Equation')).toBeInTheDocument();
  });

  it('should have the main application structure', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
