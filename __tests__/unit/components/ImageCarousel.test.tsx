/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../../utils/testHelpers';
import ImageCarousel from '@/components/ImageCarousel';

describe('ImageCarousel Component', () => {
  const mockImages = [
    'goldiegrace/portfolio/test/portfolio1',
    'goldiegrace/portfolio/test/portfolio2',
    'goldiegrace/portfolio/test/portfolio3',
  ];

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should render the first image', () => {
    render(<ImageCarousel images={mockImages} />);
    const image = screen.getByAltText('Portfolio 1');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('res.cloudinary.com'));
  });

  it('should show placeholder when no images provided', () => {
    render(<ImageCarousel images={[]} />);
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('should navigate to next image when next button clicked', () => {
    render(<ImageCarousel images={mockImages} autoPlay={false} />);
    
    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);
    
    const image = screen.getByAltText('Portfolio 2');
    expect(image).toHaveAttribute('src', expect.stringContaining('res.cloudinary.com'));
  });

  it('should navigate to previous image when previous button clicked', () => {
    render(<ImageCarousel images={mockImages} autoPlay={false} />);
    
    const prevButton = screen.getByLabelText('Previous image');
    fireEvent.click(prevButton);
    
    // Should go to last image when clicking previous from first
    const image = screen.getByAltText('Portfolio 3');
    expect(image).toHaveAttribute('src', expect.stringContaining('res.cloudinary.com'));
  });

  it('should wrap around when navigating past last image', () => {
    render(<ImageCarousel images={mockImages} autoPlay={false} />);
    
    const nextButton = screen.getByLabelText('Next image');
    
    // Click next 3 times to go past the last image
    fireEvent.click(nextButton); // to image 2
    fireEvent.click(nextButton); // to image 3
    fireEvent.click(nextButton); // wrap to image 1
    
    const image = screen.getByAltText('Portfolio 1');
    expect(image).toHaveAttribute('src', expect.stringContaining('res.cloudinary.com'));
  });

  it('should auto-play through images when enabled', async () => {
    render(<ImageCarousel images={mockImages} autoPlay={true} interval={1000} />);
    
    // Initially shows first image
    expect(screen.getByAltText('Portfolio 1')).toBeInTheDocument();
    
    // After 1 second, should show second image
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByAltText('Portfolio 2')).toBeInTheDocument();
    
    // After another second, should show third image
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByAltText('Portfolio 3')).toBeInTheDocument();
    
    // After another second, should wrap to first image
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByAltText('Portfolio 1')).toBeInTheDocument();
  });

  it('should not auto-play when disabled', () => {
    render(<ImageCarousel images={mockImages} autoPlay={false} />);
    
    expect(screen.getByAltText('Portfolio 1')).toBeInTheDocument();
    
    jest.advanceTimersByTime(5000);
    
    // Should still show first image
    expect(screen.getByAltText('Portfolio 1')).toBeInTheDocument();
  });

  it('should render indicator dots for multiple images', () => {
    render(<ImageCarousel images={mockImages} />);
    
    const indicators = screen.getAllByRole('button', { name: /Go to image/ });
    expect(indicators).toHaveLength(3);
  });

  it('should navigate to specific image when indicator clicked', () => {
    render(<ImageCarousel images={mockImages} autoPlay={false} />);
    
    const thirdIndicator = screen.getByLabelText('Go to image 3');
    fireEvent.click(thirdIndicator);
    
    expect(screen.getByAltText('Portfolio 3')).toBeInTheDocument();
  });

  it('should highlight active indicator', () => {
    render(<ImageCarousel images={mockImages} autoPlay={false} />);
    
    const indicators = screen.getAllByRole('button', { name: /Go to image/ });
    
    // First indicator should be active (white background)
    expect(indicators[0]).toHaveClass('bg-white');
    expect(indicators[1]).toHaveClass('bg-white/50');
    expect(indicators[2]).toHaveClass('bg-white/50');
    
    // Click second indicator
    fireEvent.click(indicators[1]);
    
    // Second indicator should now be active
    expect(indicators[0]).toHaveClass('bg-white/50');
    expect(indicators[1]).toHaveClass('bg-white');
    expect(indicators[2]).toHaveClass('bg-white/50');
  });

  it('should not show navigation controls for single image', () => {
    render(<ImageCarousel images={[mockImages[0]]} />);
    
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Go to image/ })).not.toBeInTheDocument();
  });

  it('should stop auto-play when component unmounts', () => {
    const { unmount } = render(<ImageCarousel images={mockImages} autoPlay={true} interval={1000} />);
    
    unmount();
    
    // Advance timers and ensure no errors occur
    expect(() => jest.advanceTimersByTime(5000)).not.toThrow();
  });
});