'use client';

import { CheckCircle, Clock, FileText, User, AlertTriangle, Pause, Play, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  request_id: string;
  action: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    full_name: string;
    role: string;
  };
}

interface AuditTimelineProps {
  auditLogs: AuditLog[];
}

const ACTION_DISPLAY: Record<
  string,
  { label: string; icon: any; color: string; slaImpact?: string }
> = {
  request_submitted: {
    label: 'Request Submitted',
    icon: FileText,
    color: 'blue',
    slaImpact: 'Started',
  },
  case_assigned: { label: 'Case Assigned', icon: User, color: 'green' },
  status_changed: { label: 'Status Changed', icon: AlertTriangle, color: 'amber' },
  document_uploaded: { label: 'Document Uploaded', icon: FileText, color: 'blue' },
  document_reviewed: { label: 'Document Reviewed', icon: CheckCircle, color: 'green' },
  clarification_requested: {
    label: 'Clarification Requested',
    icon: AlertTriangle,
    color: 'amber',
    slaImpact: 'Paused',
  },
  clarification_responded: {
    label: 'Clarification Responded',
    icon: CheckCircle,
    color: 'green',
    slaImpact: 'Resumed',
  },
  risk_flag_added: { label: 'Risk Flag Added', icon: Flag, color: 'red' },
  risk_flag_removed: { label: 'Risk Flag Removed', icon: Flag, color: 'gray' },
  sla_paused: { label: 'SLA Paused', icon: Pause, color: 'amber', slaImpact: 'Paused' },
  sla_resumed: { label: 'SLA Resumed', icon: Play, color: 'green', slaImpact: 'Resumed' },
  internal_note_created: { label: 'Internal Note Added', icon: FileText, color: 'purple' },
  opinion_submitted: { label: 'Opinion Submitted', icon: FileText, color: 'green' },
  escalated_to_firm: { label: 'Escalated to Firm', icon: AlertTriangle, color: 'red' },
};

export default function AuditTimeline({ auditLogs }: AuditTimelineProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client':
        return 'bg-blue-100 text-blue-700';
      case 'lawyer':
        return 'bg-green-100 text-green-700';
      case 'firm':
        return 'bg-purple-100 text-purple-700';
      case 'bank':
        return 'bg-orange-100 text-orange-700';
      case 'admin':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getActionDisplay = (action: string) => {
    return (
      ACTION_DISPLAY[action] || {
        label: action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        icon: FileText,
        color: 'slate',
      }
    );
  };

  // Group logs by date
  const groupedLogs = auditLogs.reduce(
    (acc, log) => {
      const date = new Date(log.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    },
    {} as Record<string, AuditLog[]>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900">Complete Audit Trail</h2>
        <p className="text-xs text-slate-500 mt-1">
          All case activities with actor tracking and SLA impact
        </p>
      </div>

      <div className="p-6">
        {Object.keys(groupedLogs).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, logs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {date}
                  </span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

                  <div className="space-y-4">
                    {logs.map((log, idx) => {
                      const actionDisplay = getActionDisplay(log.action);
                      const Icon = actionDisplay.icon;

                      return (
                        <div key={log.id} className="relative flex gap-4">
                          {/* Timeline dot */}
                          <div
                            className={`relative z-10 flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                              actionDisplay.color === 'blue'
                                ? 'bg-blue-500 text-white'
                                : actionDisplay.color === 'green'
                                  ? 'bg-green-500 text-white'
                                  : actionDisplay.color === 'amber'
                                    ? 'bg-amber-500 text-white'
                                    : actionDisplay.color === 'red'
                                      ? 'bg-red-500 text-white'
                                      : actionDisplay.color === 'purple'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-slate-400 text-white'
                            }`}
                          >
                            <Icon className="size-4" />
                          </div>

                          {/* Event content */}
                          <div className="flex-1 pb-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                                    {actionDisplay.label}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {log.user && (
                                      <>
                                        <span className="text-xs text-slate-600">
                                          {log.user.full_name}
                                        </span>
                                        <span
                                          className={`text-xs font-medium px-2 py-0.5 rounded ${getRoleBadgeColor(
                                            log.user.role
                                          )}`}
                                        >
                                          {log.user.role}
                                        </span>
                                      </>
                                    )}
                                    <span className="text-xs text-slate-400">•</span>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <Clock className="size-3" />
                                      {formatDistanceToNow(new Date(log.created_at), {
                                        addSuffix: true,
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* SLA Impact Badge */}
                                {
  actionDisplay.slaImpact && (
                                  <span
                                    className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${
                                      actionDisplay.slaImpact === 'Paused'
                                        ? 'bg-amber-100 text-amber-700'
                                        : actionDisplay.slaImpact === 'Resumed'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    SLA: {actionDisplay.slaImpact}
                                  </span>
                                )}
                              </div>

                              {/* Additional details */}
                              {
  log.details && Object.keys(log.details).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <pre className="text-xs text-slate-600 font-mono">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No audit events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
