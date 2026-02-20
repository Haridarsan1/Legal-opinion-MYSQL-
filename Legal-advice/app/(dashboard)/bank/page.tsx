
import { TrendingUp, Clock, FileCheck, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';

export default async function BankHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!hasPermission(profile, 'access_bank_dashboard')) {
    redirect('/');
  }

  const recentRequests = [
    {
      id: '#LN-2024',
      propertyAddress: '123 Marine Drive, Mumbai',
      loanAmount: '₹2.5 Cr',
      status: 'in_review' as const,
      assignedFirm: 'Wilson & Associates',
      sla: '48h Standard',
      dueDate: 'Oct 24',
    },
    {
      id: '#LN-2023',
      propertyAddress: '456 MG Road, Bangalore',
      loanAmount: '₹1.8 Cr',
      status: 'opinion_ready' as const,
      assignedFirm: 'Legal Partners LLP',
      sla: '24h Expedited',
      dueDate: 'Oct 23',
    },
    {
      id: '#LN-2020',
      propertyAddress: '789 Park Street, Kolkata',
      loanAmount: '₹3.2 Cr',
      status: 'delivered' as const,
      assignedFirm: 'Wilson & Associates',
      sla: '72h Regular',
      dueDate: 'Oct 22',
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          HDFC Bank - Legal Opinion Portal
        </h1>
        <p className="text-slate-500 text-base">
          Manage property legal opinions for home loan processing
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Total Requests</p>
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-xl">description</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">348</p>
          <p className="text-green-600 text-sm flex items-center gap-1">
            <TrendingUp className="size-4" />
            +18 this month
          </p>
        </div>

        {/* Active Loans */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Active Loans</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCheck className="size-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">42</p>
          <p className="text-slate-500 text-sm">In verification</p>
        </div>

        {/* Avg. Turnaround */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Avg. Turnaround</p>
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="size-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">36h</p>
          <p className="text-green-600 text-sm">Within SLA targets</p>
        </div>

        {/* Pending Actions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Pending Actions</p>
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="size-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">8</p>
          <p className="text-slate-500 text-sm">Requires attention</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests - Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Requests</h2>
              <Link
                href="/bank/track"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400">{request.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                          {request.sla}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{request.propertyAddress}</h3>
                      <p className="text-sm text-slate-500 mb-2">
                        Loan Amount: {request.loanAmount}
                      </p>
                      <p className="text-sm text-slate-600">Assigned to: {request.assignedFirm}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Due: {request.dueDate}</span>
                    <Link
                      href="/bank/track"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Track →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Performance */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">SLA Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">24h Expedited</span>
                  <span className="text-sm font-bold text-green-600">98% on-time</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">48h Standard</span>
                  <span className="text-sm font-bold text-green-600">96% on-time</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">72h Regular</span>
                  <span className="text-sm font-bold text-green-600">99% on-time</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/bank/upload"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
              >
                <div className="p-2 bg-primary rounded-lg">
                  <span className="material-symbols-outlined text-white text-lg">upload_file</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Upload Property Files</p>
                  <p className="text-xs text-slate-500">Start new request</p>
                </div>
              </Link>

              <Link
                href="/bank/assign"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="p-2 bg-slate-200 rounded-lg">
                  <span className="material-symbols-outlined text-slate-600 text-lg">
                    assignment_ind
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Assign to Law Firm</p>
                  <p className="text-xs text-slate-500">Select verified firms</p>
                </div>
              </Link>

              <Link
                href="/bank/track"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="p-2 bg-slate-200 rounded-lg">
                  <span className="material-symbols-outlined text-slate-600 text-lg">
                    track_changes
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Track Status</p>
                  <p className="text-xs text-slate-500">Monitor requests</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Action Required</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>3 opinions pending your review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>5 requests need firm assignment</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Partner Firms */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Top Partner Firms</h3>
            <div className="space-y-3">
              {[
                { name: 'Wilson & Associates', rating: 4.9, cases: 84 },
                { name: 'Legal Partners LLP', rating: 4.8, cases: 67 },
                { name: 'Mumbai Law Chambers', rating: 4.7, cases: 52 },
              ].map((firm, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{firm.name}</p>
                    <p className="text-xs text-slate-500">{firm.cases} cases completed</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                    <span className="font-bold text-slate-900 text-sm">{firm.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="material-symbols-outlined text-green-600 text-xl">
                  check_circle
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-900">API Integration Active</p>
                <p className="text-xs text-slate-600">Automated submissions enabled</p>
              </div>
            </div>
            <Link
              href="/bank/integration"
              className="text-xs font-medium text-primary hover:underline"
            >
              Manage Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
