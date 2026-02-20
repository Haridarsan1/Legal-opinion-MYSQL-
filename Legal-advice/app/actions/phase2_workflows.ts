'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/permissions';
import { Profile } from '@/lib/types';

/**
 * Accept request - Lawyer marks request as accepted, documents become visible
 * CRITICAL: This triggers document visibility
 */
export async function acceptRequest(requestId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify user is the assigned lawyer
    const { data: request } = await supabase
      .from('legal_requests')
      .select('assigned_lawyer_id, request_number, client_id, title')
      .eq('id', requestId)
      .single();

    if (!request || request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'You are not assigned to this request' };
    }

    // Create acceptance record
    const { data: acceptance, error: acceptError } = await supabase
      .from('request_acceptance')
      .upsert({
        request_id: requestId,
        lawyer_id: user.id,
        accepted: true,
        accepted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (acceptError) throw acceptError;

    // Update legal_requests to mark acceptance
    const { error: updateError } = await supabase
      .from('legal_requests')
      .update({
        accepted_by_lawyer: true,
        lawyer_acceptance_status: 'accepted',
        lawyer_acceptance_date: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Log status change
    await supabase.from('request_status_history').insert({
      request_id: requestId,
      from_status: 'submitted',
      to_status: 'assigned',
      changed_by: user.id,
      reason: 'Lawyer accepted the request',
    });

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'request_accepted',
      details: { acceptance_id: acceptance?.id },
    });

    // Notify client
    if (request?.client_id) {
      await supabase.from('notifications').insert({
        user_id: request.client_id,
        type: 'request_accepted',
        title: 'Request Accepted',
        message: `Your request "${request.title ?? request.request_number}" was accepted by your lawyer.`,
        related_request_id: requestId,
      });
    }

    revalidatePath(`/lawyer/requests/${requestId}`);
    revalidatePath('/lawyer/requests');
    revalidatePath('/lawyer/assigned');

    return { success: true, data: acceptance };
  } catch (error: any) {
    console.error('Error accepting request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reject request - Lawyer declines the assigned request
 */
export async function rejectRequest(requestId: string, note?: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify user is the assigned lawyer
    const { data: request } = await supabase
      .from('legal_requests')
      .select('assigned_lawyer_id, request_number, client_id, title')
      .eq('id', requestId)
      .single();

    if (!request || request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'You are not assigned to this request' };
    }

    // Mark rejection
    const { error: updateError } = await supabase
      .from('legal_requests')
      .update({
        accepted_by_lawyer: false,
        lawyer_acceptance_status: 'rejected',
        lawyer_acceptance_note: note || null,
        lawyer_acceptance_date: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Log status change
    await supabase.from('request_status_history').insert({
      request_id: requestId,
      from_status: 'assigned',
      to_status: 'assigned',
      changed_by: user.id,
      reason: 'Lawyer rejected the request',
    });

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'request_rejected',
      details: { note },
    });

    // Notify client
    if (request?.client_id) {
      await supabase.from('notifications').insert({
        user_id: request.client_id,
        type: 'request_rejected',
        title: 'Request Rejected',
        message: `Your request "${request.title ?? request.request_number}" was rejected by the lawyer.`,
        related_request_id: requestId,
      });
    }

    revalidatePath(`/lawyer/requests/${requestId}`);
    revalidatePath('/lawyer/requests');
    revalidatePath('/lawyer/assigned');

    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get request acceptance status
 */
export async function getRequestAcceptance(requestId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data: acceptance, error } = await supabase
      .from('request_acceptance')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, data: acceptance };
  } catch (error: any) {
    console.error('Error fetching acceptance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create clarification request - Lawyer sends structured question
 */
export async function createClarificationRequest(
  requestId: string,
  subject: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!message.trim()) {
    return { success: false, error: 'Clarification message required' };
  }

  try {
    // Verify user is assigned lawyer
    const { data: request } = await supabase
      .from('legal_requests')
      .select('assigned_lawyer_id, status')
      .eq('id', requestId)
      .single();

    if (!request || request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'You are not assigned to this request' };
    }

    // Create clarification
    const { data: clarification, error: clarError } = await supabase
      .from('clarifications')
      .insert({
        request_id: requestId,
        requester_id: user.id,
        subject: subject,
        message: message,
        priority: priority,
        is_resolved: false,
      })
      .select()
      .single();

    if (clarError) throw clarError;

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'clarification_requested',
      details: { clarification_id: clarification?.id },
    });

    // UPDATE STATUS to 'clarification_required'
    await supabase
      .from('legal_requests')
      .update({ status: 'clarification_required' })
      .eq('id', requestId);

    await supabase.from('request_status_history').insert({
      request_id: requestId,
      from_status: request.status,
      to_status: 'clarification_required',
      changed_by: user.id,
      reason: 'Clarification requested by lawyer',
    });

    revalidatePath(`/lawyer/requests/${requestId}`);

    return { success: true, data: clarification };
  } catch (error: any) {
    console.error('Error creating clarification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reply to clarification - Client or lawyer responds
 */
export async function replytoClarification(
  clarificationId: string,
  reply: string,
  attachments?: any[]
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!reply.trim()) {
    return { success: false, error: 'Reply text required' };
  }

  try {
    // Get clarification
    const { data: clarification } = await supabase
      .from('clarifications')
      .select('request_id, requester_id')
      .eq('id', clarificationId)
      .single();

    if (!clarification) {
      return { success: false, error: 'Clarification not found' };
    }

    // Verify user is involved
    const { data: request } = await supabase
      .from('legal_requests')
      .select('client_id')
      .eq('id', clarification.request_id)
      .single();

    const isClient = request?.client_id === user.id;
    const isLawyer = clarification.requester_id === user.id;

    if (!isClient && !isLawyer) {
      return { success: false, error: 'You cannot reply to this clarification' };
    }

    // Create reply
    const { data: clarReply, error: replyError } = await supabase
      .from('clarification_replies')
      .insert({
        clarification_id: clarificationId,
        sender_id: user.id,
        reply_text: reply,
        attachments: attachments || null,
      })
      .select()
      .single();

    if (replyError) throw replyError;

    // Create notification
    const recipientId = isClient ? clarification.requester_id : request?.client_id;
    if (recipientId) {
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type: 'clarification_reply',
        title: 'Clarification Response',
        message: 'A new response to your clarification request',
        related_request_id: clarification.request_id,
      });
    }

    revalidatePath(`/lawyer/requests/${clarification.request_id}`);
    revalidatePath(`/client/requests/${clarification.request_id}`);

    return { success: true, data: clarReply };
  } catch (error: any) {
    console.error('Error replying to clarification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark clarification as resolved
 */
export async function markClarificationResolved(clarificationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Update clarification
    const { data: clarification, error: updateError } = await supabase
      .from('clarifications')
      .update({ is_resolved: true })
      .eq('id', clarificationId)
      .select('request_id')
      .single();

    if (updateError) throw updateError;

    // Check if ALL clarifications are resolved
    const { count, error: countError } = await supabase
      .from('clarifications')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', clarification.request_id)
      .eq('is_resolved', false);

    // If no unresolved clarifications, move to drafting_opinion
    if (count === 0) {
      await supabase
        .from('legal_requests')
        .update({ status: 'drafting_opinion' })
        .eq('id', clarification.request_id);

      // Log status change
      await supabase.from('request_status_history').insert({
        request_id: clarification.request_id,
        to_status: 'drafting_opinion',
        changed_by: user.id,
        reason: 'All clarifications resolved',
      });
    }

    revalidatePath(`/lawyer/requests/${clarification.request_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error resolving clarification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Request peer review on opinion draft
 */
export async function requestPeerReview(opinionId: string, reviewerId: string, reason?: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify user is author of opinion
    const { data: opinion } = await supabase
      .from('opinion_submissions')
      .select('request_id, lawyer_id, is_final')
      .eq('id', opinionId)
      .single();

    if (!opinion || opinion.lawyer_id !== user.id) {
      return { success: false, error: 'You are not the author of this opinion' };
    }

    if (opinion.is_final) {
      return { success: false, error: 'Cannot request peer review on final opinion' };
    }

    // Verify reviewer exists and is a lawyer
    const { data: reviewer } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', reviewerId)
      .single();

    if (!reviewer || !hasPermission(reviewer, 'review_drafts')) {
      return { success: false, error: 'Invalid reviewer or reviewer does not have permission' };
    }

    // Create peer review request
    const { data: peerReview, error: prError } = await supabase
      .from('peer_reviews')
      .insert({
        opinion_submission_id: opinionId,
        request_id: opinion.request_id,
        requested_by: user.id,
        reviewer_id: reviewerId,
        status: 'requested',
      })
      .select()
      .single();

    if (prError) throw prError;

    // Notify reviewer (peer review invisible to client)
    await supabase.from('notifications').insert({
      user_id: reviewerId,
      type: 'peer_review_requested',
      title: 'Peer Review Requested',
      message: 'You have been asked to review a legal opinion',
      related_request_id: opinion.request_id,
    });

    revalidatePath(`/lawyer/opinions`);

    return { success: true, data: peerReview };
  } catch (error: any) {
    console.error('Error requesting peer review:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Submit peer review feedback
 */
export async function submitPeerReview(
  peerReviewId: string,
  status: 'approved' | 'changes_requested' | 'rejected',
  feedback: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify user is the reviewer
    const { data: review } = await supabase
      .from('peer_reviews')
      .select('reviewer_id, requested_by, opinion_submission_id')
      .eq('id', peerReviewId)
      .single();

    if (!review || review.reviewer_id !== user.id) {
      return { success: false, error: 'You are not the assigned reviewer' };
    }

    // Update review
    const { data: updated, error: updateError } = await supabase
      .from('peer_reviews')
      .update({
        status: status,
        feedback: feedback,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', peerReviewId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Notify opinion author
    await supabase.from('notifications').insert({
      user_id: review.requested_by,
      type: 'peer_review_completed',
      title: 'Peer Review Completed',
      message: `Peer review ${status.replace(/_/g, ' ')}: ${feedback}`,
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error submitting peer review:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Request required documents from client
 */
export async function requestRequiredDocuments(requestId: string, message?: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Unauthorized' };

  try {
    await supabase
      .from('legal_requests')
      .update({ status: 'documents_pending' })
      .eq('id', requestId);

    await supabase.from('request_status_history').insert({
      request_id: requestId,
      from_status: 'in_review', // Assumption
      to_status: 'documents_pending',
      changed_by: user.id,
      reason: message || 'Documents requested',
    });

    // Notify client
    // ... (fetch client_id and notify)

    revalidatePath(`/lawyer/requests/${requestId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Notify that documents have been documents uploaded
 */
export async function notifyDocumentsUploaded(requestId: string) {
  const supabase = await createClient();

  // Check if we should move to in_review
  // Only if current status is 'documents_pending' or similar
  const { data: request } = await supabase
    .from('legal_requests')
    .select('status')
    .eq('id', requestId)
    .single();

  if (request?.status === 'documents_pending') {
    await supabase.from('legal_requests').update({ status: 'in_review' }).eq('id', requestId);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('request_status_history').insert({
        request_id: requestId,
        from_status: 'documents_pending',
        to_status: 'in_review',
        changed_by: user.id,
        reason: 'Documents uploaded by client',
      });
    }

    revalidatePath(`/client/requests/${requestId}`);
    revalidatePath(`/lawyer/requests/${requestId}`);
  }

  return { success: true };
}

/**
 * Get request timeline (status history + key events)
 */
export async function getRequestTimeline(requestId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get status history
    const { data: statusHistory, error: statusError } = await supabase
      .from('request_status_history')
      .select(
        `
                *,
                user:profiles!request_status_history_changed_by_fkey(full_name)
            `
      )
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (statusError) throw statusError;

    // Get key audit events
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('request_id', requestId)
      .in('action', [
        'request_created',
        'request_accepted',
        'clarification_requested',
        'document_uploaded',
        'opinion_submitted',
      ])
      .order('created_at', { ascending: true });

    if (auditError) throw auditError;

    // Merge and sort
    const timeline = [
      ...statusHistory.map((s: any) => ({
        type: 'status_change',
        timestamp: s.created_at,
        data: s,
      })),
      ...auditLogs.map((a: any) => ({
        type: 'audit_event',
        timestamp: a.created_at,
        data: a,
      })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return { success: true, data: timeline };
  } catch (error: any) {
    console.error('Error fetching timeline:', error);
    return { success: false, error: error.message };
  }
}
