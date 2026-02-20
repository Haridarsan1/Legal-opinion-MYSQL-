import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ViewOpinionContent from './components/ViewOpinionContent';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientOpinionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Get user profile to verify they're a client
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'client') {
    redirect('/'); // Redirect non-clients
  }

  // Fetch the legal request with all related data
  const { data: request, error: requestError } = await supabase
    .from('legal_requests')
    .select(
      `
            *,
            department:departments(id, name, sla_hours),
            lawyer:profiles!legal_requests_assigned_lawyer_id_fkey(
                id,
                full_name,
                avatar_url,
                specialization,
                bar_council_id,
                phone,
                email
            ),
            documents(
                id,
                file_name,
                file_url,
                file_size,
                document_type,
                created_at,
                uploaded_by
            ),
            clarifications(
                id,
                message,
                response,
                priority,
                is_resolved,
                created_at,
                responded_at
            ),
            lawyer_reviews(
                id,
                rating,
                review_text,
                created_at
            )
        `
    )
    .eq('id', id)
    .eq('client_id', user.id) // Ensure client can only view their own requests
    .single();

  if (requestError || !request) {
    redirect('/client/track');
  }

  // Check if opinion is ready (Robust check using opinion versions)
  const hasSubmittedOpinion = request.opinion_versions?.some(
    (v: any) => !v.is_draft && v.submitted_at
  );

  // Fallback legacy check also
  const isLegacyReady =
    request.opinion_text &&
    ['opinion_ready', 'completed', 'delivered', 'client_review'].includes(request.status);

  if (!hasSubmittedOpinion && !isLegacyReady) {
    redirect(`/case/${id}`); // Redirect to main case page if opinion not ready
  }

  // Fetch audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select(
      `
            id,
            action,
            details,
            created_at,
            user:user_id(
                id,
                full_name,
                role,
                avatar_url
            )
        `
    )
    .eq('entity_id', id)
    .order('created_at', { ascending: false });

  return (
    <ViewOpinionContent
      request={request}
      auditLogs={auditLogs || []}
      currentUser={{
        id: user.id,
        name: profile.full_name,
        avatar: profile.avatar_url,
      }}
    />
  );
}
