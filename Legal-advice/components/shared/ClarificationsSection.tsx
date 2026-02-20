'use client';

import { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Clock, X, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  requestClarification,
  respondToClarification,
  markClarificationResolved,
} from '@/app/actions/requests';
import { useRouter } from 'next/navigation';
import type { Clarification } from '@/lib/types';

const PREDEFINED_TAGS = [
  'urgent',
  'contract',
  'timeline',
  'financial',
  'documentation',
  'technical',
  'legal-basis',
  'procedural',
];
const CATEGORIES = ['factual', 'legal', 'documentation', 'procedural', 'other'] as const;

export default function ClarificationsSection({
  requestId,
  clarifications,
  userRole,
}: {
  requestId: string;
  clarifications: Clarification[];
  userRole: 'lawyer' | 'client';
}) {
  const router = useRouter();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('factual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRequestClarification = async () => {
    if (!newSubject.trim() || !newMessage.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestClarification(requestId, newSubject, newMessage, newPriority);
      if (result && result.success) {
        toast.success('Clarification requested');
        setNewSubject('');
        setNewMessage('');
        setNewPriority('medium');
        setShowRequestForm(false);
        router.refresh();
      } else {
        toast.error(result?.error || 'Failed to request clarification');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondToClarification = async (clarificationId: string) => {
    if (!responseText.trim()) {
      toast.error('Response is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await respondToClarification(clarificationId, responseText);
      if (result && result.success) {
        toast.success('Response submitted');
        setResponseText('');
        setRespondingTo(null);
        router.refresh();
      } else {
        toast.error(result?.error || 'Failed to respond');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async (clarificationId: string) => {
    setIsSubmitting(true);
    try {
      const result = await markClarificationResolved(clarificationId);
      if (result && result.success) {
        toast.success('Clarification marked as resolved');
        router.refresh();
      } else {
        toast.error(result?.error || 'Failed to mark as resolved');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline skeleton when clarifications are not yet available
  if (typeof clarifications === 'undefined') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Clarifications</h2>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border bg-amber-50 border-amber-200">
              <div className="space-y-2">
                <div className="bg-slate-200 h-4 w-48 rounded animate-pulse" />
                <div className="bg-slate-200 h-4 w-full rounded animate-pulse" />
                <div className="bg-slate-200 h-3 w-40 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Clarifications</h2>
        {userRole === 'lawyer' && !showRequestForm && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <MessageSquare className="size-4" />
            Request Clarification
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Request Clarification Form (Lawyer only) */}
        {
  userRole === 'lawyer' && showRequestForm && (
          <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="size-5 text-blue-600" />
              New Clarification Request
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tags (select relevant)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all flex items-center gap-1 ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-white text-slate-600 border border-slate-300 hover:border-primary'
                      }`}
                    >
                      <Tag className="size-3" />
                      {tag}
                      {
  selectedTags.includes(tag) && <X className="size-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Subject <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Brief subject line"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe what information you need from the client"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-white"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRequestClarification}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="size-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  onClick={() => setShowRequestForm(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clarifications List */}
        {
  clarifications && clarifications.length > 0 ? (
          <div className="space-y-4">
            {clarifications.map((clar) => (
              <div
                key={clar.id}
                className={`p-4 rounded-lg border ${
                  clar.is_resolved
                    ? 'bg-green-50 border-green-200'
                    : clar.response
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-amber-50 border-amber-200'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="size-4 text-slate-600" />
                      <h3 className="font-semibold text-slate-900">{clar.subject}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          clar.is_resolved
                            ? 'bg-green-100 text-green-700'
                            : clar.response
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {clar.is_resolved ? 'Resolved' : clar.response ? 'Responded' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{clar.message}</p>
                    <p className="text-xs text-slate-500">
                      Asked {formatDistanceToNow(new Date(clar.created_at), { addSuffix: true })} by{' '}
                      {
  clar.requester?.full_name || 'Lawyer'}
                    </p>
                  </div>
                </div>

                {/* Client Response */}
                {
  clar.response && (
                  <div className="mt-3 pl-6 border-l-2 border-slate-300">
                    <p className="text-sm font-medium text-slate-900 mb-1">Client Response:</p>
                    <p className="text-sm text-slate-700 mb-2">{clar.response}</p>
                    <p className="text-xs text-slate-500">
                      Responded{' '}
                      {
  clar.responded_at
                        ? formatDistanceToNow(new Date(clar.responded_at), {
                            addSuffix: true,
                          })
                        : 'recently'}
                    </p>
                  </div>
                )}

                {/* Response Form (Client only, for unresolved + no response yet) */}
                {
  userRole === 'client' && !clar.response && !clar.is_resolved && (
                  <div className="mt-3">
                    {respondingTo === clar.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Provide your response..."
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                          disabled={isSubmitting}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespondToClarification(clar.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                          >
                            <Send className="size-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit Response'}
                          </button>
                          <button
                            onClick={() => {
                              setRespondingTo(null);
                              setResponseText('');
                            }}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(clar.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                      >
                        <Send className="size-4" />
                        Respond
                      </button>
                    )}
                  </div>
                )}

                {/* Mark Resolved (Lawyer only, when responded + not resolved) */}
                {
  userRole === 'lawyer' && clar.response && !clar.is_resolved && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleMarkResolved(clar.id)}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 className="size-4" />
                      {isSubmitting ? 'Resolving...' : 'Mark as Resolved'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              {userRole === 'lawyer'
                ? 'No clarifications requested yet'
                : 'No clarifications from your lawyer'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
