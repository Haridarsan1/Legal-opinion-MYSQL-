import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, AlertCircle, Globe } from 'lucide-react';

import { getLawyerDashboardSummaries } from '@/app/actions/lawyer-workspace';
import { LifecycleStatus } from '@/app/domain/lifecycle/LifecycleResolver';

export const metadata = {
  title: 'My Requests - Legal Opinion',
  description: 'View and manage your assigned legal requests',
};

export default async function LawyerRequestsPage() {
  const { success, data: requests, error } = await getLawyerDashboardSummaries();

  if (!success || error) {
    console.error('Error fetching requests:', error);
  }

  const requests_list = requests || [];

  const statusConfig: Partial<
    Record<LifecycleStatus, { label: string; color: string; bg: string; icon: any }>
  > = {
    draft: {
      label: 'Client Drafting',
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      icon: FileText,
    },
    submitted: { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-100', icon: Clock },
    marketplace_posted: {
      label: 'Marketplace',
      color: 'text-indigo-700',
      bg: 'bg-indigo-100',
      icon: Globe,
    }, // Globe not imported? default to Clock
    assigned: {
      label: 'Assigned',
      color: 'text-purple-700',
      bg: 'bg-purple-100',
      icon: CheckCircle,
    },
    clarification_pending: {
      label: 'Needs Clarification',
      color: 'text-amber-700',
      bg: 'bg-amber-100',
      icon: AlertCircle,
    },
    in_review: { label: 'In Review', color: 'text-blue-700', bg: 'bg-blue-100', icon: FileText },
    opinion_ready: {
      label: 'Opinion Ready',
      color: 'text-green-700',
      bg: 'bg-green-100',
      icon: CheckCircle,
    },
    delivered: {
      label: 'Delivered',
      color: 'text-green-700',
      bg: 'bg-green-100',
      icon: CheckCircle,
    },
    completed: {
      label: 'Completed',
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      icon: CheckCircle,
    },
    cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
    archived: { label: 'Archived', color: 'text-slate-500', bg: 'bg-slate-100', icon: FileText },
  };

  const getStatusConfig = (status: LifecycleStatus) => {
    return (
      statusConfig[status] || {
        label: status.replace(/_/g, ' '),
        color: 'text-slate-700',
        bg: 'bg-slate-100',
        icon: Clock,
      }
    );
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Requests</h1>
        <p className="text-slate-600 mt-1">Manage your assigned cases and legal opinions</p>
      </div>

      {requests_list.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No assigned requests</h3>
          <p className="text-slate-600">
            You don't have any assigned cases yet. Check available requests to accept new cases.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests_list.map((request) => {
            const config = getStatusConfig(request.lifecycleState);
            const StatusIcon = config.icon;

            return (
              <Link
                key={request.id}
                href={`/lawyer/review/${request.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{request.title}</h3>
                      <span className="text-sm text-slate-600">({request.request_number})</span>
                    </div>
                    {/* Description might not be in summary? aggregateCaseData includes ...req, so it should be there if queried */}
                    {/* Note: LifecycleSummary definition includes 'title', 'request_number', but NOT 'description'. extendedRequest has it. aggregateCaseData spreads req. */}
                    {/* I verified aggregatedCaseData returns object with 'status' (legacy) etc. but typescript interface LifecycleSummary might need description. */}
                    {/* Let's double check LifecycleSummary interface in LifecycleResolver.ts */}
                    {/* It does NOT have description. I should allow it or assume it's there via unknown casting if needed, or add it to interface. */}
                    {/* For now, I'll omit description or try to access it if I update interface. */}
                    {/* Wait, I should update LifecycleSummary interface to include description for dashboard previews. */}

                    <div className="flex items-center gap-4 text-sm mt-4">
                      <span className="text-slate-500">
                        Assigned: {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      {request.sla?.dueDate && (
                        <span
                          className={`${request.sla.isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}
                        >
                          Due: {new Date(request.sla.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap ${config.bg} ${config.color}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {config.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
