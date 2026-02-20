import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import RatingsContent from './RatingsContent';

export const metadata: Metadata = {
  title: 'Rate Your Experience - Legal Opinion Portal',
  description: 'Share feedback on your legal consultation',
};

export default async function RatingsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch client's legal requests with lawyer details
  const { data: requests } = await supabase
    .from('legal_requests')
    .select(
      `
            id,
            request_number,
            title,
            department,
            status,
            created_at,
            assigned_lawyer_id,
            lawyer:assigned_lawyer_id(
                id,
                full_name,
                avatar_url,
                specialization
            ),
            lawyer_reviews(id, rating, created_at)
        `
    )
    .eq('client_id', user.id)
    .not('assigned_lawyer_id', 'is', null)
    .order('created_at', { ascending: false });

  // Normalize relations and filter requests eligible for rating (have interactions)
  const eligibleRequests = (requests || []).map((req: any) => ({
    ...req,
    lawyer: Array.isArray(req.lawyer) ? req.lawyer[0] : req.lawyer,
  }));

  return <RatingsContent userId={user.id} requests={eligibleRequests} />;
}
