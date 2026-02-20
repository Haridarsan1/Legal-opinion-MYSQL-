'use client';

import { useState } from 'react';
import {
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  Eye,
  Download,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

interface Props {
  opinion: any;
  onSelect: (opinion: any) => void;
}

export default function OpinionCard({ opinion, onSelect }: Props) {
  const [showActions, setShowActions] = useState(false);

  // Get status badge
  const getStatusBadge = () => {
    if (
      ['completed', 'case_closed', 'no_further_queries_confirmed'].includes(opinion.status) ||
      opinion.rating
    ) {
      return {
        label: 'Completed',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
      };
    }

    if (opinion.status === 'opinion_ready') {
      return {
        label: 'Pending Review',
        color: 'bg-amber-100 text-amber-700',
        icon: Clock,
      };
    }

    return {
      label: 'Submitted',
      color: 'bg-blue-100 text-blue-700',
      icon: FileText,
    };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  // Check SLA compliance (mock logic)
  const slaStatus = {
    onTime: true,
    label: 'On Time',
  };

  // Get rating
  const rating = opinion.rating?.[0]?.overall_rating || null;
  const clarificationCount = opinion.clarifications?.filter((c: any) => !c.is_resolved).length || 0;

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
      {/* Case & Client */}
      <div className="col-span-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/case/${opinion.id}`}
              className="font-semibold text-slate-900 hover:text-blue-600 line-clamp-1 mb-0.5"
            >
              {opinion.request_number || `#${opinion.id.substring(0, 8)}`}
            </Link>
            <p className="text-sm text-slate-600 line-clamp-1">
              {opinion.client?.[0]?.full_name || opinion.client?.full_name || 'Client'}
            </p>
            {opinion.department?.[0]?.name && (
              <p className="text-xs text-slate-500 mt-0.5">{opinion.department[0].name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="col-span-2 flex items-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusBadge.label}
        </span>
      </div>

      {/* SLA / Rating */}
      <div className="col-span-2 flex items-center">
        {rating ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {slaStatus.onTime ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                slaStatus.onTime ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {slaStatus.label}
            </span>
          </div>
        )}
        {
  clarificationCount > 0 && (
          <div className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
            {clarificationCount} clarif.
          </div>
        )}
      </div>

      {/* Submitted */}
      <div className="col-span-2 flex items-center">
        <div>
          <p className="text-sm font-medium text-slate-900 ">
            {opinion.opinion_submitted_at
              ? format(new Date(opinion.opinion_submitted_at), 'MMM dd, yyyy')
              : 'N/A'}
          </p>
          <p className="text-xs text-slate-500">
            {opinion.opinion_submitted_at
              ? formatDistanceToNow(new Date(opinion.opinion_submitted_at), { addSuffix: true })
              : ''}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-2 relative">
        <button
          onClick={() => onSelect(opinion)}
          className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Preview
        </button>

        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-slate-600" />
        </button>

        {/* Actions Menu */}
        {
  showActions && (
          <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
            <Link
              href={`/case/${opinion.id}?tab=opinion`}
              className="w-full block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => setShowActions(false)}
            >
              <Eye className="w-4 h-4" />
              View Opinion
            </Link>
            <button
              onClick={() => setShowActions(false)}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            {rating && (
              <button
                onClick={() => setShowActions(false)}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                View Feedback
              </button>
            )}
            <Link
              href={`/case/${opinion.id}`}
              className="w-full block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => setShowActions(false)}
            >
              <ExternalLink className="w-4 h-4" />
              Open Case
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
