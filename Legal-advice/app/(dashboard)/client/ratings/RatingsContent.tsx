'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  MessageCircle,
  FileQuestion,
  Scale,
  CheckCircle,
  ArrowRight,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import { submitReview } from '@/app/actions/reviews';

interface Request {
  id: string;
  request_number: string;
  title: string;
  department: string;
  status: string;
  created_at: string;
  assigned_lawyer_id: string;
  lawyer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    specialization?: string;
  };
  lawyer_reviews?: Array<{
    id: string;
    rating: number;
    created_at: string;
  }>;
}

interface InteractionSummary {
  messagesCount: number;
  clarificationsCount: number;
  opinionSubmitted: boolean;
  hasInteraction: boolean;
}

interface Props {
  userId: string;
  requests: Request[];
}

export default function RatingsContent({ userId, requests }: Props) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [interactions, setInteractions] = useState<Record<string, InteractionSummary>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // Fetch interaction data for all requests
  useEffect(() => {
    fetchInteractions();
  }, [requests]);

  const fetchInteractions = async () => {
    setIsLoading(true);
    const interactionData: Record<string, InteractionSummary> = {};

    for (const request of requests) {
      // Count messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${userId},sender_id.eq.${request.assigned_lawyer_id}`)
        .in(
          'conversation_id',
          await supabase
            .from('conversations')
            .select('id')
            .eq('request_id', request.id)
            .then((res) => res.data?.map((c) => c.id) || [])
        );

      // Count clarifications (simplified - check if any exist)
      const { count: clarificationsCount } = await supabase
        .from('clarifications')
        .select('*', { count: 'exact', head: true })
        .eq('request_id', request.id);

      // Check if opinion submitted
      const { data: opinions } = await supabase
        .from('opinion_submissions')
        .select('id')
        .eq('request_id', request.id)
        .limit(1);

      const opinionSubmitted = (opinions?.length || 0) > 0;
      const hasInteraction =
        (messagesCount || 0) > 0 || (clarificationsCount || 0) > 0 || opinionSubmitted;

      interactionData[request.id] = {
        messagesCount: messagesCount || 0,
        clarificationsCount: clarificationsCount || 0,
        opinionSubmitted,
        hasInteraction,
      };
    }

    setInteractions(interactionData);
    setIsLoading(false);
  };

  // Get eligible requests (with interactions and not already rated)
  const eligibleRequests = requests.filter((req) => {
    const hasNoRating = !req.lawyer_reviews || req.lawyer_reviews.length === 0;
    const hasInteraction = interactions[req.id]?.hasInteraction;
    return hasNoRating && hasInteraction;
  });

  const handleSubmitRating = async () => {
    if (!selectedRequest || overallRating === 0) {
      setError('Please select at least an overall rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitReview(
        selectedRequest.id,
        overallRating,
        feedback.trim(),
        'full_case'
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (
    currentRating: number,
    onSelect: (rating: number) => void,
    size: 'large' | 'small' = 'large'
  ) => {
    const starSize = size === 'large' ? 'w-10 h-10' : 'w-5 h-5';

    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onSelect(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`${starSize} transition-all ${
                star <= (hoveredRating || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-600">Loading your cases...</p>
      </div>
    );
  }

  // If submitted, show success state
  if (isSubmitted && selectedRequest) {
    return (
      <div className="flex flex-col flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Thank you for your feedback!</h2>
          <p className="text-slate-600 mb-8">
            Your rating has been submitted successfully and will appear on the lawyer's public
            profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/client/lawyers/${selectedRequest.assigned_lawyer_id}`)}
              className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              View Lawyer Profile
            </button>
            <button
              onClick={() => router.push('/client/track')}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center"
            >
              Go to Track Status
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no eligible requests, show empty state
  if (eligibleRequests.length === 0) {
    return (
      <div className="flex flex-col flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">No cases available for rating</h2>
          <p className="text-slate-600 mb-2">
            Ratings will be available once you interact with a lawyer.
          </p>
          <p className="text-sm text-slate-500">
            This includes sending messages, receiving clarifications, or getting an opinion.
          </p>
        </div>
      </div>
    );
  }

  // If no request selected, show request selection
  if (!selectedRequest) {
    return (
      <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Rate Your Experience
          </h1>
          <p className="text-slate-600">
            Select a case to share your feedback and help improve our services
          </p>
        </div>

        <div className="grid gap-4">
          {eligibleRequests.map((request) => {
            const interaction = interactions[request.id];

            return (
              <button
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className="bg-white rounded-2xl border border-slate-200 p-6 text-left hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Lawyer Avatar */}
                  {request.lawyer.avatar_url ? (
                    <Image
                      src={request.lawyer.avatar_url}
                      alt={request.lawyer.full_name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-slate-200">
                      {request.lawyer.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      {request.lawyer.full_name}
                    </h3>
                    <p className="text-primary text-sm font-medium mb-2">
                      {request.lawyer.specialization || request.department}
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      Case {request.request_number} •{' '}
                      {format(new Date(request.created_at), 'MMM dd, yyyy')}
                    </p>

                    {/* Interaction Summary */}
                    {interaction && (
                      <div className="flex flex-wrap gap-2">
                        {interaction.messagesCount > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-amber-200">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {interaction.messagesCount} message
                            {interaction.messagesCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {interaction.clarificationsCount > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200">
                            <FileQuestion className="w-3.5 h-3.5" />
                            {interaction.clarificationsCount} clarification
                            {interaction.clarificationsCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {interaction.opinionSubmitted && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-200">
                            <Scale className="w-3.5 h-3.5" />
                            Opinion submitted
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200">
                          <Shield className="w-3.5 h-3.5" />
                          Verified Interaction
                        </span>
                      </div>
                    )}
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Rating form for selected request
  const interaction = interactions[selectedRequest!.id];

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div>
        <button
          onClick={() => setSelectedRequest(null)}
          className="text-primary hover:text-primary/80 font-medium mb-4 flex items-center gap-2"
        >
          ← Back to cases
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Rate Your Experience</h1>
        <p className="text-slate-600">
          Case {selectedRequest!.request_number} • {selectedRequest!.department}
        </p>
      </div>

      {/* Main Rating Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Lawyer Interaction Summary */}
        <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Lawyer Avatar */}
            {selectedRequest!.lawyer.avatar_url ? (
              <Image
                src={selectedRequest!.lawyer.avatar_url}
                alt={selectedRequest!.lawyer.full_name}
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white shadow-md flex-shrink-0">
                {selectedRequest!.lawyer.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}

            {/* Lawyer Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {selectedRequest!.lawyer.full_name}
              </h3>
              <p className="text-primary font-semibold mb-3">
                {selectedRequest!.lawyer.specialization || selectedRequest!.department}
              </p>

              {/* Interaction Indicators */}
              {interaction && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {interaction.messagesCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-amber-200">
                      <MessageCircle className="w-4 h-4" />
                      {interaction.messagesCount} exchanged
                    </span>
                  )}
                  {interaction.clarificationsCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200">
                      <FileQuestion className="w-4 h-4" />
                      {interaction.clarificationsCount} resolved
                    </span>
                  )}
                  {interaction.opinionSubmitted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-200">
                      <Scale className="w-4 h-4" />
                      Opinion delivered
                    </span>
                  )}
                </div>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                <Shield className="w-4 h-4" />
                Verified Interaction • Case-linked
              </span>
            </div>
          </div>
        </div>

        {/* Rating Form */}
        <div className="p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Overall Rating */}
          <div className="text-center">
            <h4 className="text-xl font-bold text-slate-900 mb-4">
              How was your experience with this lawyer?
            </h4>
            <div className="flex justify-center mb-3">
              {renderStars(overallRating, setOverallRating, 'large')}
            </div>
            {overallRating > 0 && (
              <p className="text-sm text-slate-600 font-medium">{overallRating} out of 5 stars</p>
            )}
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block font-semibold text-slate-900 mb-2">
              Share your experience <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={500}
              rows={6}
              placeholder="What went well? What could be improved?"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500">
                Avoid sharing sensitive personal or case details.
              </span>
              <span className="text-xs text-slate-500">{feedback.length}/500</span>
            </div>
          </div>

          {/* Public Review Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Your review will appear on the lawyer's public profile.</strong> Sensitive
              information should not be included.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setSelectedRequest(null)}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmitRating}
              disabled={isSubmitting || overallRating === 0}
              className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
