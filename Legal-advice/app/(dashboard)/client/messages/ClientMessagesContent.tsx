'use client';
import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react';
import { MessageSquare, Loader } from 'lucide-react';
import { getRequestsWithMessages } from '@/app/actions/messages';
import { createClient } from '@/lib/supabase/client';
import MessageThread from '@/components/shared/MessageThread';

interface Request {
  id: string;
  request_number: string;
  title: string;
  status: string;
  created_at: string;
  client: { id: string; full_name: string; avatar_url?: string };
  lawyer: { id: string; full_name: string; avatar_url?: string };
  unreadCount: number;
}

export default function ClientMessagesContent() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { data: session } = useSession();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Get current user
      const user = session?.user;
      if (user) {
        setCurrentUserId(user.id!);
      }

      // Load requests with messages
      const result = await getRequestsWithMessages();
      if (result.success && result.data) {
        // Cast and normalize the data
        const normalizedData = result.data.map((req: any) => ({
          ...req,
          client: Array.isArray(req.client) ? req.client[0] : req.client,
          lawyer: Array.isArray(req.lawyer) ? req.lawyer[0] : req.lawyer,
        }));
        setRequests(normalizedData);
        // Auto-select first request if available
        if (normalizedData.length > 0 && !selectedRequest) {
          setSelectedRequest(normalizedData[0]);
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
        <p className="text-gray-600 max-w-md">
          You don't have any requests with assigned lawyers yet. Messages will appear here once you
          create a request and assign a lawyer.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
      {/* Request List */}
      <div className="lg:w-1/3 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-bold text-lg text-gray-900">Your Conversations</h2>
          <p className="text-sm text-gray-600">{requests.length} request(s) with messages</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {requests.map((request) => (
            <button
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedRequest?.id === request.id ? 'bg-blue-50 border-l-4 border-l-[#003366]' : ''
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Lawyer Avatar */}
                {
                  request.lawyer.avatar_url ? (
                    <img
                      src={request.lawyer.avatar_url}
                      alt={request.lawyer.full_name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {request.lawyer.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                  )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {request.lawyer.full_name}
                    </h4>
                    {request.unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {request.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate mb-1">{request.title}</p>
                  <p className="text-xs text-gray-500">{request.request_number}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="lg:w-2/3 flex-1">
        {selectedRequest && selectedRequest.lawyer && currentUserId ? (
          <MessageThread
            requestId={selectedRequest.id}
            requestNumber={selectedRequest.request_number}
            recipientId={selectedRequest.lawyer.id}
            recipientName={selectedRequest.lawyer.full_name}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 h-full flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
