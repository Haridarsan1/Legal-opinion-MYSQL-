'use client';

import { useState, useMemo } from 'react';
import { Grid, Table } from 'lucide-react';
import SummaryDashboard from './components/SummaryDashboard';
import CaseGridView from './components/CaseGridView';
import CaseTableView from './components/CaseTableView';
import { SortOption } from './utils/trackUtils';
import { LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';
import { useViewMode } from './hooks/useViewMode';

interface Props {
  requests: LifecycleSummary[];
}

export default function TrackStatusContent({ requests }: Props) {
  // View Mode with localStorage persistence
  const { viewMode, setViewMode, isHydrated } = useViewMode();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('urgency');

  // Filter and Sort Logic
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req: any) => {
        // Search
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          req.title?.toLowerCase().includes(searchLower) ||
          req.request_number?.toLowerCase().includes(searchLower) ||
          req.lawyer?.full_name?.toLowerCase().includes(searchLower);

        // Dashboard Bucket Filter
        const matchesFilter =
          filter === 'ALL' ||
          (filter === 'active' && req.dashboardBucket === 'ACTIVE') ||
          (filter === 'action_needed' && req.dashboardBucket === 'ACTION_NEEDED') ||
          (filter === 'sla_risk' && req.dashboardBucket === 'SLA_RISK') ||
          (filter === 'completed' && req.dashboardBucket === 'COMPLETED');

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        // Sort Logic (applied to grid view only, table has its own sorting)
        if (sortOption === 'urgency') return b.urgencyScore - a.urgencyScore;
        if (sortOption === 'newest')
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortOption === 'oldest')
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortOption === 'sla_risk') {
          // Sort by SLA risk
          const slaOrder = { overdue: 3, 'at-risk': 2, 'on-track': 1, none: 0 };
          const aOrder = slaOrder[a.sla.status as keyof typeof slaOrder] || 0;
          const bOrder = slaOrder[b.sla.status as keyof typeof slaOrder] || 0;
          return bOrder - aOrder;
        }
        return 0;
      });
  }, [requests, searchQuery, filter, sortOption]);

  return (
    <div className="space-y-6">
      <SummaryDashboard requests={requests} />

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Filter Buttons */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
          {['ALL', 'active', 'action_needed', 'sla_risk', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              suppressHydrationWarning
            >
              {f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search, Sort, and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm"
              suppressHydrationWarning
            />
          </div>

          <div className="flex gap-2">
            {/* Sort dropdown - only show in Grid View */}
            {
  viewMode === 'grid' && (
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                suppressHydrationWarning
              >
                <option value="urgency">Smart Sort (Urgency)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="sla_risk">SLA Risk</option>
              </select>
            )}

            {/* View Mode Toggle */}
            {
  isHydrated && (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Grid View"
                  suppressHydrationWarning
                >
                  <Grid className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
                    viewMode === 'table'
                      ? 'bg-white shadow text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Table View"
                  suppressHydrationWarning
                >
                  <Table className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Table</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Renderer */}
      {
  isHydrated && (
        <>
          {viewMode === 'grid' ? (
            <CaseGridView requests={filteredRequests} />
          ) : (
            <CaseTableView requests={filteredRequests} />
          )}
        </>
      )}

      {/* Loading state while hydrating */}
      {!isHydrated && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
