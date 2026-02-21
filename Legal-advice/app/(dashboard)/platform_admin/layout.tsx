import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Platform Admin - Legal Opinion Portal',
  description: 'Platform administration dashboard',
};

export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  

  // Get authenticated user
  const session = await auth();
  const user = session?.user;

  if (!user) {redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await (await __getSupabaseClient()).from('profiles').select('*').eq('id', user.id).single();

  // Check if user is platform admin
  if (profile?.role !== 'platform_admin') {
    redirect('/auth/login');
  }

  // The parent (dashboard) layout already renders the sidebar
  // So we just return the children
  return <>{children}</>;
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
