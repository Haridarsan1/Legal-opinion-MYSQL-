'use client';

import { Clock, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { computeCaseHealth, getSLAStatus, formatTimeRemaining } from '../utils/caseHealth';
import { getNextAction, type UserRole } from '../utils/nextAction';

interface CaseHeaderProps {
  caseId: string;
  caseNumber: string;
  title: string;
  status: string;
  lawyerAcceptanceStatus?: 'pending' | 'accepted' | 'rejected';
  lawyerName?: string;
  priority: string;
  createdAt: string;
  slaDeadline?: string;
  userRole: UserRole;
  backHref: string;
  // Health factors
  pendingClarifications: number;
  unreviewedDocuments: number;
  lastActivityAt?: string;
  hasAssignedLawyer: boolean;
  opinionSubmitted: boolean;
  rated: boolean;
  // Terminal state flags
  isTerminal?: boolean;
  completedAt?: string | null;
}

export default function CaseHeader({
  caseId,
  caseNumber,
  title,
  status,
  lawyerAcceptanceStatus,
  lawyerName,
  priority,
  createdAt,
  slaDeadline,
  userRole,
  backHref,
  pendingClarifications,
  unreviewedDocuments,
  lastActivityAt,
  hasAssignedLawyer,
  opinionSubmitted,
  rated,
  isTerminal = false,
  completedAt = null,
  // Overrides from Lifecycle Engine
  nextActionOverride,
  slaStatus,
}: CaseHeaderProps & {
  nextActionOverride?: import('../utils/nextAction').NextAction | null;
  slaStatus?: { status: string; label: string; color: string; hoursRemaining: number };
}) {
  // Compute case health
  const daysSinceLastActivity = lastActivityAt
    ? Math.floor(
        (new Date().getTime() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  const computedSla = getSLAStatus(slaDeadline);
  const sla = slaStatus || computedSla;

  const health = computeCaseHealth({
    slaStatus: sla.status as any,
    pendingClarifications,
    unreviewedDocuments,
    daysSinceLastActivity,
    hasAssignedLawyer,
  });

  // Get next action (use override or compute)
  const nextAction =
    nextActionOverride !== undefined
      ? nextActionOverride
      : getNextAction(userRole, {
          status,
          hasPendingClarifications: pendingClarifications > 0,
          hasUnreviewedDocuments: unreviewedDocuments > 0,
          opinionSubmitted,
          rated,
          hasAssignedLawyer,
        });

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        {/* Back Link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Cases
        </Link>

        {/* Main Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Case Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 truncate">{title}</h1>

              {/* Case Health Badge */}
              {isTerminal ||
              [
                'case_closed',
                'completed',
                'no_further_queries_confirmed',
                'opinion_ready',
                'client_acknowledged',
              ].includes(status) ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-700">
                  <TrendingUp className="w-4 h-4" />
                  Completed
                </div>
              ) : (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${health.bgColor} ${health.color}`}
                >
                  {health.status === 'healthy' && <TrendingUp className="w-4 h-4" />}
                  {health.status === 'at_risk' && <AlertCircle className="w-4 h-4" />}
                  {health.status === 'blocked' && <AlertCircle className="w-4 h-4" />}
                  {health.label}
                </div>
              )}

              {/* Priority Badge */}
              {priority === 'urgent' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  URGENT
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="font-semibold">#{caseNumber}</span>
              </span>
              <span>•</span>
              <span>Created {format(new Date(createdAt), 'MMM d, yyyy')}</span>
              {!isTerminal && sla && (
                <>
                  <span>•</span>
                  <span className={sla.color}>{sla.label}</span>
                </>
              )}
              {/* Acceptance state */}
              {(status === 'submitted' || status === 'assigned') && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-amber-700">
                    {lawyerAcceptanceStatus === 'accepted'
                      ? `Accepted by ${lawyerName || 'assigned lawyer'}`
                      : lawyerAcceptanceStatus === 'rejected'
                        ? 'Rejected by lawyer'
                        : 'Waiting for lawyer to accept the request'}
                  </span>
                </>
              )}

              {/* SLA Countdown */}
              {!isTerminal &&
                slaDeadline &&
                ![
                  'case_closed',
                  'completed',
                  'no_further_queries_confirmed',
                  'opinion_ready',
                  'client_acknowledged',
                ].includes(status) && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${sla.color}`} />
                      <span className={`font-semibold ${sla.color}`}>
                        {formatTimeRemaining(sla.hoursRemaining)}
                      </span>
                    </div>
                  </>
                )}
            </div>
          </div>

          {/* Right: Next Action Card */}
          {nextAction && (
            <div className="lg:w-80 flex-shrink-0">
              <div
                className={`p-4 rounded-xl border-2 ${
                  nextAction.priority === 'high'
                    ? 'border-blue-300 bg-blue-50'
                    : nextAction.priority === 'medium'
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-600 mb-1">
                      {nextAction.priority === 'high' ? '🔴 ACTION REQUIRED' : 'NEXT STEP'}
                    </p>
                    <p className="font-bold text-slate-900 text-sm mb-1">{nextAction.title}</p>
                    <p className="text-xs text-slate-600 mb-3">{nextAction.description}</p>
                    <Link
                      href={nextAction.actionHref}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        nextAction.priority === 'high'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {nextAction.actionLabel}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Case Health Details - Only show for active cases */}
        {!isTerminal && health.reasons.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold">Case Health:</span>
              {health.reasons.map((reason, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  {idx > 0 && <span>•</span>}
                  <span>{reason}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
