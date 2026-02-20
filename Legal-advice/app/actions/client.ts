'use server';

import { createClient } from '@/lib/supabase/server';

export async function getClientMarketplaceMetrics() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get client's public requests
    const { data: requests, error } = await supabase
      .from('legal_requests')
      .select(
        `
                id,
                status,
                proposal_count:request_proposals!request_proposals_request_id_fkey(id)
            `
      )
      .eq('client_id', user.id)
      .eq('request_type', 'public');

    if (error) throw error;

    const activePublicRequests =
      requests?.filter((r) => ['accepting_proposals', 'proposal_review'].includes(r.status))
        .length || 0;

    const totalProposalsReceived =
      requests?.reduce((sum, r) => {
        // Count array length since we fetch IDs now
        const count = Array.isArray(r.proposal_count) ? r.proposal_count.length : 0;
        return sum + count;
      }, 0) || 0;

    const pendingDecisions =
      requests?.filter((r) => {
        const hasProposals = (Array.isArray(r.proposal_count) ? r.proposal_count.length : 0) > 0;
        return hasProposals && ['accepting_proposals', 'proposal_review'].includes(r.status);
      }).length || 0;

    return {
      success: true,
      data: {
        activePublicRequests,
        totalProposalsReceived,
        pendingDecisions,
      },
    };
  } catch (error: any) {
    console.error('Error fetching client marketplace metrics:', error);
    return { success: false, error: error.message };
  }
}

import { aggregateCaseData, type LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';

export async function getClientDashboardSummaries(): Promise<{
  success: boolean;
  data?: LifecycleSummary[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    // Fetch full hierarchy for resolver
    const { data: requests, error } = await supabase
      .from('legal_requests')
      .select(
        `
                *,
                lawyer:assigned_lawyer_id(id, full_name, avatar_url),
                department:departments(name, sla_hours),
                legal_opinions(id, opinion_versions(id, version_number, is_draft, created_at)),
                clarifications:clarifications(is_resolved),
                case_messages(read_by),
                lawyer_reviews(id),
                proposal_count:request_proposals!request_proposals_request_id_fkey(id)
            `
      )
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Query Error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Query successful, records fetched:', requests?.length);

    try {
      const summaries = aggregateCaseData(requests || [], user.id);
      return { success: true, data: summaries };
    } catch (aggError: any) {
      console.error('Aggregation Error:', aggError);
      console.error('Aggregation Error Stack:', aggError?.stack);
      throw aggError;
    }
  } catch (error: any) {
    console.error('Error fetching dashboard summaries catch block:', error);
    if (typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return { success: false, error: error.message || 'Unknown error' };
  }
}
