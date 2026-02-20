'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Server Actions for Lawyer Dashboard
 */

export async function updateCaseStatus(caseId: string, status: string, notes?: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Update case status
    const { data, error } = await supabase
      .from('legal_requests')
      .update({ status })
      .eq('id', caseId)
      .eq('assigned_lawyer_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: caseId,
      action: 'status_updated',
      details: { old_status: 'unknown', new_status: status, notes },
    });

    // Notify client
    await supabase.from('notifications').insert({
      user_id: data.client_id,
      type: 'status_updated',
      title: 'Case Status Updated',
      message: `Your case status has been updated to: ${status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
      related_request_id: caseId,
    });

    revalidatePath('/dashboard/lawyer/assigned');
    revalidatePath('/dashboard/lawyer');
    revalidatePath(`/dashboard/lawyer/cases/${caseId}`);

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function acceptCase(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const { data, error } = await supabase
      .from('legal_requests')
      .update({ 
        status: 'accepted',
        assigned_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .eq('assigned_lawyer_id', user.id)
      .eq('status', 'pending_lawyer_response')
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: user.id,
        request_id: caseId,
        action: 'case_accepted',
        details: { timestamp: new Date().toISOString() }
      });
  
    await supabase.from('notifications').insert({
        user_id: data.client_id,
        type: 'case_accepted',
        title: 'Lawyer Accepted Case',
        message: 'Your lawyer has accepted the case request.',
        related_request_id: caseId,
    });

    revalidatePath('/dashboard/lawyer');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function declineCase(caseId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const { data, error } = await supabase
      .from('legal_requests')
      .update({ 
        status: 'rejected',
        // keep assigned_lawyer_id for record? or clear it? 
        // Logic says "rejected" status implies this lawyer rejected it.
      })
      .eq('id', caseId)
      .eq('assigned_lawyer_id', user.id)
      .eq('status', 'pending_lawyer_response')
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: user.id,
        request_id: caseId,
        action: 'case_declined',
        details: { reason }
      });
  
    await supabase.from('notifications').insert({
        user_id: data.client_id,
        type: 'case_declined',
        title: 'Lawyer Declined Case',
        message: 'The lawyer has declined your case request.',
        related_request_id: caseId,
    });

    revalidatePath('/dashboard/lawyer');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function requestClarification(caseId: string, subject: string, message: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Create clarification request
    const { data, error } = await supabase
      .from('clarifications')
      .insert({
        request_id: caseId,
        requester_id: user.id,
        subject,
        message,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    // Get case details for notification
    const { data: caseData } = await supabase
      .from('legal_requests')
      .select('client_id, title')
      .eq('id', caseId)
      .single();

    if (caseData) {
      // Notify client
      await supabase.from('notifications').insert({
        user_id: caseData.client_id,
        type: 'clarification_requested',
        title: 'Clarification Requested',
        message: `Your lawyer has requested clarification on: ${subject}`,
        related_request_id: caseId,
      });
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: caseId,
      action: 'clarification_requested',
      details: { subject },
    });

    revalidatePath('/dashboard/lawyer/clarifications');
    revalidatePath(`/dashboard/lawyer/review/${caseId}`);

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitOpinion(caseId: string, opinionText: string, opinionFile?: File) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    let opinionUrl = null;

    // Upload opinion file if provided
    if (opinionFile) {
      const fileExt = opinionFile.name.split('.').pop();
      const fileName = `${caseId}-opinion-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${caseId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('legal-opinions')
        .upload(filePath, opinionFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('legal-opinions').getPublicUrl(filePath);

      opinionUrl = publicUrl;
    }

    // Update case with opinion
    const { data, error } = await supabase
      .from('legal_requests')
      .update({
        status: 'opinion_ready',
        opinion_text: opinionText,
        opinion_url: opinionUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .eq('assigned_lawyer_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: caseId,
      action: 'opinion_submitted',
      details: { has_file: !!opinionFile },
    });

    // Notify client
    await supabase.from('notifications').insert({
      user_id: data.client_id,
      type: 'opinion_ready',
      title: 'Legal Opinion Ready',
      message: 'Your legal opinion has been submitted and is ready for review.',
      related_request_id: caseId,
    });

    revalidatePath('/dashboard/lawyer/assigned');
    revalidatePath('/dashboard/lawyer');

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveDraft(caseId: string, draftText: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Save draft as internal note or in a drafts table
    const { data, error } = await supabase
      .from('opinion_drafts')
      .upsert({
        request_id: caseId,
        lawyer_id: user.id,
        draft_text: draftText,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addInternalNote(caseId: string, note: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data, error } = await supabase
      .from('internal_notes')
      .insert({
        request_id: caseId,
        lawyer_id: user.id,
        note,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/dashboard/lawyer/review/${caseId}`);

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAvailability(status: 'available' | 'busy' | 'on_leave') {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ availability_status: status })
      .eq('id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/lawyer/profile');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSpecializations(specializations: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabase.from('profiles').update({ specializations }).eq('id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/lawyer/profile');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

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
    const { error } = await supabase
      .from('clarifications')
      .update({ status: 'resolved' })
      .eq('id', clarificationId)
      .eq('requester_id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/lawyer/clarifications');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLawyerMarketplaceMetrics() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get all proposals
    const { data: proposals, error } = await supabase
      .from('request_proposals')
      .select('status')
      .eq('lawyer_id', user.id);

    if (error) throw error;

    const totalProposals = proposals?.length || 0;
    const acceptedProposals = proposals?.filter((p) => p.status === 'accepted').length || 0;
    const pendingProposals =
      proposals?.filter((p) => ['submitted', 'shortlisted'].includes(p.status)).length || 0;

    const successRate =
      totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;

    // Get bookmarked count
    const { count: bookmarkedCount } = await supabase
      .from('saved_requests')
      .select('*', { count: 'exact', head: true })
      .eq('lawyer_id', user.id);

    return {
      success: true,
      data: {
        totalProposals,
        acceptedProposals,
        pendingProposals,
        successRate,
        bookmarkedCount: bookmarkedCount || 0,
      },
    };
  } catch (error: any) {
    console.error('Error fetching marketplace metrics:', error);
    return { success: false, error: error.message };
  }
}
