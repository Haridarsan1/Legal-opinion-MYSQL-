'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
  Globe,
  ArrowRight,
  MessageCircle,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { STATUS_CONFIG } from '../utils/trackUtils';
import { LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';

interface Props {
  request: LifecycleSummary;
}

export default function CaseCard({ request }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use pre-calculated aggregated data
  const { lifecycleState, sla, progress, nextStep } = request;
  const isPublic = request.visibility === 'public';

  // Resolve status config using lifecycle state, fallback to 'submitted'
  const statusConfig = STATUS_CONFIG[lifecycleState] || STATUS_CONFIG.submitted;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header Section */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {/* Visibility Badge */}
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isPublic
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
              >
                {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isPublic ? 'Public' : 'Private'}
              </span>

              {/* ID Badge */}
              <span className="text-xs font-mono text-slate-400">
                #{request.request_number || request.id.slice(0, 8)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 truncate mb-1 text-wrap">
              {request.title}
            </h3>

            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </span>
              {request.department?.name && (
                <>
                  <span>•</span>
                  <span>{request.department.name}</span>
                </>
              )}
            </div>
          </div>

          {/* SLA & Status Pill */}
          <div className="flex flex-col items-end gap-2">
            {sla && sla.status !== 'none' && (
              <div
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-semibold ${sla.color} ${sla.bgColor} border ${sla.borderColor}`}
              >
                {sla.status === 'overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
                {sla.status === 'at-risk' && <Clock className="w-3.5 h-3.5" />}
                {sla.text}
              </div>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Lifecycle Progress */}
      <div className="px-5 py-4 bg-slate-50/50">
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Progress: {progress.label}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Step {progress.currentStep} of {progress.totalSteps}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden w-full mb-3">
          <div
            className="absolute h-full bg-slate-900 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress.progress}%` }}
          />
        </div>

        {/* Stage Labels */}
        <div className="flex justify-between text-[10px] font-medium text-slate-400">
          <span>{progress.steps[0].label}</span>
          <span className="text-slate-900 font-bold">{progress.label}</span>
          <span>{progress.steps[progress.steps.length - 1].label}</span>
        </div>
      </div>

      {/* Next Action & Lawyer Info */}
      <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Next Action Info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${nextStep.type === 'client'
                ? 'bg-amber-100 text-amber-600'
                : nextStep.type === 'lawyer'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
          >
            {nextStep.type === 'client' ? (
              <AlertCircle className="w-5 h-5" />
            ) : nextStep.type === 'lawyer' ? (
              <Clock className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Next Step</p>
            <p className="text-sm font-bold text-slate-800">{nextStep.title}</p>
          </div>
        </div>

        {/* Right: Assigned Lawyer (If Private/Assigned) */}
        {request.lawyer ? (
          <div className="flex items-center gap-3 pl-4 sm:border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Lawyer</p>
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">
                {request.lawyer.full_name}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-white shadow-sm">
              {request.lawyer.full_name.charAt(0)}
            </div>
          </div>
        ) : (
          isPublic && (
            <div className="flex items-center gap-2 pl-4 sm:border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs text-slate-500">Marketplace</p>
                <p className="text-sm font-semibold text-emerald-600">Open for Claims</p>
              </div>
              <Globe className="w-8 h-8 text-emerald-200" />
            </div>
          )
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <div className="flex gap-2">
          {/* Dynamic Primary Action */}
          {nextStep.actionLabel && nextStep.actionUrl ? (
            <Link
              href={`/client/track/${request.id}${nextStep.actionUrl}`}
              className="btn-primary-sm bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm"
            >
              {nextStep.actionLabel}
            </Link>
          ) : (
            <Link
              href={`/client/track/${request.id}`}
              className="btn-secondary-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm transition-all"
            >
              View Case <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-5 py-4 border-t border-slate-200 bg-white">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Latest Activity
          </h4>
          {/* Placeholder for activity - to be enhanced with real activity feed */}
          <div className="text-sm text-slate-600 flex items-start gap-3">
            <Activity className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p>
                Status updated to{' '}
                <span className="font-medium text-slate-900">{statusConfig.label}</span>
              </p>
              <span className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(request.updated_at))} ago
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
