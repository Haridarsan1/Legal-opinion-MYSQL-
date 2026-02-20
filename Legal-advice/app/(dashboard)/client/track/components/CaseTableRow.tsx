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

export default function CaseTableRow({ request }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { lifecycleState, sla, progress, nextStep } = request;
  const isPublic = request.visibility === 'public';
  const statusConfig = STATUS_CONFIG[lifecycleState] || STATUS_CONFIG.submitted;

  return (
    <>
      <tr
        className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Expand Toggle */}
        <td className="px-4 py-3 w-10">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </td>

        {/* Case ID & Title */}
        <td className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isPublic
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                >
                  {isPublic ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                  {isPublic ? 'Public' : 'Private'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{request.request_number || request.id.slice(0, 8)}
                </span>
              </div>
              <Link
                href={`/client/track/${request.id}`}
                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                onClick={(e) => e.stopPropagation()}
              >
                {request.title}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
        </td>

        {/* Progress */}
        <td className="px-4 py-3">
          <div className="min-w-[120px]">
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
            <p className="text-[10px] text-slate-400 mt-1">
              Step {progress.currentStep} of {progress.totalSteps}
            </p>
          </div>
        </td>

        {/* SLA Status */}
        <td className="px-4 py-3">
          {sla && sla.status !== 'none' ? (
            <div
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${sla.color} ${sla.bgColor} border ${sla.borderColor}`}
            >
              {sla.status === 'overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
              {sla.status === 'at-risk' && <Clock className="w-3.5 h-3.5" />}
              {sla.text}
            </div>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </td>

        {/* Next Step */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${nextStep.type === 'client'
                  ? 'bg-amber-100 text-amber-600'
                  : nextStep.type === 'lawyer'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-500'
                }`}
            >
              {nextStep.type === 'client' ? (
                <AlertCircle className="w-4 h-4" />
              ) : nextStep.type === 'lawyer' ? (
                <Clock className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{nextStep.title}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{nextStep.type}</p>
            </div>
          </div>
        </td>

        {/* Assigned Lawyer */}
        <td className="px-4 py-3">
          {request.lawyer ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-white shadow-sm">
                {request.lawyer.full_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {request.lawyer.full_name}
                </p>
              </div>
            </div>
          ) : isPublic ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">Open</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Pending</span>
          )}
        </td>
      </tr>

      {/* Expanded Row */}
      {isExpanded && (
        <tr>
          <td colSpan={7} className="p-0">
            <ExpandedRowDetails request={request} />
          </td>
        </tr>
      )}
    </>
  );
}
