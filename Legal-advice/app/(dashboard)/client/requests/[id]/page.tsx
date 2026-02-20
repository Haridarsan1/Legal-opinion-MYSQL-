import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import CaseWorkspace from '@/app/(dashboard)/case/[id]/CaseWorkspace';

export const metadata: Metadata = {
  title: 'Request Details - Legal Opinion Portal',
  description: 'View legal request details',
};

export default async function ClientRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // CLIENT PERMISSION CHECK
  // Ensure the user is actually the client for this request (or admin, but let's stick to client route logic)
  // Fetch request with all related data
  const { data: request, error: requestError } = await supabase
    .from('legal_requests')
    .select(
      `
            *,
            lawyer:assigned_lawyer_id(id, full_name, email, avatar_url, specialization),
            firm:assigned_firm_id(full_name, organization),
            department_info:departments(name, description),
            documents(*)
        `
    )
    .eq('id', id)
    .single();

  if (requestError || !request) {
    notFound();
  }

  // Strict Client Check
  if (request.client_id !== user.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">You do not have permission to view this request.</p>
          <Link
            href="/client/requests"
            className="inline-block px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Fetch clarifications
  const { data: clarifications } = await supabase
    .from('clarifications')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  // Fetch messages
  const { data: messages } = await supabase
    .from('case_messages')
    .select(
      `
            *,
            sender:sender_id(full_name, avatar_url)
        `
    )
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  // Fetch review if exists
  const { data: review } = await supabase
    .from('lawyer_reviews')
    .select('rating, review_text, created_at')
    .eq('request_id', id)
    .maybeSingle();

  // Fetch document requests
  const { data: documentRequests } = await supabase
    .from('document_requests')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: false });

  // Check for draft opinion (minimal check for prop satisfaction, though client doesn't see drafts)
  const { data: legalOpinion } = await supabase
    .from('legal_opinions')
    .select('id, versions:opinion_versions(id)')
    .eq('request_id', id)
    .maybeSingle();

  const hasSavedDraft =
    !!legalOpinion && Array.isArray(legalOpinion.versions) && legalOpinion.versions.length > 0;

  // ✅ WORKFLOW AGGREGATOR: Resolve complete workflow state
  const { resolveCaseWorkflow } = await import('@/app/(dashboard)/case/utils/workflowAggregator');

  const workflowSummary = await resolveCaseWorkflow(id, 'client', {
    includeMetrics: true,
  });

  return (
    <CaseWorkspace
      request={request}
      clarifications={clarifications || []}
      messages={messages || []}
      documentRequests={documentRequests || []}
      review={review || undefined}
      userId={user.id}
      userRole="client"
      userProfile={{
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      }}
      hasDraftOpinion={hasSavedDraft}
      secondOpinionRequests={[]} // Clients don't see internal reviews
      workflowSummary={workflowSummary}
    />
  );
}
