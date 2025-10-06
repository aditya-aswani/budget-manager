import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OtherExpenses from './OtherExpenses';

describe('OtherExpenses', () => {
  const defaultProps = {
    total: 70000,
    locked: false,
    onToggleLock: vi.fn(),
    onChange: vi.fn(),
    disabled: false,
    locks: {},
    onToggleLockItem: vi.fn()
  };

  it('should render other expenses label and total', () => {
    render(<OtherExpenses {...defaultProps} />);
    expect(screen.getByText(/Other Expenses:/)).toBeInTheDocument();
    expect(screen.getByText('$70,000')).toBeInTheDocument();
  });

  it('should render expand/collapse button', () => {
    render(<OtherExpenses {...defaultProps} />);
    const expandButton = screen.getAllByRole('button')[0];
    expect(expandButton).toBeInTheDocument();
  });

  it('should expand to show nested items when clicked', async () => {
    const user = userEvent.setup();
    render(<OtherExpenses {...defaultProps} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText(/Rent:/)).toBeInTheDocument();
      expect(screen.getByText(/Food:/)).toBeInTheDocument();
      expect(screen.getByText(/Legal, Accounting, Insurance:/)).toBeInTheDocument();
      expect(screen.getByText(/Supplies and Subscriptions:/)).toBeInTheDocument();
      expect(screen.getByText(/IT:/)).toBeInTheDocument();
      expect(screen.getByText(/Travel:/)).toBeInTheDocument();
      expect(screen.getByText(/Other Overhead:/)).toBeInTheDocument();
    });
  });

  it('should collapse when expand button clicked again', async () => {
    const user = userEvent.setup();
    render(<OtherExpenses {...defaultProps} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);
    await waitFor(() => expect(screen.getByText(/Rent:/)).toBeInTheDocument());

    await user.click(expandButton);
    await waitFor(() => expect(screen.queryByText(/Rent:/)).not.toBeInTheDocument());
  });

  it('should render slider', () => {
    render(<OtherExpenses {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('70000');
  });

  it('should call onChange when slider is moved', () => {
    const onChange = vi.fn();
    render(<OtherExpenses {...defaultProps} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '80000' } });

    expect(onChange).toHaveBeenCalledWith(80000);
  });

  it('should render lock button', () => {
    render(<OtherExpenses {...defaultProps} />);
    const lockButtons = screen.getAllByRole('button');
    expect(lockButtons.length).toBeGreaterThan(0);
  });

  it('should call onToggleLock when main lock button clicked', async () => {
    const user = userEvent.setup();
    const onToggleLock = vi.fn();
    render(<OtherExpenses {...defaultProps} onToggleLock={onToggleLock} />);

    const lockButton = screen.getAllByRole('button')[1];
    await user.click(lockButton);

    expect(onToggleLock).toHaveBeenCalled();
  });

  it('should disable slider when locked', () => {
    render(<OtherExpenses {...defaultProps} locked={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should disable slider when disabled prop is true', () => {
    render(<OtherExpenses {...defaultProps} disabled={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should apply orange gradient', () => {
    render(<OtherExpenses {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(249, 115, 22\)|#f97316)/);
  });

  it('should sync total from individual items', async () => {
    const onChange = vi.fn();
    render(<OtherExpenses {...defaultProps} onChange={onChange} />);

    // Component initializes with default items, which triggers onChange
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('should handle EditableNumber changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtherExpenses {...defaultProps} onChange={onChange} />);

    const valueDisplay = screen.getByText('$70,000');
    await user.click(valueDisplay);

    const inputs = screen.getAllByDisplayValue('70000');
    const input = inputs[0];
    await user.clear(input);
    await user.type(input, '90000{Enter}');

    expect(onChange).toHaveBeenCalledWith(90000);
  });

  it('should have orange background', () => {
    const { container } = render(<OtherExpenses {...defaultProps} />);
    expect(container.querySelector('.bg-orange-50')).toBeInTheDocument();
  });

  it('should respect min and max on slider', () => {
    render(<OtherExpenses {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '1000000');
  });

  it('should use 1000 step value', () => {
    render(<OtherExpenses {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '1000');
  });

  it('should render all 7 expense line items when expanded', async () => {
    const user = userEvent.setup();
    render(<OtherExpenses {...defaultProps} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    await waitFor(() => {
      const sliders = screen.getAllByRole('slider');
      // 1 main slider + 7 item sliders
      expect(sliders.length).toBe(8);
    });
  });

  it('should initialize with default values for all items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtherExpenses {...defaultProps} onChange={onChange} />);

    // Component should call onChange with the sum of default items (7 * 10000 = 70000)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBe(70000);
    });
  });

  it('should call onToggleLockItem for individual items', async () => {
    const user = userEvent.setup();
    const onToggleLockItem = vi.fn();
    render(<OtherExpenses {...defaultProps} onToggleLockItem={onToggleLockItem} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    await waitFor(async () => {
      const lockButtons = screen.getAllByRole('button');
      // Find a lock button that's part of an item (not the main one)
      const itemLockButton = lockButtons[2]; // First item's lock button
      await user.click(itemLockButton);
    });

    expect(onToggleLockItem).toHaveBeenCalled();
  });

  it('should apply orange color to all nested items', async () => {
    const user = userEvent.setup();
    render(<OtherExpenses {...defaultProps} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    await waitFor(() => {
      const sliders = screen.getAllByRole('slider');
      // Check that item sliders have orange gradient
      sliders.slice(1).forEach(slider => {
        expect(slider.style.background).toMatch(/(rgb\(249, 115, 22\)|#f97316)/);
      });
    });
  });
});
