'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  Download,
  MessageCircle,
  Star,
  AlertCircle,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';

interface Props {
  request: any;
  onRequestClarification: () => void;
  onAcceptOpinion: () => void;
  onRateOpinion: () => void;
  isAccepted: boolean;
  hasRating: boolean;
}

export default function ActionGuidanceSidebar({
  request,
  onRequestClarification,
  onAcceptOpinion,
  onRateOpinion,
  isAccepted,
  hasRating,
}: Props) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine primary action
  const getPrimaryAction = () => {
    if (!isAccepted) {
      return {
        label: 'Accept Opinion',
        onClick: onAcceptOpinion,
        icon: CheckCircle,
        color: 'bg-green-600 hover:bg-green-700 text-white',
        description: 'Formally accept this legal opinion',
      };
    }
    if (!hasRating) {
      return {
        label: 'Rate Lawyer',
        onClick: onRateOpinion,
        icon: Star,
        color: 'bg-amber-600 hover:bg-amber-700 text-white',
        description: 'Share your experience',
      };
    }
    return null;
  };

  const primaryAction = getPrimaryAction();
  const hasPendingClarifications = request.clarifications?.some((c: any) => !c.is_resolved);

  return (
    <div className={`space-y-6 ${isSticky ? 'lg:sticky lg:top-24' : ''}`}>
      {/* Next Steps Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-slate-900">Next Steps</h3>
        </div>

        <div className="space-y-3">
          {/* Primary Action */}
          {primaryAction && (
            <div>
              <button
                onClick={primaryAction.onClick}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors shadow-sm ${primaryAction.color}`}
              >
                <primaryAction.icon className="w-5 h-5" />
                {primaryAction.label}
              </button>
              <p className="text-xs text-slate-600 mt-2 text-center">{primaryAction.description}</p>
            </div>
          )}

          {/* Clarification Alert */}
          {hasPendingClarifications && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-amber-900">Pending Clarifications</p>
              </div>
              <p className="text-xs text-amber-700 mb-3">
                You have unresolved clarification requests from your lawyer.
              </p>
              <button
                onClick={onRequestClarification}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                View Clarifications
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            <span>Print Opinion</span>
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onRequestClarification}
            className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            <span>Request Clarification</span>
            <MessageCircle className="w-4 h-4" />
          </button>
          {!hasRating && isAccepted && (
            <button
              onClick={onRateOpinion}
              className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
            >
              <span>Rate Service</span>
              <Star className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lawyer Contact Card */}
      {request.lawyer && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Contact Lawyer</h3>
          <div className="space-y-3">
            {request.lawyer.phone && (
              <a
                href={`tel:${request.lawyer.phone}`}
                className="flex items-center gap-3 text-sm text-slate-700 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <span>{request.lawyer.phone}</span>
              </a>
            )}
            {request.lawyer.email && (
              <a
                href={`mailto:${request.lawyer.email}`}
                className="flex items-center gap-3 text-sm text-slate-700 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <span className="truncate">{request.lawyer.email}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Status Info Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-900 mb-4">Case Status</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Opinion Status</span>
            <span
              className={`px-2 py-1 rounded-lg font-semibold ${
                isAccepted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isAccepted ? 'Accepted' : 'Pending Review'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Rating</span>
            <span
              className={`px-2 py-1 rounded-lg font-semibold ${
                hasRating ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {hasRating ? 'Submitted' : 'Not yet'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Documents</span>
            <span className="font-semibold text-slate-900">{request.documents?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
