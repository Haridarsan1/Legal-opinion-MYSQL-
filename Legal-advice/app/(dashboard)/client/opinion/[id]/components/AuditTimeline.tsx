'use client';

import {
  Clock,
  User,
  FileText,
  MessageCircle,
  CheckCircle,
  Upload,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import Image from 'next/image';

interface AuditLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  };
}

interface Props {
  auditLogs: AuditLog[];
  requestId: string;
}

export default function AuditTimeline({ auditLogs, requestId }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('upload') || actionLower.includes('document')) return Upload;
    if (actionLower.includes('message') || actionLower.includes('clarification'))
      return MessageCircle;
    if (actionLower.includes('accept') || actionLower.includes('complete')) return CheckCircle;
    if (actionLower.includes('view') || actionLower.includes('review')) return Eye;
    return FileText;
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('upload')) return 'bg-blue-100 text-blue-600';
    if (actionLower.includes('message') || actionLower.includes('clarification'))
      return 'bg-purple-100 text-purple-600';
    if (actionLower.includes('accept') || actionLower.includes('complete'))
      return 'bg-green-100 text-green-600';
    if (actionLower.includes('opinion')) return 'bg-amber-100 text-amber-600';
    return 'bg-slate-100 text-slate-600';
  };

  const formatActionText = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const displayLogs = isCollapsed ? auditLogs.slice(0, 5) : auditLogs;

  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayLogs.map((log, index) => {
        const Icon = getActionIcon(log.action);
        const colorClass = getActionColor(log.action);
        const isLast = index === displayLogs.length - 1 && !isCollapsed;
        const isExpanded = expandedLogs.has(log.id);
        const hasDetails = log.details && Object.keys(log.details).length > 0;

        return (
          <div key={log.id} className="flex gap-3 relative">
            {/* Timeline line */}
            {!isLast && <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-slate-200" />}

            {/* Icon */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass} transition-all z-10`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {/* Actor Avatar */}
                    {
  log.user &&
                      (log.user.avatar_url ? (
                        <Image
                          src={log.user.avatar_url}
                          alt={log.user.full_name}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                      ))}

                    {/* Actor & Action */}
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{log.user?.full_name || 'System'}</span>{' '}
                        <span className="text-slate-600">{formatActionText(log.action)}</span>
                      </p>
                      {log.user && (
                        <span
                          className={`inline-block text-xs font-medium px-2 py-0.5 rounded mt-1 ${
                            log.user.role === 'client'
                              ? 'bg-blue-50 text-blue-700'
                              : log.user.role === 'lawyer'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          {log.user.role.charAt(0).toUpperCase() + log.user.role.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>

                {/* Expandable Details */}
                {
  hasDetails && (
                  <>
                    <button
                      onClick={() => toggleExpanded(log.id)}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 mt-2"
                    >
                      {isExpanded ? (
                        <>
                          Hide details
                          <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          View details
                          <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Collapse/Expand Button */}
      {
  auditLogs.length > 5 && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <>
              <span>
                Show {auditLogs.length - 5} more {auditLogs.length - 5 === 1 ? 'event' : 'events'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
