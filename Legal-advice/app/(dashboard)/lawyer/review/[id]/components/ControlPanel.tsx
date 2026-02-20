'use client';

import {
  MessageSquare,
  Pause,
  Play,
  AlertTriangle,
  StickyNote,
  CheckCircle,
  XCircle,
  Clock,
  FileWarning,
} from 'lucide-react';
import { EnhancedLegalRequest, DocumentWithReview, InternalNote } from '@/lib/types';
import { getCaseHealthDisplay, calculateSLAHealth } from '@/lib/lawyer-utils';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ControlPanelProps {
  caseData: EnhancedLegalRequest;
  documents: DocumentWithReview[];
  clarifications: any[];
  internalNotes: InternalNote[];
  onPauseSLA: (reason: string) => Promise<void>;
  onResumeSLA: () => Promise<void>;
  onEscalate: (note: string) => Promise<void>;
  onCreateNote: (text: string, type: string) => Promise<void>;
  onRefresh: () => void;
}

export default function ControlPanel({
  caseData,
  documents,
  clarifications,
  internalNotes,
  onPauseSLA,
  onResumeSLA,
  onEscalate,
  onCreateNote,
  onRefresh,
}: ControlPanelProps) {
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [escalateNote, setEscalateNote] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<'general' | 'risk' | 'research' | 'strategy'>(
    'general'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate case health factors
  const totalDocs = documents.length;
  const reviewedDocs = documents.filter((d) => d.review_status === 'reviewed').length;
  const unresolvedClarifications = clarifications.filter((c) => !c.is_resolved).length;
  const hasRiskFlags = (caseData.risk_flags?.length || 0) > 0;

  const slaHealth = caseData.sla_deadline
    ? calculateSLAHealth(caseData.sla_deadline, caseData.submitted_at)
    : null;

  // Determine overall case health
  const healthFactors = [
    {
      label: 'Documents Reviewed',
      status: totalDocs > 0 && reviewedDocs === totalDocs ? 'good' : 'warning',
      value: `${reviewedDocs}/${totalDocs}`,
    },
    {
      label: 'Clarifications',
      status: unresolvedClarifications === 0 ? 'good' : 'warning',
      value:
        unresolvedClarifications === 0 ? 'All resolved' : `${unresolvedClarifications} pending`,
    },
    {
      label: 'SLA Status',
      status: slaHealth
        ? slaHealth.status === 'healthy'
          ? 'good'
          : slaHealth.status === 'warning'
            ? 'warning'
            : 'critical'
        : 'unknown',
      value: slaHealth ? `${Math.round(slaHealth.percentRemaining)}% remaining` : 'No deadline',
    },
    {
      label: 'Risk Flags',
      status: hasRiskFlags ? 'warning' : 'good',
      value: hasRiskFlags ? `${caseData.risk_flags?.length} active` : 'None',
    },
  ];

  const caseHealth = getCaseHealthDisplay(caseData.case_health || 'healthy');

  const handlePauseSLA = async () => {
    if (!pauseReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onPauseSLA(pauseReason);
      setShowPauseModal(false);
      setPauseReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeSLA = async () => {
    setIsSubmitting(true);
    try {
      await onResumeSLA();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateNote.trim()) return;
    setIsSubmitting(true);
    try {
      await onEscalate(escalateNote);
      setShowEscalateModal(false);
      setEscalateNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteText.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateNote(newNoteText, newNoteType);
      setShowNoteModal(false);
      setNewNoteText('');
      setNewNoteType('general');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Case Health Indicator */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-4">Case Health</h3>

        <div
          className={`mb-4 p-4 rounded-lg ${caseHealth.bgColor} border-2 ${
            caseHealth.color === 'green'
              ? 'border-green-500'
              : caseHealth.color === 'amber'
                ? 'border-amber-500'
                : 'border-red-500'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {caseHealth.color === 'green' ? (
              <CheckCircle className="size-6 text-green-600" />
            ) : (
              <AlertTriangle className="size-6 text-amber-600" />
            )}
            <span className={`text-lg font-bold ${caseHealth.textColor}`}>{caseHealth.label}</span>
          </div>
        </div>

        <div className="space-y-3">
          {healthFactors.map((factor, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{factor.label}</span>
              <div className="flex items-center gap-2">
                {factor.status === 'good' ? (
                  <CheckCircle className="size-4 text-green-500" />
                ) : factor.status === 'warning' ? (
                  <AlertTriangle className="size-4 text-amber-500" />
                ) : factor.status === 'critical' ? (
                  <XCircle className="size-4 text-red-500" />
                ) : (
                  <Clock className="size-4 text-slate-400" />
                )}
                <span className="font-medium text-slate-900">{factor.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>

        <div className="space-y-2">
          <button
            onClick={() => setShowNoteModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium"
          >
            <StickyNote className="size-5" />
            Add Internal Note
          </button>

          {!caseData.sla_paused ? (
            <button
              onClick={() => setShowPauseModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors font-medium"
            >
              <Pause className="size-5" />
              Pause SLA
            </button>
          ) : (
            <button
              onClick={handleResumeSLA}
              disabled={isSubmitting}
              className="w-full flex items-center gap-3 px-4 py-3 text-left bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              <Play className="size-5" />
              Resume SLA
            </button>
          )}

          <button
            onClick={() => setShowEscalateModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors font-medium"
          >
            <AlertTriangle className="size-5" />
            Escalate to Firm
          </button>
        </div>
      </div>

      {/* Internal Notes Feed */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Internal Notes</h3>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
              Never visible to client
            </span>
          </div>
        </div>

        <div className="p-6">
          {internalNotes.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {internalNotes.map((note) => (
                <div key={note.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        note.note_type === 'risk'
                          ? 'bg-red-100 text-red-700'
                          : note.note_type === 'research'
                            ? 'bg-blue-100 text-blue-700'
                            : note.note_type === 'strategy'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {note.note_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{note.note_text}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{note.creator?.full_name || 'You'}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(note.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileWarning className="size-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No internal notes yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPauseModal && (
        <Modal
          title="Pause SLA"
          onClose={() => setShowPauseModal(false)}
          onSubmit={handlePauseSLA}
          submitLabel="Pause SLA"
          isSubmitting={isSubmitting}
        >
          <textarea
            value={pauseReason}
            onChange={(e) => setPauseReason(e.target.value)}
            placeholder="Enter reason for pausing SLA..."
            className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
            required
          />
        </Modal>
      )}

      {showEscalateModal && (
        <Modal
          title="Escalate to Firm Admin"
          onClose={() => setShowEscalateModal(false)}
          onSubmit={handleEscalate}
          submitLabel="Escalate"
          isSubmitting={isSubmitting}
        >
          <textarea
            value={escalateNote}
            onChange={(e) => setEscalateNote(e.target.value)}
            placeholder="Describe why you're escalating this case..."
            className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
            required
          />
        </Modal>
      )}

      {showNoteModal && (
        <Modal
          title="Add Internal Note"
          onClose={() => setShowNoteModal(false)}
          onSubmit={handleCreateNote}
          submitLabel="Add Note"
          isSubmitting={isSubmitting}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Note Type</label>
              <select
                value={newNoteType}
                onChange={(e) =>
                  setNewNoteType(e.target.value as 'general' | 'risk' | 'research' | 'strategy')
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="risk">Risk</option>
                <option value="research">Research</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Note Text</label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Enter your note..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Simple Modal Component
function Modal({
  title,
  children,
  onClose,
  onSubmit,
  submitLabel,
  isSubmitting,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            ×
          </button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
