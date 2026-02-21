import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import NotificationsPageContent from '@/components/notifications/NotificationsPageContent';

export const metadata = {
  title: 'Notifications - Lawyer Dashboard',
  description: 'Stay updated on your cases, deadlines, and client messages',
};

export default async function NotificationsPage() {
  

  // Get authenticated user
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch real notifications from database
  const { data: notifications, error } = await (await __getSupabaseClient()).from('notifications')
    .select(
      `
            *,
            request:legal_requests(
                id,
                request_number,
                title,
                status,
                client:profiles!legal_requests_client_id_fkey(full_name)
            )
        `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
  }

  const notificationsList = notifications || [];

  return (
    <NotificationsPageContent
      initialNotifications={notificationsList}
      role="lawyer"
      userId={user.id!}
    />
  );
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
