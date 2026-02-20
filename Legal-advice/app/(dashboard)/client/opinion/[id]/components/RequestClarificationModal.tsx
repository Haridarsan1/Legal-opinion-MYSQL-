'use client';

import { useState } from 'react';
import { X, Send, Paperclip, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  requestId: string;
  onClose: () => void;
  currentUserId: string;
}

export default function RequestClarificationModal({ requestId, onClose, currentUserId }: Props) {
  const supabase = createClient();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please provide both a subject and message');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Insert clarification
      const { error: insertError } = await supabase.from('clarifications').insert({
        request_id: requestId,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        is_resolved: false,
        created_by_role: 'client',
      });

      if (insertError) throw insertError;

      // Create audit log
      await supabase.from('audit_logs').insert({
        user_id: currentUserId,
        action: 'clarification_requested',
        entity_type: 'legal_request',
        entity_id: requestId,
        details: {
          subject,
          priority,
        },
      });

      onClose();
    } catch (err) {
      console.error('Error requesting clarification:', err);
      setError('Failed to submit clarification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = message.length;
  const maxCharacters = 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Request Clarification</h2>
              <p className="text-sm text-slate-600">Ask your lawyer for additional information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your clarification request"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
            <p className="text-xs text-slate-500 mt-1">{subject.length}/100 characters</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Describe what clarification you need from your lawyer. Be as specific as possible."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              maxLength={maxCharacters}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500">
                {characterCount}/{maxCharacters} characters
              </p>
              {characterCount > maxCharacters * 0.9 && (
                <p className="text-xs text-amber-600">Approaching character limit</p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'high', 'urgent'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-red-600 text-white'
                        : p === 'high'
                          ? 'bg-orange-600 text-white'
                          : 'bg-blue-600 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Your lawyer will be notified immediately. They typically
              respond within 24-48 hours depending on the priority level.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!subject.trim() || !message.trim() || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
