import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { SidebarProvider } from '@/components/providers/SidebarProvider';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {const session = await auth();
  const user = session?.user;

  if (!user) {redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile) {
    redirect('/login');
  }

  // Lawyer routes have their own layout, so just render children without wrapper
  if (profile.role === 'lawyer') {
    return <>{children}</>;
  }

  // For other roles (client, bank, admin), render with sidebar and navbar
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar role={profile.role} user={profile} />
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <Navbar user={profile} />
          <main className="flex-1 overflow-y-auto p-6 scroll-smooth overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
