import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultipleSelect } from './multiple-select';

describe('MultipleSelect', () => {
  const defaultProps = {
    name: 'test-select',
    value: [],
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    onChange: vi.fn(),
    onBlur: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with placeholder when no values are selected', () => {
    render(<MultipleSelect {...defaultProps} />);
    
    expect(screen.getByText('Select options...')).toBeInTheDocument();
  });

  it('should display selected values as colored tags', () => {
    const props = {
      ...defaultProps,
      value: ['Option 1', 'Option 3'],
    };
    
    render(<MultipleSelect {...props} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    expect(screen.queryByText('Select options...')).not.toBeInTheDocument();
  });

  it('should open dropdown when clicked', async () => {
    render(<MultipleSelect {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    defaultProps.options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should show checkboxes for each option', async () => {
    render(<MultipleSelect {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(defaultProps.options.length);
  });

  it('should toggle option selection when clicked', async () => {
    render(<MultipleSelect {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    const option1 = screen.getByText('Option 1').closest('li');
    await userEvent.click(option1!);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Option 1']);
  });

  it('should remove option from selection when already selected', async () => {
    const props = {
      ...defaultProps,
      value: ['Option 1', 'Option 2'],
    };
    
    render(<MultipleSelect {...props} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    const option1 = screen.getAllByText('Option 1')[1].closest('li');
    await userEvent.click(option1!);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Option 2']);
  });

  it('should show checked state for selected options', async () => {
    const props = {
      ...defaultProps,
      value: ['Option 1', 'Option 3'],
    };
    
    render(<MultipleSelect {...props} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
    expect(checkboxes[3]).not.toBeChecked();
  });

  it('should close dropdown when clicking outside', async () => {
    render(
      <div>
        <div data-testid="outside">Outside element</div>
        <MultipleSelect {...defaultProps} />
      </div>
    );
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    const outside = screen.getByTestId('outside');
    await userEvent.click(outside);
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('should apply error styling when error prop is true', () => {
    const props = {
      ...defaultProps,
      error: true,
    };
    
    render(<MultipleSelect {...props} />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('border-red-500');
  });

  it('should call onBlur when focus is lost', async () => {
    render(<MultipleSelect {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    await userEvent.tab();
    
    expect(defaultProps.onBlur).toHaveBeenCalled();
  });

  it('should handle multiple selections correctly', async () => {
    const { rerender } = render(<MultipleSelect {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    // Select first option
    const option1 = screen.getByText('Option 1').closest('li');
    await userEvent.click(option1!);
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Option 1']);
    
    // Simulate parent component updating the value prop
    defaultProps.onChange.mockClear();
    rerender(<MultipleSelect {...defaultProps} value={['Option 1']} />);
    
    // Select another option
    const option3 = screen.getByText('Option 3').closest('li');
    await userEvent.click(option3!);
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Option 1', 'Option 3']);
  });

  it('should use rainbow colors for options', async () => {
    render(<MultipleSelect {...defaultProps} value={['Option 1', 'Option 2']} />);
    
    const tag1 = screen.getByText('Option 1');
    const tag2 = screen.getByText('Option 2');
    
    // Check that the elements have the expected class
    expect(tag1).toHaveClass('inline-flex', 'items-center', 'px-2', 'py-0.5', 'rounded', 'text-xs', 'font-medium');
    expect(tag2).toHaveClass('inline-flex', 'items-center', 'px-2', 'py-0.5', 'rounded', 'text-xs', 'font-medium');
    
    // Check that inline styles exist
    expect(tag1).toHaveAttribute('style');
    expect(tag2).toHaveAttribute('style');
    
    // Verify they have different background colors (from rainbow array)
    const style1 = tag1.getAttribute('style');
    const style2 = tag2.getAttribute('style');
    expect(style1).toContain('background-color');
    expect(style2).toContain('background-color');
    expect(style1).not.toBe(style2);
  });

  it('should have scrollable dropdown for many options', async () => {
    const manyOptions = Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`);
    const props = {
      ...defaultProps,
      options: manyOptions,
    };
    
    render(<MultipleSelect {...props} />);
    
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveClass('max-h-60', 'overflow-y-auto');
  });
});