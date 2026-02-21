import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyerAnalyticsContent from './LawyerAnalyticsV2';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const metadata: Metadata = {
  title: 'Analytics - Legal Opinion Portal',
  description: 'View your performance analytics and insights',
};

export default async function LawyerAnalyticsPage() {
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

  // Fetch all assigned cases
  const cases = await prisma.legal_requests.findMany({
    where: { assigned_lawyer_id: user.id },
    orderBy: { created_at: 'desc' },
  });

  // Fetch ratings
  const ratings = await prisma.lawyer_reviews.findMany({
    where: { lawyer_id: user.id },
    orderBy: { created_at: 'desc' },
  });

  // Calculate current month vs previous month for trends
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthCases = cases.filter((c) => new Date(c.created_at!) >= currentMonthStart) || [];

  const previousMonthCases =
    cases.filter((c) => {
      const date = new Date(c.created_at!);
      return date >= previousMonthStart && date <= previousMonthEnd;
    }) || [];

  // Fetch profile views (last 30 days)
  // TODO: Implement profile_views tracking table
  // For now, set to 0 until tracking is implemented
  const profileViewsLast30Days = 0;
  const profileViewsPrevious30Days = 0;

  // Fetch messages data
  const userConversations = await prisma.conversations.findMany({
    where: {
      OR: [
        { participant_1_id: user.id },
        { participant_2_id: user.id },
      ],
    },
    select: { id: true },
  });

  const conversationIds = userConversations.map((c) => c.id);

  const messages = await prisma.messages.findMany({
    where: {
      conversation_id: { in: conversationIds },
    },
  });

  const messagesSent = messages.filter((m) => m.sender_id === user.id);
  const messagesReceived = messages.filter((m) => m.sender_id !== user.id);

  return (
    <LawyerAnalyticsContent
      profile={profile}
      allCases={cases || []}
      allRatings={ratings || []}
      currentMonthCases={currentMonthCases}
      previousMonthCases={previousMonthCases}
      profileViewsLast30Days={profileViewsLast30Days}
      profileViewsPrevious30Days={profileViewsPrevious30Days}
      messagesSent={messagesSent}
      messagesReceived={messagesReceived}
    />
  );
}
