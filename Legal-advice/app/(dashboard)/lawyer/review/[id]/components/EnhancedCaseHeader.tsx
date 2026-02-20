'use client';

import { Clock, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { calculateSLAHealth, formatSLACountdown, getCaseHealthDisplay } from '@/lib/lawyer-utils';
import { EnhancedLegalRequest, SLAHealth } from '@/lib/types';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface EnhancedCaseHeaderProps {
  caseData: EnhancedLegalRequest;
}

export default function EnhancedCaseHeader({ caseData }: EnhancedCaseHeaderProps) {
  const [slaHealth, setSlaHealth] = useState<SLAHealth | null>(null);

  // Update SLA countdown every minute
  useEffect(() => {
    if (!caseData.sla_deadline || !caseData.submitted_at) {
      setSlaHealth(null);
      return;
    }

    const updateSLA = () => {
      const health = calculateSLAHealth(caseData.sla_deadline!, caseData.submitted_at);
      setSlaHealth(health);
    };

    updateSLA(); // Initial calculation
    const interval = setInterval(updateSLA, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [caseData.sla_deadline, caseData.submitted_at]);

  const caseHealth = getCaseHealthDisplay(caseData.case_health || 'healthy');

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Link href="/lawyer/assigned" className="hover:text-primary transition-colors">
          Assigned Cases
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">
          {caseData.request_number || `#${caseData.id?.substring(0, 8)}`}
        </span>
      </div>

      {/* Main Header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Case Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                {caseData.request_number || `Request #${caseData.id?.substring(0, 8)}`}
              </h1>
              <StatusBadge status={caseData.status} />
              {caseData.priority === 'urgent' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  <span className="size-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  URGENT
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 mb-4">
              {caseData.title || caseData.description?.substring(0, 100)}
            </p>

            {/* Case Ownership Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {caseData.assigned_by_profile && (
                <div className="flex items-start gap-2">
                  <User className="size-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Assigned By</p>
                    <p className="font-medium text-slate-900">
                      {caseData.assigned_by_profile.full_name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {caseData.assigned_by_profile.role}
                    </p>
                  </div>
                </div>
              )}

              {
  caseData.escalation_owner_profile && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Escalation Owner</p>
                    <p className="font-medium text-slate-900">
                      {caseData.escalation_owner_profile.full_name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {caseData.escalation_owner_profile.role}
                    </p>
                  </div>
                </div>
              )}

              {/* Case Health */}
              <div className="flex items-start gap-2">
                {caseHealth.color === 'green' ? (
                  <CheckCircle className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-amber-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-xs text-slate-500">Case Health</p>
                  <p
                    className={`font-bold text-sm ${caseHealth.textColor} ${caseHealth.bgColor} px-2 py-0.5 rounded inline-block`}
                  >
                    {caseHealth.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: SLA Countdown */}
          {
  slaHealth && (
            <div
              className={`
                                flex-shrink-0 lg:min-w-[280px]
                                border-2 rounded-xl p-4
                                ${
                                  slaHealth.color === 'green'
                                    ? 'border-green-500 bg-green-50'
                                    : slaHealth.color === 'amber'
                                      ? 'border-amber-500 bg-amber-50'
                                      : 'border-red-500 bg-red-50'
                                }
                            `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock
                  className={`size-5 ${
                    slaHealth.color === 'green'
                      ? 'text-green-600'
                      : slaHealth.color === 'amber'
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                />
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  {slaHealth.isOverdue ? 'SLA OVERDUE' : 'SLA Countdown'}
                  {
  caseData.sla_paused && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                      PAUSED
                    </span>
                  )}
                </p>
              </div>

              {!caseData.sla_paused ? (
                <>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className={`text-3xl font-bold ${
                        slaHealth.color === 'green'
                          ? 'text-green-700'
                          : slaHealth.color === 'amber'
                            ? 'text-amber-700'
                            : 'text-red-700'
                      }`}
                    >
                      {slaHealth.hoursRemaining}
                      <span className="text-lg">h</span>
                    </span>
                    <span
                      className={`text-2xl font-bold ${
                        slaHealth.color === 'green'
                          ? 'text-green-700'
                          : slaHealth.color === 'amber'
                            ? 'text-amber-700'
                            : 'text-red-700'
                      }`}
                    >
                      {slaHealth.minutesRemaining}
                      <span className="text-sm">m</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {slaHealth.isOverdue ? 'Overdue' : 'Remaining'}
                    {' • '}
                    {Math.round(slaHealth.percentRemaining)}% of SLA
                  </p>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        slaHealth.color === 'green'
                          ? 'bg-green-500'
                          : slaHealth.color === 'amber'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, slaHealth.percentRemaining)}%`,
                      }}
                    ></div>
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <p className="text-sm font-medium text-blue-700 mb-1">SLA Paused</p>
                  {caseData.sla_pause_reason && (
                    <p className="text-xs text-slate-600">Reason: {caseData.sla_pause_reason}</p>
                  )}
                </div>
              )}

              {
  caseData.sla_tier && (
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
                  {caseData.sla_tier} SLA Tier
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
