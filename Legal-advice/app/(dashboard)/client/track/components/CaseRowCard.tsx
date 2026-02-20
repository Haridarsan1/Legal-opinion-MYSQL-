'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';
import { STATUS_CONFIG } from '../utils/trackUtils';
import ExpandedRowDetails from './ExpandedRowDetails';

interface Props {
  request: LifecycleSummary;
}

export default function CaseRowCard({ request }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { lifecycleState, sla, progress, nextStep } = request;
  const isPublic = request.visibility === 'public';
  const statusConfig = STATUS_CONFIG[lifecycleState] || STATUS_CONFIG.submitted;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Header: Status and Expand */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
          <button className="text-slate-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Title and ID */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isPublic
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
            >
              {isPublic ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
              {
  isPublic ? 'Public' : 'Private'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              #{request.request_number || request.id.slice(0, 8)}
            </span>
          </div>
          <Link
            href={`/client/track/${request.id}`}
            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
            onClick={(e) => e.stopPropagation()}
          >
            {request.title}
          </Link>
          <p className="text-xs text-slate-500 mt-1">
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-700">{progress.label}</span>
            <span className="text-xs text-slate-500">{progress.progress}%</span>
          </div>
          <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-slate-900 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {/* Footer Info Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          {/* SLA */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
              SLA Status
            </span>
            {sla && sla.status !== 'none' ? (
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${sla.text === 'Overdue' ? 'text-red-600' : 'text-slate-700'}`}
              >
                {sla.status === 'overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
                {
  sla.status === 'at-risk' && <Clock className="w-3.5 h-3.5" />}
                {
  sla.text}
              </div>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
          </div>

          {/* Assigned Lawyer */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
              Lawyer
            </span>
            {request.lawyer ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                  {request.lawyer.full_name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-900 truncate">
                  {request.lawyer.full_name}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {
  isExpanded && (
        <div className="border-t border-slate-200">
          <ExpandedRowDetails request={request} />
        </div>
      )}
    </div>
  );
}
