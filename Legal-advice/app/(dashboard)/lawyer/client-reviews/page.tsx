import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Star, MessageCircle } from 'lucide-react';
import { getLawyerRatingSummary, getLawyerReviews } from '@/app/actions/reviews';

export const metadata: Metadata = {
  title: 'Client Reviews - Legal Opinion Portal',
  description: 'Manage and view your client reviews',
};

export default async function ClientReviewsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch rating summary
  const summaryResult = await getLawyerRatingSummary(user.id);
  const summary =
    summaryResult.success && summaryResult.data
      ? summaryResult.data
      : { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

  // Fetch reviews
  const reviewsResult = await getLawyerReviews(user.id);
  const reviews =
    reviewsResult.success && Array.isArray(reviewsResult.data) ? reviewsResult.data : [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Client Reviews</h1>
        <p className="text-slate-500 mt-1">See what your clients are saying about your services.</p>
      </header>

      {/* Default State: No Reviews */}
      {
  reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No reviews yet</h3>
          <p className="text-slate-500 mt-1 max-w-md text-center">
            Once you complete cases, clients will be prompted to leave feedback.
          </p>
        </div>
      )}

      {
  reviews.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit space-y-6">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-slate-900">{summary.average.toFixed(1)}</h2>
              <div className="flex justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(summary.average)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500">Based on {summary.total} reviews</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  summary.distribution[rating as keyof typeof summary.distribution] || 0;
                const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="font-medium text-slate-700">{rating}</span>
                      <Star className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-500 shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.map((review: any) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {review.client?.avatar_url ? (
                      <Image
                        src={review.client.avatar_url}
                        alt={review.client.full_name || 'Client'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {(review.client?.full_name || 'C').charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {review.client?.full_name || 'Anonymous Client'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Case #{review.request?.request_number || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                    <span className="font-bold text-slate-900">{review.rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed mb-4">
                  {review.review_text || (
                    <span className="text-slate-400 italic">
                      No formatted review text provided.
                    </span>
                  )}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                  <span>
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
