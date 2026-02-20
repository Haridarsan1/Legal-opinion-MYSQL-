'use client';

import { useState } from 'react';
import { X, Star, Send, CheckCircle } from 'lucide-react';
import { submitReview } from '@/app/actions/reviews';

interface Props {
  requestId: string;
  lawyerId?: string;
  lawyerName?: string;
  onClose: () => void;
  onComplete: () => void;
  currentUserId: string;
}

export default function RatingModal({
  requestId,
  lawyerId,
  lawyerName,
  onClose,
  onComplete,
  currentUserId,
}: Props) {
  // Remove createClient usage for insertion, but maybe keep for other things? No, not needed here.
  // const supabase = createClient()

  const [overallRating, setOverallRating] = useState(0);
  // Removed categoryRatings state
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (rating: number) => {
    setOverallRating(rating);
  };

  // Removed handleCategoryRating

  const handleSubmit = async () => {
    if (overallRating === 0) {
      setError('Please provide an overall rating');
      return;
    }

    if (!lawyerId) {
      setError('Lawyer information is missing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Use server action
      const result = await submitReview(
        requestId,
        overallRating,
        feedback,
        'opinion' // Default interaction type for this modal context
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // No audit log insertion here, assuming server action handles it or it's not strictly required by new spec (user didn't mention audit logs in phase 3)
      // But if we want audit logs, we should add them to the server action.
      // For now, adhering to user request "All review submissions must go through a server action".

      setIsSuccess(true);
      setTimeout(() => onComplete(), 2000);
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    // ... success UI (unchanged logic, just ensuring variables are in scope)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600">
            Your rating has been submitted successfully. Your feedback helps us improve our
            services.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Rate Your Experience</h2>
              <p className="text-sm text-slate-600">
                How was your experience with {lawyerName || 'your lawyer'}?
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleStarClick(rating)}
                  className="group transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 transition-all ${
                      rating <= overallRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300 group-hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {overallRating > 0 && (
              <p className="text-center text-sm font-medium text-slate-600 mt-3">
                {overallRating === 5
                  ? 'Excellent!'
                  : overallRating === 4
                    ? 'Very Good'
                    : overallRating === 3
                      ? 'Good'
                      : overallRating === 2
                        ? 'Fair'
                        : 'Needs Improvement'}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Additional Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              placeholder="Share your thoughts about the service you received..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 mt-1">{feedback.length}/500 characters</p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Your feedback is valuable and helps us maintain high-quality legal services. All
              ratings are confidential.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={overallRating === 0 || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
