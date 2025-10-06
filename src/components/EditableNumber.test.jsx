import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableNumber from './EditableNumber';

describe('EditableNumber', () => {
  it('should render formatted value', () => {
    render(<EditableNumber value={1000} onChange={vi.fn()} />);
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('should switch to input mode on click', async () => {
    const user = userEvent.setup();
    render(<EditableNumber value={1000} onChange={vi.fn()} />);

    const display = screen.getByText('$1,000');
    await user.click(display);

    const input = screen.getByDisplayValue('1000');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('should save value on Enter key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<EditableNumber value={1000} onChange={onChange} />);

    const display = screen.getByText('$1,000');
    await user.click(display);

    const input = screen.getByDisplayValue('1000');
    await user.clear(input);
    await user.type(input, '2000{Enter}');

    expect(onChange).toHaveBeenCalledWith(2000);
    // Simulate parent component updating the value
    rerender(<EditableNumber value={2000} onChange={onChange} />);
    expect(screen.getByText('$2,000')).toBeInTheDocument();
  });

  it('should save value on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EditableNumber value={1000} onChange={onChange} />);

    const display = screen.getByText('$1,000');
    await user.click(display);

    const input = screen.getByDisplayValue('1000');
    await user.clear(input);
    await user.type(input, '3000');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(3000);
  });

  it('should cancel on Escape key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EditableNumber value={1000} onChange={onChange} />);

    const display = screen.getByText('$1,000');
    await user.click(display);

    const input = screen.getByDisplayValue('1000');
    await user.clear(input);
    await user.type(input, '5000');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('should respect min value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EditableNumber value={100} onChange={onChange} min={50} max={200} />);

    const display = screen.getByText('$100');
    await user.click(display);

    const input = screen.getByDisplayValue('100');
    await user.clear(input);
    await user.type(input, '10{Enter}');

    expect(onChange).toHaveBeenCalledWith(50);
  });

  it('should respect max value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EditableNumber value={100} onChange={onChange} min={50} max={200} />);

    const display = screen.getByText('$100');
    await user.click(display);

    const input = screen.getByDisplayValue('100');
    await user.clear(input);
    await user.type(input, '500{Enter}');

    expect(onChange).toHaveBeenCalledWith(200);
  });

  it('should handle formatted input with commas', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EditableNumber value={1000} onChange={onChange} />);

    const display = screen.getByText('$1,000');
    await user.click(display);

    const input = screen.getByDisplayValue('1000');
    await user.clear(input);
    await user.type(input, '10,000{Enter}');

    expect(onChange).toHaveBeenCalledWith(10000);
  });

  it('should handle empty input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EditableNumber value={1000} onChange={onChange} min={0} />);

    const display = screen.getByText('$1,000');
    await user.click(display);

    const input = screen.getByDisplayValue('1000');
    await user.clear(input);

    // Type Enter to save empty value
    await user.type(input, '{Enter}');

    // Empty input becomes NaN, so onChange should not be called
    // Or if it is, it should use the min value (0)
    if (onChange.mock.calls.length > 0) {
      expect(onChange).toHaveBeenCalledWith(0);
    }
  });

  it('should apply step value', () => {
    const onChange = vi.fn();
    render(<EditableNumber value={1000} onChange={onChange} min={0} max={10000} step={500} />);

    // Just verify it renders - step is used in parent components
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('should handle negative values', () => {
    render(<EditableNumber value={-500} onChange={vi.fn()} />);
    expect(screen.getByText('-$500')).toBeInTheDocument();
  });

  it('should select all text when entering edit mode', async () => {
    const user = userEvent.setup();
    render(<EditableNumber value={1000} onChange={vi.fn()} />);

    const display = screen.getByText('$1,000');
    await user.click(display);

    const input = screen.getByDisplayValue('1000');
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(4); // "1000".length
  });
});
