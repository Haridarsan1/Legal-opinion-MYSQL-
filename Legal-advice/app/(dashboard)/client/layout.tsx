import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ClientSidebar from '@/components/client/ClientSidebar';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {const session = await auth();
  const user = session?.user;

  if (!user) {redirect('/auth/login');
  }

  const { data: profile } = await (await __getSupabaseClient()).from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'client') {
    redirect('/auth/login');
  }

  // Client layout uses parent dashboard layout's Sidebar, no need to wrap again
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
