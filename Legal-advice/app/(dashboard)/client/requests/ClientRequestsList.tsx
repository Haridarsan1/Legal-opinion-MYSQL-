'use client';

import { useState } from 'react';
import { Plus, FileText, Lock, Globe } from 'lucide-react';
import Link from 'next/link';
import RequestCard from '@/components/shared/RequestCard';
import type { LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';
import { formatDate } from '@/utils/formatDate';

interface ClientRequestsListProps {
  initialRequests: LifecycleSummary[];
}

type TabType = 'all' | 'private' | 'public';

export default function ClientRequestsList({ initialRequests }: ClientRequestsListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const safeRequests = Array.isArray(initialRequests) ? initialRequests : [];

  const filteredRequests = safeRequests.filter((request) => {
    if (activeTab === 'all') return true;
    return request.visibility === activeTab;
  });

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'all', label: 'All Requests', icon: FileText },
    { id: 'private', label: 'Private Requests', icon: Lock },
    { id: 'public', label: 'Public Requests', icon: Globe },
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                                `}
              >
                <Icon
                  className={`size-4 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'}`}
                />
                {tab.label}
                <span
                  className={`ml-1.5 rounded-full py-0.5 px-2 text-xs font-medium ring-1 ring-inset ${isActive ? 'bg-primary/10 text-primary ring-primary/20' : 'bg-slate-100 text-slate-600 ring-slate-500/10'}`}
                >
                  {tab.id === 'all'
                    ? safeRequests.length
                    : safeRequests.filter((r) => r.visibility === tab.id).length}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {
  filteredRequests.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
            {activeTab === 'public' ? (
              <Globe className="h-6 w-6 text-slate-400" />
            ) : activeTab === 'private' ? (
              <Lock className="h-6 w-6 text-slate-400" />
            ) : (
              <FileText className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No {activeTab !== 'all' ? activeTab : ''} requests found
          </h3>
          <p className="text-slate-600 mb-6">
            {activeTab === 'public'
              ? "You haven't posted any public requests yet. Public requests are visible to all lawyers in the marketplace."
              : "You don't have any requests in this category."}
          </p>
          <Link
            href="/client/new-request"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" />
            Create Request
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRequests.map((request) => (
            <Link key={request.id} href={`/client/requests/${request.id}`} className="block">
              <RequestCard
                id={request.request_number || request.id.substring(0, 8)}
                title={request.title}
                client="Me"
                department={(request.department?.name || 'General') as any}
                status={request.lifecycleState as any}
                priority={request.priority as any}
                dueDate={formatDate(request.sla.dueDate || request.created_at)}
                assignedTo={request.lawyer ? 'Assigned Lawyer' : undefined}
                visibility={request.visibility}
                publicStatus={request.public_status}
                publicPostedAt={request.public_posted_at}
                claimCount={request.claim_count}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
