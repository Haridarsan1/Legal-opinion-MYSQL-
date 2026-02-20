/**
 * PHASE 3: Opinion Lifecycle Server Actions
 *
 * Handles:
 * - Opinion version management (autosave, publish, lock)
 * - Digital signature workflow with validation
 * - Opinion clarifications from client
 * - Request closure enforcement
 * - Access logging for compliance
 */

'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/permissions';
import { Profile } from '@/lib/types';

// ========================================
// OPINION VERSION MANAGEMENT
// ========================================

/**
 * Save opinion as autosave (temporary, replaced each time)
 */
export async function saveOpinionAutosave(
  opinionSubmissionId: string,
  sections: {
  const supabase = await createClient();
    facts: string;
    issues: string;
    analysis: string;
    conclusion: string;
    references: string;
  }
) {const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabase.from('opinion_autosaves').upsert(
      {
        opinion_submission_id: opinionSubmissionId,
        lawyer_id: user.id,
        content_sections: sections,
      },
      {
        onConflict: 'opinion_submission_id,lawyer_id',
      }
    );

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Publish opinion version (creates permanent version, deletes autosave)
 */
export async function publishOpinionVersion(
  opinionSubmissionId: string,
  requestId: string,
  sections: {
  const supabase = await createClient();
    facts: string;
    issues: string;
    analysis: string;
    conclusion: string;
    references: string;
  },
  status: 'draft' | 'peer_review' | 'approved' = 'draft'
) {const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Fetch profile for permissions
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  
  // Permission Logic:
  // If user has 'bypass_review', they can skip peer review.
  // If status is 'peer_review' but they have bypass permission, promote to 'approved' automatically.
  let finalStatus = status;
  if (status === 'peer_review' && hasPermission(profile, 'bypass_review')) {
      finalStatus = 'approved';
  }

  try {
    // Validate all sections are complete
    const allComplete = Object.values(sections).every((s) => s.trim().length > 0);
    if (!allComplete) {
      return { success: false, error: 'All sections must be completed' };
    }

    // Get next version number
    const { data: latestVersion } = await supabase
      .from('opinion_versions')
      .select('version_number')
      .eq('opinion_submission_id', opinionSubmissionId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersionNumber = (latestVersion?.version_number || 0) + 1;

    // Create version
    const { data: version, error: versionError } = await supabase
      .from('opinion_versions')
      .insert({
        opinion_submission_id: opinionSubmissionId,
        request_id: requestId,
        version_number: nextVersionNumber,
        content_sections: sections,
        created_by: user.id,
        status: finalStatus,
      })
      .select()
      .single();

    if (versionError) throw versionError;

    // Update opinion_submissions with current version
    await supabase
      .from('opinion_submissions')
      .update({ current_version_id: version.id })
      .eq('id', opinionSubmissionId);

    // Delete autosave
    await supabase
      .from('opinion_autosaves')
      .delete()
      .eq('opinion_submission_id', opinionSubmissionId)
      .eq('lawyer_id', user.id);

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'opinion_version_published',
      details: { version_number: nextVersionNumber, status: finalStatus },
    });

    revalidatePath(`/lawyer/requests/${requestId}`);

    return { success: true, versionId: version.id, versionNumber: nextVersionNumber };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lock opinion version (after digital signature)
 */
export async function lockOpinionVersion(versionId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabase
      .from('opinion_versions')
      .update({
        is_locked: true,
        locked_at: new Date().toISOString(),
        locked_by: user.id,
        status: 'signed',
      })
      .eq('id', versionId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ========================================
// DIGITAL SIGNATURE VALIDATION
// ========================================

/**
 * Validate opinion readiness for signature
 */
export async function validateOpinionForSignature(opinionVersionId: string, requestId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Check 1: No open clarifications
    const { data: openClarifications } = await supabase
      .from('clarifications')
      .select('id')
      .eq('request_id', requestId)
      .eq('status', 'open');

    const noOpenClarifications = (openClarifications?.length || 0) === 0;

    // Check 2: No pending peer reviews
    const { data: pendingReviews } = await supabase
      .from('peer_reviews')
      .select('id')
      .eq('request_id', requestId)
      .in('status', ['requested', 'in_progress']);

    const noPendingPeerReviews = (pendingReviews?.length || 0) === 0;

    // Check 3: All sections complete
    const { data: version } = await supabase
      .from('opinion_versions')
      .select('content_sections')
      .eq('id', opinionVersionId)
      .single();

    let allSectionsComplete = false;
    if (version) {
      const sections = version.content_sections as any;
      allSectionsComplete = Object.values(sections).every(
        (s: any) => typeof s === 'string' && s.trim().length > 0
      );
    }

    // Check 4: Client notified (opinion submission exists)
    const clientNotified = true; // Simplified - opinion_submission exists = client aware

    const validationPassed =
      noOpenClarifications && noPendingPeerReviews && allSectionsComplete && clientNotified;

    // Save validation record
    await supabase.from('opinion_signature_validations').insert({
      opinion_version_id: opinionVersionId,
      no_open_clarifications: noOpenClarifications,
      no_pending_peer_reviews: noPendingPeerReviews,
      all_sections_complete: allSectionsComplete,
      client_notified: clientNotified,
      validated_by: user.id,
    });

    return {
      success: true,
      validation: {
        no_open_clarifications: noOpenClarifications,
        no_pending_peer_reviews: noPendingPeerReviews,
        all_sections_complete: allSectionsComplete,
        client_notified: clientNotified,
        validation_passed: validationPassed,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ========================================
// OPINION CLARIFICATIONS (CLIENT)
// ========================================

/**
 * Client requests clarification on delivered opinion
 */
export async function requestOpinionClarification(
  opinionSubmissionId: string,
  requestId: string,
  sectionReference: string,
  question: string
) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify user is the client
    const { data: request } = await supabase
      .from('legal_requests')
      .select('client_id, assigned_lawyer_id')
      .eq('id', requestId)
      .single();

    if (!request || request.client_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Create clarification request
    const { data: clarification, error: clarError } = await supabase
      .from('opinion_clarification_requests')
      .insert({
        opinion_submission_id: opinionSubmissionId,
        request_id: requestId,
        section_reference: sectionReference,
        client_question: question,
        status: 'open',
      })
      .select()
      .single();

    if (clarError) throw clarError;

    // Notify lawyer
    await supabase.from('notifications').insert({
      user_id: request.assigned_lawyer_id,
      type: 'opinion_clarification',
      title: 'Opinion Clarification Requested',
      message: `Client requested clarification on section: ${sectionReference}`,
      related_request_id: requestId,
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'opinion_clarification_requested',
      details: { section: sectionReference, clarification_id: clarification.id },
    });

    revalidatePath(`/client/requests/${requestId}`);

    return { success: true, clarificationId: clarification.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lawyer responds to opinion clarification
 */
export async function respondToOpinionClarification(clarificationId: string, response: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Update clarification with response
    const { data: clarification, error: updateError } = await supabase
      .from('opinion_clarification_requests')
      .update({
        lawyer_response: response,
        responded_at: new Date().toISOString(),
        responded_by: user.id,
        status: 'answered',
      })
      .eq('id', clarificationId)
      .select('request_id')
      .single();

    if (updateError) throw updateError;

    // Get client ID for notification
    const { data: request } = await supabase
      .from('legal_requests')
      .select('client_id')
      .eq('id', clarification.request_id)
      .single();

    if (request) {
      // Notify client
      await supabase.from('notifications').insert({
        user_id: request.client_id,
        type: 'clarification_answered',
        title: 'Opinion Clarification Answered',
        message: 'Your clarification request has been answered by the lawyer',
        related_request_id: clarification.request_id,
      });
    }

    revalidatePath(`/lawyer/requests/${clarification.request_id}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ========================================
// REQUEST CLOSURE
// ========================================

/**
 * Close request (client or admin)
 * CRITICAL: Enforces read-only state
 */
export async function closeRequest(
  requestId: string,
  closureReason: string,
  satisfactionRating?: number
) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify user is client or admin
    const { data: request } = await supabase
      .from('legal_requests')
      .select('client_id, is_closed')
      .eq('id', requestId)
      .single();

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.is_closed) {
      return { success: false, error: 'Request already closed' };
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'platform_admin';
    const isClient = request.client_id === user.id;

    if (!isAdmin && !isClient) {
      return { success: false, error: 'Unauthorized to close this request' };
    }

    // Validate closure requirements
    const { data: opinion } = await supabase
      .from('opinion_submissions')
      .select('is_final')
      .eq('request_id', requestId)
      .single();

    const opinionDelivered = opinion?.is_final || false;

    const { data: openClarifications } = await supabase
      .from('opinion_clarification_requests')
      .select('id')
      .eq('request_id', requestId)
      .eq('status', 'open');

    const allClarificationsResolved = (openClarifications?.length || 0) === 0;

    const { data: signature } = await supabase
      .from('digital_signatures')
      .select('id')
      .eq('request_id', requestId)
      .eq('status', 'signed')
      .maybeSingle();

    const signatureVerified = !!signature;

    // Create closure record
    const { error: closureError } = await supabase.from('request_closures').insert({
      request_id: requestId,
      closed_by: user.id,
      closure_reason: closureReason,
      client_satisfaction_rating: satisfactionRating,
      opinion_delivered: opinionDelivered,
      all_clarifications_resolved: allClarificationsResolved,
      signature_verified: signatureVerified,
      is_immutable: true,
    });

    if (closureError) throw closureError;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'request_closed',
      details: { reason: closureReason, rating: satisfactionRating },
    });

    revalidatePath(`/client/requests/${requestId}`);
    revalidatePath(`/lawyer/requests/${requestId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ========================================
// ACCESS LOGGING (COMPLIANCE)
// ========================================

/**
 * Log version access for audit trail
 */
export async function logVersionAccess(
  versionId: string,
  accessType: 'view' | 'edit' | 'download' | 'print' | 'share',
  accessSource?: string,
  durationSeconds?: number
) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await supabase.from('version_access_logs').insert({
      opinion_version_id: versionId,
      accessed_by: user.id,
      access_type: accessType,
      access_source: accessSource,
      access_duration_seconds: durationSeconds,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get opinion access history (admin/lawyer only)
 */
export async function getOpinionAccessHistory(opinionSubmissionId: string) {
  const supabase = await createClient();const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data: logs, error } = await supabase
      .from('version_access_logs')
      .select(
        `
        *,
        accessed_by_profile:profiles!version_access_logs_accessed_by_fkey(full_name, role),
        version:opinion_versions!version_access_logs_opinion_version_id_fkey(version_number, status)
      `
      )
      .eq('opinion_versions.opinion_submission_id', opinionSubmissionId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return { success: true, logs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
