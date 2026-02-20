'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import {
  createClarificationRequest,
  markClarificationResolved,
} from '@/app/actions/phase2_workflows';
import { toast } from 'sonner';

interface Document {
  id: string;
  file_name: string;
  file_path?: string;
  uploader_id: string;
}

interface Clarification {
  id: string;
  message: string;
  created_at: string;
  response?: string;
  responded_at?: string;
  is_resolved: boolean;
  priority?: string;
  parent_id?: string;
  created_by_role?: string;
  resolved_by?: string;
  resolved_at?: string;
  related_document_id?: string;
  due_date?: string;
  resolution_status?: 'open' | 'responded' | 'resolved';
}

interface Props {
  requestId: string;
  clarifications: Clarification[];
  userRole: 'client' | 'lawyer';
  userId: string;
  clientId: string;
  documents?: { id: string; file_name: string; uploader_id?: string }[];
}

export default function CaseClarifications({
  requestId,
  clarifications: initialClarifications,
  userRole,
  userId,
  clientId,
  documents = [],
}: Props) {    const [clarifications, setClarifications] = useState<Clarification[]>(initialClarifications);
  const [newClarification, setNewClarification] = useState('');
  const [clarificationPriority, setClarificationPriority] = useState<
    'low' | 'medium' | 'high' | 'urgent'
  >('medium');
  const [relatedDocumentId, setRelatedDocumentId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [clarificationResponse, setClarificationResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out child clarifications (responses)
  const parentClarifications = clarifications.filter((c) => !c.parent_id);

  // Filter documents to show only those uploaded by the client
  const clientDocuments = documents.filter((doc) => doc.uploader_id === clientId);

  const handleCreateClarification = async () => {    if (!newClarification.trim() || userRole !== 'lawyer') return;

    setIsSubmitting(true);

    try {      // Updated to use Server Action
      const result = await createClarificationRequest(
        requestId,
        newClarification,
        newClarification,
        clarificationPriority
      );

      if (!result.success) throw new Error(result.error);

      // Optimistic update or refresh?
      // The server action revalidates the path, so a router.refresh() might be redundant but safe

      // We can also fetch the new clarification to update local state immediately if needed,
      // but the realtime subscription should handle it.
      // For now, let's clear inputs.

      setNewClarification('');
      setClarificationPriority('medium');
      setRelatedDocumentId('');
      setDueDate('');
      toast.success('Clarification requested');
    } catch (error: any) {
      console.error('Error creating clarification:', error);
      toast.error(error.message || 'Failed to create clarification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondClarification = async (clarificationId: string) => {
    if (!clarificationResponse.trim() || userRole !== 'client') return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('clarifications')
        .update({          response: clarificationResponse,
          responded_at: new Date().toISOString(),
          resolution_status: 'responded',
        })
        .eq('id', clarificationId);

      if (error) throw error;

      setClarifications((prev) =>
        prev.map((c) =>
          c.id === clarificationId
            ? {
                ...c,
                response: clarificationResponse,
                responded_at: new Date().toISOString(),
                resolution_status: 'responded',
              }
            : c
        )
      );

      // Check if all clarifications are now resolved
      const allResolved = clarifications.every((c) => c.id === clarificationId || c.is_resolved);

      // If all clarifications resolved, update request status back to in_review
      if (allResolved) {
        await supabase.from('legal_requests').update({ status: 'in_review' }).eq('id', requestId);

        // Create audit log
        await supabase.from('audit_logs').insert({
          user_id: userId,
          action: 'clarifications_resolved',
          entity_type: 'legal_request',
          entity_id: requestId,
          details: { message: 'All clarifications resolved, case back to review' },
        });
      }

      setClarificationResponse('');
      setRespondingTo(null);
      toast.success('Response sent');
    } catch (error) {
      console.error('Error responding to clarification:', error);
      alert('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async (clarificationId: string) => {
    if (userRole !== 'lawyer') return;

    try {
      // Updated to use Server Action
      const result = await markClarificationResolved(clarificationId);

      if (!result.success) throw new Error(result.error);

      setClarifications((prev) =>
        prev.map((c) =>
          c.id === clarificationId
            ? {
                ...c,
                is_resolved: true,
                resolution_status: 'resolved',
                resolved_by: userId,
                resolved_at: new Date().toISOString(),
              }
            : c
        )
      );
      toast.success('Marked as resolved');
    } catch (error: any) {
      console.error('Error marking as resolved:', error);
      toast.error(error.message || 'Failed to mark as resolved');
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-blue-600 bg-blue-100'; // Changed from normal
      case 'low':
        return 'text-slate-600 bg-slate-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Request Clarification (Lawyer Only) */}
      {
  userRole === 'lawyer' && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-slate-900 mb-3">Request Clarification</h3>
          <textarea
            value={newClarification}
            onChange={(e) => setNewClarification(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
            placeholder="What clarification do you need from the client?"
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Related Document (Optional)
              </label>
              <select
                value={relatedDocumentId}
                onChange={(e) => setRelatedDocumentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">None</option>
                {clientDocuments.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.file_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <select
              value={clarificationPriority}
              onChange={(e) =>
                setClarificationPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')
              }
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              onClick={handleCreateClarification}
              disabled={!newClarification.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Clarification'}
            </button>
          </div>
        </div>
      )}

      {/* Clarifications List */}
      <div className="space-y-4">
        {parentClarifications.length > 0 ? (
          <>
            {parentClarifications.map((clarification) => (
              <div
                key={clarification.id}
                className={`p-4 rounded-xl border-2 ${
                  clarification.is_resolved
                    ? 'border-green-200 bg-green-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {clarification.is_resolved ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Resolution Status Badge */}
                      {
  clarification.resolution_status === 'resolved' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          ✓ Resolved
                        </span>
                      )}
                      {
  clarification.resolution_status === 'responded' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          → Responded
                        </span>
                      )}
                      {
  clarification.resolution_status === 'open' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          ○ Open
                        </span>
                      )}
                      {
  clarification.priority && clarification.priority !== 'normal' && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(clarification.priority)}`}
                        >
                          {clarification.priority.toUpperCase()}
                        </span>
                      )}
                      {
  clarification.due_date && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          Due: {new Date(clarification.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 text-sm mb-2">{clarification.message}</p>

                    {clarification.response && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Client Response:
                        </p>
                        <p className="text-slate-700 text-sm">{clarification.response}</p>
                        {clarification.responded_at && (
                          <p className="text-xs text-slate-500 mt-2">
                            {formatDistanceToNow(new Date(clarification.responded_at), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {!clarification.is_resolved && userRole === 'client' && (
                      <>
                        {respondingTo === clarification.id ? (
                          <div className="mt-4 space-y-3">
                            <textarea
                              value={clarificationResponse}
                              onChange={(e) => setClarificationResponse(e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              placeholder="Type your response..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespondClarification(clarification.id)}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                {isSubmitting ? 'Submitting...' : 'Submit Response'}
                              </button>
                              <button
                                onClick={() => {
                                  setRespondingTo(null);
                                  setClarificationResponse('');
                                }}
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRespondingTo(clarification.id)}
                            className="mt-3 px-4 py-2 bg-white border border-amber-300 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-colors text-sm"
                          >
                            Respond Now
                          </button>
                        )}
                      </>
                    )}

                    {!clarification.is_resolved &&
                      userRole === 'lawyer' &&
                      clarification.response && (
                        <button
                          onClick={() => handleMarkResolved(clarification.id)}
                          className="mt-3 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Mark as Resolved
                        </button>
                      )}

                    <p className="text-xs text-slate-500 mt-2">
                      Requested{' '}
                      {
  formatDistanceToNow(new Date(clarification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No clarifications requested yet</p>
            {userRole === 'client' && (
              <p className="text-xs text-slate-400 mt-1">
                You'll be notified when the lawyer requests clarification
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
