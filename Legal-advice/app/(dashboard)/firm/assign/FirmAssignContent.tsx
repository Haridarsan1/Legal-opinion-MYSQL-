'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';
import StampedOpinionSection from '@/components/shared/StampedOpinionSection';
import RatingsDisplay from '@/components/shared/RatingsDisplay';
import { formatDistanceToNow } from 'date-fns';
import { assignCaseToLawyer } from '@/app/actions/requests';

interface Props {
  cases: any[];
  lawyers: any[];
  ratings: any[];
}

export default function FirmAssignContent({ cases, lawyers, ratings }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAssign = (requestId: string, lawyerId: string) => {
    setAssigningId(requestId);

    startTransition(async () => {
      const result = await assignCaseToLawyer(requestId, lawyerId);

      if (result?.success) {
        toast.success('Case assigned to lawyer successfully');
        setSelectedLawyer((prev) => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
        router.refresh();
      } else {
        toast.error(
          result?.error === 'already_assigned_or_unavailable'
            ? 'This case is already assigned or unavailable'
            : 'Failed to assign case'
        );
      }

      setAssigningId(null);
    });
  };

  // Filter cases by search
  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      (caseItem.request_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (caseItem.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (caseItem.client?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const columns = [
    {
      key: 'request_number',
      label: 'Case ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs font-semibold text-slate-900">#{value}</span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (_: any, caseItem: any) => (
        <p className="font-medium text-slate-900 truncate max-w-xs">{caseItem.title || 'N/A'}</p>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (_: any, caseItem: any) => (
        <p className="text-sm text-slate-900">{caseItem.client?.full_name || 'N/A'}</p>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (_: any, caseItem: any) => (
        <p className="text-sm text-slate-900">{caseItem.department?.name || 'N/A'}</p>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          low: 'bg-green-50 text-green-700 border-green-200',
          medium: 'bg-blue-50 text-blue-700 border-blue-200',
          high: 'bg-amber-50 text-amber-700 border-amber-200',
          urgent: 'bg-red-50 text-red-700 border-red-200',
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded border ${colors[value] || colors.medium} uppercase`}
          >
            {value || 'medium'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any) => <StatusBadge status={value} />,
    },
    {
      key: 'assigned_lawyer_id',
      label: 'Assigned Lawyer',
      render: (_: any, caseItem: any) => {
        const isAssigned = caseItem.lawyer?.full_name;
        const isAssigning = assigningId === caseItem.id;
        const hasLawyers = lawyers.length > 0;
        const selectedValue = selectedLawyer[caseItem.id] || '';

        if (isAssigned) {
          return (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-slate-900">{caseItem.lawyer.full_name}</p>
            </div>
          );
        }

        // Unassigned case
        if (!hasLawyers) {
          return (
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400">No lawyers available</p>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <select
              value={selectedValue}
              onChange={(e) =>
                setSelectedLawyer((prev) => ({ ...prev, [caseItem.id]: e.target.value }))
              }
              disabled={isAssigning}
              className="form-select block rounded border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary px-2 py-1.5 text-xs disabled:opacity-50"
            >
              <option value="">Select lawyer...</option>
              {lawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.full_name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedValue) {
                  handleAssign(caseItem.id, selectedValue);
                }
              }}
              disabled={!selectedValue || isAssigning}
              className="px-2 py-1.5 rounded bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Submitted',
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-slate-500">
          {value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 gap-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/firm"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors w-fit text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Firm Cases</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            {cases.length === 0
              ? 'No cases assigned to your firm yet.'
              : `View and manage ${cases.length} case(s) assigned to your firm`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by case ID, title, or client name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input block w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary h-11 pl-10 pr-4 text-sm"
        />
      </div>

      {/* Stamped Opinion Submission Section */}
      <StampedOpinionSection cases={cases} />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCases}
        emptyState={{
          title: cases.length === 0 ? 'No cases yet' : 'No cases found',
          description:
            cases.length === 0
              ? 'Your firm has no cases assigned yet. Check back later.'
              : 'Try adjusting your search',
        }}
      />

      {/* Firm Ratings Section */}
      <RatingsDisplay ratings={ratings} />
    </div>
  );
}
