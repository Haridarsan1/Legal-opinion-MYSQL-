'use client';

import { X, Star, FileText, Calendar, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect } from 'react';

interface Props {
  opinion: any;
  onClose: () => void;
}

export default function OpinionPreview({ opinion, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    globalThis.document.addEventListener('keydown', handleEscape);
    return () => globalThis.document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const rating = opinion.rating?.[0];
  const clarificationCount = opinion.clarifications?.filter((c: any) => !c.is_resolved).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  {opinion.request_number || `Request #${opinion.id.substring(0, 8)}`}
                </h2>
              </div>
              <Link
                href={`/case/${opinion.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Open full case
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Opinion Text */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Legal Opinion</h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {opinion.opinion_text || 'No opinion text available'}
              </p>
            </div>
          </div>

          {/* Submission Details */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Submission Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Submitted:</span>
                <span className="font-medium text-slate-900">
                  {opinion.opinion_submitted_at
                    ? format(new Date(opinion.opinion_submitted_at), 'MMM dd, yyyy · h:mm a')
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Client:</span>
                <span className="font-medium text-slate-900">
                  {opinion.client?.[0]?.full_name || opinion.client?.full_name || 'N/A'}
                </span>
              </div>
              {clarificationCount > 0 && (
                <div className="px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700">
                    <span className="font-semibold">{clarificationCount}</span> clarification
                    {clarificationCount > 1 ? 's' : ''} requested
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Client Feedback */}
          {
  rating && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Client Feedback</h3>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= rating.overall_rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-slate-900">
                    {rating.overall_rating.toFixed(1)}
                  </span>
                </div>

                {/* Feedback Text */}
                {
  rating.feedback && (
                  <p className="text-sm text-slate-700 italic">"{rating.feedback}"</p>
                )}

                {/* Feedback Date */}
                <p className="text-xs text-slate-500 mt-2">
                  Reviewed {format(new Date(rating.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
          <Link
            href={`/case/${opinion.id}?tab=opinion`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            View Full Case
          </Link>
        </div>
      </div>
    </div>
  );
}
