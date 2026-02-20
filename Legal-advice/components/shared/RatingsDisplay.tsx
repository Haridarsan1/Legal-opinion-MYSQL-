'use client';

import { Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface Review {
  id: string;
  requestId?: string;
  rating: number;
  review_text?: string;
  overall_rating?: number; // deprecated
  feedback?: string; // deprecated
  created_at: string;
  request_id: string;
  client: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Props {
  ratings: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export default function RatingsDisplay({
  ratings,
  averageRating: propAverage,
  totalReviews: propTotal,
}: Props) {
  // Calculate stats if not provided (fallback)
  const validRatings = ratings.filter((r) => (r.rating || r.overall_rating || 0) > 0);

  const calculatedAverage =
    validRatings.length > 0
      ? (
          validRatings.reduce((sum, r) => sum + (r.rating || r.overall_rating || 0), 0) /
          validRatings.length
        ).toFixed(1)
      : '0.0';

  const averageRating = propAverage !== undefined ? propAverage.toFixed(1) : calculatedAverage;
  const totalReviews = propTotal !== undefined ? propTotal : validRatings.length;

  const stars = [1, 2, 3, 4, 5];

  // Distribution calculation
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
  validRatings.forEach((r) => {
    const ratingVal = r.rating || r.overall_rating || 0;
    if (ratingVal >= 1 && ratingVal <= 5) {
      distribution[Math.ceil(ratingVal)]++; // Just in case of float
    }
  });

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="bg-slate-50 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          {/* Overall Score */}
          <div className="text-center sm:text-left">
            <div className="flex items-baseline justify-center sm:justify-start gap-2 mb-2">
              <span className="text-5xl font-bold text-slate-900">{averageRating}</span>
              <span className="text-slate-500 font-medium">/ 5.0</span>
            </div>
            <div className="flex gap-1 mb-2 justify-center sm:justify-start">
              {stars.map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-slate-600 text-sm">
              Based on {totalReviews} client review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* progress bars (distribution) */}
          <div className="flex-1 w-full max-w-sm">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3 mb-2 last:mb-0">
                  <div className="flex items-center gap-1 w-12 flex-shrink-0">
                    <span className="text-sm font-medium text-slate-700">{rating}</span>
                    <Star className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right tabular-nums">
                    {Math.round(percentage)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Client Reviews</h3>

        {validRatings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No written reviews yet</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {validRatings.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.client.avatar_url ? (
                      <Image
                        src={review.client.avatar_url}
                        alt={review.client.full_name}
                        width={48}
                        height={48}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {review.client.full_name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900">{review.client.full_name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>Verified Client</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {stars.map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (review.rating || review.overall_rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {(review.review_text || review.feedback) && (
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {review.review_text || review.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
