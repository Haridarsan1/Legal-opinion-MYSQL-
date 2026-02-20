import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyerProfileContent from './LawyerProfileContent';

export default async function LawyerProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch lawyer profile data + role-specific lawyer record
  const { data } = await supabase
    .from('profiles')
    .select(
      `
      *,
      lawyer:lawyers(*)
    `
    )
    .eq('id', user.id)
    .single();

  const profile = data;
  const lawyerProfile = (data as any)?.lawyer || null;

  if (!profile || profile.role !== 'lawyer') {
    redirect('/auth/login');
  }

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
    .eq('lawyer_id', user.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  return <LawyerProfileContent profile={profile} lawyerProfile={lawyerProfile} reviews={reviews || []} />;
}
