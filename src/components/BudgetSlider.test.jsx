import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BudgetSlider from './BudgetSlider';

describe('BudgetSlider', () => {
  const defaultProps = {
    label: 'Test Budget',
    value: 50000,
    min: 0,
    max: 100000,
    step: 1000,
    locked: false,
    onToggleLock: vi.fn(),
    onChange: vi.fn(),
    disabled: false
  };

  it('should render label and value', () => {
    render(<BudgetSlider {...defaultProps} />);
    expect(screen.getByText(/Test Budget:/)).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('should render slider', () => {
    render(<BudgetSlider {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue('50000');
  });

  it('should call onChange when slider is moved', () => {
    const onChange = vi.fn();
    render(<BudgetSlider {...defaultProps} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75000' } });

    expect(onChange).toHaveBeenCalledWith(75000);
  });

  it('should render lock button', () => {
    render(<BudgetSlider {...defaultProps} />);
    const lockButton = screen.getByRole('button');
    expect(lockButton).toBeInTheDocument();
  });

  it('should call onToggleLock when lock button clicked', async () => {
    const user = userEvent.setup();
    const onToggleLock = vi.fn();
    render(<BudgetSlider {...defaultProps} onToggleLock={onToggleLock} />);

    const lockButton = screen.getByRole('button');
    await user.click(lockButton);

    expect(onToggleLock).toHaveBeenCalled();
  });

  it('should disable slider when locked', () => {
    render(<BudgetSlider {...defaultProps} locked={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should disable slider when disabled prop is true', () => {
    render(<BudgetSlider {...defaultProps} disabled={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should apply orange color by default', () => {
    const { container } = render(<BudgetSlider {...defaultProps} />);
    expect(container.querySelector('.bg-orange-50')).toBeInTheDocument();
  });

  it('should apply blue color when specified', () => {
    const { container } = render(<BudgetSlider {...defaultProps} color="blue" />);
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
  });

  it('should apply green color when specified', () => {
    const { container } = render(<BudgetSlider {...defaultProps} color="green" />);
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
  });

  it('should apply medium size by default', () => {
    const { container } = render(<BudgetSlider {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveClass('h-2');
  });

  it('should apply small size when specified', () => {
    render(<BudgetSlider {...defaultProps} size="sm" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveClass('h-1.5');
  });

  it('should apply large size when specified', () => {
    render(<BudgetSlider {...defaultProps} size="lg" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveClass('h-2.5');
  });

  it('should calculate gradient percentage correctly', () => {
    render(<BudgetSlider {...defaultProps} value={25000} min={0} max={100000} />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toContain('25%');
  });

  it('should handle min and max attributes', () => {
    render(<BudgetSlider {...defaultProps} min={10000} max={200000} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10000');
    expect(slider).toHaveAttribute('max', '200000');
  });

  it('should handle step attribute', () => {
    render(<BudgetSlider {...defaultProps} step={5000} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '5000');
  });

  it('should integrate with EditableNumber', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BudgetSlider {...defaultProps} onChange={onChange} />);

    const valueDisplay = screen.getByText('$50,000');
    await user.click(valueDisplay);

    const inputs = screen.getAllByDisplayValue('50000');
    const input = inputs[0];
    await user.clear(input);
    await user.type(input, '80000{Enter}');

    expect(onChange).toHaveBeenCalledWith(80000);
  });

  it('should apply correct gradient colors for orange', () => {
    render(<BudgetSlider {...defaultProps} color="orange" />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(249, 115, 22\)|#f97316)/);
    expect(slider.style.background).toMatch(/(rgb\(255, 237, 213\)|#ffedd5)/);
  });

  it('should apply correct gradient colors for blue', () => {
    render(<BudgetSlider {...defaultProps} color="blue" />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(59, 130, 246\)|#3b82f6)/);
    expect(slider.style.background).toMatch(/(rgb\(219, 234, 254\)|#dbeafe)/);
  });

  it('should apply correct gradient colors for green', () => {
    render(<BudgetSlider {...defaultProps} color="green" />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(34, 197, 94\)|#22c55e)/);
    expect(slider.style.background).toMatch(/(rgb\(220, 252, 231\)|#dcfce7)/);
  });
});
