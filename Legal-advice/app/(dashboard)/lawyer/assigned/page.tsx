import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import AssignedRequestsContent from './AssignedRequestsContent';

export const metadata: Metadata = {
  title: 'Assigned Requests - Lawyer Dashboard',
  description: 'View and manage your assigned legal cases',
};

export default async function AssignedRequestsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {return <div>Unauthorized</div>;
  }

  // Fetch assigned cases
  const { data: assignedCases } = await supabase
    .from('legal_requests')
    .select(
      `
            *,
            client:profiles!legal_requests_client_id_fkey(full_name, email),
            department:departments(name)
        `
    )
    .eq('assigned_lawyer_id', user.id)
    .order('created_at', { ascending: false });

  // Calculate stats
  const totalRequests = assignedCases?.length || 0;
  const acceptedRequests =
    assignedCases?.filter((c) => c.lawyer_acceptance_status === 'accepted' || c.accepted_by_lawyer)
      .length || 0;
  const rejectedRequests =
    assignedCases?.filter((c) => c.lawyer_acceptance_status === 'rejected').length || 0;
  const urgent =
    assignedCases?.filter((c) => {
      if (!c.deadline) return false;
      const daysUntilDeadline = Math.ceil(
        (new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDeadline <= 2 && c.status !== 'completed';
    }).length || 0;

  // Fetch departments for filter
  const { data: departments } = await supabase.from('departments').select('id, name').order('name');

  return (
    <AssignedRequestsContent
      cases={assignedCases || []}
      departments={departments || []}
      stats={{
        totalRequests,
        acceptedRequests,
        rejectedRequests,
        urgent,
      }}
    />
  );
}
