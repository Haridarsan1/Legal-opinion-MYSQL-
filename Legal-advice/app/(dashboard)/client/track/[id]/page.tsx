import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import ClientCaseWorkspace from './ClientCaseWorkspace';

export const metadata: Metadata = {
  title: 'Case Details - Legal Opinion Portal',
  description: 'View your legal request details',
};

export default async function ClientRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  

  // Get authenticated user
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch request details with all related data
  const { data: request, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
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
    .eq('client_id', user.id)
    .single();

  if (requestError || !request) {
    notFound();
  }

  // Fetch clarifications
  const { data: clarifications } = await (await __getSupabaseClient()).from('clarifications')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  // Fetch legal opinion with versions
  const { data: legalOpinion, error: opinionError } = await (await __getSupabaseClient()).from('legal_opinions')
    .select(
      `
            id, 
            status, 
            current_version,
            versions:opinion_versions(
                id, 
                version_number, 
                content, 
                is_draft,
                created_at,
                submitted_at
            )
        `
    )
    .eq('request_id', id)
    .maybeSingle();

  // Debug: Log opinion fetch results
  console.log('[CLIENT PAGE DEBUG] Legal Opinion Fetch:', {
    requestId: id,
    opinionExists: !!legalOpinion,
    opinionId: legalOpinion?.id,
    status: legalOpinion?.status,
    versionsCount: legalOpinion?.versions?.length || 0,
    versions: legalOpinion?.versions,
    error: opinionError,
  });

  // Fetch existing rating if any
  const { data: reviewData } = await (await __getSupabaseClient()).from('lawyer_reviews')
    .select('rating, review_text, created_at')
    .eq('request_id', id)
    .maybeSingle();

  // Fetch audit logs for timeline
  const { data: auditLogs } = await (await __getSupabaseClient()).from('request_audit_logs')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  // Fetch proposals (if any)
  const { data: proposals } = await (await __getSupabaseClient()).from('proposals')
    .select(
      `
            *,
            lawyer:lawyer_id(full_name, avatar_url, specialization),
            firm:firm_id(organization)
        `
    )
    .eq('request_id', id)
    .order('created_at', { ascending: false });

  const rating = reviewData
    ? {
        overall_rating: reviewData.rating,
        feedback: reviewData.review_text,
        created_at: reviewData.created_at,
      }
    : undefined;

  return (
    <ClientCaseWorkspace
      request={request}
      clarifications={clarifications || []}
      legalOpinion={legalOpinion || undefined}
      rating={rating || undefined}
      userId={user.id!}
      auditLogs={auditLogs || []}
      proposals={proposals || []}
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
