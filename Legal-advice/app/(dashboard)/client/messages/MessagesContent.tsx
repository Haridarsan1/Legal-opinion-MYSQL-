'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Check,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participant_1_id: string;
  participant_2_id: string;
  request_id?: string;
  last_message_at?: string;
  participant_1: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  participant_2: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  legal_request?: {
    id: string;
    request_number: string;
    status: string;
  };
  messages: Message[];
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
}

interface Props {
  userId: string;
}

export default function MessagesContent({ userId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();

    // Set up subscription placeholder (Supabase realtime removed)

    return () => { };
  }, [selectedConversation]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = (await __getSupabaseClient()).from('messages')
        .select(
          `
                    *,
                    sender:sender_id(id, full_name, avatar_url, role)
                `
        )
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      (await __getSupabaseClient()).from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false);

      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const { error } = await (await __getSupabaseClient()).from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: userId,
        content: newMessage.trim(),
        read: false,
      });

      if (error) throw error;

      // Update conversation's last_message_at
      (await __getSupabaseClient()).from('conversations')
        .update({
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', selectedConversation);

      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participant_1_id === userId ? conv.participant_2 : conv.participant_1;
  };

  const getUnreadCount = (conv: Conversation) => {
    return conv.messages?.filter((m: any) => m.sender_id !== userId && !m.read).length || 0;
  };

  const getLastMessage = (conv: Conversation) => {
    const sorted = conv.messages?.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted?.[0];
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = getOtherParticipant(conv);
    return (
      otherParticipant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.legal_request?.request_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const otherParticipant = selectedConv ? getOtherParticipant(selectedConv) : null;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Conversations List */}
      <div
        className={`${isSidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden md:block ${!isSidebarOpen && 'hidden'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-primary/5 to-blue-50">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </h3>
              <p className="text-slate-600 text-sm">
                {searchQuery ? 'Try a different search' : 'Start by contacting a lawyer'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conv) => {
                const participant = getOtherParticipant(conv);
                const lastMsg = getLastMessage(conv);
                const unreadCount = getUnreadCount(conv);

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all mb-2 ${selectedConversation === conv.id
                        ? 'bg-gradient-to-r from-primary/10 to-blue-50 border-l-4 border-primary shadow-sm'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      {
                        participant.avatar_url ? (
                          <Image
                            src={participant.avatar_url}
                            alt={participant.full_name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-white"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white shadow-md">
                            {participant.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 truncate">
                            {participant.full_name}
                          </h4>
                          {lastMsg && (
                            <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                              {formatDistanceToNow(new Date(lastMsg.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                        {conv.legal_request && (
                          <div className="text-xs text-primary font-medium mb-1">
                            {conv.legal_request.request_number}
                          </div>
                        )}
                        {
                          lastMsg && (
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-slate-600 truncate flex-1">
                                {lastMsg.content}
                              </p>
                              {unreadCount > 0 && (
                                <div className="flex items-center justify-center px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full flex-shrink-0">
                                  {unreadCount}
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Workspace */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
        {selectedConversation && otherParticipant ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {otherParticipant.avatar_url ? (
                  <Image
                    src={otherParticipant.avatar_url}
                    alt={otherParticipant.full_name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold ring-2 ring-primary/20">
                    {otherParticipant.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-900">{otherParticipant.full_name}</h3>
                  {selectedConv?.legal_request && (
                    <p className="text-sm text-slate-600">
                      {selectedConv.legal_request.request_number}
                    </p>
                  )}
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-md">
                    <Send className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
                  <p className="text-slate-600">Start the conversation below</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === userId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage
                              ? 'bg-gradient-to-br from-primary to-blue-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-900'
                            }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 mt-1.5 px-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <span
                            className={`text-xs ${isOwnMessage ? 'text-slate-500' : 'text-slate-500'}`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                          {isOwnMessage &&
                            (message.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400" />
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-4 shadow-lg">
              <div className="flex items-end gap-3 max-w-5xl mx-auto">
                <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none max-h-32 transition-all"
                    disabled={isSending}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="p-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 disabled:hover:shadow-none"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Send className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a conversation</h3>
            <p className="text-slate-600">
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        )}
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
