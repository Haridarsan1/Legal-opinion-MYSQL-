'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/permissions';

/**
 * Get public open requests for lawyers to browse
 */
export async function getPublicOpenRequests(filters?: {
  const supabase = await createClient();
  departmentId?: string;
  priority?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a lawyer
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'access_marketplace')) {
    return { success: false, error: 'Only lawyers can view public requests' };
  }

  try {
    let query = (supabase.from('legal_requests') as any)
      .select(
        `
                id,
                request_number,
                title,
                description,
                priority,
                status,
                created_at,
                public_posted_at,
                budget_min,
                budget_max,
                proposal_deadline,
                complexity_level,
                required_experience_years,
                confidentiality_type,
                attachments_count,
                industry_type,
                jurisdiction,
                expected_deliverables,
                department:departments(id, name),
                client:profiles!legal_requests_client_id_fkey(full_name, organization),
                proposal_count:request_proposals(id)
            `
      )
      .eq('request_type', 'public')
      .in('public_status', ['PUBLIC_OPEN', 'LAWYERS_INTERESTED'])
      .order('public_posted_at', { ascending: false });

    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data: requests, error } = await query;

    if (error) throw error;

    // For each request, check if current lawyer has submitted a proposal
    const requestsWithProposalStatus = await Promise.all(
      (requests || []).map(async (request: any) => {
        const { data: myProposal } = await supabase
          .from('request_proposals')
          .select('id, status')
          .eq('request_id', request.id)
          .eq('lawyer_id', user.id)
          .not('status', 'eq', 'withdrawn')
          .single();

        return {
          ...request,
          hasMyProposal: !!myProposal,
          myProposalStatus: myProposal?.status || null,
        };
      })
    );

    return { success: true, data: requestsWithProposalStatus };
  } catch (error: any) {
    console.error('Error fetching public requests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get lawyer's own public claims
 */
export async function getMyPublicClaims() {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data: claims, error } = await supabase
      .from('public_case_claims')
      .select(
        `
                id,
                case_id,
                status,
                interest_message,
                timeline_estimate,
                fee_estimate,
                fee_currency,
                created_at,
                updated_at,
                case:legal_requests(
                    id,
                    request_number,
                    title,
                    description,
                    priority,
                    status,
                    public_status,
                    created_at,
                    client:profiles!legal_requests_client_id_fkey(full_name, organization),
                    department:departments(name)
                )
            `
      )
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: claims || [] };
  } catch (error: any) {
    console.error('Error fetching public claims:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get interested lawyers for a client's public case
 */
export async function getInterestedLawyers(caseId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify case belongs to user
    const { data: caseData } = await supabase
      .from('legal_requests')
      .select('client_id, request_type, public_status')
      .eq('id', caseId)
      .single();

    if (!caseData || caseData.client_id !== user.id || caseData.request_type !== 'public') {
      return { success: false, error: 'Case not found or not authorized' };
    }

    const { data: claims, error } = await supabase
      .from('public_case_claims')
      .select(
        `
                id,
                lawyer_id,
                status,
                interest_message,
                timeline_estimate,
                fee_estimate,
                fee_currency,
                conflict_confirmed,
                created_at,
                lawyer:profiles!public_case_claims_lawyer_id_fkey(
                    id,
                    full_name,
                    bar_council_id,
                    specialization,
                    years_of_experience,
                    avatar_url,
                    bio,
                    email
                )
            `
      )
      .eq('case_id', caseId)
      .in('status', ['pending', 'selected'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: claims || [] };
  } catch (error: any) {
    console.error('Error fetching interested lawyers:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lawyer expresses interest in a public case
 */
export async function createPublicClaim(formData: FormData) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const caseId = formData.get('caseId') as string;
    const interestMessage = formData.get('interestMessage') as string;
    const timelineEstimate = formData.get('timelineEstimate') as string;
    const feeEstimate = formData.get('feeEstimate') as string;
    const conflictConfirmed = formData.get('conflictConfirmed') === 'true';

    if (!caseId || !interestMessage) {
      return { success: false, error: 'Missing required fields' };
    }

    // Call the database function
    const { data, error } = await supabase.rpc('create_public_claim', {
      p_case_id: caseId,
      p_lawyer_id: user.id,
      p_interest_message: interestMessage,
      p_timeline_estimate: timelineEstimate || null,
      p_fee_estimate: feeEstimate ? parseFloat(feeEstimate) : null,
      p_fee_currency: 'INR',
      p_conflict_confirmed: conflictConfirmed,
    });

    if (error) {
      console.error('RPC Error:', error);
      return { success: false, error: error.message };
    }

    if (data && data[0]) {
      const result = data[0];
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }

    revalidatePath(`/case/${caseId}`);
    revalidatePath('/lawyer/public-requests');
    revalidatePath('/lawyer/my-claims');

    return { success: true, message: 'Claim submitted successfully' };
  } catch (error: any) {
    console.error('Error creating claim:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Client selects a lawyer for public request
 */
export async function selectLawyerForPublicRequest(caseId: string, claimId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Call the database function
    const { data, error } = await supabase.rpc('select_lawyer_for_public_request', {
      p_case_id: caseId,
      p_claim_id: claimId,
      p_client_id: user.id,
    });

    if (error) {
      console.error('RPC Error:', error);
      return { success: false, error: error.message };
    }

    if (data && data[0]) {
      const result = data[0];
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }

    revalidatePath(`/case/${caseId}`);
    revalidatePath('/client/track');
    revalidatePath('/lawyer/my-claims');

    return { success: true, message: 'Lawyer selected successfully' };
  } catch (error: any) {
    console.error('Error selecting lawyer:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lawyer withdraws a public claim
 */
export async function withdrawPublicClaim(claimId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Call the database function
    const { data, error } = await supabase.rpc('withdraw_public_claim', {
      p_claim_id: claimId,
      p_lawyer_id: user.id,
    });

    if (error) {
      console.error('RPC Error:', error);
      return { success: false, error: error.message };
    }

    if (data && data[0]) {
      const result = data[0];
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }

    revalidatePath('/lawyer/my-claims');

    return { success: true, message: 'Claim withdrawn successfully' };
  } catch (error: any) {
    console.error('Error withdrawing claim:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get public request notifications
 */
export async function getPublicRequestNotifications() {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data: notifications, error } = await supabase
      .from('public_request_notifications')
      .select(
        `
                id,
                case_id,
                claim_id,
                type,
                title,
                message,
                is_read,
                created_at,
                case:legal_requests(request_number, title)
            `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: notifications || [] };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark public request notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabase
      .from('public_request_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/lawyer/notifications');
    revalidatePath('/client/notifications');

    return { success: true };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get proposal statistics for a public request (Market Insights)
 * Returns aggregated data: total proposals, average fee, fee range, average timeline
 */
export async function getProposalStats(requestId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get all non-withdrawn proposals for this request
    const { data: proposals, error } = await supabase
      .from('request_proposals')
      .select('proposed_fee, timeline_days')
      .eq('request_id', requestId)
      .not('status', 'eq', 'withdrawn');

    if (error) throw error;

    if (!proposals || proposals.length === 0) {
      return {
        success: true,
        data: {
          total_proposals: 0,
          average_fee: null,
          lowest_fee: null,
          highest_fee: null,
          average_timeline: null,
        },
      };
    }

    // Calculate statistics
    const fees = proposals.map((p) => p.proposed_fee);
    const timelines = proposals.map((p) => p.timeline_days);

    const stats = {
      total_proposals: proposals.length,
      average_fee: Math.round(fees.reduce((a, b) => a + b, 0) / fees.length),
      lowest_fee: Math.min(...fees),
      highest_fee: Math.max(...fees),
      average_timeline: Math.round(timelines.reduce((a, b) => a + b, 0) / timelines.length),
    };

    return { success: true, data: stats };
  } catch (error: any) {
    console.error('Error fetching proposal statistics:', error);
    return { success: false, error: error.message || 'Failed to fetch proposal statistics' };
  }
}

/**
 * Get a single public request with full details for the lawyer view
 */
export async function getPublicRequestDetails(requestId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a lawyer
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'access_marketplace')) {
    return { success: false, error: 'Only lawyers can view public requests' };
  }

  try {
    // Fetch request details
    const { data: request, error } = await (supabase.from('legal_requests') as any)
      .select(
        `
                id,
                request_number,
                title,
                description,
                priority,
                status,
                created_at,
                public_posted_at,
                budget_min,
                budget_max,
                proposal_deadline,
                complexity_level,
                required_experience_years,
                confidentiality_type,
                attachments_count,
                industry_type,
                jurisdiction,
                expected_deliverables,
                department:departments(id, name),
                client:profiles!legal_requests_client_id_fkey(full_name, organization),
                proposal_count:request_proposals(id)
            `
      )
      .eq('id', requestId)
      .single();

    if (error) throw error;

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // Check if I have a proposal
    const { data: myProposal } = await supabase
      .from('request_proposals')
      .select('id, status, proposed_fee, timeline_days, proposal_message, created_at')
      .eq('request_id', requestId)
      .eq('lawyer_id', user.id)
      .not('status', 'eq', 'withdrawn')
      .maybeSingle();

    // Check if bookmarked
    const { count: bookmarkCount } = await supabase
      .from('saved_requests')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('lawyer_id', user.id);

    // Get market stats
    const statsCheck = await getProposalStats(requestId);
    const marketStats = statsCheck.success ? statsCheck.data : null;

    return {
      success: true,
      data: {
        ...request,
        hasMyProposal: !!myProposal,
        myProposalStatus: myProposal?.status || null,
        myProposalDetails: myProposal || null,
        isBookmarked: bookmarkCount ? bookmarkCount > 0 : false,
        marketStats,
      },
    };
  } catch (error: any) {
    console.error('Error fetching request details:', error);
    return { success: false, error: error.message || 'Failed to fetch request details' };
  }
}
