import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import TrackStatusContent from './TrackStatusContent';
import { aggregateCaseData } from '@/app/domain/lifecycle/LifecycleResolver';

export const metadata: Metadata = {
  title: 'Track Status - Legal Opinion Portal',
  description: 'Monitor your legal opinion requests',
};

export default async function TrackStatusPage() {
  

  // Get authenticated user
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Fetch all user requests with related data
  const { data: requests, error } = await supabase
    .from('legal_requests')
    .select(
      `
            *,
            department:departments(name, sla_hours),
            lawyer:profiles!legal_requests_assigned_lawyer_id_fkey(id, full_name, email, avatar_url),
            documents(id, file_name, file_type),
            clarifications(id, is_resolved),
            case_messages(id, read_by),
            audit_events:audit_logs(action, created_at, details),
            lawyer_reviews(id),
            legal_opinions(
                id,
                status,
                opinion_versions(is_draft, created_at, version_number)
            )
        `
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests:', JSON.stringify(error, null, 2));
    return <div>Error loading requests</div>;
  }

  // Transform and Aggregate Data via Service
  // We need to flatten the structure for the aggregator if it expects opinion_versions at root or update the aggregator
  // For now, let's map it before passing to aggregateCaseData
  const mappedRequests = (requests || []).map((req: any) => {
    const opinion = req.legal_opinions?.[0];
    const versions =
      opinion?.opinion_versions?.map((v: any) => ({
        ...v,
        submitted_at: v.created_at, // Map created_at to submitted_at for resolver compatibility
      })) || [];

    return {
      ...req,
      opinion_versions: versions,
    };
  });

  const lifecycleSummaries = aggregateCaseData(mappedRequests, user.id);

  return <TrackStatusContent requests={lifecycleSummaries} />;
}
