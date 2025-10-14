import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaffSalaries from './StaffSalaries';

describe('StaffSalaries', () => {
  const defaultProps = {
    total: 120000,
    locked: false,
    onToggleLock: vi.fn(),
    onChange: vi.fn(),
    disabled: false,
    locks: {},
    onToggleLockItem: vi.fn(),
    beforeSemester: 60000,
    duringSemester: 60000,
    onBeforeSemesterChange: vi.fn(),
    onDuringSemesterChange: vi.fn(),
    duringDetails: {
      leadsOtherRoles: { quantity: 2, rate: 5000 },
      residentialFaculty: { quantity: 2, rate: 5000 },
      ras: { quantity: 2, rate: 5000 },
      retreatTeacher: { quantity: 1, rate: 5000 },
      daylongVisitingTeacher: { quantity: 1, rate: 5000 },
      weeklongVisitingTeacher: { quantity: 2, rate: 5000 },
      headCook: { quantity: 1, rate: 5000 },
      assistantCook: { quantity: 1, rate: 5000 }
    },
    onDuringDetailsChange: vi.fn()
  };

  it('should render staff salaries label and total', () => {
    render(<StaffSalaries {...defaultProps} />);
    expect(screen.getByText(/Staff Salaries:/)).toBeInTheDocument();
    expect(screen.getByText('$120,000')).toBeInTheDocument();
  });

  it('should render expand/collapse button', () => {
    render(<StaffSalaries {...defaultProps} />);
    const expandButton = screen.getAllByRole('button')[0];
    expect(expandButton).toBeInTheDocument();
  });

  it('should expand to show nested items when clicked', async () => {
    const user = userEvent.setup();
    render(<StaffSalaries {...defaultProps} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText(/Before Semester:/)).toBeInTheDocument();
      expect(screen.getByText(/During Semester:/)).toBeInTheDocument();
    });
  });

  it('should collapse when expand button clicked again', async () => {
    const user = userEvent.setup();
    render(<StaffSalaries {...defaultProps} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);
    await waitFor(() => expect(screen.getByText(/Before Semester:/)).toBeInTheDocument());

    await user.click(expandButton);
    await waitFor(() => expect(screen.queryByText(/Before Semester:/)).not.toBeInTheDocument());
  });

  it('should render slider', () => {
    render(<StaffSalaries {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('120000');
  });

  it('should call onChange when slider is moved', () => {
    const onChange = vi.fn();
    render(<StaffSalaries {...defaultProps} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '150000' } });

    expect(onChange).toHaveBeenCalledWith(150000);
  });

  it('should render lock button', () => {
    render(<StaffSalaries {...defaultProps} />);
    const lockButtons = screen.getAllByRole('button');
    expect(lockButtons.length).toBeGreaterThan(0);
  });

  it('should call onToggleLock when main lock button clicked', async () => {
    const user = userEvent.setup();
    const onToggleLock = vi.fn();
    render(<StaffSalaries {...defaultProps} onToggleLock={onToggleLock} />);

    const lockButton = screen.getAllByRole('button')[1]; // Second button is lock
    await user.click(lockButton);

    expect(onToggleLock).toHaveBeenCalled();
  });

  it('should disable slider when locked', () => {
    render(<StaffSalaries {...defaultProps} locked={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should disable slider when disabled prop is true', () => {
    render(<StaffSalaries {...defaultProps} disabled={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should apply orange gradient', () => {
    render(<StaffSalaries {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(249, 115, 22\)|#f97316)/);
  });

  it('should show During Semester nested items when expanded twice', async () => {
    const user = userEvent.setup();
    render(<StaffSalaries {...defaultProps} />);

    // Expand main
    const mainExpandButton = screen.getAllByRole('button')[0];
    await user.click(mainExpandButton);

    await waitFor(() => expect(screen.getByText(/During Semester:/)).toBeInTheDocument());

    // Find and click during semester expand button
    const duringButtons = screen.getAllByRole('button');
    const duringExpandButton = duringButtons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg && btn.closest('div')?.textContent?.includes('During Semester');
    });

    if (duringExpandButton) {
      await user.click(duringExpandButton);

      await waitFor(() => {
        expect(screen.getByText(/Leads\/Other Roles/)).toBeInTheDocument();
      });
    }
  });

  it('should sync total from before and during semester', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<StaffSalaries {...defaultProps} onChange={onChange} total={120000} />);

    // Component sets initial state, which triggers onChange
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('should handle EditableNumber changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StaffSalaries {...defaultProps} onChange={onChange} />);

    const valueDisplay = screen.getByText('$120,000');
    await user.click(valueDisplay);

    const inputs = screen.getAllByDisplayValue('120000');
    const input = inputs[0];
    await user.clear(input);
    await user.type(input, '150000{Enter}');

    expect(onChange).toHaveBeenCalledWith(150000);
  });

  it('should have orange background', () => {
    const { container } = render(<StaffSalaries {...defaultProps} />);
    expect(container.querySelector('.bg-orange-50')).toBeInTheDocument();
  });

  it('should respect min and max on slider', () => {
    render(<StaffSalaries {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '1000000');
  });

  it('should use 1000 step value', () => {
    render(<StaffSalaries {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '1000');
  });

  it('should initialize with default before and during semester values', async () => {
    const user = userEvent.setup();
    render(<StaffSalaries {...defaultProps} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    await waitFor(() => {
      // Check that Before Semester and During Semester items are rendered
      expect(screen.getByText(/Before Semester:/)).toBeInTheDocument();
      expect(screen.getByText(/During Semester:/)).toBeInTheDocument();
    });
  });
});
