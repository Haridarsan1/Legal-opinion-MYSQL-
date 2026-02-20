'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Acknowledge receipt of the legal opinion.
 * Transitions status from 'opinion_ready' -> 'client_acknowledged'.
 */
export async function acknowledgeOpinion(requestId: string) {
  const supabase = await createClient();try {
    const session = await auth();
  const user = session?.user;

    if (!user) return { success: false, error: 'Unauthorized' };

    // Fetch request to verify ownership and status
    const { data: request } = await supabase
      .from('legal_requests')
      .select('status, client_id')
      .eq('id', requestId)
      .single();

    if (!request) return { success: false, error: 'Request not found' };
    if (request.client_id !== user.id) return { success: false, error: 'Unauthorized' };

    // Strict status check: Can only acknowledge if opinion is ready
    // (Assuming 'opinion_ready' is the status set when lawyer publishes)
    if (request.status !== 'opinion_ready') {
      return { success: false, error: 'Opinion is not ready for acknowledgement' };
    }

    // Update status
    const { error } = await supabase
      .from('legal_requests')
      .update({
        status: 'client_acknowledged',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;

    // Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'client_acknowledged_opinion',
      entity_type: 'legal_request',
      entity_id: requestId,
      details: { message: 'Client acknowledged receipt of legal opinion' },
    });

    revalidatePath(`/client/requests/${requestId}`);
    revalidatePath(`/case/${requestId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error acknowledging opinion:', error);
    return { success: false, error: error.message || 'Failed to acknowledge opinion' };
  }
}

/**
 * Confirm no further questions.
 * Transitions status from 'client_acknowledged' -> 'no_further_queries_confirmed'.
 * Allowed only if all queries are resolved.
 */
export async function confirmNoFurtherQuestions(requestId: string) {
  const supabase = await createClient();try {
    const session = await auth();
  const user = session?.user;

    if (!user) return { success: false, error: 'Unauthorized' };

    // Fetch request
    const { data: request } = await supabase
      .from('legal_requests')
      .select('status, client_id, assigned_lawyer_id, request_number')
      .eq('id', requestId)
      .single();

    if (!request) return { success: false, error: 'Request not found' };
    if (request.client_id !== user.id) return { success: false, error: 'Unauthorized' };

    // Status Check
    if (request.status !== 'client_acknowledged') {
      return { success: false, error: 'Cannot confirm. Opinion must be acknowledged first.' };
    }

    // Check for unresolved queries
    const { count, error: countError } = await supabase
      .from('post_opinion_queries')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('status', 'open');

    if (countError) throw countError;

    if (count && count > 0) {
      return {
        success: false,
        error: `You have ${count} open queries. Please wait for a response before confirming.`,
      };
    }

    // Update status
    const { error } = await supabase
      .from('legal_requests')
      .update({
        status: 'no_further_queries_confirmed',
        client_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;

    // Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'client_confirmed_no_questions',
      entity_type: 'legal_request',
      entity_id: requestId,
      details: { message: 'Client confirmed no further questions' },
    });

    // Notify Assigned Lawyer
    if (request.assigned_lawyer_id) {
      await supabase.from('notifications').insert({
        user_id: request.assigned_lawyer_id,
        type: 'client_update',
        title: 'Client Satisfaction Confirmed',
        message: `Client has confirmed no further questions for case ${request.request_number}. You may now close the case.`,
        related_request_id: requestId,
      });
    }

    revalidatePath(`/client/requests/${requestId}`);
    revalidatePath(`/case/${requestId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error confirming no questions:', error);
    return { success: false, error: error.message || 'Failed to confirm' };
  }
}

/**
 * Submit a post-opinion query.
 * Allowed only if status is 'client_acknowledged'.
 */
export async function submitPostOpinionQuery(requestId: string, queryText: string) {
  const supabase = await createClient();try {
    const session = await auth();
  const user = session?.user;

    if (!user) return { success: false, error: 'Unauthorized' };

    // Fetch request
    const { data: request } = await supabase
      .from('legal_requests')
      .select('status, client_id')
      .eq('id', requestId)
      .single();

    if (!request) return { success: false, error: 'Request not found' };
    if (request.client_id !== user.id) return { success: false, error: 'Unauthorized' };

    // Logic Rule: Can only raise queries if acknowledged or strictly in post-opinion phase
    // We allow it in 'client_acknowledged' status.
    // If status is 'case_closed', strictly NO new queries.
    if (request.status === 'case_closed') {
      return { success: false, error: 'Case is closed. No further queries allowed.' };
    }
    if (request.status === 'no_further_queries_confirmed') {
      return { success: false, error: 'You have already confirmed no further questions.' };
    }
    if (request.status !== 'client_acknowledged') {
      return { success: false, error: 'You must acknowledge the opinion before raising queries.' };
    }

    // Insert Query
    const { error } = await supabase.from('post_opinion_queries').insert({
      request_id: requestId,
      query_text: queryText,
      raised_by: user.id,
      status: 'open',
    });

    if (error) throw error;

    // Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'post_opinion_query_raised',
      entity_type: 'legal_request',
      entity_id: requestId,
      details: { query_content: queryText.substring(0, 50) + '...' },
    });

    revalidatePath(`/client/requests/${requestId}`);
    revalidatePath(`/case/${requestId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting query:', error);
    return { success: false, error: error.message || 'Failed to submit query' };
  }
}

/**
 * Respond to a post-opinion query.
 * Allowed only for the assigned lawyer.
 */
export async function resolvePostOpinionQuery(queryId: string, responseText: string) {
  const supabase = await createClient();try {
    const session = await auth();
  const user = session?.user;

    if (!user) return { success: false, error: 'Unauthorized' };

    // Fetch query and linked request to verify lawyer assignment
    const { data: query } = await supabase
      .from('post_opinion_queries')
      .select(
        `
                *,
                request:legal_requests(id, assigned_lawyer_id, status)
            `
      )
      .eq('id', queryId)
      .single();

    if (!query) return { success: false, error: 'Query not found' };

    // Check if request is closed
    if (query.request.status === 'case_closed') {
      return { success: false, error: 'Case is closed. Cannot respond to queries.' };
    }

    // Check permission
    if (query.request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'Only the assigned lawyer can respond' };
    }

    // Update Query
    const { error } = await supabase
      .from('post_opinion_queries')
      .update({
        response_text: responseText,
        responded_by: user.id,
        responded_at: new Date().toISOString(),
        status: 'resolved',
      })
      .eq('id', queryId);

    if (error) throw error;

    // Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'post_opinion_query_resolved',
      entity_type: 'legal_request', // Linking to request for timeline visibility
      entity_id: query.request.id,
      details: { query_id: queryId, response_preview: responseText.substring(0, 50) + '...' },
    });

    revalidatePath(`/case/${query.request.id}`);
    revalidatePath(`/client/requests/${query.request.id}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error resolving query:', error);
    return { success: false, error: error.message || 'Failed to resolve query' };
  }
}

/**
 * Close the case formally.
 * Allowed only if all queries are resolved and client has acknowledged.
 */
export async function closeCase(requestId: string) {
  const supabase = await createClient();try {
    const session = await auth();
  const user = session?.user;

    if (!user) return { success: false, error: 'Unauthorized' };

    // Fetch request details
    const { data: request } = await supabase
      .from('legal_requests')
      .select('status, assigned_lawyer_id')
      .eq('id', requestId)
      .single();

    if (!request) return { success: false, error: 'Request not found' };
    if (request.assigned_lawyer_id !== user.id) return { success: false, error: 'Unauthorized' };

    // Status Pre-requisites
    if (request.status !== 'no_further_queries_confirmed') {
      return {
        success: false,
        error: 'Client must confirm "No Further Questions" before you can close the case.',
      };
    }

    // Check for open queries (Redundant safety check)
    const { count, error: countError } = await supabase
      .from('post_opinion_queries')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('status', 'open');

    if (countError) throw countError;

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot close case. There are ${count} unresolved post-opinion queries.`,
      };
    }

    // Close Case
    const { error } = await supabase
      .from('legal_requests')
      .update({
        status: 'case_closed',
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;

    // Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'case_closed',
      entity_type: 'legal_request',
      entity_id: requestId,
      details: { message: 'Lawyer formally closed the case' },
    });

    revalidatePath(`/case/${requestId}`);
    revalidatePath('/lawyer/requests');

    return { success: true };
  } catch (error: any) {
    console.error('Error closing case:', error);
    return { success: false, error: error.message || 'Failed to close case' };
  }
}
