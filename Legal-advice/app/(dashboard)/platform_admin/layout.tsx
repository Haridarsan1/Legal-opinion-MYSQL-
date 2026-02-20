import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Platform Admin - Legal Opinion Portal',
  description: 'Platform administration dashboard',
};

export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Check if user is platform admin
  if (profile?.role !== 'platform_admin') {
    redirect('/auth/login');
  }

  // The parent (dashboard) layout already renders the sidebar
  // So we just return the children
  return <>{children}</>;
}
