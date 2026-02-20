'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onChange?: (rating: number) => void;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  editable = false,
  onChange,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  const handleClick = (value: number) => {
    if (!editable) return;

    setSelectedRating(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!editable) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!editable) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || selectedRating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1;
        const isFilled = value <= displayRating;

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={!editable}
            className={`transition-all ${
              editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
            aria-label={`Rate ${value} out of ${maxRating}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : hoverRating > 0 && editable
                    ? 'text-yellow-200'
                    : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
      {!editable && (
        <span className="text-sm font-bold text-slate-700 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
