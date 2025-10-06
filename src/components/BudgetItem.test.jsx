import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BudgetItem from './BudgetItem';

describe('BudgetItem', () => {
  const defaultProps = {
    label: 'Test Item',
    value: 5000,
    min: 0,
    max: 10000,
    step: 100,
    locked: false,
    onToggleLock: vi.fn(),
    onChange: vi.fn(),
    disabled: false
  };

  it('should render label and value', () => {
    render(<BudgetItem {...defaultProps} />);
    expect(screen.getByText(/Test Item:/)).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('should render slider with correct value', () => {
    render(<BudgetItem {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('5000');
  });

  it('should call onChange when slider is moved', () => {
    const onChange = vi.fn();
    render(<BudgetItem {...defaultProps} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '7000' } });

    expect(onChange).toHaveBeenCalledWith(7000);
  });

  it('should show unlock icon when not locked', () => {
    render(<BudgetItem {...defaultProps} locked={false} />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should show lock icon when locked', () => {
    render(<BudgetItem {...defaultProps} locked={true} />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should call onToggleLock when lock button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleLock = vi.fn();
    render(<BudgetItem {...defaultProps} onToggleLock={onToggleLock} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onToggleLock).toHaveBeenCalled();
  });

  it('should disable slider when locked', () => {
    render(<BudgetItem {...defaultProps} locked={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should disable slider when disabled prop is true', () => {
    render(<BudgetItem {...defaultProps} disabled={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should apply orange gradient by default', () => {
    render(<BudgetItem {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(249, 115, 22\)|#f97316)/);
  });

  it('should apply blue gradient when color is blue', () => {
    render(<BudgetItem {...defaultProps} color="blue" />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(59, 130, 246\)|#3b82f6)/);
  });

  it('should apply green gradient when color is green', () => {
    render(<BudgetItem {...defaultProps} color="green" />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(16, 185, 129\)|#10b981)/);
  });

  it('should calculate gradient percentage correctly', () => {
    render(<BudgetItem {...defaultProps} value={2500} min={0} max={10000} />);
    const slider = screen.getByRole('slider');
    // 2500 out of 10000 = 25%
    expect(slider.style.background).toContain('25%');
  });

  it('should handle EditableNumber changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BudgetItem {...defaultProps} onChange={onChange} />);

    const valueDisplay = screen.getByText('$5,000');
    await user.click(valueDisplay);

    const inputs = screen.getAllByDisplayValue('5000');
    const input = inputs[0];
    await user.clear(input);
    await user.type(input, '8000{Enter}');

    expect(onChange).toHaveBeenCalledWith(8000);
  });

  it('should respect min and max bounds', () => {
    render(<BudgetItem {...defaultProps} min={1000} max={5000} value={3000} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '1000');
    expect(slider).toHaveAttribute('max', '5000');
  });

  it('should use correct step value', () => {
    render(<BudgetItem {...defaultProps} step={500} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '500');
  });

  it('should fallback to orange color for invalid color', () => {
    render(<BudgetItem {...defaultProps} color="invalid" />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(249, 115, 22\)|#f97316)/);
  });
});
