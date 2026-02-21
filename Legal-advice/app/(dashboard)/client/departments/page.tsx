import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import DepartmentsListContent from './DepartmentsListContent';

export const metadata: Metadata = {
  title: 'Legal Departments - Legal Opinion Portal',
  description: 'Explore our specialized legal practice areas',
};

export default async function DepartmentsPage() {
  

  // Fetch all departments
  const { data: departments } = await (await __getSupabaseClient()).from('departments')
    .select('*')
    .order('name', { ascending: true });

  return <DepartmentsListContent departments={departments || []} />;
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
