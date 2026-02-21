'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface Message {
  id: string;
  sender_id: string;
  sender_role: 'client' | 'lawyer';
  message: string;
  created_at: string;
  attachments?: any[];
  read_by?: string[];
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Props {
  requestId: string;
  messages: Message[];
  userId: string;
  userRole: 'client' | 'lawyer';
  userProfile: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function CaseMessages({
  requestId,
  messages: initialMessages,
  userId,
  userRole,
  userProfile,
}: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync with parent state for real-time updates
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSendingMessage(true);

    try {
      const { data, error } = await (await __getSupabaseClient()).from('case_messages')
        .insert({
          request_id: requestId,
          sender_id: userId,
          sender_role: userRole,
          message: newMessage,
          attachments: [],
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state with user info
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          sender: userProfile,
        },
      ]);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-50 rounded-xl">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1">Start a conversation about this case</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.sender_id === userId;
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {
  message.sender?.avatar_url ? (
                    <Image
                      src={message.sender.avatar_url}
                      alt={message.sender.full_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isOwn ? 'bg-blue-100' : 'bg-slate-200'
                      }`}
                    >
                      <User className={`w-5 h-5 ${isOwn ? 'text-blue-600' : 'text-slate-500'}`} />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1">{message.sender?.full_name}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className={`text-xs ${isOwn ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isMounted
                          ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
                          : format(new Date(message.created_at), 'MMM d, h:mm a')}
                      </p>
                      {isOwn && message.read_by && message.read_by.length > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-green-600 font-medium">Read</span>
                        </>
                      )}
                      {
  isOwn && (!message.read_by || message.read_by.length === 0) && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">Sent</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="button"
              className="absolute bottom-3 right-3 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Attach file (coming soon)"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSendingMessage}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
          >
            <Send className="w-5 h-5" />
            {isSendingMessage ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
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
