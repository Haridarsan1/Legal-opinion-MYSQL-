import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import LawyerProfileContent from './LawyerProfileContent';

export const metadata: Metadata = {
  title: 'Lawyer Profile - Legal Opinion Portal',
  description: 'View lawyer profile and expertise',
};

export default async function LawyerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user;

  // Fetch lawyer profile
  const { data: lawyer, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'lawyer')
    .single();

  if (error || !lawyer) {
    notFound();
  }

  // Fetch departments for consultation form
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .eq('active', true)
    .order('name');

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('lawyer_reviews')
    .select(
      `
            id,
            rating,
            review_text,
            created_at,
            request_id,
            client:profiles!client_id (
                full_name,
                avatar_url
            )
        `
    )
    .eq('lawyer_id', id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  // Calculate derived stats (redundant to DB but good for checking)
  const validReviews = reviews || [];

  const stats = {
    cases: lawyer.total_cases_handled || 0,
    rating: lawyer.average_rating || 0,
    experience: lawyer.years_of_experience || 0,
    successRate: null, // Not yet tracked
  };

  return (
    <LawyerProfileContent
      lawyer={lawyer}
      stats={stats}
      departments={departments || []}
      clientId={user?.id || ''}
      reviews={validReviews}
    />
  );
}
