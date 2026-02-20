import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { listFirmCases, listLawyers } from '@/app/actions/requests';
import FirmAssignContent from './FirmAssignContent';

export const metadata: Metadata = {
  title: 'Assign Cases - Firm Dashboard',
  description: 'Assign firm cases to lawyers',
};

export default async function FirmAssignPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Fetch firm cases and available lawyers using server actions
  const casesResult = await listFirmCases();
  const lawyersResult = await listLawyers();

  const cases = casesResult?.success ? casesResult.data || [] : [];
  const lawyers = lawyersResult?.success ? lawyersResult.data || [] : [];

  // Fetch reviews for these lawyers (Aggregate Firm Reputation)
  let ratings: any[] = [];
  if (lawyers.length > 0) {
    const lawyerIds = lawyers.map((l: any) => l.id);
    const { data: reviews } = await supabase
      .from('lawyer_reviews')
      .select(
        `
                *,
                client:profiles!lawyer_reviews_client_id_fkey(full_name, avatar_url)
            `
      )
      .in('lawyer_id', lawyerIds)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to recent 50 reviews for valid performance

    ratings = reviews || [];
  }

  return <FirmAssignContent cases={cases} lawyers={lawyers} ratings={ratings} />;
}
