'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/permissions';

/**
 * Server actions for Request Proposals Management
 * Handles proposal submission, retrieval, and status updates
 */

// =====================================================
// TYPES
// =====================================================

export interface Proposal {
  id: string;
  request_id: string;
  lawyer_id: string;
  proposed_fee: number;
  timeline_days: number;
  proposal_message: string;
  attachments: any[];
  status: 'submitted' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
}

export interface ProposalWithDetails extends Proposal {
  lawyer: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    bar_council_id?: string;
    specialization?: string[];
    years_of_experience?: number;
    bio?: string;
  };
  request?: {
    id: string;
    title: string;
    request_number: string;
    status: string;
    client: {
      full_name: string;
      organization?: string;
    };
  };
}

interface ActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

// =====================================================
// 1. CREATE PROPOSAL
// =====================================================

export async function createProposal(
  formData: FormData
): Promise<ActionResult<{
proposalId: string }>> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    // Verify user is a lawyer
    const { data: profile } = (await __getSupabaseClient()).from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile || !hasPermission(profile, 'access_marketplace')) {
      return { success: false, error: 'Only lawyers can submit proposals' };
    }

    // Extract form data
    const requestId = formData.get('requestId') as string;
    const proposedFee = parseFloat(formData.get('proposedFee') as string);
    const timelineDays = parseInt(formData.get('timelineDays') as string);
    const proposalMessage = formData.get('proposalMessage') as string;
    const attachmentsJson = formData.get('attachments') as string;

    // Validation
    if (!requestId || !proposedFee || !timelineDays || !proposalMessage) {
      return { success: false, error: 'All fields are required' };
    }

    if (proposedFee <= 0) {
      return { success: false, error: 'Proposed fee must be greater than 0' };
    }

    if (timelineDays <= 0) {
      return { success: false, error: 'Timeline must be at least 1 day' };
    }

    if (proposalMessage.length < 50) {
      return { success: false, error: 'Proposal message must be at least 50 characters' };
    }

    // Parse attachments
    let attachments = [];
    if (attachmentsJson) {
      try {
        attachments = JSON.parse(attachmentsJson);
      } catch {
        attachments = [];
      }
    }

    // Fetch request details for validation
    const { data: requestData, error: requestError } = (await __getSupabaseClient()).from('legal_requests')
      .select('budget_min, budget_max')
      .eq('id', requestId)
      .single();

    if (requestError || !requestData) {
      return { success: false, error: 'Request not found' };
    }

    // Validate fee against budget
    if (requestData.budget_min && proposedFee < requestData.budget_min) {
      return {
        success: false,
        error: `Proposed fee cannot be less than the minimum budget of ₹${requestData.budget_min}`,
      };
    }

    if (requestData.budget_max && proposedFee > requestData.budget_max) {
      return {
        success: false,
        error: `Proposed fee cannot exceed the maximum budget of ₹${requestData.budget_max}`,
      };
    }

    // Call database function to create proposal
    const { data, error } = await (await __getSupabaseClient()).rpc('create_proposal', {
      p_request_id: requestId,
      p_lawyer_id: user.id,
      p_proposed_fee: proposedFee,
      p_timeline_days: timelineDays,
      p_proposal_message: proposalMessage,
      p_attachments: attachments,
    });

    if (error) {
      console.error('Error creating proposal:', error);
      return { success: false, error: error.message || 'Failed to create proposal' };
    }

    // Check function result
    if (data && data.length > 0) {
      const result = data[0];
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Revalidate paths
      revalidatePath('/lawyer/public-requests');
      revalidatePath('/lawyer/my-proposals');
      revalidatePath(`/client/proposals/${requestId}`);

      return {
        success: true,
        data: { proposalId: result.proposal_id },
      };
    }

    return { success: false, error: 'Unexpected response from database' };
  } catch (error: any) {
    console.error('Error in createProposal:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 2. GET PROPOSALS FOR REQUEST (Client View)
// =====================================================

export async function getProposalsForRequest(
  requestId: string
): Promise<ActionResult<ProposalWithDetails[]>> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify request belongs to client
    const { data: request } = (await __getSupabaseClient()).from('legal_requests')
      .select('client_id')
      .eq('id', requestId)
      .single();

    if (!request || request.client_id !== user.id) {
      return { success: false, error: 'Request not found or access denied' };
    }

    // Get all proposals with lawyer details
    const { data, error } = (await __getSupabaseClient()).from('request_proposals')
      .select(
        `
                *,
                lawyer:profiles!lawyer_id (
                    id,
                    full_name,
                    email,
                    avatar_url,
                    bar_council_id,
                    specialization,
                    years_of_experience,
                    bio
                )
            `
      )
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
      return { success: false, error: 'Failed to fetch proposals' };
    }

    return { success: true, data: data as ProposalWithDetails[] };
  } catch (error: any) {
    console.error('Error in getProposalsForRequest:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 3. GET MY PROPOSALS (Lawyer View)
// =====================================================

export async function getMyProposals(): Promise<ActionResult<ProposalWithDetails[]>> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get lawyer's proposals with request details
    const { data, error } = (await __getSupabaseClient()).from('request_proposals')
      .select(
        `
                *,
                request:legal_requests!request_id (
                    id,
                    title,
                    request_number,
                    status,
                    client:profiles!client_id (
                        full_name,
                        organization
                    )
                )
            `
      )
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my proposals:', error);
      return { success: false, error: 'Failed to fetch your proposals' };
    }

    return { success: true, data: data as ProposalWithDetails[] };
  } catch (error: any) {
    console.error('Error in getMyProposals:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 4. UPDATE PROPOSAL (Lawyer edits their proposal)
// =====================================================

export async function updateProposal(
  proposalId: string,
  updates: {
    proposedFee?: number;
    timelineDays?: number;
    proposalMessage?: string;
    attachments?: any[];
  }
): Promise<ActionResult> {try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify proposal exists and belongs to lawyer
    const { data: proposal } = (await __getSupabaseClient()).from('request_proposals')
      .select('lawyer_id, status, request_id')
      .eq('id', proposalId)
      .single();

    if (!proposal || proposal.lawyer_id !== user.id) {
      return { success: false, error: 'Proposal not found or access denied' };
    }

    // Can only edit pending or shortlisted proposals
    if (!['submitted', 'shortlisted'].includes(proposal.status)) {
      return { success: false, error: 'Cannot edit this proposal' };
    }

    // Fetch request details for validation
    const { data: requestData, error: requestError } = (await __getSupabaseClient()).from('legal_requests')
      .select('budget_min, budget_max')
      .eq('id', proposal.request_id)
      .single();

    if (requestError || !requestData) {
      return { success: false, error: 'Request details not found' }; // Should not happen if proposal exists
    }

    // Validation
    if (updates.proposedFee !== undefined) {
      if (updates.proposedFee <= 0) {
        return { success: false, error: 'Proposed fee must be greater than 0' };
      }

      // Validate against budget
      if (requestData.budget_min && updates.proposedFee < requestData.budget_min) {
        return {
          success: false,
          error: `Proposed fee cannot be less than the minimum budget of ₹${requestData.budget_min}`,
        };
      }

      if (requestData.budget_max && updates.proposedFee > requestData.budget_max) {
        return {
          success: false,
          error: `Proposed fee cannot exceed the maximum budget of ₹${requestData.budget_max}`,
        };
      }
    }

    if (updates.timelineDays !== undefined && updates.timelineDays <= 0) {
      return { success: false, error: 'Timeline must be at least 1 day' };
    }

    if (updates.proposalMessage !== undefined && updates.proposalMessage.length < 50) {
      return { success: false, error: 'Proposal message must be at least 50 characters' };
    }

    // Prepare update object
    const updateData: any = {};
    if (updates.proposedFee !== undefined) updateData.proposed_fee = updates.proposedFee;
    if (updates.timelineDays !== undefined) updateData.timeline_days = updates.timelineDays;
    if (updates.proposalMessage !== undefined)
      updateData.proposal_message = updates.proposalMessage;
    if (updates.attachments !== undefined) updateData.attachments = updates.attachments;

    // Update proposal
    const { error } = (await __getSupabaseClient()).from('request_proposals')
      .update(updateData)
      .eq('id', proposalId);

    if (error) {
      console.error('Error updating proposal:', error);
      return { success: false, error: 'Failed to update proposal' };
    }

    // Revalidate paths
    revalidatePath('/lawyer/my-proposals');

    return { success: true };
  } catch (error: any) {
    console.error('Error in updateProposal:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 5. WITHDRAW PROPOSAL
// =====================================================

export async function withdrawProposal(proposalId: string): Promise<ActionResult> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Call database function
    const { data, error } = await (await __getSupabaseClient()).rpc('withdraw_proposal', {
      p_proposal_id: proposalId,
      p_lawyer_id: user.id,
    });

    if (error) {
      console.error('Error withdrawing proposal:', error);
      return { success: false, error: error.message || 'Failed to withdraw proposal' };
    }

    // Check function result
    if (data && data.length > 0) {
      const result = data[0];
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Revalidate paths
      revalidatePath('/lawyer/my-proposals');

      return { success: true };
    }

    return { success: false, error: 'Unexpected response from database' };
  } catch (error: any) {
    console.error('Error in withdrawProposal:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 6. SHORTLIST PROPOSAL (Client)
// =====================================================

export async function shortlistProposal(proposalId: string): Promise<ActionResult> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get proposal and verify access
    const { data: proposal } = (await __getSupabaseClient()).from('request_proposals')
      .select(
        `
                id,
                status,
                lawyer_id,
                request_id,
                request:legal_requests!request_id (
                    client_id
                )
            `
      )
      .eq('id', proposalId)
      .single();

    if (!proposal) {
      return { success: false, error: 'Proposal not found' };
    }

    const request = Array.isArray(proposal.request) ? proposal.request[0] : proposal.request;

    if (request.client_id !== user.id) {
      return { success: false, error: 'Access denied' };
    }

    // Can only shortlist submitted proposals
    if (proposal.status !== 'submitted') {
      return { success: false, error: 'Can only shortlist pending proposals' };
    }

    // Update to shortlisted
    const { error } = (await __getSupabaseClient()).from('request_proposals')
      .update({ status: 'shortlisted' })
      .eq('id', proposalId);

    if (error) {
      console.error('Error shortlisting proposal:', error);
      return { success: false, error: 'Failed to shortlist proposal' };
    }

    // Create notification
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: proposal.lawyer_id,
      type: 'proposal_shortlisted',
      title: 'Proposal Shortlisted!',
      message: "Your proposal has been shortlisted by the client. You're one step closer!",
      related_request_id: proposal.request_id,
    });

    revalidatePath(`/client/proposals`);

    return { success: true };
  } catch (error: any) {
    console.error('Error in shortlistProposal:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 7. ACCEPT PROPOSAL (Client)
// =====================================================

export async function acceptProposal(proposalId: string): Promise<ActionResult> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // ---------------------------------------------------------
    // NEW LOGIC: ACCEPT PROPOSAL -> CREATE PRIVATE CASE
    // ---------------------------------------------------------
    
    // 1. Get Proposal Details
    const { data: proposalData, error: propError } = (await __getSupabaseClient()).from('request_proposals')
      .select('*, request:legal_requests(*)')
      .eq('id', proposalId)
      .single();

    if (propError || !proposalData) {
        return { success: false, error: 'Proposal not found' };
    }

    const originalRequest = proposalData.request as any;

    // 2. Transact: Accept Proposal, Mark Limit, Create Case
    // We use a simple sequential approach here. In a real prod env, a stored procedure is safer.
    
    // A. Update Proposal Status
    const { error: updatePropError } = (await __getSupabaseClient()).from('request_proposals')
      .update({ status: 'accepted' })
      .eq('id', proposalId);

    if (updatePropError) throw updatePropError;

    // B. Mark Original Request as Awarded
    const { error: updateReqError } = (await __getSupabaseClient()).from('legal_requests')
        .update({ status: 'awarded' })
        .eq('id', originalRequest.id);

    if (updateReqError) throw updateReqError;

    // C. Create New Private Case
    // The new case inherits details but is "Private" and "Awaiting Payment" (or "Accepted")
    const { data: newCase, error: newCaseError } = (await __getSupabaseClient()).from('legal_requests')
        .insert({
            client_id: user.id,
            department_id: originalRequest.department_id,
            title: originalRequest.title, // Keep same title? Or append " - Worked by X"?
            description: originalRequest.description,
            priority: originalRequest.priority,
            status: 'awaiting_payment', // Per requirement
            visibility: 'private',
            request_type: 'direct', // It is now a direct engagement
            assigned_lawyer_id: proposalData.lawyer_id,
            assigned_at: new Date().toISOString(),
            // Linkage
            proposal_id: proposalId,
            origin_request_id: originalRequest.id,
            // Budget/Fee
            loan_amount: proposalData.proposed_fee, // Assuming this maps? Or better add a 'fee' column? Using loan_amount as proxy for now or ignore. 
            // Better to keep loan_amount actual loan amount if real estate. 
            // The fee is in the proposal.
        })
        .select()
        .single();
    
    if (newCaseError) throw newCaseError;

    // Create Notification
    await (await __getSupabaseClient()).from('notifications').insert({
        user_id: proposalData.lawyer_id,
        type: 'proposal_accepted',
        title: 'Proposal Accepted!',
        message: `Your proposal for "${originalRequest.title}" has been accepted. A new case #${newCase.request_number} has been created.`,
        related_request_id: newCase.id,
    });

    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/track');
    revalidatePath('/dashboard/lawyer');

    return { success: true };

  } catch (error: any) {
    console.error('Error in acceptProposal:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 8. REJECT PROPOSAL (Client)
// =====================================================

export async function rejectProposal(proposalId: string): Promise<ActionResult> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get proposal and verify access
    const { data: proposal } = (await __getSupabaseClient()).from('request_proposals')
      .select(
        `
                id,
                lawyer_id,
                request_id,
                status,
                request:legal_requests!request_id (
                    client_id
                )
            `
      )
      .eq('id', proposalId)
      .single();

    if (!proposal) {
      return { success: false, error: 'Proposal not found' };
    }

    const request = Array.isArray(proposal.request) ? proposal.request[0] : proposal.request;

    if (request.client_id !== user.id) {
      return { success: false, error: 'Access denied' };
    }

    // Can only reject submitted or shortlisted proposals
    if (!['submitted', 'shortlisted'].includes(proposal.status)) {
      return { success: false, error: 'Cannot reject this proposal' };
    }

    // Update to rejected
    const { error } = (await __getSupabaseClient()).from('request_proposals')
      .update({ status: 'rejected' })
      .eq('id', proposalId);

    if (error) {
      console.error('Error rejecting proposal:', error);
      return { success: false, error: 'Failed to reject proposal' };
    }

    // Create notification
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: proposal.lawyer_id,
      type: 'proposal_rejected',
      title: 'Proposal Not Selected',
      message: 'The client has decided not to proceed with your proposal.',
      related_request_id: proposal.request_id,
    });

    revalidatePath(`/client/proposals`);

    return { success: true };
  } catch (error: any) {
    console.error('Error in rejectProposal:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 9. GET PROPOSAL COUNT FOR REQUEST
// =====================================================

export async function getProposalCount(
  requestId: string
): Promise<ActionResult<{
count: number }>> {
  try {
    

    const { count, error } = (await __getSupabaseClient()).from('request_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .not('status', 'eq', 'withdrawn');

    if (error) {
      console.error('Error getting proposal count:', error);
      return { success: false, error: 'Failed to get proposal count' };
    }

    return { success: true, data: { count: count || 0 } };
  } catch (error: any) {
    console.error('Error in getProposalCount:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
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
