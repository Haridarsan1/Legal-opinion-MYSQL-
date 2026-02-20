import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyerSidebar from '@/components/lawyer/LawyerSidebar';

import { SidebarProvider } from '@/components/providers/SidebarProvider';
import Navbar from '@/components/layout/Navbar';

export default async function LawyerLayout({ children }: { children: React.ReactNode }) {const session = await auth();
  const user = session?.user;

  if (!user) {redirect('/auth/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'lawyer') {
    redirect('/auth/login');
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        <LawyerSidebar user={profile} />
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
          <Navbar user={profile} />
          <main className="flex-1 w-full p-6 flex flex-col overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
