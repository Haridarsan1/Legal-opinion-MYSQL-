'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getMyProposals, withdrawProposal } from '@/app/actions/proposals';
import type { ProposalWithDetails } from '@/app/actions/proposals';

type TabType = 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    const result = await getMyProposals();

    if (result.success && result.data) {
      setProposals(result.data);
    } else {
      toast.error(result.error || 'Failed to load proposals');
    }
    setLoading(false);
  };

  const handleWithdraw = async (proposalId: string) => {
    if (!confirm('Are you sure you want to withdraw this proposal?')) {
      return;
    }

    setWithdrawing(proposalId);
    const result = await withdrawProposal(proposalId);

    if (result.success) {
      toast.success('Proposal withdrawn successfully');
      fetchProposals();
    } else {
      toast.error(result.error || 'Failed to withdraw proposal');
    }
    setWithdrawing(null);
  };

  // Filter proposals by status
  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'pending') return p.status === 'submitted';
    if (activeTab === 'shortlisted') return p.status === 'shortlisted';
    if (activeTab === 'accepted') return p.status === 'accepted';
    if (activeTab === 'rejected') return p.status === 'rejected';
    if (activeTab === 'withdrawn') return p.status === 'withdrawn';
    return true;
  });

  // Calculate metrics
  const totalProposals = proposals.length;
  const acceptedCount = proposals.filter((p) => p.status === 'accepted').length;
  const acceptanceRate =
    totalProposals > 0 ? ((acceptedCount / totalProposals) * 100).toFixed(1) : '0';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getTabCount = (tab: TabType) => {
    const map = {
      pending: proposals.filter((p) => p.status === 'submitted').length,
      shortlisted: proposals.filter((p) => p.status === 'shortlisted').length,
      accepted: proposals.filter((p) => p.status === 'accepted').length,
      rejected: proposals.filter((p) => p.status === 'rejected').length,
      withdrawn: proposals.filter((p) => p.status === 'withdrawn').length,
    };
    return map[tab];
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            My Proposals
          </h1>
          <p className="text-slate-600 text-base">
            Track your submitted proposals and their current status.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Proposals</p>
                <p className="text-2xl font-black text-slate-900">{totalProposals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Accepted</p>
                <p className="text-2xl font-black text-slate-900">{acceptedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Success Rate</p>
                <p className="text-2xl font-black text-slate-900">{acceptanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {(['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'] as TabType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors relative ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab ? 'bg-white/20' : 'bg-slate-200'
                  }`}
                >
                  {getTabCount(tab)}
                </span>
              </button>
            )
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-8 text-primary animate-spin" />
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
            <AlertCircle className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Proposals Found</h3>
            <p className="text-slate-600 mb-4">
              {activeTab === 'pending'
                ? "You haven't submitted any proposals yet. Browse public requests to get started!"
                : `No ${activeTab} proposals.`}
            </p>
            {activeTab === 'pending' && (
              <Link
                href="/lawyer/public-requests"
                className="inline-block px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Public Requests
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProposals.map((proposal) => {
              const request = Array.isArray(proposal.request)
                ? proposal.request[0]
                : proposal.request;
              const client = request?.client
                ? Array.isArray(request.client)
                  ? request.client[0]
                  : request.client
                : null;

              return (
                <div
                  key={proposal.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Request Info - Column 1 */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-slate-500">
                          {request?.request_number}
                        </span>
                        <Badge
                          className={`${getStatusColor(
                            proposal.status
                          )} border px-2 py-1 text-xs font-semibold uppercase`}
                        >
                          {proposal.status}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {request?.title || 'Untitled Request'}
                      </h3>

                      {client && (
                        <p className="text-sm text-slate-600 mb-2">
                          Client: <span className="font-semibold">{client.full_name}</span>
                          {client.organization && ` • ${client.organization}`}
                        </p>
                      )}

                      <p className="text-sm text-slate-500">
                        Submitted on {new Date(proposal.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Proposal Details - Column 2 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="size-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Proposed Fee</p>
                          <p className="text-lg font-bold text-slate-900">
                            ₹{proposal.proposed_fee.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Timeline</p>
                          <p className="text-lg font-bold text-slate-900">
                            {proposal.timeline_days} days
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions - Column 3 */}
                    <div className="flex flex-col gap-2">
                      {proposal.status === 'accepted' && (
                        <Link
                          href={`/lawyer/requests/${proposal.request_id}`}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors text-center"
                        >
                          View Case
                        </Link>
                      )}

                      {(proposal.status === 'submitted' || proposal.status === 'shortlisted') && (
                        <>
                          <Link
                            href={`/lawyer/public-requests/${proposal.request_id}`}
                            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors text-center"
                          >
                            View Request
                          </Link>
                          <button
                            onClick={() => handleWithdraw(proposal.id)}
                            disabled={withdrawing === proposal.id}
                            className="px-4 py-2 rounded-lg bg-white border border-red-300 text-red-600 font-semibold text-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {withdrawing === proposal.id ? 'Withdrawing...' : 'Withdraw'}
                          </button>
                        </>
                      )}

                      {proposal.status === 'shortlisted' && (
                        <div className="mt-2 p-2 rounded-lg bg-yellow-50 border border-yellow-300 text-center">
                          <p className="text-xs font-semibold text-yellow-700">⭐ Shortlisted</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
