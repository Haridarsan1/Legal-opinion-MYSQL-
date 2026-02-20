import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ClientSidebar from '@/components/client/ClientSidebar';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {const session = await auth();
  const user = session?.user;

  if (!user) {redirect('/auth/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'client') {
    redirect('/auth/login');
  }

  // Client layout uses parent dashboard layout's Sidebar, no need to wrap again
  return <>{children}</>;
}
