import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import LawyerReviewContent from './LawyerReviewContent';

export const metadata: Metadata = {
  title: 'Review Case - Legal Opinion Portal',
  description: 'Review and submit legal opinion',
};

export default async function LawyerReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user;

  if (!user) {redirect('/login');
  }

  // Fetch lawyer profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'lawyer') {
    redirect('/login');
  }

  // Fetch the legal request with full details
  const { data: request, error } = await supabase
    .from('legal_requests')
    .select(
      `
            *,
            client:client_id(id, full_name, email, avatar_url, phone),
            department_info:departments(name, description),
            documents(*)
        `
    )
    .eq('id', id)
    .single();

  // Handle errors
  if (error || !request) {
    notFound();
  }

  // Check if lawyer is assigned to this case
  const isAssignedLawyer = request.assigned_lawyer_id === user.id;

  // Check if lawyer is a requested second opinion reviewer
  const { data: secondOpinionRequest } = await supabase
    .from('second_opinion_requests')
    .select('*')
    .eq('original_request_id', id)
    .eq('shared_with_lawyer_id', user.id)
    .maybeSingle();

  const isReviewer = !!secondOpinionRequest;

  if (!isAssignedLawyer && !isReviewer) {
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
          <p className="text-slate-600 mb-6">
            This case is not assigned to you. You can only review cases that have been assigned to
            your account.
          </p>
          <Link
            href="/lawyer/requests"
            className="inline-block px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            View My Cases
          </Link>
        </div>
      </div>
    );
  }

  // Fetch clarifications if any
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

  // Fetch document requests
  const { data: documentRequests } = await supabase
    .from('document_requests')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: false });

  // Check for draft opinion with saved versions
  const { data: legalOpinion } = await supabase
    .from('legal_opinions')
    .select(
      `
            id, 
            status, 
            current_version,
            versions:opinion_versions(id, version_number, is_draft, submitted_at)
        `
    )
    .eq('request_id', id)
    .maybeSingle();

  // Second opinion tab should only unlock when a draft has been saved
  const hasSavedDraft =
    !!legalOpinion && Array.isArray(legalOpinion.versions) && legalOpinion.versions.length > 0;

  // Lifecycle Resolution
  // We need to shape the data into ExtendedRequest
  const latestVersion = legalOpinion?.versions?.sort(
    (a, b) => b.version_number - a.version_number
  )[0];

  // Import dynamically to avoid top-level await issues if any (though standard import is fine usually)
  const { resolveLifecycleStatus, getLifecycleProgress } =
    await import('@/app/domain/lifecycle/LifecycleResolver');

  const extendedRequest = {
    ...request,
    // Map missing fields if necessary, or ensure they exist
    latest_opinion_version: latestVersion
      ? {
          is_draft: latestVersion.is_draft,
          submitted_at: latestVersion.submitted_at,
        }
      : undefined,
    // We might want audit events for perfect resolution, but for now we might skip or fetch them
    // If we want accurate terminal state, we should fetch audit events
  };

  // Fetch minimal audit events for status resolution accuracy
  const { data: auditEvents } = await supabase
    .from('audit_logs')
    .select('action, created_at, details')
    .eq('request_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (auditEvents) {
    (extendedRequest as any).audit_events = auditEvents;
  }

  const lifecycleStatus = resolveLifecycleStatus(extendedRequest as any);
  const progressMetrics = getLifecycleProgress(extendedRequest as any, lifecycleStatus);

  // Fetch existing second opinion requests
  const { data: secondOpinionRequests } = await supabase
    .from('second_opinion_requests')
    .select('*')
    .eq('original_request_id', id)
    .order('created_at', { ascending: false });

  return (
    <LawyerReviewContent
      request={request}
      clarifications={clarifications || []}
      messages={messages || []}
      documentRequests={documentRequests || []}
      lawyerId={user.id}
      userProfile={profile}
      secondOpinionRequest={secondOpinionRequest || undefined}
      hasDraftOpinion={hasSavedDraft}
      secondOpinionRequests={secondOpinionRequests || []}
      lifecycleStatus={lifecycleStatus}
      progressMetrics={progressMetrics}
    />
  );
}
