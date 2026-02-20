import { createClient } from '@/lib/supabase/server';
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

  if (!user) {redirect('/login');
  }

  // Fetch lawyer profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'lawyer') {
    redirect('/login');
  }

  // Fetch all assigned cases
  const { data: cases } = await supabase
    .from('legal_requests')
    .select('*')
    .eq('assigned_lawyer_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .eq('lawyer_id', user.id)
    .order('created_at', { ascending: false });

  // Calculate current month vs previous month for trends
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthCases = cases?.filter((c) => new Date(c.created_at) >= currentMonthStart) || [];

  const previousMonthCases =
    cases?.filter((c) => {
      const date = new Date(c.created_at);
      return date >= previousMonthStart && date <= previousMonthEnd;
    }) || [];

  // Fetch profile views (last 30 days)
  // TODO: Implement profile_views tracking table
  // For now, set to 0 until tracking is implemented
  const profileViewsLast30Days = 0;
  const profileViewsPrevious30Days = 0;

  // Fetch messages data
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

  const conversationIds = conversations?.map((c) => c.id) || [];

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });

  const messagesSent = messages?.filter((m) => m.sender_id === user.id) || [];
  const messagesReceived = messages?.filter((m) => m.sender_id !== user.id) || [];

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
