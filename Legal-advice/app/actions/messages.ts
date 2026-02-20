'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Send a message in a request thread
 */
export async function sendMessage(
  requestId: string,
  recipientId: string,
  messageText: string,
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

  if (!messageText.trim()) {
    return { success: false, error: 'Message cannot be empty' };
  }

  try {
    // Verify user is part of the request (client or assigned lawyer)
    const { data: request, error: requestError } = await supabase
      .from('legal_requests')
      .select('id, client_id, assigned_lawyer_id, request_number')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found' };
    }

    const isClient = request.client_id === user.id;
    const isLawyer = request.assigned_lawyer_id === user.id;

    if (!isClient && !isLawyer) {
      return { success: false, error: 'You are not authorized to send messages for this request' };
    }

    // Verify recipient is the other party
    const expectedRecipient = isClient ? request.assigned_lawyer_id : request.client_id;
    if (recipientId !== expectedRecipient) {
      return { success: false, error: 'Invalid recipient' };
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('request_messages')
      .insert({
        request_id: requestId,
        sender_id: user.id,
        recipient_id: recipientId,
        message_text: messageText,
        attachments: attachments || null,
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Create notification for recipient
    await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `You have a new message regarding request ${request.request_number}`,
      related_request_id: requestId,
    });

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'message_sent',
      details: { recipient_id: recipientId },
    });

    revalidatePath('/client/messages');
    revalidatePath('/lawyer/messages');

    return { success: true, data: message };
  } catch (error: any) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all messages for a request
 */
export async function getRequestMessages(requestId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify user is part of the request
    const { data: request, error: requestError } = await supabase
      .from('legal_requests')
      .select('id, client_id, assigned_lawyer_id')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found' };
    }

    const isClient = request.client_id === user.id;
    const isLawyer = request.assigned_lawyer_id === user.id;

    if (!isClient && !isLawyer) {
      return { success: false, error: 'You are not authorized to view messages for this request' };
    }

    // Fetch messages with sender details
    const { data: messages, error: messagesError } = await supabase
      .from('request_messages')
      .select(
        `
                id,
                message_text,
                attachments,
                is_read,
                created_at,
                sender_id,
                recipient_id,
                sender:profiles!request_messages_sender_id_fkey(id, full_name, avatar_url),
                recipient:profiles!request_messages_recipient_id_fkey(id, full_name, avatar_url)
            `
      )
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return { success: true, data: messages || [] };
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark messages as read for the current user
 */
export async function markMessagesAsRead(requestId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Mark all unread messages sent to this user as read
    const { error: updateError } = await supabase
      .from('request_messages')
      .update({ is_read: true })
      .eq('request_id', requestId)
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    if (updateError) throw updateError;

    revalidatePath('/client/messages');
    revalidatePath('/lawyer/messages');

    return { success: true };
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all requests with messages for the current user (client or lawyer)
 */
export async function getRequestsWithMessages() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    let query = supabase.from('legal_requests').select(`
                id,
                request_number,
                title,
                status,
                created_at,
                client:profiles!legal_requests_client_id_fkey(id, full_name, avatar_url),
                lawyer:profiles!legal_requests_assigned_lawyer_id_fkey(id, full_name, avatar_url)
            `);

    // Filter based on role
    if (profile.role === 'client') {
      query = query.eq('client_id', user.id).not('assigned_lawyer_id', 'is', null);
    } else if (profile.role === 'lawyer') {
      query = query.eq('assigned_lawyer_id', user.id);
    } else {
      return { success: false, error: 'Only clients and lawyers can access messages' };
    }

    const { data: requests, error: requestsError } = await query.order('created_at', {
      ascending: false,
    });

    if (requestsError) throw requestsError;

    // Get unread message counts for each request
    const requestsWithCounts = await Promise.all(
      (requests || []).map(async (request) => {
        const { count } = await supabase
          .from('request_messages')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', request.id)
          .eq('recipient_id', user.id)
          .eq('is_read', false);

        return {
          ...request,
          unreadCount: count || 0,
        };
      })
    );

    return { success: true, data: requestsWithCounts };
  } catch (error: any) {
    console.error('Error fetching requests with messages:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List all available lawyers for assignment
 */
export async function listAvailableLawyers() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data: lawyers, error } = await supabase
      .from('profiles')
      .select(
        'id, full_name, email, specialization, years_of_experience, avatar_url, bio, location, average_rating, total_reviews, availability_status'
      )
      .eq('role', 'lawyer')
      .order('average_rating', { ascending: false, nullsFirst: false })
      .order('full_name', { ascending: true });

    if (error) throw error;

    // Map DB fields to expected UI format
    const mappedLawyers = (lawyers || []).map((l: any) => ({
      ...l,
      rating: l.average_rating || 0,
      reviews_count: l.total_reviews || 0,
      title: 'Legal Expert', // Default title
      availability_status: l.availability_status || 'Available',
    }));

    return { success: true, data: mappedLawyers };
  } catch (error: any) {
    console.error('Error fetching available lawyers:', error);
    return { success: false, error: error.message };
  }
}
