'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock,
  IndianRupee,
  BadgeCheck,
  Star,
  FileText,
  TrendingUp,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  getProposalsForRequest,
  acceptProposal,
  shortlistProposal,
  rejectProposal,
} from '@/app/actions/proposals';
import type { ProposalWithDetails } from '@/app/actions/proposals';
import Modal from '@/components/shared/Modal';

type SortBy = 'fee_low' | 'fee_high' | 'timeline_short' | 'timeline_long' | 'experience' | 'newest';
type FilterBy = 'all' | 'shortlisted' | 'submitted';

export default function ProposalComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;

  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'accept' | 'reject' | null;
    proposalId: string | null;
    lawyerName?: string;
  }>({
    isOpen: false,
    type: null,
    proposalId: null,
  });

  useEffect(() => {
    if (requestId) {
      fetchProposals();
    }
  }, [requestId]);

  const fetchProposals = async () => {
    setLoading(true);
    const result = await getProposalsForRequest(requestId);

    if (result.success && result.data) {
      setProposals(result.data);
    } else {
      toast.error(result.error || 'Failed to load proposals');
    }
    setLoading(false);
  };

  const initiateAccept = (proposalId: string, lawyerName: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'accept',
      proposalId,
      lawyerName,
    });
  };

  const initiateReject = (proposalId: string, lawyerName: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'reject',
      proposalId,
      lawyerName,
    });
  };

  const handleConfirmAction = async () => {
    const { type, proposalId } = confirmationModal;
    if (!type || !proposalId) return;

    setProcessingId(proposalId);
    setConfirmationModal((prev) => ({ ...prev, isOpen: false })); // Close modal immediately

    let result;

    if (type === 'accept') {
      result = await acceptProposal(proposalId);
      if (result.success) {
        toast.success('Proposal accepted! The lawyer has been assigned to your request.');
        setTimeout(() => {
          router.push('/client/track');
        }, 1500);
      }
    } else {
      result = await rejectProposal(proposalId);
      if (result.success) {
        toast.success('Proposal rejected');
        fetchProposals();
      }
    }

    if (!result.success) {
      toast.error(result?.error || `Failed to ${type} proposal`);
    }
    setProcessingId(null);
  };

  const handleShortlist = async (proposalId: string) => {
    setProcessingId(proposalId);
    const result = await shortlistProposal(proposalId);

    if (result.success) {
      toast.success('Proposal shortlisted!');
      fetchProposals();
    } else {
      toast.error(result.error || 'Failed to shortlist proposal');
    }
    setProcessingId(null);
  };

  // Filter and sort proposals
  const filteredAndSortedProposals = proposals
    .filter((p) => {
      if (filterBy === 'all') return true;
      return p.status === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'fee_low':
          return a.proposed_fee - b.proposed_fee;
        case 'fee_high':
          return b.proposed_fee - a.proposed_fee;
        case 'timeline_short':
          return a.timeline_days - b.timeline_days;
        case 'timeline_long':
          return b.timeline_days - a.timeline_days;
        case 'experience':
          return (b.lawyer.years_of_experience || 0) - (a.lawyer.years_of_experience || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const acceptedProposal = proposals.find((p) => p.status === 'accepted');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-1">
              Proposal Comparison
            </h1>
            <p className="text-slate-600">
              Review and compare proposals from {proposals.length} lawyer
              {proposals.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* No proposals state */}
        {
  proposals.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
            <AlertCircle className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Proposals Yet</h3>
            <p className="text-slate-600">
              Lawyers are still reviewing your request. Check back soon!
            </p>
          </div>
        ) : (
          <>
            {/* Accepted Proposal Section */}
            {
  acceptedProposal && (
              <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-6 border-2 border-green-300 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="size-6 text-green-600" />
                  <h3 className="text-lg font-bold text-slate-900">Selected Lawyer</h3>
                </div>
                <ProposalCard
                  proposal={acceptedProposal}
                  onAccept={(id) => initiateAccept(id, acceptedProposal.lawyer.full_name)}
                  onShortlist={handleShortlist}
                  onReject={(id) => initiateReject(id, acceptedProposal.lawyer.full_name)}
                  processing={processingId === acceptedProposal.id}
                  isAccepted={true}
                />
              </div>
            )}

            {/* Filters and Sorting */}
            {!acceptedProposal && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Filter
                    </label>
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                    >
                      <option value="all">All Proposals</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="submitted">Pending Review</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                    >
                      <option value="newest">Newest First</option>
                      <option value="fee_low">Fee: Low to High</option>
                      <option value="fee_high">Fee: High to Low</option>
                      <option value="timeline_short">Timeline: Shortest First</option>
                      <option value="timeline_long">Timeline: Longest First</option>
                      <option value="experience">Most Experienced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Proposals Grid */}
            <div className="space-y-6">
              {filteredAndSortedProposals
                .filter((p) => p.status !== 'accepted')
                .map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onAccept={(id) => initiateAccept(id, proposal.lawyer.full_name)}
                    onShortlist={handleShortlist}
                    onReject={(id) => initiateReject(id, proposal.lawyer.full_name)}
                    processing={processingId === proposal.id}
                    isAccepted={false}
                  />
                ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmationModal.type === 'accept' ? 'Accept Proposal' : 'Reject Proposal'}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          {confirmationModal.type === 'accept' ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
              <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Are you sure?</p>
                <p>
                  You are about to accept the proposal from{' '}
                  <span className="font-bold">{confirmationModal.lawyerName}</span>. This will
                  assign them to your request and notify other lawyers that the request is closed.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Confirm Rejection</p>
                <p>
                  Are you sure you want to reject the proposal from{' '}
                  <span className="font-bold">{confirmationModal.lawyerName}</span>? You can undo
                  this later if needed.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${
                confirmationModal.type === 'accept'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {confirmationModal.type === 'accept' ? 'Confirm Acceptance' : 'Reject Proposal'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// =====================================================
// PROPOSAL CARD COMPONENT
// =====================================================

interface ProposalCardProps {
  proposal: ProposalWithDetails;
  onAccept: (id: string) => void;
  onShortlist: (id: string) => void;
  onReject: (id: string) => void;
  processing: boolean;
  isAccepted: boolean;
}

function ProposalCard({
  proposal,
  onAccept,
  onShortlist,
  onReject,
  processing,
  isAccepted,
}: ProposalCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Shortlisted</Badge>
        );
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Pending Review</Badge>;
    }
  };

  return (
    <div
      className={`rounded-xl p-6 shadow-sm border transition-all ${
        isAccepted
          ? 'bg-white border-green-300'
          : proposal.status === 'shortlisted'
            ? 'bg-yellow-50 border-yellow-300'
            : 'bg-white border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lawyer Info - Column 1 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-start gap-4">
            {proposal.lawyer.avatar_url ? (
              <img
                src={proposal.lawyer.avatar_url}
                alt={proposal.lawyer.full_name}
                className="size-16 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <span className="text-2xl font-bold text-primary">
                  {proposal.lawyer.full_name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-lg">{proposal.lawyer.full_name}</h4>
              {proposal.lawyer.years_of_experience && (
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Award className="size-4" />
                  <span>{proposal.lawyer.years_of_experience}+ years</span>
                </div>
              )}
              {
  proposal.lawyer.bar_council_id && (
                <p className="text-xs text-slate-500">Bar ID: {proposal.lawyer.bar_council_id}</p>
              )}
              <div className="mt-2">{getStatusBadge(proposal.status)}</div>
            </div>
          </div>

          {/* Specializations */}
          {
  proposal.lawyer.specialization &&
            (() => {
              // Handle specialization which could be string[] or JSON string
              let specs: string[] = [];
              const rawSpec = proposal.lawyer.specialization;

              if (Array.isArray(rawSpec)) {
                // Already an array
                specs = rawSpec;
              } else if (typeof rawSpec === 'string') {
                // Try parsing JSON, fallback to comma-separated
                const strSpec = rawSpec as string;
                try {
                  const parsed = JSON.parse(strSpec);
                  specs = Array.isArray(parsed) ? parsed : [strSpec];
                } catch {
                  // Not JSON, treat as comma-separated
                  specs = strSpec.split(',').map((s: string) => s.trim());
                }
              }

              return (
                specs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {specs.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )
              );
            })()}

          {/* Bio */}
          {
  proposal.lawyer.bio && (
            <p className="text-sm text-slate-600 line-clamp-3">{proposal.lawyer.bio}</p>
          )}
        </div>

        {/* Proposal Details - Column 2 */}
        <div className="lg:col-span-1 space-y-4">
          {/* Fee */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <IndianRupee className="size-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Proposed Fee</p>
              <p className="text-xl font-bold text-slate-900">
                ₹{proposal.proposed_fee.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <Clock className="size-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Timeline</p>
              <p className="text-xl font-bold text-slate-900">
                {proposal.timeline_days} day{proposal.timeline_days !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Proposal Message */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Proposal</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {proposal.proposal_message}
            </p>
          </div>
        </div>

        {/* Actions - Column 3 */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {isAccepted ? (
            <div className="p-4 rounded-lg bg-green-50 border border-green-300 text-center">
              <CheckCircle className="size-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-green-700">Selected Lawyer</p>
              <p className="text-sm text-green-600 mt-1">Case in Progress</p>
            </div>
          ) : proposal.status === 'rejected' ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-center">
              <p className="font-semibold text-red-700">Rejected</p>
            </div>
          ) : (
            <>
              <button
                onClick={() => onAccept(proposal.id)}
                disabled={processing}
                className="px-4 py-3 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4" />
                    Accept Proposal
                  </>
                )}
              </button>

              {proposal.status === 'submitted' && (
                <button
                  onClick={() => onShortlist(proposal.id)}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 font-semibold text-sm hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Star className="size-4" />
                  Shortlist
                </button>
              )}

              <button
                onClick={() => onReject(proposal.id)}
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-white border border-red-300 text-red-600 font-semibold text-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Reject
              </button>
            </>
          )}

          {/* Submission Date */}
          <div className="text-xs text-slate-500 text-center mt-auto">
            Submitted {new Date(proposal.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
