'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  submitPostOpinionQuery,
  resolvePostOpinionQuery,
} from '@/app/actions/post_opinion_workflow';
import { MessageSquare, Send, CheckCircle, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PostOpinionQueriesProps {
  requestId: string;
  userRole: 'client' | 'lawyer';
  isCaseClosed: boolean;
  isClientConfirmed?: boolean;
}

interface Query {
  id: string;
  query_text: string;
  raised_by: string;
  created_at: string;
  response_text?: string;
  responded_by?: string;
  responded_at?: string;
  status: 'open' | 'resolved';
  raiser?: { full_name: string; avatar_url?: string };
  responder?: { full_name: string; avatar_url?: string };
}

export default function PostOpinionQueries({
  requestId,
  userRole,
  isCaseClosed,
  isClientConfirmed,
}: PostOpinionQueriesProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newQuery, setNewQuery] = useState('');
  const [responseMap, setResponseMap] = useState<Record<string, string>>({}); // queryId -> responseText
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQueries();
    // Real-time subscription removed (Supabase to MySQL migration)
  }, [requestId]);

  const fetchQueries = async () => {
    try {
      const { data, error } = await (await __getSupabaseClient()).from('post_opinion_queries')
        .select(
          `
                    *,
                    raiser:raised_by(full_name, avatar_url),
                    responder:responded_by(full_name, avatar_url)
                `
        )
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuery = async () => {
    if (!newQuery.trim()) return;
    setIsSubmitting(true);

    const result = await submitPostOpinionQuery(requestId, newQuery);

    if (result.success) {
      setNewQuery('');
      toast.success('Query submitted successfully');
      fetchQueries();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleResolveQuery = async (queryId: string) => {
    const responseText = responseMap[queryId];
    if (!responseText?.trim()) return;

    setIsSubmitting(true);
    const result = await resolvePostOpinionQuery(queryId, responseText);

    if (result.success) {
      setResponseMap((prev) => {
        const next = { ...prev };
        delete next[queryId];
        return next;
      });
      toast.success('Response sent');
      fetchQueries();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="text-center py-4 text-slate-500">Loading queries...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Post-Opinion Queries
      </h3>

      {queries.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-slate-500">No queries raised yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => (
            <div
              key={query.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
            >
              {/* Question */}
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">
                      {query.raiser?.full_name || 'Client'}
                    </span>
                    <span className="text-xs text-slate-500" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm">
                    {query.query_text}
                  </p>
                </div>
              </div>

              {/* Response */}
              {
                query.status === 'resolved' ? (
                  <div className="flex gap-3 pl-8 relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 -z-10" />
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">
                          {query.responder?.full_name || 'Lawyer'}
                        </span>
                        <span className="text-xs text-slate-500" suppressHydrationWarning>
                          {query.responded_at &&
                            formatDistanceToNow(new Date(query.responded_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-slate-700 bg-blue-50/50 p-3 rounded-lg text-sm border border-blue-100">
                        {query.response_text}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Lawyer Response Input */
                  userRole === 'lawyer' &&
                  !isCaseClosed && (
                    <div className="pl-11 mt-3">
                      <div className="flex gap-2">
                        <textarea
                          value={responseMap[query.id] || ''}
                          onChange={(e) =>
                            setResponseMap((prev) => ({ ...prev, [query.id]: e.target.value }))
                          }
                          placeholder="Write your response..."
                          className="flex-1 p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                        <button
                          onClick={() => handleResolveQuery(query.id)}
                          disabled={isSubmitting || !responseMap[query.id]?.trim()}
                          className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                )}
            </div>
          ))}
        </div>
      )}

      {/* Client New Query Input */}
      {
        userRole === 'client' && !isCaseClosed && !isClientConfirmed && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
            <h4 className="font-semibold text-slate-900 mb-2">Ask a follow-up question</h4>
            <p className="text-xs text-slate-500 mb-3">
              You can ask questions related to the delivered opinion.
            </p>
            <div className="flex gap-2">
              <textarea
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmitQuery}
                disabled={isSubmitting || !newQuery.trim()}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Sending...' : 'Send Query'}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      {
        isCaseClosed && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 text-slate-500 rounded-lg text-sm justify-center">
            <AlertCircle className="w-4 h-4" />
            Case is closed. No further queries allowed.
          </div>
        )}
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
