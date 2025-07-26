import React from 'react';

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
}

export default function RatingStars({ rating, totalReviews }: RatingStarsProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="text-yellow-400 relative">
          <span className="absolute overflow-hidden w-1/2">★</span>
          <span className="text-gray-300">★</span>
        </span>
      );
    } else {
      stars.push(
        <span key={i} className="text-gray-300">★</span>
      );
    }
  }
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      <span className="text-sm text-gray-600">
        {rating.toFixed(1)}
        {totalReviews !== undefined && ` (${totalReviews} Reviews)`}
      </span>
    </div>
  );
}