import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyersListContent from './LawyersListContent';

export const metadata = {
  title: 'Find a Lawyer - Legal Opinion Portal',
  description: 'Browse verified legal experts by specialization and experience',
};

export default async function LawyersListPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch all lawyers with their stats
  const { data: lawyers, error } = await (await __getSupabaseClient()).from('profiles')
    .select(
      `
            id,
            full_name,
            email,
            avatar_url,
            location,
            specialization,
            years_of_experience,
            average_rating,
            total_reviews,
            availability_status
        `
    )
    .eq('role', 'lawyer')
    .order('average_rating', { ascending: false, nullsFirst: false })
    .order('full_name');

  if (error) {
    console.error('Error fetching lawyers:', error);
  }

  // Fetch case counts for each lawyer
  const { data: caseCounts } = await (await __getSupabaseClient()).from('legal_requests')
    .select('assigned_lawyer_id, status')
    .not('assigned_lawyer_id', 'is', null);

  // Calculate stats for each lawyer
  const lawyersWithStats = (lawyers || []).map((lawyer: any) => {
    const lawyerCases = caseCounts?.filter((c: any) => c.assigned_lawyer_id === lawyer.id) || [];
    return {
      ...lawyer,
      specialization: lawyer.specialization
        ? Array.isArray(lawyer.specialization)
          ? lawyer.specialization
          : [lawyer.specialization]
        : [],
      // Map DB fields to UI expected fields
      rating: lawyer.average_rating || 0,
      reviews_count: lawyer.total_reviews || 0,
      title: 'Legal Expert', // Default title since it's not in DB
      totalCases: lawyerCases.length,
      completedCases: lawyerCases.filter(
        (c: any) => c.status === 'completed' || c.status === 'delivered'
      ).length,
    };
  });

  // Fetch departments for filter options
  const { data: departments } = await (await __getSupabaseClient()).from('departments')
    .select('id, name')
    .eq('active', true)
    .order('name');

  return <LawyersListContent lawyers={lawyersWithStats} departments={departments || []} />;
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
