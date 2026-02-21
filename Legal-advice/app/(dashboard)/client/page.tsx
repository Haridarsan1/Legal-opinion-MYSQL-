import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import ClientDashboardContent from './ClientDashboardContent';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard - Legal Opinion Portal',
  description: 'Client dashboard for managing legal requests',
};

export default async function ClientDashboardPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    redirect('/auth/login');
  }

  // Fetch all requests with related data
  const requests = await prisma.legal_requests.findMany({
    where: { client_id: user.id },
    include: {
      profiles_legal_requests_assigned_lawyer_idToprofiles: {
        select: { id: true, full_name: true, avatar_url: true },
      },
      departments: {
        select: { name: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

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

  // Fetch marketplace metrics
  const metricsRes = await getClientMarketplaceMetrics();
  const marketplaceMetrics = metricsRes.success ? metricsRes.data : null;

  // Fetch dashboard summaries
  const dashboardRes = await getClientDashboardSummaries();
  const initialData = dashboardRes.success && dashboardRes.data ? dashboardRes.data : [];

  return (
    <ClientDashboardContent
      profile={profile}
      initialData={initialData}
      unreadMessages={unreadCount || 0}
      marketplaceMetrics={marketplaceMetrics}
    />
  );
}

import { getClientMarketplaceMetrics, getClientDashboardSummaries } from '@/app/actions/client';
