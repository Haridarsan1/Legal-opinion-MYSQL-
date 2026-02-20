'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Server actions for Saved Requests (Bookmark) Management
 * Allows lawyers to bookmark/save public requests for later review
 */

// =====================================================
// TYPES
// =====================================================

export interface SavedRequest {
  id: string;
  lawyer_id: string;
  request_id: string;
  notes?: string;
  created_at: string;
  request?: {
    id: string;
    request_number: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    visibility: string;
    department: {
      name: string;
    };
    proposal_count: Array<any>;
    // Marketplace fields
    budget_min?: number;
    budget_max?: number;
    expected_timeline_days?: number;
    complexity_level?: string;
    required_experience_years?: number;
    confidentiality_type?: string;
    proposal_deadline?: string;
    created_at: string;
    public_posted_at?: string;
  };
}

interface ActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

// =====================================================
// 1. SAVE REQUEST (Bookmark)
// =====================================================

export async function saveRequest(requestId: string, notes?: string): Promise<ActionResult> {
  const supabase = await createClient();try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    // Verify user is a lawyer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'lawyer') {
      return { success: false, error: 'Only lawyers can bookmark requests' };
    }

    // Verify request exists and is public
    const { data: request } = await supabase
      .from('legal_requests')
      .select('id, visibility, status')
      .eq('id', requestId)
      .single();

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.visibility !== 'public') {
      return { success: false, error: 'Only public requests can be bookmarked' };
    }

    // Create bookmark
    const { error } = await supabase.from('saved_requests').insert({
      lawyer_id: user.id,
      request_id: requestId,
      notes: notes || null,
    });

    if (error) {
      // Check for unique constraint violation (already bookmarked)
      if (error.code === '23505') {
        return { success: false, error: 'Request already bookmarked' };
      }
      console.error('Error saving request:', error);
      return { success: false, error: 'Failed to bookmark request' };
    }

    // Revalidate paths
    revalidatePath('/lawyer/public-requests');
    revalidatePath('/lawyer/saved-requests');

    return { success: true };
  } catch (error: any) {
    console.error('Error in saveRequest:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 2. UNSAVE REQUEST (Remove Bookmark)
// =====================================================

export async function unsaveRequest(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete bookmark
    const { error } = await supabase
      .from('saved_requests')
      .delete()
      .eq('lawyer_id', user.id)
      .eq('request_id', requestId);

    if (error) {
      console.error('Error removing bookmark:', error);
      return { success: false, error: 'Failed to remove bookmark' };
    }

    // Revalidate paths
    revalidatePath('/lawyer/public-requests');
    revalidatePath('/lawyer/saved-requests');

    return { success: true };
  } catch (error: any) {
    console.error('Error in unsaveRequest:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 3. GET SAVED REQUESTS
// =====================================================

export async function getSavedRequests(): Promise<ActionResult<SavedRequest[]>> {
  const supabase = await createClient();try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch saved requests with request details
    const { data, error } = await supabase
      .from('saved_requests')
      .select(
        `
                *,
                request:legal_requests (
                    id,
                    request_number,
                    title,
                    description,
                    priority,
                    status,
                    visibility,
                    proposal_deadline,
                    complexity_level,
                    budget_min,
                    budget_max,
                    created_at,
                    public_posted_at,
                    department:departments (
                        id,
                        name
                    ),
                    proposal_count:request_proposals(id)
                )
            `
      )
      .eq('lawyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved requests:', error);
      return {
        success: false,
        error: `Failed to fetch saved requests: ${error.message} (${error.code})`,
      };
    }

    return { success: true, data: data as SavedRequest[] };
  } catch (error: any) {
    console.error('Error in getSavedRequests:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 4. CHECK IF REQUEST IS SAVED
// =====================================================

export async function isRequestSaved(
  requestId: string
): Promise<ActionResult<{
  const supabase = await createClient();
isSaved: boolean }>> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if bookmark exists
    const { data, error } = await supabase
      .from('saved_requests')
      .select('id')
      .eq('lawyer_id', user.id)
      .eq('request_id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine
      console.error('Error checking saved status:', error);
      return { success: false, error: 'Failed to check bookmark status' };
    }

    return { success: true, data: { isSaved: !!data } };
  } catch (error: any) {
    console.error('Error in isRequestSaved:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// ======================================================
// 5. UPDATE BOOKMARK NOTES
// =====================================================

export async function updateBookmarkNotes(requestId: string, notes: string): Promise<ActionResult> {
  const supabase = await createClient();try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update notes
    const { error } = await supabase
      .from('saved_requests')
      .update({ notes })
      .eq('lawyer_id', user.id)
      .eq('request_id', requestId);

    if (error) {
      console.error('Error updating bookmark notes:', error);
      return { success: false, error: 'Failed to update notes' };
    }

    revalidatePath('/lawyer/saved-requests');

    return { success: true };
  } catch (error: any) {
    console.error('Error in updateBookmarkNotes:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// =====================================================
// 6. GET SAVED REQUESTS COUNT
// =====================================================

export async function getSavedRequestsCount(): Promise<ActionResult<{
  const supabase = await createClient();
count: number }>> {
  try {
    

    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { count, error } = await supabase
      .from('saved_requests')
      .select('*', { count: 'exact', head: true })
      .eq('lawyer_id', user.id);

    if (error) {
      console.error('Error getting saved requests count:', error);
      return { success: false, error: 'Failed to get count' };
    }

    return { success: true, data: { count: count || 0 } };
  } catch (error: any) {
    console.error('Error in getSavedRequestsCount:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
