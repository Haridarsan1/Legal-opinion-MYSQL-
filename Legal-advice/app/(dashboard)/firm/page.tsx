import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Card from '@/components/shared/Card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckSquare, AlertCircle, Building2, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { hasPermission } from '@/lib/permissions';

export default async function FirmOwnerDashboard() {


  // 1. Get User & Profile
  const session = await auth();
  const user = session?.user;
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile, 'access_firm_dashboard')) {
    redirect('/login'); // Or unauthorized page
  }

  const firmId = profile.firm_id;

  if (!firmId) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">No Firm Assigned</h2>
        <p className="text-slate-500">Please contact support or complete onboarding.</p>
      </div>
    );
  }

  // 2. Parallel Fetching
  const [{ data: requests }, { count: taskCount }, { data: recentRequests }] = await Promise.all([
    // Requests for Stats
    (await __getSupabaseClient()).from('legal_requests')
      .select('id, status, client_id, bank_id')
      .eq('firm_id', firmId)
      .neq('status', 'completed')
      .neq('status', 'cancelled'),

    // Pending Tasks Count
    (await __getSupabaseClient()).from('firm_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('firm_id', firmId)
      .neq('status', 'completed'),

    // Recent Activity
    (await __getSupabaseClient()).from('legal_requests')
      .select('*, client:client_id(full_name)')
      .eq('firm_id', firmId)
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  // 3. Process Stats
  const activeRequests = requests?.length || 0;
  const bankRequests = requests?.filter((r: any) => r.bank_id).length || 0;
  const clientRequests = requests?.filter((r: any) => r.client_id && !r.bank_id).length || 0;

  const stats = {
    activeRequests,
    bankRequests,
    clientRequests,
    pendingTasks: taskCount || 0,
    slaAtRisk: 0, // Placeholder logic
  };

  const recentActivity = recentRequests || [];

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Firm Dashboard</h1>
        <p className="text-slate-500">Overview of firm operations and performance</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Active Requests</p>
            <h3 className="text-2xl font-bold">{stats.activeRequests}</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Bank Requests</p>
            <h3 className="text-2xl font-bold">{stats.bankRequests}</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Pending Tasks</p>
            <h3 className="text-2xl font-bold">{stats.pendingTasks}</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">SLA At Risk</p>
            <h3 className="text-2xl font-bold">{stats.slaAtRisk}</h3>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
        {/* Recent Requests */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Firm Activity</h2>
            <Link href="/firm/requests" className="text-primary text-sm hover:underline">
              View All
            </Link>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-medium">Request</th>
                  <th className="p-4 font-medium">Client/Bank</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((req: any) => (
                  <tr key={req.id} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="p-4 font-medium">
                      {req.title}{' '}
                      <span className="text-slate-400 block text-xs">{req.request_number}</span>
                    </td>
                    <td className="p-4">{req.client?.full_name}</td>
                    <td className="p-4">
                      <Badge variant="outline">{req.status}</Badge>
                    </td>
                    <td className="p-4 text-right text-slate-500">
                      {new Date(req.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {
                  recentActivity.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No recent activity
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </Card>
        </section>

        {/* Quick Actions / Shortcuts */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Capabilities</h2>
          <div className="grid gap-3">
            <Link
              href="/firm/requests"
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">Manage Requests</span>
            </Link>
            <Link
              href="/firm/team"
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">Manage Team</span>
            </Link>
            <Link
              href="/firm/tasks"
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">Assignments</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
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
