import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AuditLogsContent from './AuditLogsContent';

export const metadata: Metadata = {
  title: 'Audit Logs - Legal Opinion Portal',
  description: 'View activity history and audit trail',
};

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Fetch audit logs for the user
  const { data: logs } = await supabase
    .from('audit_logs')
    .select(
      `
            *,
            request:legal_requests(title, request_number)
        `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return <AuditLogsContent logs={logs || []} />;
}
