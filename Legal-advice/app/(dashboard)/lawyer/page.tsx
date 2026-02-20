import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyerDashboardContent from './LawyerDashboardContent';
import { hasPermission } from '@/lib/permissions';

export const metadata: Metadata = {
  title: 'Dashboard - Legal Opinion Portal',
  description: 'Lawyer dashboard for managing assigned cases',
};

export default async function LawyerDashboardPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {redirect('/login');
  }

  // Fetch lawyer profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'lawyer') {
    redirect('/login');
  }

  // Fetch assigned cases with client info
  const { data: assignedCases } = await supabase
    .from('legal_requests')
    .select(
      `
            *,
            client:client_id(id, full_name, email, avatar_url),
            department_info:departments(name)
        `
    )
    .eq('assigned_lawyer_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch lawyer rating summary
  const ratingSummaryResult = await getLawyerRatingSummary(user.id);
  const avgRating =
    ratingSummaryResult.success && ratingSummaryResult.data ? ratingSummaryResult.data.average : 0;

  // Fetch unread message count
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)
    .neq('sender_id', user.id)
    .in('conversation_id', conversations?.map((c) => c.id) || []);

  // Fetch tasks
  const { data: tasks } = await supabase
    .from('firm_tasks')
    .select('*')
    .eq('assigned_to', user.id)
    .neq('status', 'completed')
    .order('due_date', { ascending: true });

  const canReviewDrafts = hasPermission(profile, 'review_drafts');
  let reviews: any[] = [];
  if (canReviewDrafts) {
    const { data } = await supabase
      .from('legal_requests')
      .select('*')
      .eq('status', 'in_review')
      .order('updated_at', { ascending: false });
    reviews = data || [];
  }

  // Fetch marketplace metrics
  const metricsRes = await getLawyerMarketplaceMetrics();
  const marketplaceMetrics = metricsRes.success ? metricsRes.data : null;

  if (!hasPermission(profile, 'view_senior_dashboard')) {
    return (
      <JuniorLawyerDashboard
        profile={profile}
        tasks={tasks || []}
        activeResearchCases={assignedCases || []}
        avgRating={avgRating}
      />
    );
  }

  // Default to Senior Layout
  return (
    <SeniorLawyerDashboard
      profile={profile}
      cases={assignedCases || []}
      tasks={tasks || []}
      reviews={reviews}
      marketplaceMetrics={marketplaceMetrics}
      avgRating={avgRating}
    />
  );
}

import JuniorLawyerDashboard from './JuniorLawyerDashboard';
import SeniorLawyerDashboard from './SeniorLawyerDashboard';
import { getLawyerMarketplaceMetrics } from '@/app/actions/lawyer';
import { getLawyerRatingSummary } from '@/app/actions/reviews';
