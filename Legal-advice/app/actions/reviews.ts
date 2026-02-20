'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// =====================================================
// TYPES
// =====================================================

export interface LawyerReview {
  id: string;
  request_id: string;
  lawyer_id: string;
  client_id: string;
  rating: number;
  review_text: string | null;
  interaction_type: 'opinion' | 'chat' | 'call' | 'full_case' | null;
  is_visible: boolean;
  is_approved: boolean;
  created_at: string;
  client?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

// =====================================================
// 1. CHECK ELIGIBILITY
// =====================================================

export async function getReviewEligibility(
  requestId: string
): Promise<ActionResult<{ eligible: boolean; reason?: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // 1. Fetch Request Details
    const { data: request, error: reqError } = await supabase
      .from('legal_requests')
      .select('id, client_id, assigned_lawyer_id, status')
      .eq('id', requestId)
      .single();

    if (reqError || !request) return { success: false, error: 'Request not found' };

    // 2. Check Ownership
    if (request.client_id !== user.id) {
      return {
        success: true,
        data: { eligible: false, reason: 'You are not the client of this request' },
      };
    }

    // 3. Check Status (Must be completed/delivered)
    const eligibleStatuses = ['completed', 'delivered', 'opinion_ready', 'closed']; // Adjust based on exact enum values
    // Note: 'opinion_ready' usually means delivered. 'closed' and 'completed' are terminal.
    if (!eligibleStatuses.includes(request.status)) {
      // Also check strict completion if relying on audit logs, but status check is faster first
      return { success: true, data: { eligible: false, reason: 'Request is not yet completed' } };
    }

    // 4. Check if already reviewed
    const { data: existingReview } = await supabase
      .from('lawyer_reviews')
      .select('id')
      .eq('request_id', requestId)
      .eq('client_id', user.id)
      .single();

    if (existingReview) {
      return { success: true, data: { eligible: false, reason: 'Review already submitted' } };
    }

    return { success: true, data: { eligible: true } };
  } catch (error: any) {
    console.error('Error checking review eligibility:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// 3. UPDATE LAWYER STATS (Internal Helper)
// =====================================================

async function updateLawyerStats(lawyerId: string) {
  const supabase = await createClient();

  // Calculate new average and count
  const { data: reviews, error } = await supabase
    .from('lawyer_reviews')
    .select('rating')
    .eq('lawyer_id', lawyerId)
    .eq('is_visible', true)
    .eq('is_approved', true);

  if (error) {
    console.error('Error fetching reviews for stats update:', error);
    return;
  }

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

  // Update profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      average_rating: Number(averageRating.toFixed(1)), // Keep 1 decimal place
      total_reviews: totalReviews,
    })
    .eq('id', lawyerId);

  if (updateError) {
    console.error('Error updating lawyer stats:', updateError);
  }
}

// =====================================================
// 4. SUBMIT REVIEW
// =====================================================

export async function submitReview(
  requestId: string,
  rating: number,
  reviewText: string,
  interactionType: string
): Promise<ActionResult> {
  try {
    // 1. Validate Input
    if (rating < 1 || rating > 5) return { success: false, error: 'Invalid rating (1-5)' };

    // 2. Check Eligibility (Re-run logic for security)
    const eligibility = await getReviewEligibility(requestId);
    if (!eligibility.success || !eligibility.data?.eligible) {
      return {
        success: false,
        error: eligibility.data?.reason || eligibility.error || 'Not eligible to review',
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch lawyer ID again to be safe
    const { data: request } = await supabase
      .from('legal_requests')
      .select('assigned_lawyer_id')
      .eq('id', requestId)
      .single();

    if (!request?.assigned_lawyer_id)
      return { success: false, error: 'No lawyer assigned to this request' };

    // 3. Insert Review
    const { error } = await supabase.from('lawyer_reviews').insert({
      request_id: requestId,
      lawyer_id: request.assigned_lawyer_id,
      client_id: user!.id,
      rating,
      review_text: reviewText,
      interaction_type: interactionType,
      is_visible: true,
      is_approved: true,
    });

    if (error) throw error;

    // 4. Update Lawyer Stats
    await updateLawyerStats(request.assigned_lawyer_id);

    // 5. Revalidate cache
    revalidatePath(`/client/requests/${requestId}`);
    revalidatePath(`/lawyer/profile/${request.assigned_lawyer_id}`);
    revalidatePath('/dashboard/client/ratings'); // If there's a list

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// 5. UPDATE REVIEW
// =====================================================

export async function updateLawyerReview(
  reviewId: string,
  rating: number,
  reviewText: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // Validate
    if (rating < 1 || rating > 5) return { success: false, error: 'Invalid rating' };

    // Update
    const { data: review, error } = await supabase
      .from('lawyer_reviews')
      .update({
        rating,
        review_text: reviewText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .eq('client_id', user.id) // Security check
      .select('lawyer_id, request_id')
      .single();

    if (error) throw error;

    // Update Stats
    await updateLawyerStats(review.lawyer_id);

    revalidatePath(`/client/requests/${review.request_id}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// 6. DELETE REVIEW
// =====================================================

export async function deleteLawyerReview(reviewId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get review details first to know which lawyer to update stats for
    const { data: review } = await supabase
      .from('lawyer_reviews')
      .select('lawyer_id, request_id')
      .eq('id', reviewId)
      .eq('client_id', user?.id)
      .single();

    if (!review) return { success: false, error: 'Review not found or unauthorized' };

    // Delete
    const { error } = await supabase.from('lawyer_reviews').delete().eq('id', reviewId);

    if (error) throw error;

    // Update Stats
    await updateLawyerStats(review.lawyer_id);

    revalidatePath(`/client/requests/${review.request_id}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// 7. GET LAWYER REVIEWS
// =====================================================

export async function getLawyerReviews(lawyerId: string): Promise<ActionResult<LawyerReview[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('lawyer_reviews')
      .select(
        `
                *,
                client:profiles!client_id (
                    full_name,
                    avatar_url
                )
            `
      )
      .eq('lawyer_id', lawyerId)
      .eq('is_visible', true)
      .eq('is_approved', true) // Only public approved reviews
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as LawyerReview[] };
  } catch (error: any) {
    console.error('Error fetching lawyer reviews:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// 8. GET LAWYER RATING SUMMARY
// =====================================================
export async function getLawyerRatingSummary(lawyerId: string) {
  try {
    const supabase = await createClient();

    // Optimization: Fetch directly from profiles if available, but for distribution we still need raw reviews or a separate stats table.
    // For now, continuing to calculate distribution on fly, but taking average from profiles could be faster if we trust it 100%.
    // Let's stick to calculating from reviews for consistency in this view,
    // OR fetch avg from profile and distribution from reviews.

    const { data, error } = await supabase
      .from('lawyer_reviews')
      .select('rating')
      .eq('lawyer_id', lawyerId)
      .eq('is_approved', true);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        success: true,
        data: { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      };
    }

    const total = data.length;
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = Number((sum / total).toFixed(1));

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    data.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
    });

    return { success: true, data: { average, total, distribution } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
