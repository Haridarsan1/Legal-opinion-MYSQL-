import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ClientRequestsList from './ClientRequestsList';
import { getClientDashboardSummaries } from '@/app/actions/client';

export const metadata = {
  title: 'My Requests - Legal Opinion',
  description: 'View and manage your legal opinion requests',
};

export default async function ClientRequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch client's requests using the new lifecycle-aware aggregator
  const response = await getClientDashboardSummaries();

  const requests_list = response.data || [];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Requests</h1>
          <p className="text-slate-600 mt-1">Manage all your legal opinion requests</p>
        </div>
        <Link
          href="/client/new-request"
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      <ClientRequestsList initialRequests={requests_list} />
    </div>
  );
}
