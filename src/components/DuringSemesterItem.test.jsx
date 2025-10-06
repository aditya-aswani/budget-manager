import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DuringSemesterItem from './DuringSemesterItem';

describe('DuringSemesterItem', () => {
  const defaultProps = {
    label: 'Test Role',
    total: 10000,
    rate: 5000,
    quantity: 2,
    min: 0,
    max: 50000,
    step: 500,
    locked: false,
    onToggleLock: vi.fn(),
    onTotalChange: vi.fn(),
    onRateChange: vi.fn(),
    onQuantityChange: vi.fn(),
    disabled: false
  };

  it('should render label', () => {
    render(<DuringSemesterItem {...defaultProps} />);
    expect(screen.getByText(/Test Role:/)).toBeInTheDocument();
  });

  it('should render total, rate, and quantity inputs', () => {
    render(<DuringSemesterItem {...defaultProps} />);
    expect(screen.getByDisplayValue('10,000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5,000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('should render equals and multiplication symbols', () => {
    render(<DuringSemesterItem {...defaultProps} />);
    expect(screen.getByText('=')).toBeInTheDocument();
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('should call onTotalChange when total input changes', () => {
    const onTotalChange = vi.fn();
    render(<DuringSemesterItem {...defaultProps} onTotalChange={onTotalChange} />);

    const totalInput = screen.getByDisplayValue('10,000');
    fireEvent.change(totalInput, { target: { value: '15000' } });

    expect(onTotalChange).toHaveBeenCalledWith(15000);
  });

  it('should call onRateChange when rate input changes', () => {
    const onRateChange = vi.fn();
    render(<DuringSemesterItem {...defaultProps} onRateChange={onRateChange} />);

    const rateInput = screen.getByDisplayValue('5,000');
    fireEvent.change(rateInput, { target: { value: '7000' } });

    expect(onRateChange).toHaveBeenCalledWith(7000);
  });

  it('should call onQuantityChange when quantity input changes', () => {
    const onQuantityChange = vi.fn();
    render(<DuringSemesterItem {...defaultProps} onQuantityChange={onQuantityChange} />);

    const quantityInput = screen.getByDisplayValue('2');
    fireEvent.change(quantityInput, { target: { value: '3' } });

    expect(onQuantityChange).toHaveBeenCalledWith(3);
  });

  it('should render slider with correct value', () => {
    render(<DuringSemesterItem {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('10000');
  });

  it('should call onTotalChange when slider is moved', () => {
    const onTotalChange = vi.fn();
    render(<DuringSemesterItem {...defaultProps} onTotalChange={onTotalChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20000' } });

    expect(onTotalChange).toHaveBeenCalledWith(20000);
  });

  it('should render lock button', () => {
    render(<DuringSemesterItem {...defaultProps} />);
    const lockButton = screen.getByRole('button');
    expect(lockButton).toBeInTheDocument();
  });

  it('should call onToggleLock when lock button clicked', async () => {
    const user = userEvent.setup();
    const onToggleLock = vi.fn();
    render(<DuringSemesterItem {...defaultProps} onToggleLock={onToggleLock} />);

    const lockButton = screen.getByRole('button');
    await user.click(lockButton);

    expect(onToggleLock).toHaveBeenCalled();
  });

  it('should disable inputs when locked', () => {
    render(<DuringSemesterItem {...defaultProps} locked={true} />);
    const totalInput = screen.getByDisplayValue('10,000');
    const rateInput = screen.getByDisplayValue('5,000');
    const quantityInput = screen.getByDisplayValue('2');
    const slider = screen.getByRole('slider');

    expect(totalInput).toBeDisabled();
    expect(rateInput).toBeDisabled();
    expect(quantityInput).toBeDisabled();
    expect(slider).toBeDisabled();
  });

  it('should disable inputs when disabled prop is true', () => {
    render(<DuringSemesterItem {...defaultProps} disabled={true} />);
    const totalInput = screen.getByDisplayValue('10,000');
    const rateInput = screen.getByDisplayValue('5,000');
    const quantityInput = screen.getByDisplayValue('2');
    const slider = screen.getByRole('slider');

    expect(totalInput).toBeDisabled();
    expect(rateInput).toBeDisabled();
    expect(quantityInput).toBeDisabled();
    expect(slider).toBeDisabled();
  });

  it('should apply orange gradient', () => {
    render(<DuringSemesterItem {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(249, 115, 22\)|#f97316)/);
    expect(slider.style.background).toMatch(/(rgb\(255, 237, 213\)|#ffedd5)/);
  });

  it('should calculate gradient percentage correctly', () => {
    render(<DuringSemesterItem {...defaultProps} total={25000} min={0} max={50000} />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toContain('50%');
  });

  it('should handle formatted input with commas', () => {
    const onTotalChange = vi.fn();
    render(<DuringSemesterItem {...defaultProps} onTotalChange={onTotalChange} />);

    const totalInput = screen.getByDisplayValue('10,000');
    fireEvent.change(totalInput, { target: { value: '25,000' } });

    expect(onTotalChange).toHaveBeenCalledWith(25000);
  });

  it('should respect min and max bounds on slider', () => {
    render(<DuringSemesterItem {...defaultProps} min={1000} max={100000} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '1000');
    expect(slider).toHaveAttribute('max', '100000');
  });

  it('should use correct step value', () => {
    render(<DuringSemesterItem {...defaultProps} step={1000} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '1000');
  });
});
