import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LawyerOpinions from './LawyerOpinions';

export const metadata: Metadata = {
  title: 'My Opinions - Legal Opinion Portal',
  description: 'Manage and track all submitted legal opinions',
};

export default async function LawyerOpinionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile to verify lawyer role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'lawyer') {
    redirect('/lawyer');
  }

  // Fetch all cases with opinions where this lawyer is assigned
  const { data: cases } = await supabase
    .from('legal_requests')
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
      (c) => c.opinion_text !== null || (c.opinion_details && c.opinion_details.length > 0)
    ) || [];

  return <LawyerOpinions cases={relevantCases} userId={user.id} lawyerName={profile.full_name} />;
}
