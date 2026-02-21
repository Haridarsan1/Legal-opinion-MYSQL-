'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition, useEffect } from 'react';
import { acceptRequest, rejectRequest } from '@/app/actions/phase2_workflows';
import {
  Search,
  SlidersHorizontal,
  FolderOpen,
  X,
  Check,
  CalendarDays,
  Bell,
  Plus,
  Filter,
} from 'lucide-react';
import AssignedRequestsFilterPanel, {
  FilterState,
  initialFilterState,
} from '@/components/lawyer/AssignedRequestsFilterPanel';
import { getLifecycleLabel } from '@/app/domain/lifecycle/LifecycleResolver';

interface Department {
  id: string;
  name: string;
}

interface CaseData {
  id: string;
  title: string;
  description: string;
  status: string;
  lawyer_acceptance_status?: 'pending' | 'accepted' | 'rejected';
  accepted_by_lawyer?: boolean;
  priority: string;
  deadline: string | null;
  created_at: string;
  client: { full_name: string; email: string } | null;
  department: { name: string } | null;
}

interface Props {
  cases: CaseData[];
  departments: Department[];
  stats: {
    totalRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    urgent: number;
  };
}

export default function AssignedRequestsContent({ cases, departments, stats }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredCases = useMemo(() => {
    return cases.filter((c: any) => {
      // 1. Search Query
      const matchesSearch = searchQuery
        ? `${c.title} ${c.client?.full_name ?? ''} ${c.id}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true;

      // 2. Priority Filter
      const matchesPriority =
        filters.priority.length === 0 || filters.priority.includes(c.priority);

      // 3. Status/Workflow Filter
      // Mapping UI status to valid case data status
      const matchesStatus =
        filters.status.length === 0 ||
        filters.status.some((s) => {
          if (s === 'Pending Acceptance')
            return c.lawyer_acceptance_status === 'pending' || !c.lawyer_acceptance_status;
          if (s === 'Accepted') return c.lawyer_acceptance_status === 'accepted';
          if (s === 'Rejected') return c.lawyer_acceptance_status === 'rejected';
          if (s === 'Completed') return c.status === 'completed';
          // Add more complex mappings if needed based on 'status' field
          return false;
        });

      // 4. Department Filter
      const matchesDept =
        filters.department.length === 0 ||
        (c.department && filters.department.includes(c.department.name));

      // 5. Date Range Logic (Created At)
      const createdDate = new Date(c.created_at).getTime();
      const afterStart =
        !filters.dateRange.start || createdDate >= new Date(filters.dateRange.start).getTime();
      const beforeEnd =
        !filters.dateRange.end ||
        createdDate <= new Date(filters.dateRange.end).getTime() + 86400000; // Add 1 day for inclusive end

      // 6. SLA/Deadline Logic
      const matchesSLA =
        filters.sla.length === 0 ||
        filters.sla.some((sla) => {
          if (!c.deadline) return false;
          const today = new Date();
          const deadline = new Date(c.deadline);
          const diffDays = Math.ceil(
            (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (sla === 'Overdue') return diffDays < 0;
          if (sla === 'Due Today') return diffDays === 0;
          if (sla === 'Due Tomorrow') return diffDays === 1;
          if (sla === 'This Week') return diffDays >= 0 && diffDays <= 7;
          return false;
        });

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesDept &&
        afterStart &&
        beforeEnd &&
        matchesSLA
      );
    });
  }, [cases, searchQuery, filters]);

  // Hydration mismatch prevention for dates
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show filtered results after mount to ensure date consistency
  const displayCases = mounted ? filteredCases : cases;

  const initials = (name?: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('');
  };

  const handleAccept = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await acceptRequest(id);
      if (!res.success) {
        alert(res.error || 'Failed to accept request');
      } else {
        window.location.reload();
      }
      setPendingId(null);
    });
  };

  const handleReject = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await rejectRequest(id);
      if (!res.success) {
        alert(res.error || 'Failed to reject request');
      } else {
        window.location.reload();
      }
      setPendingId(null);
    });
  };

  const removeFilter = (key: keyof FilterState, value: string | null) => {
    if (key === 'dateRange') {
      setFilters((prev) => ({ ...prev, dateRange: { start: null, end: null } }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: (prev[key] as string[]).filter((item) => item !== value),
      }));
    }
  };

  const activeFilterCount = Object.entries(filters).reduce((acc, [key, value]) => {
    if (key === 'dateRange') return acc + (value.start || value.end ? 1 : 0);
    return acc + (value as string[]).length;
  }, 0);

  return (
    <div className="flex flex-col relative">
      {/* Filter Panel */}
      <AssignedRequestsFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        setFilters={setFilters}
        departments={departments}
        onApply={() => setIsFilterPanelOpen(false)}
        onClear={() => setFilters(initialFilterState)}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">Lawyer workspace</p>
            <h1 className="text-2xl font-bold text-gray-900">Assigned Requests</h1>
            <p className="text-sm text-gray-600">
              Manage your assigned client requests and update their status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
              <Bell className="w-5 h-5" />
              Alerts
            </button>
            <Link
              href="/lawyer/requests"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shrink-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRequests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Accepted</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.acceptedRequests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Rejected</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{stats.rejectedRequests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Case ID, Client, or Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setIsFilterPanelOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-gray-700 ${activeFilterCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            More Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(initialFilterState)}
              className="text-sm text-red-600 hover:underline px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {
  activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.priority.map((p) => (
              <Chip key={p} label={`Priority: ${p}`} onRemove={() => removeFilter('priority', p)} />
            ))}
            {
  filters.status.map((s) => (
              <Chip key={s} label={`Status: ${s}`} onRemove={() => removeFilter('status', s)} />
            ))}
            {
  filters.department.map((d: any) => (
              <Chip key={d} label={`Dept: ${d}`} onRemove={() => removeFilter('department', d)} />
            ))}
            {
  filters.clientType.map((c: any) => (
              <Chip key={c} label={`Client: ${c}`} onRemove={() => removeFilter('clientType', c)} />
            ))}
            {
  filters.sla.map((s) => (
              <Chip key={s} label={`Due: ${s}`} onRemove={() => removeFilter('sla', s)} />
            ))}
            {(filters.dateRange.start || filters.dateRange.end) && (
              <Chip
                label={`Date: ${filters.dateRange.start || '...'} - ${filters.dateRange.end || '...'}`}
                onRemove={() => removeFilter('dateRange', null)}
              />
            )}
          </div>
        )}

        <div className="flex items-center text-xs text-gray-500 gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Last updated: Just now</span>
          <span className="text-gray-300">|</span>
          <span>
            Showing {displayCases.length} result{displayCases.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#F8FAFC] px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1.1fr,1.4fr,1.1fr,1fr,1fr,1fr,1fr] bg-gray-50 text-xs font-semibold text-gray-500 px-4 py-3 sticky top-0 z-10">
            <span>Case ID</span>
            <span>Subject</span>
            <span>Client Name</span>
            <span>Department</span>
            <span>Status</span>
            <span>Date Received</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-gray-200">
            {displayCases.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your filters or search query.
                </p>
                <button
                  onClick={() => {
                    setFilters(initialFilterState);
                    setSearchQuery('');
                  }}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              displayCases.map((caseItem) => {
                const isLoadingRow = pendingId === caseItem.id && isPending;
                return (
                  <div
                    key={caseItem.id}
                    className="grid grid-cols-[1.1fr,1.4fr,1.1fr,1fr,1fr,1fr,1fr] px-4 py-4 items-center"
                  >
                    <Link
                      href={`/lawyer/review/${caseItem.id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      CASE-{caseItem.id.slice(0, 4).toUpperCase()}
                    </Link>
                    <div className="flex flex-col text-sm text-gray-900 leading-5">
                      <span className="font-semibold">{caseItem.title}</span>
                      <span className="text-xs text-gray-500 line-clamp-2">
                        {caseItem.description || 'No description provided.'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-900">
                      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                        {initials(caseItem.client?.full_name)}
                      </div>
                      <div className="flex flex-col leading-5">
                        <span className="font-semibold">
                          {caseItem.client?.full_name || 'Unknown client'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {caseItem.client?.email || ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 inline-flex w-max border border-blue-100">
                      {caseItem.department?.name || 'General'}
                    </span>

                    {/* Status Column */}
                    <div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          caseItem.status === 'completed' || caseItem.status === 'case_closed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : caseItem.status === 'opinion_ready'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {getLifecycleLabel(caseItem.status as any)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(caseItem.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      {caseItem.lawyer_acceptance_status !== 'rejected' && (
                        <button
                          onClick={() => handleAccept(caseItem.id)}
                          disabled={
                            isLoadingRow || caseItem.lawyer_acceptance_status === 'accepted'
                          }
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                            caseItem.lawyer_acceptance_status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 disabled:opacity-60'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />{' '}
                          {
  caseItem.lawyer_acceptance_status === 'accepted' ? 'Accepted' : 'Accept'}
                        </button>
                      )}
                      {
  caseItem.lawyer_acceptance_status !== 'accepted' && (
                        <button
                          onClick={() => handleReject(caseItem.id)}
                          disabled={
                            isLoadingRow || caseItem.lawyer_acceptance_status === 'rejected'
                          }
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                            caseItem.lawyer_acceptance_status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-red-600 text-white border-red-600 hover:bg-red-700 disabled:opacity-60'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />{' '}
                          {
  caseItem.lawyer_acceptance_status === 'rejected' ? 'Rejected' : 'Reject'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-blue-900 rounded-full p-0.5 hover:bg-blue-100 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
