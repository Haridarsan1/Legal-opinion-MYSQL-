'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  FileCheck,
  Bookmark,
  LayoutGrid,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { resolveDashboardTitle } from '@/lib/lawyer-utils';

export default function SeniorLawyerDashboard({
  profile,
  cases,
  tasks,
  reviews,
  marketplaceMetrics,
  avgRating,
}: {
  profile: any;
  cases: any[];
  tasks: any[];
  reviews: any[];
  marketplaceMetrics?: {
    totalProposals: number;
    acceptedProposals: number;
    pendingProposals: number;
    successRate: number;
    bookmarkedCount: number;
  } | null;
  avgRating: number;
}) {
  const router = useRouter();

  // Mock calculations or use real data
  const activeCasesCount = cases.length;
  const pendingReviewsCount = reviews.length;
  const proposalsSent = marketplaceMetrics?.totalProposals || 0;
  const successRate = marketplaceMetrics?.successRate || 95;
  const canReviewDrafts = hasPermission(profile, 'review_drafts');
  const canAccessMarketplace = hasPermission(profile, 'access_marketplace');
  const dashboardTitle = resolveDashboardTitle(profile);

  return (
    <div className="flex-1 w-full h-full flex flex-col space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{dashboardTitle}</h1>
          <p className="text-slate-500 mt-1">Welcome back, {profile.full_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search active cases..."
              className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-slate-400 text-slate-700"
            />
          </div>
          {canAccessMarketplace && (
            <Link
              href="/lawyer/public-requests"
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Browse Marketplace
            </Link>
          )}
        </div>
      </header>

      {/* Metrics Grid */}
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full shrink-0">
        <StatCard
          label="Active Cases"
          value={activeCasesCount}
          icon={Briefcase}
          trend="+5%"
          color="blue"
        />
        {canReviewDrafts && (
          <StatCard
            label="Drafts to Review"
            value={pendingReviewsCount}
            icon={FileCheck}
            priority
            color="amber"
          />
        )}
        <StatCard
          label="Proposals Sent"
          value={proposalsSent}
          icon={LayoutGrid}
          color="purple"
          subtext="This Month"
        />
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
                href="/lawyer/assigned"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All Cases
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {cases.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {cases.slice(0, 10).map((c) => (
                    <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-400">
                              #{c.request_number}
                            </span>
                            {c.priority === 'urgent' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-100">
                                Urgent
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {c.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5" />
                              {c.client?.full_name || 'Client'}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(c.created_at), 'dd/MM/yyyy')}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/lawyer/cases/${c.id}`}
                          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap self-start sm:self-center"
                        >
                          Manage Case
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
                    Start by browsing the marketplace for new opportunities.
                  </p>
                  <Link
                    href="/lawyer/public-requests"
                    className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                  >
                    Browse Requests
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Section (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {canReviewDrafts && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
                  Pending Reviews
                </h2>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {reviews.length} Total
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {reviews.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {reviews.map((r: any) => (
                      <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{r.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              Submitted by: {r.submitted_by_name || 'Associate'}
                            </p>
                            <button className="mt-3 w-full text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md transition-colors">
                              Review Draft
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">All drafts reviewed</p>
                  </div>
                )}

                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    href="/lawyer/reviews"
                    className="text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
                  >
                    View All Reviews
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Saved Requests Widget */}
          {marketplaceMetrics?.bookmarkedCount ? (
            <div className="bg-blue-900 rounded-xl p-5 shadow-lg text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-blue-300" />
                  <h4 className="font-bold text-sm text-white">Saved Requests</h4>
                </div>
                <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-bold">
                  {marketplaceMetrics.bookmarkedCount}
                </span>
              </div>
              <p className="text-xs text-blue-200 mb-4">
                You have saved requests waiting for proposals.
              </p>
              <Link
                href="/lawyer/saved-requests"
                className="block w-full text-center py-2 bg-white text-blue-900 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              >
                View Saved Items
              </Link>
            </div>
          ) : null}
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
  const iconColor = style.split(' ')[1];
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
        <div
          className={`h-1.5 w-16 mt-4 rounded-full ${color === 'blue' ? 'bg-blue-600' : color === 'amber' ? 'bg-amber-500' : color === 'purple' ? 'bg-purple-500' : 'bg-green-500'}`}
        />
      </div>
    </div>
  );
}
