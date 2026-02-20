import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import NotificationsPageContent from '@/components/notifications/NotificationsPageContent';

export const metadata = {
  title: 'Notifications - Legal Opinion',
  description: 'View your notifications',
};

export default async function ClientNotificationsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect('/auth/login');

  // Fetch notifications
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
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
      role="client"
      userId={user.id}
    />
  );
}
