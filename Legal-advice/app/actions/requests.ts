'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/permissions';

/**
 * List unassigned submitted requests available for lawyers to claim
 */
export async function listUnassignedRequests() {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a lawyer
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'access_marketplace')) {
    return { success: false, error: 'Only lawyers can view unassigned requests.' };
  }

  try {
    const { data: requests, error } = await (await __getSupabaseClient()).from('legal_requests')
      .select(
        `
                id,
                request_number,
                title,
                description,
                status,
                priority,
                sla_deadline,
                created_at,
                department:departments(name, sla_hours),
                client:profiles!legal_requests_client_id_fkey(full_name, organization)
            `
      )
      .eq('status', 'submitted')
      .is('assigned_lawyer_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: requests || [] };
  } catch (error: any) {
    console.error('Error fetching unassigned requests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List requests assigned to the current lawyer
 */
export async function listAssignedRequests() {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a lawyer
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'view_assigned_cases')) {
    return { success: false, error: 'Only lawyers can view assigned requests.' };
  }

  try {
    const { data: requests, error } = await (await __getSupabaseClient()).from('legal_requests')
      .select(
        `
                id,
                request_number,
                title,
                description,
                status,
                priority,
                sla_deadline,
                assigned_at,
                created_at,
                department:departments(name, sla_hours),
                client:profiles!legal_requests_client_id_fkey(full_name, organization)
            `
      )
      .eq('assigned_lawyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: requests || [] };
  } catch (error: any) {
    console.error('Error fetching assigned requests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List requests created by the current bank
 */
export async function listBankRequests() {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a bank
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'access_bank_dashboard')) {
    return { success: false, error: 'Only bank users can view bank requests.' };
  }

  try {
    const { data: requests, error } = await (await __getSupabaseClient()).from('legal_requests')
      .select(
        `
                id,
                request_number,
                title,
                description,
                status,
                priority,
                sla_deadline,
                assigned_at,
                created_at,
                assigned_firm_id,
                assigned_lawyer_id,
                department:departments(name, sla_hours),
                firm:profiles!legal_requests_assigned_firm_id_fkey(full_name, organization),
                lawyer:profiles!legal_requests_assigned_lawyer_id_fkey(full_name)
            `
      )
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: requests || [] };
  } catch (error: any) {
    console.error('Error fetching bank requests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List lawyers available to the current firm for case assignment
 */
export async function listLawyers() {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a firm or a firm lawyer
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { success: false, error: 'Profile not found.' };
  }

  // Check permission
  if (!hasPermission(profile, 'view_firm_directory')) {
    return { success: false, error: 'Only firm members can list lawyers.' };
  }

  // Use the user's ID if role is 'firm', otherwise use the profile's firm_id
  const isFirmUser = profile.role === 'firm';
  const targetFirmId = isFirmUser ? user.id : profile.firm_id;

  try {
    // Return only lawyers assigned to this firm
    const { data: lawyers, error } = await (await __getSupabaseClient()).from('profiles')
      .select('id, full_name, email, specialization, years_of_experience')
      .eq('role', 'lawyer')
      .eq('firm_id', targetFirmId)
      .order('full_name', { ascending: true });

    if (error) throw error;

    return { success: true, data: lawyers || [] };
  } catch (error: any) {
    console.error('Error fetching firm lawyers:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get request details for lawyer review (read-only)
 */
export async function getRequestDetails(requestId: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a lawyer
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'view_assigned_cases')) {
    return { success: false, error: 'Only lawyers can view request details.' };
  }

  try {
    // Fetch request details with authorization check
    const { data: request, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
      .select(
        `
                id,
                request_number,
                title,
                description,
                status,
                priority,
                sla_deadline,
                property_address,
                loan_amount,
                submitted_at,
                assigned_at,
                created_at,
                client:profiles!legal_requests_client_id_fkey(id, full_name, email, organization),
                department:departments(id, name, sla_hours)
            `
      )
      .eq('id', requestId)
      .eq('assigned_lawyer_id', user.id)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found or not assigned to you.' };
    }

    // Fetch documents for this request
    const { data: documents, error: docsError } = await (await __getSupabaseClient()).from('documents')
      .select('id, file_name, file_size, file_type, document_type, description, uploaded_at')
      .eq('request_id', requestId)
      .order('uploaded_at', { ascending: false });

    if (docsError) throw docsError;

    return {
      success: true,
      data: {
        request,
        documents: documents || [],
      },
    };
  } catch (error: any) {
    console.error('Error fetching request details:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List cases assigned to the current firm
 */
export async function listFirmCases() {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a firm
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'view_all_firm_cases')) {
    return { success: false, error: 'Only firms can view these requests.' };
  }

  try {
    const { data: requests, error } = await (await __getSupabaseClient()).from('legal_requests')
      .select(
        `
                id,
                request_number,
                title,
                description,
                status,
                priority,
                sla_deadline,
                assigned_at,
                created_at,
                assigned_lawyer_id,
                department:departments(name, sla_hours),
                client:profiles!legal_requests_client_id_fkey(full_name, organization)
            `
      )
      .eq('assigned_firm_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: requests || [] };
  } catch (error: any) {
    console.error('Error fetching firm cases:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Claim an unassigned submitted request
 */
export async function claimRequest(requestId: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a lawyer
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'access_marketplace')) {
    return { success: false, error: 'Only lawyers can claim requests.' };
  }

  try {
    const now = new Date().toISOString();

    // Atomic conditional update with guard
    const { data: updatedRequest, error: updateError } = await (await __getSupabaseClient()).from('legal_requests')
      .update({
        assigned_lawyer_id: user.id,
        assigned_at: now,
        status: 'assigned',
      })
      .eq('id', requestId)
      .eq('status', 'submitted')
      .is('assigned_lawyer_id', null)
      .select('id, request_number, client_id')
      .single();

    // If no rows affected, request was already claimed or not available
    if (updateError || !updatedRequest) {
      return { success: false, error: 'already_claimed' };
    }

    // Insert audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'case_claimed',
      details: { request_number: updatedRequest.request_number },
    });

    // Insert notification for client (DB only)
    if (updatedRequest.client_id) {
      await (await __getSupabaseClient()).from('notifications').insert({
        user_id: updatedRequest.client_id,
        type: 'case_assigned',
        title: 'Lawyer Assigned',
        message: `Your request ${updatedRequest.request_number} has been assigned to a lawyer.`,
        related_request_id: requestId,
      });
    }

    revalidatePath('/dashboard/lawyer/assigned');
    revalidatePath('/dashboard/lawyer');
    revalidatePath('/dashboard/client/track');

    return {
      success: true,
      data: { id: updatedRequest.id, request_number: updatedRequest.request_number },
    };
  } catch (error: any) {
    console.error('Error claiming request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Assign a case (owned by firm) to a specific lawyer
 */
export async function assignCaseToLawyer(requestId: string, lawyerId: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a firm
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'assign_cases')) {
    return { success: false, error: 'Only firms can assign cases to lawyers.' };
  }

  try {
    const now = new Date().toISOString();

    // Atomic conditional update to prevent double assignment
    const { data: updatedRequest, error: updateError } = await (await __getSupabaseClient()).from('legal_requests')
      .update({
        assigned_lawyer_id: lawyerId,
        assigned_at: now,
        status: 'assigned',
      })
      .eq('id', requestId)
      .eq('assigned_firm_id', user.id)
      .is('assigned_lawyer_id', null)
      .select('id, request_number, client_id')
      .single();

    if (updateError || !updatedRequest) {
      return { success: false, error: 'already_assigned_or_unavailable' };
    }

    // Audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'case_assigned_to_lawyer',
      details: { lawyer_id: lawyerId },
    });

    // Notify lawyer
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: lawyerId,
      type: 'case_assigned',
      title: 'New Case Assigned',
      message: `You have been assigned to case ${updatedRequest.request_number}.`,
      related_request_id: requestId,
    });

    // Notify client that a lawyer was assigned (optional but helpful)
    if (updatedRequest.client_id) {
      await (await __getSupabaseClient()).from('notifications').insert({
        user_id: updatedRequest.client_id,
        type: 'case_assigned',
        title: 'Lawyer Assigned',
        message: `A lawyer has been assigned to your request ${updatedRequest.request_number}.`,
        related_request_id: requestId,
      });
    }

    revalidatePath('/dashboard/firm/oversight');
    revalidatePath('/dashboard/lawyer/assigned');

    return {
      success: true,
      data: { id: updatedRequest.id, request_number: updatedRequest.request_number },
    };
  } catch (error: any) {
    console.error('Error assigning case to lawyer:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new legal request
 */
export async function createLegalRequest(formData: FormData) {
  const supabase = await createClient();// Get authenticated user
  const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const departmentId = formData.get('departmentId') as string;
    const priority = (formData.get('priority') as string) || 'medium';
    const visibility = (formData.get('visibility') as string) || 'private';
    const slaTier = formData.get('slaTier') as string;
    const propertyAddress = formData.get('propertyAddress') as string;
    const loanAmount = formData.get('loanAmount') as string;
    const assignedLawyerId = formData.get('assignedLawyerId') as string | null;

    // Marketplace fields
    const budgetMin = formData.get('budgetMin') as string;
    const budgetMax = formData.get('budgetMax') as string;
    const expectedTimeline = formData.get('expectedTimeline') as string;
    const complexity = formData.get('complexity') as 'low' | 'medium' | 'high';
    const experience = formData.get('experience') as string;
    const confidentiality = formData.get('confidentiality') as
      | 'public'
      | 'confidential'
      | 'highly_confidential';
    const deliverables = formData.get('deliverables') as string; // JSON string
    const jurisdiction = formData.get('jurisdiction') as string;

    // Determine request type based on visibility
    const requestType = visibility === 'public' ? 'public' : 'direct';

    // For public requests: status is 'open'
    // For direct requests: status is 'pending_lawyer_response'
    const status =
      visibility === 'public' ? 'open' : assignedLawyerId ? 'pending_lawyer_response' : 'submitted';

    const assignedAt =
      visibility === 'public' ? null : assignedLawyerId ? null : null; // assignedAt should be set when lawyer ACCEPTS, not when invited? 
    // Requirement says "0% - Case Created". "Visible to Lawyer -> New Request".
    // So assigned_at might technically be set to associate them, but status is pending.
    // If we keep assigned_lawyer_id set, queries work. Status distinguishes acceptance.

    // However, for direct request, we assign immediately BUT status is pending.
    // assigned_at usually implies "active assignment". 
    // Let's set assigned_at to NULL until they accept? 
    // Or keep it set so they see it. 
    // Logic: assigned_lawyer_id is the Invite. Status 'pending_lawyer_response'.
    // Action 'updateCaseStatus' -> 'accepted' sets assigned_at? 
    // Let's keep assigned_lawyer_id set, assigned_at can be now or null. I will set it to now to indicate "sent to lawyer".

    // Public request metadata
    const publicPostedAt = visibility === 'public' ? new Date().toISOString() : null;
    const publicExpiresAt =
      visibility === 'public' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null;
    const publicStatus = visibility === 'public' ? 'PUBLIC_OPEN' : null;

    // Insert request
    const { data, error } = await (await __getSupabaseClient()).from('legal_requests')
      .insert({
        client_id: user.id,
        department_id: departmentId,
        title,
        description,
        priority,
        visibility,
        sla_tier: slaTier,
        property_address: propertyAddress,
        loan_amount: loanAmount ? parseFloat(loanAmount) : null,
        status,
        request_type: requestType,
        assigned_lawyer_id: assignedLawyerId,
        assigned_at: assignedAt,
        public_posted_at: publicPostedAt,
        public_expires_at: publicExpiresAt,
        public_status: publicStatus,
        // Marketplace fields
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        expected_timeline_days: expectedTimeline ? parseInt(expectedTimeline) : null,
        complexity_level: complexity || 'medium',
        required_experience_years: experience ? parseInt(experience) : null,
        confidentiality_type: confidentiality || 'public',
        expected_deliverables: deliverables ? JSON.parse(deliverables) : [],
        jurisdiction: jurisdiction || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: data.id,
      action: 'request_created',
      details: {
        title,
        department_id: departmentId,
        request_type: requestType,
        assigned_lawyer_id: assignedLawyerId,
      },
    });

    // Create notification for user
    const notificationMessage =
      visibility === 'public'
        ? `Your public legal request "${title}" has been posted successfully. Lawyers can now submit proposals.`
        : `Your legal request "${title}" has been submitted successfully.`;

    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: user.id,
      type: 'request_submitted',
      title: 'Request Submitted',
      message: notificationMessage,
      related_request_id: data.id,
    });

    // If lawyer was assigned (direct request), notify the lawyer
    if (assignedLawyerId && visibility !== 'public') {
      await (await __getSupabaseClient()).from('notifications').insert({
        user_id: assignedLawyerId,
        type: 'case_assigned',
        title: 'New Case Assigned',
        message: `You have been assigned to request "${title}" (${data.request_number}).`,
        related_request_id: data.id,
      });

      // Create audit log for assignment
      await (await __getSupabaseClient()).from('audit_logs').insert({
        user_id: user.id,
        request_id: data.id,
        action: 'lawyer_assigned_on_creation',
        details: { lawyer_id: assignedLawyerId },
      });

      revalidatePath('/lawyer/assigned');
      revalidatePath('/lawyer');
    }

    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/track');
    revalidatePath('/client');
    revalidatePath('/client/track');

    if (visibility === 'public') {
      revalidatePath('/lawyer/public-requests');
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a bank-originated legal request with document metadata (no storage upload)
 */
export async function createBankRequest(params: {
  title: string;
  description: string;
  departmentId: string;
  priority?: string;
  slaHoursOverride?: number; // optional urgency override in hours
  propertyAddress?: string;
  loanAmount?: number;
  documents?: Array<{
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    document_type?: string;
    description?: string;
  }>;
}) {
  const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a bank
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'create_bank_requests')) {
    return { success: false, error: 'Only bank users can create bank requests.' };
  }

  const {
    title,
    description,
    departmentId,
    priority = 'medium',
    slaHoursOverride,
    propertyAddress,
    loanAmount,
    documents = [],
  } = params;

  try {
    // Get department SLA hours
    const { data: dept, error: deptError } = await (await __getSupabaseClient()).from('departments')
      .select('sla_hours')
      .eq('id', departmentId)
      .single();

    if (deptError || !dept) {
      throw deptError || new Error('Department not found');
    }

    const hours = slaHoursOverride ?? dept.sla_hours;
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

    // Create request
    const { data: request, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
      .insert({
        client_id: user.id,
        department_id: departmentId,
        title,
        description,
        priority,
        sla_deadline: slaDeadline,
        property_address: propertyAddress || null,
        loan_amount: loanAmount ?? null,
        status: 'submitted',
        assigned_firm_id: null,
        assigned_lawyer_id: null,
      })
      .select()
      .single();

    if (requestError || !request) throw requestError;

    // Insert document metadata rows (if provided)
    if (documents.length > 0) {
      const docsToInsert = documents.map((doc) => ({
        request_id: request.id,
        uploaded_by: user.id,
        file_name: doc.file_name,
        file_path: doc.file_path,
        file_size: doc.file_size,
        file_type: doc.file_type,
        document_type: doc.document_type || 'other',
        description: doc.description || null,
      }));

      const { error: docsError } = await (await __getSupabaseClient()).from('documents').insert(docsToInsert);
      if (docsError) {
        // best-effort cleanup to keep consistency
        await (await __getSupabaseClient()).from('legal_requests').delete().eq('id', request.id);
        throw docsError;
      }
    }

    // Audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: request.id,
      action: 'bank_request_created',
      details: { department_id: departmentId, documents_count: documents.length },
    });

    // Notification to bank user (self)
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: user.id,
      type: 'request_submitted',
      title: 'Bank Request Submitted',
      message: `Your bank request "${title}" has been submitted successfully.`,
      related_request_id: request.id,
    });

    revalidatePath('/dashboard/bank');
    revalidatePath('/dashboard/bank/requests');

    return { success: true, data: request };
  } catch (error: any) {
    console.error('Error creating bank request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Bank assigns a request to a firm (atomic guard)
 */
export async function assignRequestToFirm(requestId: string, firmId: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a bank
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'bank') {
    return { success: false, error: 'Only bank users can assign requests to firms.' };
  }

  try {
    const now = new Date().toISOString();

    // Atomic conditional update: must be owned by this bank and unassigned to any firm
    const { data: updatedRequest, error: updateError } = await (await __getSupabaseClient()).from('legal_requests')
      .update({
        assigned_firm_id: firmId,
        assigned_at: now,
        status: 'assigned',
      })
      .eq('id', requestId)
      .eq('client_id', user.id)
      .is('assigned_firm_id', null)
      .select('id, request_number, client_id')
      .single();

    if (updateError || !updatedRequest) {
      return { success: false, error: 'already_assigned_or_unavailable' };
    }

    // Audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'bank_assigned_to_firm',
      details: { firm_id: firmId },
    });

    // Notify firm
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: firmId,
      type: 'case_assigned',
      title: 'New Bank Case Assigned',
      message: `A bank request ${updatedRequest.request_number} has been assigned to your firm.`,
      related_request_id: requestId,
    });

    // Notify bank (self-confirmation)
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: user.id,
      type: 'case_assigned',
      title: 'Firm Assigned',
      message: `You assigned request ${updatedRequest.request_number} to the firm.`,
      related_request_id: requestId,
    });

    revalidatePath('/dashboard/bank/requests');
    revalidatePath('/dashboard/firm/oversight');

    return {
      success: true,
      data: { id: updatedRequest.id, request_number: updatedRequest.request_number },
    };
  } catch (error: any) {
    console.error('Error assigning request to firm:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload document to Supabase Storage and create document record
 */
export async function uploadDocument(
  file: File,
  requestId: string,
  documentType: string = 'other'
) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${requestId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await (await __getSupabaseClient()).storage
      .from('legal-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create document record
    const { data, error } = await (await __getSupabaseClient()).from('documents')
      .insert({
        request_id: requestId,
        uploaded_by: user.id,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        document_type: documentType,
      })
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'document_uploaded',
      details: { file_name: file.name, document_type: documentType },
    });

    revalidatePath('/dashboard/client/track');

    return { success: true, data };
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Assign case to lawyer or firm
 */
export async function assignCase(
  requestId: string,
  assigneeId: string,
  assigneeType: 'lawyer' | 'firm'
) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Update request with assignment
    const updateData: any = {
      status: 'assigned',
      assigned_at: new Date().toISOString(),
    };

    if (assigneeType === 'lawyer') {
      updateData.assigned_lawyer_id = assigneeId;
    } else {
      updateData.assigned_firm_id = assigneeId;
    }

    const { data, error } = await (await __getSupabaseClient()).from('legal_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'case_assigned',
      details: { assignee_id: assigneeId, assignee_type: assigneeType },
    });

    // Create notification for assignee
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: assigneeId,
      type: 'case_assigned',
      title: 'New Case Assigned',
      message: `A new case has been assigned to you.`,
      related_request_id: requestId,
    });

    revalidatePath('/dashboard/firm/oversight');
    revalidatePath('/dashboard/lawyer/assigned');

    return { success: true, data };
  } catch (error: any) {
    console.error('Error assigning case:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Request clarification from client
 */
/**
 * Lawyer requests clarification from client (creates blocking point)
 * Guards: Only assigned lawyer can request; blocks transition to opinion_ready
 * Status: assigned → clarification_requested
 */
export async function requestClarification(
  requestId: string,
  subject: string,
  message: string,
  priority: string = 'medium'
) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a lawyer
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'lawyer') {
    return { success: false, error: 'Only lawyers can request clarifications.' };
  }

  try {
    // Fetch request to verify lawyer is assigned
    const { data: request, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
      .select('id, client_id, assigned_lawyer_id')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found.' };
    }

    if (request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'You are not assigned to this case.' };
    }

    // Create clarification
    const { data: clarification, error: clarError } = await (await __getSupabaseClient()).from('clarifications')
      .insert({
        request_id: requestId,
        requester_id: user.id,
        subject,
        message,
        priority: priority || 'medium',
      })
      .select()
      .single();

    if (clarError) throw clarError;

    // Update request status to clarification_requested
    const { error: statusError } = await (await __getSupabaseClient()).from('legal_requests')
      .update({ status: 'clarification_requested' })
      .eq('id', requestId);

    if (statusError) throw statusError;

    // Create audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'clarification_requested',
      details: { clarification_id: clarification.id, subject },
    });

    // Notify client
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: request.client_id,
      type: 'clarification_requested',
      title: 'Clarification Required',
      message: `Your lawyer has requested clarification: ${subject}`,
      related_request_id: requestId,
    });

    revalidatePath('/dashboard/lawyer/assigned');
    revalidatePath('/dashboard/client/track');

    return { success: true };
  } catch (error) {
    console.error('Request clarification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request clarification',
    };
  }
}

/**
 * Client responds to clarification request
 * Guards: Only request client can respond; only to unresolved clarifications
 * Sets: response, responded_at, notifies lawyer
 */
export async function respondToClarification(clarificationId: string, response: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Fetch clarification + request to verify ownership
    const { data: clarification, error: clarError } = await (await __getSupabaseClient()).from('clarifications')
      .select('id, request_id, requester_id, is_resolved')
      .eq('id', clarificationId)
      .single();

    if (clarError || !clarification) {
      return { success: false, error: 'Clarification not found.' };
    }

    if (clarification.is_resolved) {
      return { success: false, error: 'This clarification is already resolved.' };
    }

    // Verify request belongs to current user
    const { data: request, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
      .select('client_id')
      .eq('id', clarification.request_id)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found.' };
    }

    if (request.client_id !== user.id) {
      return { success: false, error: 'You do not have access to this clarification.' };
    }

    // Update clarification with response
    const { data: updated, error: updateError } = await (await __getSupabaseClient()).from('clarifications')
      .update({
        response,
        responded_at: new Date().toISOString(),
      })
      .eq('id', clarificationId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: clarification.request_id,
      action: 'clarification_responded',
      details: { clarification_id: clarificationId },
    });

    // Notify lawyer who requested clarification
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: clarification.requester_id,
      type: 'clarification_responded',
      title: 'Clarification Response Received',
      message: 'Client has responded to your clarification request.',
      related_request_id: clarification.request_id,
    });

    revalidatePath('/dashboard/lawyer/assigned');
    revalidatePath('/dashboard/client/track');

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error responding to clarification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lawyer marks clarification as resolved
 * Guards: Only assigned lawyer can resolve; case must be in clarification_requested status
 * Status transition: clarification_requested → in_review (if all clarifications resolved)
 */
export async function markClarificationResolved(clarificationId: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a lawyer
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'lawyer') {
    return { success: false, error: 'Only lawyers can resolve clarifications.' };
  }

  try {
    // Fetch clarification + verify requester is current user
    const { data: clarification, error: clarError } = await (await __getSupabaseClient()).from('clarifications')
      .select('id, request_id, requester_id, is_resolved')
      .eq('id', clarificationId)
      .single();

    if (clarError || !clarification) {
      return { success: false, error: 'Clarification not found.' };
    }

    if (clarification.is_resolved) {
      return { success: false, error: 'This clarification is already resolved.' };
    }

    if (clarification.requester_id !== user.id) {
      return { success: false, error: 'You did not request this clarification.' };
    }

    // Update clarification as resolved
    const { data: updated, error: updateError } = await (await __getSupabaseClient()).from('clarifications')
      .update({ is_resolved: true })
      .eq('id', clarificationId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Check if all clarifications for this request are resolved
    const { data: unresolvedCount, error: countError } = await (await __getSupabaseClient()).from('clarifications')
      .select('id', { count: 'exact' })
      .eq('request_id', clarification.request_id)
      .eq('is_resolved', false);

    if (countError) throw countError;

    // If all resolved, move request back to in_review
    const allResolved = unresolvedCount && unresolvedCount.length === 0;
    if (allResolved) {
      await (await __getSupabaseClient()).from('legal_requests')
        .update({ status: 'in_review' })
        .eq('id', clarification.request_id);
    }

    // Create audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: clarification.request_id,
      action: 'clarification_resolved',
      details: { clarification_id: clarificationId, all_resolved: allResolved },
    });

    // Notify client
    const { data: request } = await (await __getSupabaseClient()).from('legal_requests')
      .select('client_id')
      .eq('id', clarification.request_id)
      .single();

    if (request) {
      await (await __getSupabaseClient()).from('notifications').insert({
        user_id: request.client_id,
        type: 'clarification_resolved',
        title: 'Clarification Resolved',
        message: 'Your lawyer has reviewed your response.',
        related_request_id: clarification.request_id,
      });
    }

    revalidatePath('/dashboard/lawyer/assigned');
    revalidatePath('/dashboard/client/track');

    return { success: true, data: updated, allResolved };
  } catch (error: any) {
    console.error('Error resolving clarification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List clarifications for a specific request
 * Guards: Only request client or assigned lawyer can view
 * Returns: All clarifications with full details
 */
export async function listClarifications(requestId: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Fetch request to verify access
    const { data: request, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
      .select('client_id, assigned_lawyer_id')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found.' };
    }

    // Check if user is client or assigned lawyer
    const isClient = request.client_id === user.id;
    const isLawyer = request.assigned_lawyer_id === user.id;

    if (!isClient && !isLawyer) {
      return { success: false, error: 'You do not have access to this request.' };
    }

    // Fetch clarifications with requester details
    const { data: clarifications, error: clarError } = await (await __getSupabaseClient()).from('clarifications')
      .select(
        `
                id,
                request_id,
                requester_id,
                subject,
                message,
                priority,
                is_resolved,
                response,
                responded_at,
                created_at,
                requester:requester_id(id, full_name, role)
            `
      )
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (clarError) throw clarError;

    // Transform the requester field from array to object
    const transformedClarifications = (clarifications || []).map((c: any) => ({
      ...c,
      requester: Array.isArray(c.requester) ? c.requester[0] : c.requester,
    }));

    return { success: true, data: transformedClarifications };
  } catch (error: any) {
    console.error('Error fetching clarifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Submit legal opinion
 */
export async function submitOpinion(requestId: string, opinionText: string, opinionFile?: File) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify caller is lawyer and assigned to the request
    const { data: profile } = await (await __getSupabaseClient()).from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'lawyer') {
      return { success: false, error: 'Only lawyers can submit opinions.' };
    }

    const { data: request, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
      .select('id, client_id, assigned_lawyer_id, status')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found.' };
    }

    if (request.assigned_lawyer_id !== user.id) {
      return { success: false, error: 'You are not assigned to this request.' };
    }

    // Ensure all clarifications are resolved
    const { data: unresolved, error: clarErr } = await (await __getSupabaseClient()).from('clarifications')
      .select('id', { count: 'exact' })
      .eq('request_id', requestId)
      .eq('is_resolved', false);

    if (clarErr) throw clarErr;
    const hasUnresolved = Array.isArray(unresolved) ? unresolved.length > 0 : false;
    if (hasUnresolved) {
      return {
        success: false,
        error: 'Unresolved clarifications must be resolved before submitting opinion.',
      };
    }

    // Upload opinion document if provided
    let documentId: string | null = null;
    if (opinionFile) {
      const uploadResult = await uploadDocument(opinionFile, requestId, 'legal_opinion');
      if (uploadResult.success && uploadResult.data) {
        documentId = uploadResult.data.id;
        // Optionally store opinionText into document description
        if (opinionText) {
          await (await __getSupabaseClient()).from('documents')
            .update({ description: opinionText })
            .eq('id', documentId);
        }
      }
    }

    // Update request status to opinion_ready
    const { data: updated, error } = await (await __getSupabaseClient()).from('legal_requests')
      .update({ status: 'opinion_ready' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'opinion_submitted',
      details: { document_id: documentId, has_text: !!opinionText },
    });

    // Notify client (DB only)
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: updated.client_id,
      type: 'opinion_ready',
      title: 'Legal Opinion Ready',
      message: 'Your legal opinion is ready for review.',
      related_request_id: requestId,
    });

    revalidatePath('/dashboard/lawyer/assigned');
    revalidatePath('/dashboard/client/track');

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error submitting opinion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Firm submits stamped opinion and delivers to client
 * Guards: Firm only, assigned to request, opinion must exist
 * Status: opinion_ready → delivered
 */
export async function submitStampedOpinion(requestId: string, stampedFile?: File, notes?: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify caller is a firm
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'firm') {
    return { success: false, error: 'Only firms can submit stamped opinions.' };
  }

  try {
    // Verify request owned by firm and in opinion_ready status
    const { data: request, error: reqErr } = await (await __getSupabaseClient()).from('legal_requests')
      .select('id, client_id, assigned_firm_id, status')
      .eq('id', requestId)
      .single();

    if (reqErr || !request) {
      return { success: false, error: 'Request not found.' };
    }

    if (request.assigned_firm_id !== user.id) {
      return { success: false, error: 'This request is not assigned to your firm.' };
    }

    if (request.status !== 'opinion_ready') {
      return { success: false, error: 'Opinion is not ready for stamping.' };
    }

    // Ensure an opinion document exists
    const { data: opinionDocs, error: docErr } = await (await __getSupabaseClient()).from('documents')
      .select('id, uploaded_at')
      .eq('request_id', requestId)
      .eq('document_type', 'legal_opinion')
      .order('uploaded_at', { ascending: false })
      .limit(1);

    if (docErr) throw docErr;
    if (!opinionDocs || opinionDocs.length === 0) {
      return { success: false, error: 'No opinion document found to stamp.' };
    }

    // Optionally upload stamped file as new latest version
    let stampedDocId: string | null = null;
    if (stampedFile) {
      const uploadResult = await uploadDocument(stampedFile, requestId, 'legal_opinion');
      if (uploadResult.success && uploadResult.data) {
        stampedDocId = uploadResult.data.id;
        if (notes) {
          await (await __getSupabaseClient()).from('documents').update({ description: notes }).eq('id', stampedDocId);
        }
      }
    }

    // Update request status to delivered
    const { data: updated, error } = await (await __getSupabaseClient()).from('legal_requests')
      .update({ status: 'delivered' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await (await __getSupabaseClient()).from('audit_logs').insert({
      user_id: user.id,
      request_id: requestId,
      action: 'stamped_opinion_submitted',
      details: { stamped_document_id: stampedDocId, notes_present: !!notes },
    });

    // Notify client (DB only)
    await (await __getSupabaseClient()).from('notifications').insert({
      user_id: updated.client_id,
      type: 'opinion_delivered',
      title: 'Legal Opinion Delivered',
      message: 'Your firm has delivered the stamped legal opinion.',
      related_request_id: requestId,
    });

    revalidatePath('/dashboard/firm/oversight');
    revalidatePath('/dashboard/client/track');

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error submitting stamped opinion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get opinion details for a request with role-based access
 * Guards:
 *  - Lawyer: must be assigned
 *  - Firm: must be assigned
 *  - Client: allowed only after delivered/completed
 */
export async function getOpinionDetails(requestId: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Fetch request for access checks
    const { data: request, error: reqErr } = await (await __getSupabaseClient()).from('legal_requests')
      .select(
        `
                id,
                request_number,
                status,
                client_id,
                assigned_lawyer_id,
                assigned_firm_id,
                description,
                sla_deadline,
                submitted_at,
                assigned_at
            `
      )
      .eq('id', requestId)
      .single();

    if (reqErr || !request) {
      return { success: false, error: 'Request not found.' };
    }

    const isLawyer = request.assigned_lawyer_id === user.id;
    const isFirm = request.assigned_firm_id === user.id;
    const isClient = request.client_id === user.id;

    if (!isLawyer && !isFirm && !isClient) {
      return { success: false, error: 'Access denied for this request.' };
    }

    // Client can view only after delivered/completed
    if (isClient && !['delivered', 'completed'].includes(request.status)) {
      return { success: false, error: 'Opinion not yet available to client.' };
    }

    // Fetch latest opinion document(s)
    const { data: opinions, error: docsErr } = await (await __getSupabaseClient()).from('documents')
      .select(
        `
                id,
                file_name,
                file_path,
                file_size,
                file_type,
                document_type,
                description,
                uploaded_by,
                uploaded_at
            `
      )
      .eq('request_id', requestId)
      .eq('document_type', 'legal_opinion')
      .order('uploaded_at', { ascending: false });

    if (docsErr) throw docsErr;

    return { success: true, data: { request, opinions: opinions || [] } };
  } catch (error: any) {
    console.error('Error fetching opinion details:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Submit rating for completed request
 */

/**
 * Get ratings by sender role
 * - Lawyer: ratings about the lawyer
 * - Firm: ratings about the firm
 * - Client: ratings submitted by the client
 */

/**
 * Update request status
 */
export async function updateRequestStatus(requestId: string, status: string) {
  const supabase = await createClient(); const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data, error } = await (await __getSupabaseClient()).from('legal_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard');

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List notifications for the authenticated user
 */
export async function listNotifications(filters?: {
  unreadOnly?: boolean; limit?: number
}) {
  try {
    // Auth guard
    const {
      data: { user },
      error: authError,
    } = { data: { user: (await auth())?.user }, error: null };
    if (authError || !user) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    // Build query - user-scoped
    let query = (await __getSupabaseClient()).from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply optional filters
    if (filters?.unreadOnly) {
      query = query.eq('is_read', false);
    }

    query = query.limit(filters?.limit || 50);

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error listing notifications:', error);
    return { success: false, error: error.message, data: null };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  try {
    // Auth guard
    const {
      data: { user },
      error: authError,
    } = { data: { user: (await auth())?.user }, error: null };
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const { data: notification, error: fetchError } = await (await __getSupabaseClient()).from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      return { success: false, error: 'Notification not found' };
    }

    if (notification.user_id !== user.id) {
      return { success: false, error: 'Not authorized' };
    }

    // Update read status
    const { error } = await (await __getSupabaseClient()).from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;

    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark notification as unread
 */
export async function markNotificationUnread(notificationId: string) {
  try {
    const {
      data: { user },
      error: authError,
    } = { data: { user: (await auth())?.user }, error: null };
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: notification, error: fetchError } = await (await __getSupabaseClient()).from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      return { success: false, error: 'Notification not found' };
    }

    if (notification.user_id !== user.id) {
      return { success: false, error: 'Not authorized' };
    }

    const { error } = await (await __getSupabaseClient()).from('notifications')
      .update({ is_read: false })
      .eq('id', notificationId);

    if (error) throw error;

    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error marking notification unread:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsRead() {
  try {
    const {
      data: { user },
      error: authError,
    } = { data: { user: (await auth())?.user }, error: null };
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await (await __getSupabaseClient()).from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error marking all notifications read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get document download URL
 */
export async function getDocumentDownloadUrl(filePath: string) {
  try {
    const { data, error } = await (await __getSupabaseClient()).storage
      .from('legal-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;

    return { success: true, url: data.signedUrl };
  } catch (error: any) {
    console.error('Error getting download URL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update request details (title, description)
 * Only allowed for requests in 'submitted' or 'assigned' status
 */
export async function updateRequest(
  requestId: string,
  data: {
    title?: string; description?: string
  }
) {
  try {
    const {
      data: { user },
      error: authError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      // Fetch request to verify ownership and status
      const { data: request, error: fetchError } = await (await __getSupabaseClient()).from('legal_requests')
        .select('client_id, status')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Request not found' };
      }

      // Verify ownership
      if (request.client_id !== user.id) {
        return { success: false, error: 'You do not have permission to edit this request' };
      }

      // Only allow editing for submitted or assigned requests
      if (!['submitted', 'assigned'].includes(request.status)) {
        return {
          success: false,
          error: `Cannot edit request in '${request.status}' status. Only submitted or assigned requests can be edited.`,
        };
      }

      // Update request
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;

      if (Object.keys(updateData).length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      const { error: updateError } = await (await __getSupabaseClient()).from('legal_requests')
        .update(updateData)
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create audit log
      await (await __getSupabaseClient()).from('audit_logs').insert({
        user_id: user.id,
        request_id: requestId,
        action: 'request_updated',
        details: { updated_fields: Object.keys(updateData) },
      });

      revalidatePath('/client/track');
      revalidatePath(`/client/track/${requestId}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error updating request:', error);
      return { success: false, error: error.message };
    }
  } catch (error: any) {
    console.error('Error in updateRequest:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unexpected error' };
  }
}
/**
 * Delete a request
 * Only allowed for requests in 'submitted' or 'assigned' status
 */
export async function deleteRequest(requestId: string) {
  try {
    const {
      data: { user },
      error: authError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      // Fetch request to verify ownership and status
      const { data: request, error: fetchError } = await (await __getSupabaseClient()).from('legal_requests')
        .select('client_id, status, request_number')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Request not found' };
      }

      // Verify ownership
      if (request.client_id !== user.id) {
        return { success: false, error: 'You do not have permission to delete this request' };
      }

      // Only allow deletion for submitted or assigned requests
      if (!['submitted', 'assigned'].includes(request.status)) {
        return {
          success: false,
          error: `Cannot delete request in '${request.status}' status. Only submitted or assigned requests can be deleted.`,
        };
      }

      // Delete request (cascade will handle related records)
      const { error: deleteError } = await (await __getSupabaseClient()).from('legal_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Create audit log
      await (await __getSupabaseClient()).from('audit_logs').insert({
        user_id: user.id,
        request_id: requestId,
        action: 'request_deleted',
        details: { request_number: request.request_number, status: request.status },
      });

      revalidatePath('/client/track');

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting request:', error);
      return { success: false, error: error.message };
    }
  } catch (error: any) {
    console.error('Error in deleteRequest auth:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Delete a document
 * Only the uploader can delete documents
 */
export async function deleteDocument(documentId: string) {
  try {
    const {
      data: { user },
      error: authError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      // Fetch document to verify ownership
      const { data: document, error: fetchError } = await (await __getSupabaseClient()).from('documents')
        .select('uploaded_by, file_path, request_id')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        return { success: false, error: 'Document not found' };
      }

      // Verify ownership
      if (document.uploaded_by !== user.id) {
        return { success: false, error: 'You do not have permission to delete this document' };
      }

      // Delete from storage
      const { error: storageError } = await (await __getSupabaseClient()).storage
        .from('legal-documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: deleteError } = await (await __getSupabaseClient()).from('documents').delete().eq('id', documentId);

      if (deleteError) throw deleteError;

      // Create audit log
      await (await __getSupabaseClient()).from('audit_logs').insert({
        user_id: user.id,
        request_id: document.request_id,
        action: 'document_deleted',
        details: { document_id: documentId },
      });

      revalidatePath(`/client/track/${document.request_id}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  } catch (error: any) {
    console.error('Error in deleteDocument:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Submit a rating for a completed case
 */
export async function submitRating(requestId: string, rating: number, feedback: string) {
  try {
    const {
      data: { user },
      error: authError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      // Verify request exists and belongs to user
      const { data: request, error: fetchError } = await (await __getSupabaseClient()).from('legal_requests')
        .select('id, assigned_lawyer_id, status')
        .eq('id', requestId)
        .eq('client_id', user.id)
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Request not found' };
      }

      if (!request.assigned_lawyer_id) {
        return { success: false, error: 'No lawyer assigned to rate' };
      }

      // Insert rating
      const { error: insertError } = await (await __getSupabaseClient()).from('lawyer_reviews')
        .insert({
          request_id: requestId,
          client_id: user.id,
          lawyer_id: request.assigned_lawyer_id,
          rating: rating,
          review_text: feedback,
          overall_rating: rating,
          feedback: feedback,
        } as any);

      if (insertError) throw insertError;

      revalidatePath('/dashboard/client/track');
      revalidatePath(`/client/track/${requestId}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      return { success: false, error: error.message };
    }
  } catch (error: any) {
    console.error('Error in submitRating:', error);
    return { success: false, error: 'Unexpected error' };
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
