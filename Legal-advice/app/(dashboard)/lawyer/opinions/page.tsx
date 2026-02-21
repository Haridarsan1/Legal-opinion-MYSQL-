import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyerOpinions from './LawyerOpinions';

export const metadata: Metadata = {
  title: 'My Opinions - Legal Opinion Portal',
  description: 'Manage and track all submitted legal opinions',
};

export default async function LawyerOpinionsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile to verify lawyer role
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'lawyer') {
    redirect('/lawyer');
  }

  // Fetch all cases with opinions where this lawyer is assigned
  const { data: cases } = await (await __getSupabaseClient()).from('legal_requests')
    .select(
      `
            *,
            client:profiles!legal_requests_client_id_fkey(
                full_name,
                email
            ),
            department:departments(
                name
            ),
            rating:ratings(
                overall_rating,
                feedback,
                created_at
            ),
            clarifications:clarifications(id, is_resolved),
            opinion_details:legal_opinions(status, updated_at)
        `
    )
    .eq('assigned_lawyer_id', user.id)
    .order('created_at', { ascending: false });

  // Filter to only show cases that have a draft OR a submitted opinion
  const relevantCases =
    cases?.filter(
      (c: any) => c.opinion_text !== null || (c.opinion_details && c.opinion_details.length > 0)
    ) || [];

  return <LawyerOpinions cases={relevantCases} userId={user.id!} lawyerName={profile.full_name} />;
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
