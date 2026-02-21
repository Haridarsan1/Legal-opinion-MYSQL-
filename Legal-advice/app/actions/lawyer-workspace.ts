'use server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Lawyer Workspace Server Actions
 * Professional case management features for lawyers
 */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { RiskFlag, InternalNote, OpinionSubmission } from '@/lib/types';


// =====================================================
// RISK FLAG MANAGEMENT
// =====================================================

export async function toggleRiskFlag(
  requestId: string,
  flag: RiskFlag,
  add: boolean
): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());

    // Get current user
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current risk flags
    const { data: request, error: fetchError } = (await createClient()).from('legal_requests')
      .select('risk_flags')
      .eq('id', requestId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const currentFlags = (request.risk_flags as RiskFlag[]) || [];
    let newFlags: RiskFlag[];

    if (add) {
      // Add flag if not already present
      newFlags = currentFlags.includes(flag) ? currentFlags : [...currentFlags, flag];
    } else {
      // Remove flag
      newFlags = currentFlags.filter((f) => f !== flag);
    }

    // Update risk flags
    const { error: updateError } = (await createClient()).from('legal_requests')
      .update({ risk_flags: newFlags })
      .eq('id', requestId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Log action in audit_logs
    (await createClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: add ? 'risk_flag_added' : 'risk_flag_removed',
      details: { flag, new_flags: newFlags },
    });

    revalidatePath(`/lawyer/review/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Error toggling risk flag:', error);
    return { success: false, error: 'Failed to toggle risk flag' };
  }
}

// =====================================================
// DOCUMENT REVIEW TRACKING
// =====================================================

export async function markDocumentReviewed(
  documentId: string,
  requestId: string
): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update document review status
    const { error: updateError } = (await createClient()).from('documents')
      .update({
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_status: 'reviewed',
      })
      .eq('id', documentId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Log action
    (await createClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'document_reviewed',
      details: { document_id: documentId },
    });

    revalidatePath(`/lawyer/review/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Error marking document reviewed:', error);
    return { success: false, error: 'Failed to mark document as reviewed' };
  }
}

export async function unmarkDocumentReviewed(
  documentId: string,
  requestId: string
): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update document review status
    const { error: updateError } = (await createClient()).from('documents')
      .update({
        reviewed_by: null,
        reviewed_at: null,
        review_status: 'pending',
      })
      .eq('id', documentId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/lawyer/review/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Error unmarking document:', error);
    return { success: false, error: 'Failed to unmark document' };
  }
}

// =====================================================
// INTERNAL NOTES
// =====================================================

export async function createInternalNote(
  requestId: string,
  noteText: string,
  noteType: 'general' | 'risk' | 'research' | 'strategy' = 'general'
): Promise<{
  success: boolean; error?: string; note?: InternalNote
}> {
  try {
    const supabase = (await createClient());

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Insert internal note
    const { data, error: insertError } = (await createClient()).from('internal_notes')
      .insert({
        request_id: requestId,
        created_by: user.id,
        note_text: noteText,
        note_type: noteType,
        visible_to_roles: ['lawyer', 'firm'],
      })
      .select('*')
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Log action
    (await createClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'internal_note_created',
      details: { note_type: noteType },
    });

    revalidatePath(`/lawyer/review/${requestId}`);
    return { success: true, note: data as InternalNote };
  } catch (error) {
    console.error('Error creating internal note:', error);
    return { success: false, error: 'Failed to create internal note' };
  }
}

export async function getInternalNotes(
  requestId: string
): Promise<{
  success: boolean; data?: InternalNote[]; error?: string
}> {
  try {
    const supabase = (await createClient());

    const { data, error } = (await createClient()).from('internal_notes')
      .select(
        `
                *,
                creator:created_by (
                    id,
                    full_name,
                    role
                )
            `
      )
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as InternalNote[] };
  } catch (error) {
    console.error('Error fetching internal notes:', error);
    return { success: false, error: 'Failed to fetch internal notes' };
  }
}

// =====================================================
// SLA MANAGEMENT
// =====================================================

export async function pauseSLA(
  requestId: string,
  reason: string
): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error: updateError } = (await createClient()).from('legal_requests')
      .update({
        sla_paused: true,
        sla_pause_reason: reason,
        sla_paused_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Log action
    (await createClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'sla_paused',
      details: { reason },
    });

    revalidatePath(`/lawyer/review/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Error pausing SLA:', error);
    return { success: false, error: 'Failed to pause SLA' };
  }
}

export async function resumeSLA(requestId: string): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current request to calculate new deadline
    const { data: request } = (await createClient()).from('legal_requests')
      .select('sla_paused_at, sla_deadline')
      .eq('id', requestId)
      .single();

    if (request?.sla_paused_at && request.sla_deadline) {
      // Calculate time paused
      const pausedTime = new Date().getTime() - new Date(request.sla_paused_at).getTime();

      // Extend deadline by paused time
      const newDeadline = new Date(new Date(request.sla_deadline).getTime() + pausedTime);

      const { error: updateError } = (await createClient()).from('legal_requests')
        .update({
          sla_paused: false,
          sla_pause_reason: null,
          sla_resumed_at: new Date().toISOString(),
          sla_deadline: newDeadline.toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      // Just resume without extending deadline
      const { error: updateError } = (await createClient()).from('legal_requests')
        .update({
          sla_paused: false,
          sla_pause_reason: null,
          sla_resumed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    }

    // Log action
    (await createClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'sla_resumed',
      details: {},
    });

    revalidatePath(`/lawyer/review/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Error resuming SLA:', error);
    return { success: false, error: 'Failed to resume SLA' };
  }
}

// =====================================================
// ESCALATION
// =====================================================

export async function escalateToFirm(
  requestId: string,
  note: string
): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get lawyer's firm
    const { data: profile } = (await createClient()).from('profiles')
      .select('organization')
      .eq('id', user.id)
      .single();

    if (!profile?.organization) {
      return { success: false, error: 'No firm association found' };
    }

    // Update escalation owner
    const { error: updateError } = (await createClient()).from('legal_requests')
      .update({
        escalation_owner: profile.organization,
      })
      .eq('id', requestId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Create internal note
    await createInternalNote(requestId, `Escalated to firm admin: ${note}`, 'general');

    // Log action
    (await createClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'escalated_to_firm',
      details: { note },
    });

    revalidatePath(`/lawyer/review/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Error escalating to firm:', error);
    return { success: false, error: 'Failed to escalate to firm' };
  }
}

// =====================================================
// CASE HEALTH UPDATE
// =====================================================

export async function updateCaseHealth(
  requestId: string
): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());

    // Call database function to calculate case health
    const { data, error } = (await createClient()).rpc('calculate_case_health', {
      p_request_id: requestId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Update the case health
    const { error: updateError } = (await createClient()).from('legal_requests')
      .update({ case_health: data })
      .eq('id', requestId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/lawyer/review/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating case health:', error);
    return { success: false, error: 'Failed to update case health' };
  }
}

// =====================================================
// PROFESSIONAL OPINION SUBMISSION
// =====================================================

export async function submitProfessionalOpinion(data: {
  requestId: string;
  opinionType: 'preliminary' | 'final';
  assumptions: string;
  limitations: string;
  validityPeriod: string;
  isFinal: boolean;
  selfReviewChecklist: {
    all_documents_reviewed: boolean;
    clarifications_resolved: boolean;
    legal_research_completed: boolean;
    citations_verified: boolean;
    opinion_proofread: boolean;
  };
  fileData: { name: string; type: string; size: number }; // File metadata, actual upload handled separately
}): Promise<{
  success: boolean; error?: string; version?: number
}> {
  try {
    const supabase = (await createClient());

    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate checklist is complete
    const checklistComplete = Object.values(data.selfReviewChecklist).every((v) => v === true);
    if (!checklistComplete) {
      return { success: false, error: 'Self-review checklist must be completed' };
    }

    // Get current version number
    const { data: existingOpinions } = (await createClient()).from('opinion_submissions')
      .select('version')
      .eq('request_id', data.requestId)
      .order('version', { ascending: false })
      .limit(1);

    const newVersion =
      existingOpinions && existingOpinions.length > 0 ? existingOpinions[0].version + 1 : 1;

    // Check if final opinion already exists
    if (data.isFinal) {
      const { data: finalOpinions } = (await createClient()).from('opinion_submissions')
        .select('id')
        .eq('request_id', data.requestId)
        .eq('is_final', true);

      if (finalOpinions && finalOpinions.length > 0) {
        return { success: false, error: 'A final opinion already exists for this case' };
      }
    }

    // Insert opinion submission
    const { data: opinion, error: insertError } = (await createClient()).from('opinion_submissions')
      .insert({
        request_id: data.requestId,
        lawyer_id: user.id,
        opinion_type: data.opinionType,
        version: newVersion,
        is_final: data.isFinal,
        assumptions: data.assumptions,
        limitations: data.limitations,
        validity_period: data.validityPeriod,
        self_review_checklist: data.selfReviewChecklist,
        // document_id will be set after file upload
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Update request status to opinion_ready if final
    if (data.isFinal) {
      (await createClient()).from('legal_requests')
        .update({ status: 'opinion_ready' })
        .eq('id', data.requestId);
    }

    // Log action
    (await createClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: data.requestId,
      action: 'opinion_submitted',
      details: {
        version: newVersion,
        opinion_type: data.opinionType,
        is_final: data.isFinal,
      },
    });

    revalidatePath(`/lawyer/review/${data.requestId}`);
    return { success: true, version: newVersion };
  } catch (error) {
    console.error('Error submitting opinion:', error);
    return { success: false, error: 'Failed to submit opinion' };
  }
}

// =====================================================
// SECOND OPINION / PEER REVIEW
// =====================================================

export async function getLawyersForSecondOpinion(
  search: string = ''
): Promise<{
  success: boolean; data?: any[]; error?: string
}> {
  try {
    const supabase = (await createClient());
    const session = await auth();
    const user = session?.user;

    if (!user) return { success: false, error: 'Not authenticated' };

    let query = (await createClient()).from('profiles')
      .select('id, full_name, specialization, avatar_url, organization, years_of_experience')
      .eq('role', 'lawyer')
      .neq('id', user.id); // Exclude self

    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return { success: false, error: 'Failed to fetch lawyers' };
  }
}

export async function createSecondOpinionRequest(
  originalRequestId: string,
  targetLawyerId: string,
  note: string
): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());
    const session = await auth();
    const user = session?.user;

    if (!user) return { success: false, error: 'Not authenticated' };

    // Create request
    const { error: insertError } = (await createClient()).from('second_opinion_requests').insert({
      original_request_id: originalRequestId,
      shared_by: user.id, // The current lawyer
      shared_with_lawyer_id: targetLawyerId,
      status: 'pending',
      reviewer_notes: note, // Initial note is the request message
      share_type: 'second_opinion',
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath(`/case/${originalRequestId}/opinion`);
    return { success: true };
  } catch (error) {
    console.error('Error creating second opinion request:', error);
    return { success: false, error: 'Failed to create request' };
  }
}

export async function getIncomingReviewRequests(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const supabase = (await createClient());
    const session = await auth();
    const user = session?.user;

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = (await createClient()).from('second_opinion_requests')
      .select(
        `
                *,
                request:original_request_id (
                    id, 
                    title, 
                    description,
                    priority,
                    due_date,
                    client:client_id (full_name)
                ),
                requester:shared_by (full_name, avatar_url)
            `
      )
      .eq('shared_with_lawyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching review requests:', error);
    return { success: false, error: 'Failed to fetch reviews' };
  }
}

export async function updateSecondOpinionStatus(
  requestId: string, // ID of the second_opinion_request
  status: 'accepted' | 'rejected' | 'completed' | 'changes_requested',
  notes?: string
): Promise<{
  success: boolean; error?: string
}> {
  try {
    const supabase = (await createClient());

    const updates: any = { status };
    if (notes) {
      updates.reviewer_notes = notes; // Append or overwrite? Simple overwrite for now or we need a chat system later.
    }

    const { error } = (await createClient()).from('second_opinion_requests')
      .update(updates)
      .eq('id', requestId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/lawyer/opinions/reviews');
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

// =====================================================
// DASHBOARD AGGREGATION
// =====================================================

import { aggregateCaseData, type LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';

export async function getLawyerDashboardSummaries(): Promise<{
  success: boolean;
  data?: LifecycleSummary[];
  error?: string;
}> {
  const supabase = (await createClient());
  const session = await auth();
  const user = session?.user;

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    // Fetch full hierarchy for resolver
    const { data: requests, error } = (await createClient()).from('legal_requests')
      .select(
        `
                *,
                lawyer:assigned_lawyer_id(id, full_name, avatar_url),
                department:departments(name, sla_hours),
                opinion_versions(id, version_number, is_draft, submitted_at),
                clarifications:legal_clarifications(is_resolved),
                case_messages:messages(read, read_by),
                lawyer_reviews(id)
            `
      )
      .eq('assigned_lawyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const summaries = aggregateCaseData(requests || [], user.id!);
    return { success: true, data: summaries };
  } catch (error: any) {
    console.error('Error fetching dashboard summaries:', error);
    return { success: false, error: error.message };
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
