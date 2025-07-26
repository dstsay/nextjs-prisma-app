/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '../../utils/testHelpers';
import RatingStars from '@/components/RatingStars';

describe('RatingStars Component', () => {
  it('should render 5 stars', () => {
    render(<RatingStars rating={3} />);
    const stars = screen.getAllByText(/★/);
    expect(stars).toHaveLength(5);
  });

  it('should show correct number of full stars for whole ratings', () => {
    const { rerender } = render(<RatingStars rating={3} />);
    let stars = screen.getAllByText(/★/);
    const fullStars = stars.filter(star => star.className.includes('text-yellow-400'));
    expect(fullStars).toHaveLength(3);

    // Test different ratings
    rerender(<RatingStars rating={5} />);
    stars = screen.getAllByText(/★/);
    const allFullStars = stars.filter(star => star.className.includes('text-yellow-400'));
    expect(allFullStars).toHaveLength(5);

    rerender(<RatingStars rating={0} />);
    stars = screen.getAllByText(/★/);
    const noFullStars = stars.filter(star => star.className.includes('text-yellow-400'));
    expect(noFullStars).toHaveLength(0);
  });

  it('should show half star for decimal ratings >= 0.5', () => {
    render(<RatingStars rating={3.5} />);
    const stars = screen.getAllByText(/★/);
    const fullStars = stars.filter(star => 
      star.className.includes('text-yellow-400') && !star.parentElement?.className.includes('relative')
    );
    expect(fullStars).toHaveLength(3);
    
    // Check for half star (parent has relative class)
    const halfStars = stars.filter(star => 
      star.parentElement?.className.includes('relative')
    );
    expect(halfStars.length).toBeGreaterThan(0);
  });

  it('should not show half star for decimal ratings < 0.5', () => {
    render(<RatingStars rating={3.3} />);
    const stars = screen.getAllByText(/★/);
    const fullStars = stars.filter(star => 
      star.className.includes('text-yellow-400') && !star.parentElement?.className.includes('relative')
    );
    expect(fullStars).toHaveLength(3);
    
    const halfStars = stars.filter(star => 
      star.parentElement?.className.includes('relative')
    );
    expect(halfStars).toHaveLength(0);
  });

  it('should display rating value', () => {
    render(<RatingStars rating={4.5} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should display review count when provided', () => {
    render(<RatingStars rating={4} totalReviews={25} />);
    expect(screen.getByText(/\(25 Reviews\)/)).toBeInTheDocument();
  });

  it('should not display review count when not provided', () => {
    render(<RatingStars rating={4} />);
    expect(screen.queryByText(/Reviews/)).not.toBeInTheDocument();
  });

  it('should handle edge case of 0 reviews', () => {
    render(<RatingStars rating={0} totalReviews={0} />);
    expect(screen.getByText(/0\.0.*\(0 Reviews\)/)).toBeInTheDocument();
  });

  it('should format rating to 1 decimal place', () => {
    render(<RatingStars rating={4.333333} />);
    expect(screen.getByText('4.3')).toBeInTheDocument();
  });
});