'use client';

import { useState } from 'react';
import { X, MessageCircle, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();

interface Lawyer {
  id: string;
  full_name: string;
  specialization?: string | string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lawyer: Lawyer;
  clientId: string;
}

const QUICK_PROMPTS = [
  "I'd like to understand your availability",
  'Do you handle this type of case?',
  'What documents are usually required?',
];

export default function SendMessageModal({ isOpen, onClose, lawyer, clientId }: Props) {const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
    if (!isOpen) return null;

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const handleSubmit = async () => {
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Step 1: Get or create conversation using the helper function
      const { data: conversationData, error: convError } = await (await __getSupabaseClient()).rpc(
        'get_or_create_conversation',
        {
          p_user1_id: clientId,
          p_user2_id: lawyer.id,
          p_request_id: null,
        }
      );

      if (convError) throw convError;

      const conversationId = conversationData;

      // Step 2: Send the message
      const { error: messageError } = await (await __getSupabaseClient()).from('messages').insert({
        conversation_id: conversationId,
        sender_id: clientId,
        content: message.trim(),
        read: false,
      });

      if (messageError) throw messageError;

      // Step 3: Create notification for lawyer
      await (await __getSupabaseClient()).from('notifications').insert({
        user_id: lawyer.id,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message from a client`,
        read: false,
      });

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push(`/client/messages`);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const getSpecialization = () => {
    if (!lawyer.specialization) return 'Legal Expert';
    return Array.isArray(lawyer.specialization) ? lawyer.specialization[0] : lawyer.specialization;
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
          <p className="text-slate-600 mb-4">Redirecting to Messages...</p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Formal legal work requires a consultation request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900">Message Lawyer</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You are messaging <strong>{lawyer.full_name}</strong> ({getSpecialization()})
            </p>
            <p className="text-xs text-blue-700 mt-1">This does not create a legal request.</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Quick Prompts */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Quick Messages
            </label>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm text-slate-700"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              maxLength={500}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={message.length < 10 ? 'text-amber-600' : 'text-green-600'}>
                {message.length < 10 ? `${10 - message.length} characters needed` : 'Minimum met ✓'}
              </span>
              <span className="text-slate-500">{message.length}/500</span>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-700">
              <strong>Note:</strong> Messages are for preliminary questions only. For formal legal
              work, please submit a consultation request.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || message.trim().length < 10}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
