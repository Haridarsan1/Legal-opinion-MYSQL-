import { createClient } from '@/lib/supabase/server';
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
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await (await __getSupabaseClient()).from('profiles').select('*').eq('id', user.id).single();

  // Fetch all requests with related data
  const { data: requests } = (await __getSupabaseClient()).from('legal_requests')
    .select(
      `
            *,
            lawyer:assigned_lawyer_id(id, full_name, avatar_url),
            department_info:departments(name)
        `
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch unread message count
  const { count: unreadCount } = (await __getSupabaseClient()).from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)
    .neq('sender_id', user.id)
    .in(
      'conversation_id',
      (await __getSupabaseClient()).from('conversations')
        .select('id')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .then((res: any) => res.data?.map((c: any) => c.id) || [])
    );

  // Fetch marketplace metrics
  const metricsRes = await getClientMarketplaceMetrics();
  const marketplaceMetrics = metricsRes.success ? metricsRes.data : null;

  // Fetch dashboard summaries (Lifecycle Resolved)
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
