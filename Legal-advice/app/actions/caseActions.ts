'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Define valid status transitions
const STATUS_FLOW: Record<string, string[]> = {
  submitted: ['assigned', 'cancelled'],
  assigned: ['in_review', 'cancelled'],
  in_review: ['documents_pending', 'clarification_required', 'drafting_opinion', 'cancelled'],
  documents_pending: ['in_review', 'cancelled'],
  clarification_required: ['in_review', 'cancelled'],
  drafting_opinion: ['opinion_ready', 'in_review', 'cancelled'],
  opinion_ready: ['client_acknowledged', 'completed', 'in_review'], // Added client_acknowledged
  client_acknowledged: ['case_closed', 'completed'], // New status
  case_closed: [], // Terminal state
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

type RequestStatus = string;

export async function updateCaseStatus(
  requestId: string,
  newStatus: RequestStatus,
  notes?: string
) {
  const supabase = await createClient();try {
    

    // Get current user
    const session = await auth();
  const user = session?.user;
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get current request
    const { data: request, error: fetchError } = await supabase
      .from('legal_requests')
      .select('status, assigned_lawyer_id, client_id')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return { success: false, error: 'Request not found' };
    }

    // Permission check: only lawyer can update status
    if (request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'Only assigned lawyer can update status' };
    }

    // Validate transition
    const currentStatus = request.status as RequestStatus;
    const validTransitions = STATUS_FLOW[currentStatus] || [];

    if (!validTransitions.includes(newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions.join(', ')}`,
      };
    }

    // Update status
    const { error: updateError } = await supabase
      .from('legal_requests')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'status_updated',
      entity_type: 'legal_request',
      entity_id: requestId,
      details: {
        from: currentStatus,
        to: newStatus,
        notes: notes || null,
      },
    });

    // Revalidate paths
    revalidatePath(`/case/${requestId}`);
    revalidatePath('/lawyer/requests');
    revalidatePath('/client/track');

    return { success: true };
  } catch (error) {
    console.error('Error updating case status:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function acceptCase(requestId: string) {
  const supabase = await createClient();try {
    const session = await auth();
  const user = session?.user;
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify lawyer is assigned
    const { data: request } = await supabase
      .from('legal_requests')
      .select('assigned_lawyer_id, status')
      .eq('id', requestId)
      .single();

    if (!request || request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'Not authorized for this case' };
    }

    // Update to accepted status
    const { error } = await supabase
      .from('legal_requests')
      .update({
        lawyer_acceptance_status: 'accepted',
        lawyer_accepted_at: new Date().toISOString(),
        status: 'in_review',
      })
      .eq('id', requestId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'case_accepted',
      entity_type: 'legal_request',
      entity_id: requestId,
      details: { message: 'Lawyer accepted case assignment' },
    });

    revalidatePath(`/case/${requestId}`);
    revalidatePath('/lawyer/requests');

    return { success: true };
  } catch (error) {
    console.error('Error accepting case:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function rejectCase(requestId: string, reason: string) {
  const supabase = await createClient();try {
    const session = await auth();
  const user = session?.user;
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify lawyer is assigned
    const { data: request } = await supabase
      .from('legal_requests')
      .select('assigned_lawyer_id')
      .eq('id', requestId)
      .single();

    if (!request || request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'Not authorized for this case' };
    }

    // Update to rejected status
    const { error } = await supabase
      .from('legal_requests')
      .update({
        lawyer_acceptance_status: 'rejected',
        lawyer_rejected_at: new Date().toISOString(),
        status: 'submitted', // Return to submitted for re-assignment
      })
      .eq('id', requestId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'case_rejected',
      entity_type: 'legal_request',
      entity_id: requestId,
      details: { reason },
    });

    revalidatePath(`/case/${requestId}`);
    revalidatePath('/lawyer/requests');

    return { success: true };
  } catch (error) {
    console.error('Error rejecting case:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function calculateSLA(requestId: string) {
  const supabase = await createClient();try {
    

    const { data: request } = await supabase
      .from('legal_requests')
      .select('created_at, status, sla_deadline')
      .eq('id', requestId)
      .single();

    if (!request) {
      return { slaStatus: 'unknown', daysRemaining: 0 };
    }

    const deadline = request.sla_deadline ? new Date(request.sla_deadline) : null;
    const now = new Date();

    if (!deadline || request.status === 'completed' || request.status === 'cancelled') {
      return { slaStatus: 'none', daysRemaining: 0 };
    }

    const msRemaining = deadline.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    let slaStatus: 'onTrack' | 'warning' | 'overdue';

    if (daysRemaining < 0) {
      slaStatus = 'overdue';
    } else if (daysRemaining <= 2) {
      slaStatus = 'warning';
    } else {
      slaStatus = 'onTrack';
    }

    return { slaStatus, daysRemaining, deadline: deadline.toISOString() };
  } catch (error) {
    console.error('Error calculating SLA:', error);
    return { slaStatus: 'unknown', daysRemaining: 0 };
  }
}
