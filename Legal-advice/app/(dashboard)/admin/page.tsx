import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';

export default async function AdminHomePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!hasPermission(profile, 'view_admin_dashboard')) {
    redirect('/');
  }

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          Platform Admin Dashboard
        </h1>
        <p className="text-slate-500 text-base">
          Manage users, content, and monitor system health across the entire platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Total Users</p>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="size-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">2,847</p>
          <p className="text-green-600 text-sm flex items-center gap-1">
            <TrendingUp className="size-4" />
            +248 this month
          </p>
        </div>

        {/* Active Requests */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Active Requests</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="size-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">564</p>
          <p className="text-slate-500 text-sm">Across all clients</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Monthly Revenue</p>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="size-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">₹1.8Cr</p>
          <p className="text-green-600 text-sm flex items-center gap-1">
            <TrendingUp className="size-4" />
            +32% vs last month
          </p>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">System Health</p>
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1">99.8%</p>
          <p className="text-slate-500 text-sm">Uptime</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Growth Chart */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">User Growth (Last 12 Months)</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {[420, 485, 512, 548, 595, 638, 692, 745, 812, 891, 952, 1024].map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-primary rounded-t-lg hover:bg-primary/80 transition-colors cursor-pointer"
                      style={{ height: `${(value / 1024) * 240}px` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Activity */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Platform Activity</h2>
              <Link
                href="/admin/analytics"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                {
                  action: 'New Law Firm Registered',
                  details: 'Supreme Legal Associates joined the platform',
                  time: '2 hours ago',
                  icon: 'business',
                  color: 'text-blue-600 bg-blue-100',
                },
                {
                  action: 'High Volume Alert',
                  details: '50+ requests submitted in the last hour',
                  time: '3 hours ago',
                  icon: 'trending_up',
                  color: 'text-amber-600 bg-amber-100',
                },
                {
                  action: 'System Maintenance Completed',
                  details: 'Database optimization successful',
                  time: '5 hours ago',
                  icon: 'check_circle',
                  color: 'text-green-600 bg-green-100',
                },
              ].map((activity, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      <span className="material-symbols-outlined text-xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">{activity.action}</h3>
                      <p className="text-sm text-slate-600 mb-1">{activity.details}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
              >
                <div className="p-2 bg-primary rounded-lg">
                  <span className="material-symbols-outlined text-white text-lg">group</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Manage Users</p>
                  <p className="text-xs text-slate-500">2,847 total users</p>
                </div>
              </Link>

              <Link
                href="/admin/content"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="p-2 bg-slate-200 rounded-lg">
                  <span className="material-symbols-outlined text-slate-600 text-lg">
                    edit_note
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Content Management</p>
                  <p className="text-xs text-slate-500">Templates & checklists</p>
                </div>
              </Link>

              <Link
                href="/admin/security-logs"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="p-2 bg-slate-200 rounded-lg">
                  <span className="material-symbols-outlined text-slate-600 text-lg">security</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Security Logs</p>
                  <p className="text-xs text-slate-500">Monitor access</p>
                </div>
              </Link>

              <Link
                href="/admin/disputes"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="p-2 bg-slate-200 rounded-lg">
                  <span className="material-symbols-outlined text-slate-600 text-lg">gavel</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Dispute Resolution</p>
                  <p className="text-xs text-slate-500">3 pending</p>
                </div>
              </Link>
            </div>
          </div>

          {/* User Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">User Distribution</h3>
            <div className="space-y-3">
              {[
                { role: 'Clients', count: 1248, percentage: 44, color: 'bg-blue-500' },
                { role: 'Lawyers', count: 892, percentage: 31, color: 'bg-purple-500' },
                { role: 'Law Firms', count: 428, percentage: 15, color: 'bg-green-500' },
                { role: 'Banks', count: 256, percentage: 9, color: 'bg-amber-500' },
                { role: 'Admins', count: 23, percentage: 1, color: 'bg-red-500' },
              ].map((stat) => (
                <div key={stat.role}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{stat.role}</span>
                    <span className="text-sm text-slate-500">
                      {stat.count} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`${stat.color} h-2 rounded-full transition-all`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="material-symbols-outlined text-green-600 text-xl">cloud_done</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">All Systems Operational</p>
                <p className="text-xs text-slate-600">Last checked: 2 mins ago</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">API Response Time:</span>
                <span className="font-bold text-green-600">42ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Database Status:</span>
                <span className="font-bold text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Storage Usage:</span>
                <span className="font-bold text-slate-900">62%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
