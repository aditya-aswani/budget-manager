import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TuitionScholarshipsSection from './TuitionScholarshipsSection';

describe('TuitionScholarshipsSection', () => {
  const defaultProps = {
    budget: {
      tuition: 150000
    },
    incomeItems: {
      tuition: 190000,
      scholarships: 40000
    },
    locks: {},
    expanded: {},
    updateNetTuition: vi.fn(),
    updateTuitionItem: vi.fn(),
    updateScholarshipsItem: vi.fn(),
    toggleLock: vi.fn(),
    toggleExpanded: vi.fn()
  };

  it('should render (Tuition - Scholarships) label', () => {
    render(<TuitionScholarshipsSection {...defaultProps} />);
    const label = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'label' && content.includes('(Tuition - Scholarships):');
    });
    expect(label).toBeInTheDocument();
  });

  it('should render net tuition value', () => {
    render(<TuitionScholarshipsSection {...defaultProps} />);
    expect(screen.getByText('$150,000')).toBeInTheDocument();
  });

  it('should render expand button', () => {
    render(<TuitionScholarshipsSection {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should call toggleExpanded when expand button clicked', async () => {
    const user = userEvent.setup();
    const toggleExpanded = vi.fn();
    render(<TuitionScholarshipsSection {...defaultProps} toggleExpanded={toggleExpanded} />);

    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    expect(toggleExpanded).toHaveBeenCalledWith('tuitionScholarships');
  });

  it('should show tuition and scholarships items when expanded', () => {
    const props = {
      ...defaultProps,
      expanded: { tuitionScholarships: true }
    };
    render(<TuitionScholarshipsSection {...props} />);

    expect(screen.getByText(/Tuition:/)).toBeInTheDocument();
    expect(screen.getByText(/Scholarships:/)).toBeInTheDocument();
  });

  it('should not show tuition and scholarships items when collapsed', () => {
    const props = {
      ...defaultProps,
      expanded: { tuitionScholarships: false }
    };
    render(<TuitionScholarshipsSection {...props} />);

    expect(screen.queryByText(/^Tuition:$/)).not.toBeInTheDocument();
  });

  it('should render slider', () => {
    render(<TuitionScholarshipsSection {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('150000');
  });

  it('should call updateNetTuition when slider is moved', () => {
    const updateNetTuition = vi.fn();
    render(<TuitionScholarshipsSection {...defaultProps} updateNetTuition={updateNetTuition} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '200000' } });

    expect(updateNetTuition).toHaveBeenCalledWith(200000);
  });

  it('should render lock button', () => {
    render(<TuitionScholarshipsSection {...defaultProps} />);
    const lockButtons = screen.getAllByRole('button');
    expect(lockButtons.length).toBeGreaterThan(0);
  });

  it('should call toggleLock for tuition when lock button clicked', async () => {
    const user = userEvent.setup();
    const toggleLock = vi.fn();
    render(<TuitionScholarshipsSection {...defaultProps} toggleLock={toggleLock} />);

    const lockButton = screen.getAllByRole('button')[1];
    await user.click(lockButton);

    expect(toggleLock).toHaveBeenCalledWith('tuition');
  });

  it('should disable slider when locked', () => {
    const props = {
      ...defaultProps,
      locks: { tuition: true }
    };
    render(<TuitionScholarshipsSection {...props} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should have blue background', () => {
    const { container } = render(<TuitionScholarshipsSection {...defaultProps} />);
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
  });

  it('should apply blue gradient to slider', () => {
    render(<TuitionScholarshipsSection {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toMatch(/(rgb\(59, 130, 246\)|#3b82f6)/);
  });

  it('should render tuition item with correct value when expanded', () => {
    const props = {
      ...defaultProps,
      expanded: { tuitionScholarships: true }
    };
    render(<TuitionScholarshipsSection {...props} />);

    expect(screen.getByText('$190,000')).toBeInTheDocument();
  });

  it('should render scholarships item with correct value when expanded', () => {
    const props = {
      ...defaultProps,
      expanded: { tuitionScholarships: true }
    };
    render(<TuitionScholarshipsSection {...props} />);

    expect(screen.getByText('$40,000')).toBeInTheDocument();
  });

  it('should call updateTuitionItem when tuition sub-item changes', async () => {
    const updateTuitionItem = vi.fn();
    const props = {
      ...defaultProps,
      expanded: { tuitionScholarships: true },
      updateTuitionItem
    };
    render(<TuitionScholarshipsSection {...props} />);

    const sliders = screen.getAllByRole('slider');
    const tuitionSlider = sliders[1]; // First sub-item slider
    fireEvent.change(tuitionSlider, { target: { value: '200000' } });

    expect(updateTuitionItem).toHaveBeenCalledWith(200000);
  });

  it('should call updateScholarshipsItem when scholarships sub-item changes', async () => {
    const updateScholarshipsItem = vi.fn();
    const props = {
      ...defaultProps,
      expanded: { tuitionScholarships: true },
      updateScholarshipsItem
    };
    render(<TuitionScholarshipsSection {...props} />);

    const sliders = screen.getAllByRole('slider');
    const scholarshipsSlider = sliders[2]; // Second sub-item slider
    fireEvent.change(scholarshipsSlider, { target: { value: '50000' } });

    expect(updateScholarshipsItem).toHaveBeenCalledWith(50000);
  });

  it('should handle tuition item with undefined or null value', () => {
    const props = {
      ...defaultProps,
      expanded: { tuitionScholarships: true },
      incomeItems: {
        tuition: null,
        scholarships: 40000
      }
    };
    render(<TuitionScholarshipsSection {...props} />);

    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('should apply blue color to nested items', () => {
    const props = {
      ...defaultProps,
      expanded: { tuitionScholarships: true }
    };
    render(<TuitionScholarshipsSection {...props} />);

    const sliders = screen.getAllByRole('slider');
    // Check nested sliders have blue gradient
    sliders.slice(1).forEach(slider => {
      expect(slider.style.background).toMatch(/(rgb\(59, 130, 246\)|#3b82f6)/);
    });
  });

  it('should handle EditableNumber changes on main value', async () => {
    const user = userEvent.setup();
    const updateNetTuition = vi.fn();
    render(<TuitionScholarshipsSection {...defaultProps} updateNetTuition={updateNetTuition} />);

    const valueDisplay = screen.getByText('$150,000');
    await user.click(valueDisplay);

    const inputs = screen.getAllByDisplayValue('150000');
    const input = inputs[0];
    await user.clear(input);
    await user.type(input, '175000{Enter}');

    expect(updateNetTuition).toHaveBeenCalledWith(175000);
  });
});
