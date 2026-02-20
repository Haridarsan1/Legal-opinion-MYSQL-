'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader, CheckCheck, Check } from 'lucide-react';
import { toast } from 'sonner';
import { sendMessage, getRequestMessages, markMessagesAsRead } from '@/app/actions/messages';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  recipient: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface MessageThreadProps {
  requestId: string;
  requestNumber: string;
  recipientId: string;
  recipientName: string;
  currentUserId: string;
}

export default function MessageThread({
  requestId,
  requestNumber,
  recipientId,
  recipientName,
  currentUserId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      const result = await getRequestMessages(requestId);
      if (result.success && result.data) {
        const normalizedMessages = result.data.map((msg: any) => ({
          ...msg,
          sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender,
          recipient: Array.isArray(msg.recipient) ? msg.recipient[0] : msg.recipient,
        }));
        setMessages(normalizedMessages);
        // Mark messages as read
        await markMessagesAsRead(requestId);
      } else {
        toast.error(result.error || 'Failed to load messages');
      }
      setLoading(false);
    };

    loadMessages();
  }, [requestId]);

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`request_messages:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_messages',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          // Fetch the complete message with sender/recipient details
          const fetchNewMessage = async () => {
            const result = await getRequestMessages(requestId);
            if (result.success && result.data) {
              const normalizedMessages = result.data.map((msg: any) => ({
                ...msg,
                sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender,
                recipient: Array.isArray(msg.recipient) ? msg.recipient[0] : msg.recipient,
              }));
              setMessages(normalizedMessages);
              scrollToBottom();
              // Mark as read if it's for current user
              if (payload.new.recipient_id === currentUserId) {
                await markMessagesAsRead(requestId);
              }
            }
          };
          fetchNewMessage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, currentUserId, supabase]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);

    const result = await sendMessage(requestId, recipientId, newMessage.trim());

    if (result.success) {
      setNewMessage('');
      // Message will be added via realtime subscription
    } else {
      toast.error(result.error || 'Failed to send message');
    }

    setSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-bold text-lg text-gray-900">Conversation - Request {requestNumber}</h3>
        <p className="text-sm text-gray-600">with {recipientName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">No messages yet</h4>
            <p className="text-sm text-gray-600">
              Start the conversation by sending a message below
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-2 max-w-[70%] ${
                    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  {message.sender.avatar_url ? (
                    <img
                      src={message.sender.avatar_url}
                      alt={message.sender.full_name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {message.sender.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        isOwnMessage ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message_text}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{formatTime(message.created_at)}</span>
                      {isOwnMessage && (
                        <>
                          {message.is_read ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
