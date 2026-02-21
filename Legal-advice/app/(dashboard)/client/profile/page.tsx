import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import ProfileContent from './ProfileContent';

export const metadata: Metadata = {
  title: 'Profile - Legal Opinion Portal',
  description: 'Manage your account settings',
};

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {return <div>Unauthorized</div>;
  }

  // Fetch user profile
  const { data: profile } = await (await __getSupabaseClient()).from('profiles').select('*').eq('id', user.id).single();

  return <ProfileContent profile={profile} />;
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
