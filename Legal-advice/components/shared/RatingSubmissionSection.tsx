'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { submitRating } from '@/app/actions/requests';
import { useRouter } from 'next/navigation';

interface RatingSubmissionSectionProps {
  requestId: string;
  canSubmit: boolean;
  existingRating?: {
    overall_rating: number;
    feedback: string;
    created_at: string;
  } | null;
  reason?: string;
}

export default function RatingSubmissionSection({
  requestId,
  canSubmit,
  existingRating,
  reason,
}: RatingSubmissionSectionProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitRating(requestId, rating, feedback);

      if (result?.success) {
        toast.success('Rating submitted successfully');
        setRating(0);
        setFeedback('');
        router.refresh();
      } else {
        toast.error(result?.error || 'Failed to submit rating');
      }
    } catch (error) {
      toast.error('An error occurred while submitting rating');
      console.error('Submit rating error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show existing rating if present
  if (existingRating) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-blue-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Your Rating
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= existingRating.overall_rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
            <span className="ml-2 font-semibold text-slate-900">
              {existingRating.overall_rating}/5
            </span>
          </div>
          {existingRating.feedback && (
            <div className="mt-3 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">{existingRating.feedback}</p>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3">
            Submitted on{' '}
            {new Date(existingRating.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    );
  }

  // Show disabled state if cannot submit
  if (!canSubmit) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Rate Your Experience
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">{reason || 'Rating not available yet'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show submission form
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-blue-50">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-600" />
          Rate Your Experience
        </h3>
        <p className="text-sm text-slate-600 mt-1">Help us improve by sharing your feedback</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                  className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 font-semibold text-slate-900">{rating}/5</span>}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {rating === 0 && 'Click to select a rating'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              id="feedback"
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Share your experience with our service..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
