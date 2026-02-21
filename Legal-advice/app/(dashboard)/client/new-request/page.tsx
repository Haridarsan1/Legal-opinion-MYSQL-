import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import NewRequestForm from './NewRequestForm';

export const metadata: Metadata = {
  title: 'New Request - Legal Opinion Portal',
  description: 'Create a new legal opinion request',
};

export default async function NewRequestPage() {
  

  // Fetch departments for selection
  const { data: departments } = await (await __getSupabaseClient()).from('departments')
    .select('*')
    .order('name', { ascending: true });

  return <NewRequestForm departments={departments || []} />;
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
