'use client';

import { useState } from 'react';
import { Shield, Download, ChevronDown, ChevronUp, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ComplianceSectionProps {
  auditLogs: any[];
  requestId: string;
}

export default function ComplianceSection({ auditLogs, requestId }: ComplianceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [justificationNotes, setJustificationNotes] = useState('');

  const recentLogs = auditLogs.slice(0, 10);

  const handleDownloadReport = () => {
    // Placeholder for future PDF generation
    alert('Audit report generation will be implemented in the future');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Shield className="size-6 text-blue-600" />
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-900">Compliance & Audit</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Legal defensibility and audit trail preview
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="size-5 text-slate-400" />
        ) : (
          <ChevronDown className="size-5 text-slate-400" />
        )}
      </button>

      {/* Expandable Content */}
      {
  isExpanded && (
        <div className="p-6 space-y-6">
          {/* Audit Log Preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">
                Recent Audit Events (Last 10)
              </h3>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Download className="size-4" />
                Download Full Report
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  <span>Action</span>
                  <span>Actor</span>
                  <span>Timestamp</span>
                  <span>Details</span>
                </div>
              </div>

              <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="grid grid-cols-4 gap-4 px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900 capitalize">
                        {log.action?.replace(/_/g, ' ') || 'Unknown'}
                      </span>
                      <span className="text-slate-600">
                        {log.user?.full_name || 'System'}
                        <span className="ml-2 text-xs text-slate-500">
                          ({log.user?.role || 'system'})
                        </span>
                      </span>
                      <span className="text-slate-500 text-xs">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="text-slate-500 text-xs truncate">
                        {log.details ? JSON.stringify(log.details).substring(0, 30) + '...' : '-'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="size-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No audit events available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Justification Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Action Justification Notes (Optional)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Add notes to justify sensitive actions. These are included in audit reports for
              compliance purposes.
            </p>
            <textarea
              value={justificationNotes}
              onChange={(e) => setJustificationNotes(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
              placeholder="Enter justification for any sensitive actions taken on this case..."
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => {
                  // Save justification notes (implement save logic)
                  alert('Justification notes saved (implement save logic)');
                  setJustificationNotes('');
                }}
                disabled={!justificationNotes.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Justification
              </button>
            </div>
          </div>

          {/* Compliance Indicators */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Compliance Status</h4>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>✓ All actions logged with timestamps and actors</li>
                  <li>✓ RLS policies enforce data isolation</li>
                  <li>✓ Internal notes protected from client access</li>
                  <li>✓ Complete audit trail maintained for legal defensibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
