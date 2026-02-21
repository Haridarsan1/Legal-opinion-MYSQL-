import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import CaseWorkspace from './CaseWorkspace';

export const metadata: Metadata = {
  title: 'Case Workspace - Legal Opinion Portal',
  description: 'Collaborative case workspace',
};

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile to determine role
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Fetch request with all related data
  const { data: request, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
    .select(
      `
            *,
            lawyer:assigned_lawyer_id(id, full_name, email, avatar_url, specialization),
            firm:assigned_firm_id(full_name, organization),
            department_info:departments(name, description),
            documents(*),
            audit_events:audit_logs(action, created_at, details)
        `
    )
    .eq('id', id)
    .single();

  if (requestError || !request) {
    notFound();
  }

  // Check permissions
  const isClient = request.client_id === user.id;
  const isLawyer = request.assigned_lawyer_id === user.id;

  if (!isClient && !isLawyer) {
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
          <p className="text-slate-600 mb-6">You don't have permission to view this case.</p>
          <a
            href={profile.role === 'lawyer' ? '/lawyer/requests' : '/client/track'}
            className="inline-block px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const userRole: 'client' | 'lawyer' = isClient ? 'client' : 'lawyer';

  // Fetch clarifications
  const { data: clarifications } = await (await __getSupabaseClient()).from('clarifications')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  // Fetch messages with sender info
  const { data: messages } = await (await __getSupabaseClient()).from('case_messages')
    .select(
      `
            *,
            sender:sender_id(full_name, avatar_url)
        `
    )
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  // Fetch rating if exists
  const { data: rating } = await (await __getSupabaseClient()).from('ratings')
    .select('overall_rating, feedback, created_at')
    .eq('request_id', id)
    .maybeSingle();

  // Fetch document requests
  const { data: documentRequests } = await (await __getSupabaseClient()).from('document_requests')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: false });

  // Check for draft opinion with saved versions
  const { data: legalOpinion } = await (await __getSupabaseClient()).from('legal_opinions')
    .select(
      `
            id, 
            status, 
            current_version,
            versions:opinion_versions(id, version_number, is_draft)
        `
    )
    .eq('request_id', id)
    .maybeSingle();

  // Second opinion tab should only unlock when a draft has been saved
  const hasSavedDraft =
    !!legalOpinion && Array.isArray(legalOpinion.versions) && legalOpinion.versions.length > 0;

  // DEBUG: Log the draft status
  console.log('[DEBUG page.tsx] Legal Opinion Data:', {
    exists: !!legalOpinion,
    opinionId: legalOpinion?.id,
    status: legalOpinion?.status,
    currentVersion: legalOpinion?.current_version,
    versionsIsArray: Array.isArray(legalOpinion?.versions),
    versionsCount: legalOpinion?.versions?.length || 0,
    versions: legalOpinion?.versions,
    hasSavedDraft,
  });

  // Fetch existing second opinion requests
  const { data: secondOpinionRequests } = await (await __getSupabaseClient()).from('second_opinion_requests')
    .select(
      `
            *,
            reviewer:shared_with_lawyer_id(full_name, avatar_url)
        `
    )
    .eq('original_request_id', id)
    .order('created_at', { ascending: false });

  // ✅ WORKFLOW AGGREGATOR: Resolve complete workflow state
  const { resolveCaseWorkflow } = await import('../utils/workflowAggregator');

  const workflowSummary = await resolveCaseWorkflow(id, userRole, {
    includeMetrics: true,
  });

  return (
    <CaseWorkspace
      request={request}
      clarifications={clarifications || []}
      messages={messages || []}
      documentRequests={documentRequests || []}
      review={
        rating
          ? {
            rating: rating.overall_rating,
            review_text: rating.feedback,
            created_at: rating.created_at,
          }
          : undefined
      }
      userId={user.id!}
      userRole={userRole}
      userProfile={{
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      }}
      hasDraftOpinion={hasSavedDraft}
      secondOpinionRequests={secondOpinionRequests || []}
      workflowSummary={workflowSummary}
    />
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
