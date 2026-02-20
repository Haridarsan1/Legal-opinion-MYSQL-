'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, FileText, ChevronsUpDown } from 'lucide-react';
import { LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';
import CaseTableRow from './CaseTableRow';
import CaseRowCard from './CaseRowCard';

interface Props {
  requests: LifecycleSummary[];
}

type SortField = 'case' | 'status' | 'progress' | 'sla' | 'next_step' | 'lawyer' | 'created';
type SortDirection = 'asc' | 'desc';

export default function CaseTableView({ requests }: Props) {
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending when switching columns
    }
  };

  // Sort requests based on current sort field and direction
  const sortedRequests = [...requests].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'case':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.lifecycleState.localeCompare(b.lifecycleState);
        break;
      case 'progress':
        comparison = a.progress.progress - b.progress.progress;
        break;
      case 'sla':
        // Sort by SLA status priority: overdue > at-risk > on-track > none
        const slaOrder = { overdue: 3, 'at-risk': 2, 'on-track': 1, none: 0 };
        const aOrder = slaOrder[a.sla.status as keyof typeof slaOrder] || 0;
        const bOrder = slaOrder[b.sla.status as keyof typeof slaOrder] || 0;
        comparison = aOrder - bOrder;
        break;
      case 'next_step':
        comparison = a.nextStep.title.localeCompare(b.nextStep.title);
        break;
      case 'lawyer':
        const aLawyer = a.lawyer?.full_name || '';
        const bLawyer = b.lawyer?.full_name || '';
        comparison = aLawyer.localeCompare(bLawyer);
        break;
      case 'created':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-slate-900" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
    );
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No cases found</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Try adjusting your filters or search query to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10"></th>

              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => handleSort('case')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Case
                  </span>
                  <SortIcon field="case" />
                </div>
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </span>
                  <SortIcon field="status" />
                </div>
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors min-w-[150px]"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Progress
                  </span>
                  <SortIcon field="progress" />
                </div>
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('sla')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    SLA
                  </span>
                  <SortIcon field="sla" />
                </div>
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('next_step')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Next Step
                  </span>
                  <SortIcon field="next_step" />
                </div>
              </th>

              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('lawyer')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Assigned
                  </span>
                  <SortIcon field="lawyer" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((request) => (
              <CaseTableRow key={request.id} request={request} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Fallback - Card List */}
      <div className="lg:hidden divide-y divide-slate-200">
        {sortedRequests.map((request) => (
          <div key={request.id} className="p-4">
            <CaseRowCard request={request} />
          </div>
        ))}
      </div>
    </div>
  );
}
