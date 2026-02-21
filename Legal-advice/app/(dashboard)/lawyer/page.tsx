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

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch lawyer profile
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
  });

  if (!profile || profile.role !== 'lawyer') {
    redirect('/auth/login');
  }

  // Fetch assigned cases with client info
  const assignedCases = await prisma.legal_requests.findMany({
    where: { assigned_lawyer_id: user.id },
    include: {
      profiles_legal_requests_client_idToprofiles: {
        select: { id: true, full_name: true, email: true, avatar_url: true },
      },
      departments: {
        select: { name: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  // Fetch lawyer rating summary
  const ratingSummaryResult = await getLawyerRatingSummary(user.id!);
  const avgRating =
    ratingSummaryResult.success && ratingSummaryResult.data ? ratingSummaryResult.data.average : 0;

  // Fetch unread message count (guard if messaging tables are not in schema)
  let unreadCount = 0;
  const prismaAny = prisma as any;

  if (prismaAny.conversations && prismaAny.messages) {
    const userConversations = await prismaAny.conversations.findMany({
      where: {
        OR: [
          { participant_1_id: user.id },
          { participant_2_id: user.id },
        ],
      },
      select: { id: true },
    });

    const conversationIds = userConversations.map((c: any) => c.id);

    unreadCount = await prismaAny.messages.count({
      where: {
        read: false,
        sender_id: { not: user.id },
        conversation_id: {
          in: conversationIds,
        },
      },
    });
  }

  // Fetch tasks (guard if firm_tasks table is not in schema)
  let tasks: any[] = [];
  if ((prisma as any).firm_tasks) {
    tasks = await (prisma as any).firm_tasks.findMany({
      where: {
        assigned_to: user.id,
        status: { not: 'completed' },
      },
      orderBy: { due_date: 'asc' },
    });
  }

  const canReviewDrafts = hasPermission(profile, 'review_drafts');
  let reviews: any[] = [];
  if (canReviewDrafts) {
    reviews = await prisma.legal_requests.findMany({
      where: { status: 'in_review' },
      orderBy: { updated_at: 'desc' },
    });
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
