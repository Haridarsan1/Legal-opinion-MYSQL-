'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
  size = 'md',
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };

  const handleClick = (index: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = (hoverRating !== null ? hoverRating : rating) > index;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            className={cn(
              'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-sm',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
            aria-label={`Rate ${index + 1} stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-slate-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
