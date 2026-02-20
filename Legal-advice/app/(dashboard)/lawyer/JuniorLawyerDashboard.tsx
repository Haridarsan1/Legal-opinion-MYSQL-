'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Search,
  Clock,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  TrendingUp,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { format } from 'date-fns';
import { resolveDashboardTitle } from '@/lib/lawyer-utils';

export default function JuniorLawyerDashboard({
  profile,
  tasks,
  activeResearchCases,
  avgRating,
}: {
  profile: any;
  tasks: any[];
  activeResearchCases: any[];
  avgRating: number;
}) {
  const supabase = createClient();
  const router = useRouter();

  const handleStartTask = async (taskId: string) => {
    const { error } = await supabase
      .from('firm_tasks')
      .update({ status: 'in_progress' })
      .eq('id', taskId);
    if (error) toast.error('Failed to start task');
    else {
      toast.success('Task started');
      router.refresh();
    }
  };

  const handleSubmitTask = async (taskId: string) => {
    const { error } = await supabase
      .from('firm_tasks')
      .update({ status: 'submitted' })
      .eq('id', taskId);
    if (error) toast.error('Failed to submit task');
    else {
      toast.success('Task submitted for review');
      router.refresh();
    }
  };

  // Calculate Metrics
  const activeCasesCount = activeResearchCases.length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const urgentTasksCount = tasks.filter(
    (t) => t.priority === 'high' && t.status !== 'completed'
  ).length;
  // Mock metric for success rate as verified data is not available
  const successRate = 98;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
      case 'submitted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'urgent':
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{resolveDashboardTitle(profile)}</h1>
          <p className="text-slate-500 mt-1">Welcome back, {profile.full_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search case files..."
              className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-slate-400 text-slate-700"
            />
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            New Opinion
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full shrink-0">
        <StatCard
          label="Active Cases"
          value={activeCasesCount}
          icon={Briefcase}
          trend="+12%"
          color="blue"
        />
        <StatCard
          label="Drafts to Review"
          value={pendingTasksCount}
          icon={FileText}
          priority
          color="amber"
        />
        <StatCard label="Urgent Tasks" value={urgentTasksCount} icon={AlertCircle} color="purple" />
        <StatCard
          label="Client Rating"
          value={avgRating.toFixed(1)}
          icon={CheckCircle2}
          subtext="Average"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-1 min-h-0">
        {/* Active Cases Section (8/12) */}
        <div className="lg:col-span-8 h-full">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                Active Cases
              </h2>
              <Link
                href="/lawyer/cases"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All Cases
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {activeResearchCases.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {activeResearchCases.slice(0, 10).map((c) => (
                    <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-400">
                              #{c.request_number}
                            </span>
                            {c.priority === 'high' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-100">
                                High Priority
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {c.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(c.created_at), 'dd/MM/yyyy')}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              4h Remaining
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/lawyer/cases/${c.id}`}
                          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap self-start sm:self-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">No active cases</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                    You're all caught up! Enjoy your day.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Section (1/3) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
              Drafts Pending Review
            </h2>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {tasks.length} Total
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {tasks.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3">
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                          task.priority === 'high'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-blue-50 text-blue-600'
                        )}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Submitted by Current User
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {task.priority === 'high' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              Urgent
                            </span>
                          )}

                          {task.status === 'pending' ? (
                            <button
                              onClick={() => handleStartTask(task.id)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors ml-auto"
                            >
                              Start Review
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSubmitTask(task.id)}
                              className="text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors ml-auto"
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No pending drafts</p>
              </div>
            )}

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-xs font-semibold text-slate-600 hover:text-primary transition-colors">
                View Full Activity Feed
              </button>
            </div>
          </div>

          {/* SLA Warning Card */}
          <div className="bg-slate-900 rounded-xl p-5 shadow-lg text-white">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm mb-2 text-white">SLA BREACH WARNING</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  3 cases are nearing critical SLA thresholds. Immediate sign-off required for{' '}
                  <strong className="text-white">Global Bank Corp</strong> to maintain team KPIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, priority, subtext, color }: any) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-b-4 border-blue-600',
    amber: 'bg-amber-50 text-amber-600 border-b-4 border-amber-500',
    purple: 'bg-purple-50 text-purple-600 border-b-4 border-purple-500',
    green: 'bg-green-50 text-green-600 border-b-4 border-green-500',
  };

  const style = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue;
  const iconColor = style.split(' ')[1]; // Extract text-color class
  const bgColor = style.split(' ')[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColor} ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-100">
            {trend}
          </span>
        )}
        {priority && (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded border border-amber-100 uppercase tracking-wide">
            Priority
          </span>
        )}
        {subtext && (
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {subtext}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        {/* Progress Bar Visual (Decorative) */}
        <div
          className={`h-1.5 w-16 mt-4 rounded-full ${color === 'blue' ? 'bg-blue-600' : color === 'amber' ? 'bg-amber-500' : color === 'purple' ? 'bg-purple-500' : 'bg-green-500'}`}
        />
      </div>
    </div>
  );
}
