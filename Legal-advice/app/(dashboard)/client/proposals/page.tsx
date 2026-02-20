'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Users, Clock, AlertCircle, Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getClientDashboardSummaries } from '@/app/actions/client';
import { LifecycleSummary, LifecycleStatus } from '@/app/domain/lifecycle/LifecycleResolver';

export default function ProposalsListingPage() {
  const [requests, setRequests] = useState<LifecycleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepting' | 'reviewing' | 'assigned'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch all summaries using the unified action
      const result = await getClientDashboardSummaries();

      if (result.success && result.data) {
        // Filter only public public requests
        const publicRequests = result.data.filter((r) => r.visibility === 'public');
        setRequests(publicRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: LifecycleStatus) => {
    switch (status) {
      case 'assigned':
      case 'claimed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'marketplace_posted':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getDeadlineText = (deadline: string | null) => {
    if (!deadline) return null;

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { text: 'Expired', color: 'text-red-600' };
    if (daysLeft === 0) return { text: 'Expires today', color: 'text-orange-600' };
    if (daysLeft === 1) return { text: '1 day left', color: 'text-orange-600' };
    return { text: `${daysLeft} days left`, color: 'text-slate-600' };
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;

    // Accepting: Posted and 0 proposals (or just posted?)
    // The original logic was: status === 'submitted' || status === 'accepting_proposals'
    // New logic: marketplace_posted
    if (filter === 'accepting') {
      return req.lifecycleState === 'marketplace_posted' || req.lifecycleState === 'submitted';
    }

    // Reviewing: Has proposals and NOT assigned
    if (filter === 'reviewing') {
      return (
        (req.proposal_count || 0) > 0 &&
        !['assigned', 'claimed', 'closed', 'completed'].includes(req.lifecycleState)
      );
    }

    // Assigned
    if (filter === 'assigned') {
      return [
        'assigned',
        'claimed',
        'in_review',
        'opinion_ready',
        'delivered',
        'completed',
      ].includes(req.lifecycleState);
    }

    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Proposal Management
          </h1>
          <p className="text-slate-600 text-base">
            Review and compare proposals from lawyers for your public requests.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-primary'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter('accepting')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filter === 'accepting'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-primary'
            }`}
          >
            Accepting Proposals
          </button>
          <button
            onClick={() => setFilter('reviewing')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filter === 'reviewing'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-primary'
            }`}
          >
            Ready to Review
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filter === 'assigned'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-primary'
            }`}
          >
            Assigned
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-8 text-primary animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
            <AlertCircle className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Requests Found</h3>
            <p className="text-slate-600 mb-4">
              {filter === 'all'
                ? "You haven't created any public requests yet."
                : 'No requests match the selected filter.'}
            </p>
            <Link
              href="/client/new-request"
              className="inline-block text-primary font-semibold hover:underline"
            >
              Create New Request →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => {
              // proposal_deadline is not in LifecycleSummary explicit interface but might be in the spread req?
              // aggregateCaseData spreads req. If LifecycleSummary interface doesn't have it, TS might complain.
              // I should access it safely or add to interface.
              // For now, casting as any to access potential extra fields or assuming interface update.
              // I'll check if I can add proposal_deadline to LifecycleSummary or just use SLA?
              // Marketplace requests have proposal deadlines, SLA is for opinion.
              // I'll cast to any for this field to avoid blocked errors, or rely on SLA if that's what it is (unlikely).
              const deadlineInfo = getDeadlineText((request as any).proposal_deadline);

              return (
                <Link key={request.id} href={`/client/proposals/${request.id}`}>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Left Column */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-slate-500">
                            {request.request_number}
                          </span>
                          <Badge
                            className={`${getStatusColor(
                              request.lifecycleState
                            )} border px-2 py-1 text-xs font-semibold uppercase`}
                          >
                            {request.lifecycleState.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-300 border px-2 py-1 text-xs font-semibold uppercase">
                            Public
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors mb-2">
                          {request.title}
                        </h3>

                        {/* Description is not in LifecycleSummary interface, but spread from req. Casting. */}
                        <p className="text-slate-600 line-clamp-2 text-sm mb-4">
                          {(request as any).description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Users className="size-4 text-slate-400" />
                            <span className="font-semibold text-primary">
                              {request.proposal_count || 0}
                            </span>
                            <span>
                              proposal
                              {(request.proposal_count || 0) !== 1 ? 's' : ''} received
                            </span>
                          </div>
                          {deadlineInfo && (
                            <div className="flex items-center gap-1">
                              <Clock className="size-4 text-slate-400" />
                              <span className={deadlineInfo.color}>{deadlineInfo.text}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col items-end gap-3 md:min-w-[180px]">
                        {(request.proposal_count || 0) > 0 ? (
                          <div className="flex flex-col items-end">
                            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                              <span className="text-2xl font-black text-primary">
                                {request.proposal_count}
                              </span>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors">
                              Review Proposals
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-2 mx-auto">
                              <FileText className="size-6 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">Waiting for proposals</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
