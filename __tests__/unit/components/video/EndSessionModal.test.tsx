import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EndSessionModal } from '../../../../components/video/EndSessionModal';

describe('EndSessionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <EndSessionModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="End Session?"
        message="Are you sure?"
      />
    );

    expect(screen.queryByText('End Session?')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <EndSessionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="End Session?"
        message="Are you sure you want to end this session?"
      />
    );

    expect(screen.getByText('End Session?')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to end this session?')).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <EndSessionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="End Session?"
        message="Are you sure?"
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm when Yes button is clicked', () => {
    render(
      <EndSessionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="End Session?"
        message="Are you sure?"
      />
    );

    const confirmButton = screen.getByText('Yes, end session');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    render(
      <EndSessionModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="End Session?"
        message="Are you sure?"
      />
    );

    // Find the backdrop (first div with onClick)
    const backdrop = screen.getByText('End Session?').closest('.fixed')?.querySelector('div');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });
});