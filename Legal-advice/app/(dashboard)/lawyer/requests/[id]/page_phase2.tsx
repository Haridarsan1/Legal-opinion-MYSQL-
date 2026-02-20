'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, MessageSquare, File, BookOpen, Calendar, Loader } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LawyerRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const [activeTab, setActiveTab] = useState<
    'overview' | 'clarifications' | 'documents' | 'opinion' | 'timeline'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [clarifications, setClarifications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [opinion, setOpinion] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [acceptance, setAcceptance] = useState<any>(null);
  const [showAcceptButton, setShowAcceptButton] = useState(false);

  useEffect(() => {
    fetchRequestData();
  }, [requestId]);

  const fetchRequestData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch request details
      const { data: req, error: reqError } = await supabase
        .from('legal_requests')
        .select(
          `
                    *,
                    department:departments(name),
                    client:profiles!legal_requests_client_id_fkey(full_name, email)
                `
        )
        .eq('id', requestId)
        .single();

      if (reqError) throw reqError;
      setRequest(req);
      setShowAcceptButton(!req.accepted_by_lawyer);

      // Fetch acceptance status
      const { data: acc } = await supabase
        .from('request_acceptance')
        .select('*')
        .eq('request_id', requestId)
        .single();

      if (acc) setAcceptance(acc);

      // Fetch clarifications
      const { data: clarifs } = await supabase
        .from('clarifications')
        .select(
          `
                    *,
                    replies:clarification_replies(*)
                `
        )
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (clarifs) setClarifications(clarifs);

      // Fetch documents
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('request_id', requestId)
        .order('uploaded_at', { ascending: false });

      if (docs) setDocuments(docs);

      // Fetch opinion
      const { data: opinions } = await supabase
        .from('opinion_submissions')
        .select(
          `
                    *,
                    signatures:digital_signatures(*)
                `
        )
        .eq('request_id', requestId)
        .eq('is_final', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (opinions) setOpinion(opinions);

      // Fetch timeline
      const { data: statusHistory } = await supabase
        .from('request_status_history')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (statusHistory) setTimeline(statusHistory);
    } catch (err: any) {
      console.error('Error fetching request:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'clarifications', label: 'Clarifications', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: File },
    { id: 'opinion', label: 'Opinion', icon: BookOpen },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 p-8">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center gap-4">
          <Link href="/lawyer/requests" className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="text-red-600">{error || 'Request not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header with Acceptance Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/lawyer/requests" className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{request.title}</h1>
            <p className="text-slate-600 mt-1">{request.request_number}</p>
          </div>
        </div>
        {showAcceptButton && (
          <button
            onClick={() => {
              // Call acceptance action
              setShowAcceptButton(false);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Accept Request
          </button>
        )}
      </div>

      {/* Acceptance Status */}
      {request.accepted_by_lawyer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ You accepted this request on{' '}
            {new Date(request.lawyer_acceptance_date).toLocaleString()}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-t-lg">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg p-8 min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 font-medium">Description</p>
                <p className="text-slate-900 mt-1">{request.description}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Client</p>
                <p className="text-slate-900 mt-1">{request.client?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Department</p>
                <p className="text-slate-900 mt-1">{request.department?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Status</p>
                <p className="text-slate-900 mt-1 capitalize">
                  {request.status.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clarifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Clarifications</h3>
            {clarifications.length === 0 ? (
              <p className="text-slate-600">No clarifications sent yet.</p>
            ) : (
              <div className="space-y-4">
                {clarifications.map((c: any) => (
                  <div key={c.id} className="border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-slate-900">{c.subject}</p>
                    <p className="text-slate-600 text-sm mt-2">{c.message}</p>
                    <p
                      className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                        c.is_resolved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {c.is_resolved ? 'Resolved' : 'Pending'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
            {!request.accepted_by_lawyer ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Documents will be visible once you accept the request
                </p>
              </div>
            ) : documents.length === 0 ? (
              <p className="text-slate-600">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded"
                  >
                    <File className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{doc.file_name}</p>
                      <p className="text-xs text-slate-500">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.document_type}
                      </p>
                    </div>
                    {doc.reviewed_at && <span className="text-xs text-green-600">✓ Reviewed</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'opinion' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Legal Opinion</h3>
            {!opinion ? (
              <div>
                <p className="text-slate-600 mb-4">No final opinion submitted yet.</p>
                <button
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!request.accepted_by_lawyer}
                >
                  {request.accepted_by_lawyer ? 'Submit Opinion' : 'Accept request first'}
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Final opinion submitted</p>
                <p className="text-sm text-slate-900">Version: {opinion.version}</p>
                {opinion.signatures && opinion.signatures.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">✓ Digitally signed</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Request Timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-slate-600">No events yet.</p>
            ) : (
              <div className="space-y-4">
                {timeline.map((event: any, idx: number) => (
                  <div key={event.id || idx} className="flex gap-4">
                    <div className="relative">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                      {idx < timeline.length - 1 && (
                        <div className="absolute left-1.5 top-5 w-0.5 h-12 bg-slate-200"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 capitalize">
                        {event.to_status?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-slate-600">{event.reason}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
