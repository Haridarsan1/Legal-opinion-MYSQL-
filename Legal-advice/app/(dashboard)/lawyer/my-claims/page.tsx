'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Loader,
  AlertCircle,
  Trash2,
  CheckCircle,
  Clock,
  IndianRupee,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { getMyPublicClaims, withdrawPublicClaim } from '@/app/actions/publicRequestActions';

interface Claim {
  id: string;
  case_id: string;
  status: 'pending' | 'selected' | 'rejected' | 'withdrawn';
  interest_message: string;
  timeline_estimate: string;
  fee_estimate: number;
  fee_currency: string;
  created_at: string;
  updated_at: string;
  case: {
    id: string;
    request_number: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    public_status: string;
    created_at: string;
    client: {
      full_name: string;
      organization: string;
    };
    department: {
      name: string;
    };
  };
}

export default function MyPublicClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    const result = await getMyPublicClaims();
    if (result.success && result.data) {
      setClaims(result.data as any);
    } else {
      toast.error(result.error || 'Failed to load claims');
    }
    setLoading(false);
  };

  const handleWithdraw = async (claimId: string) => {
    if (!confirm('Are you sure you want to withdraw this claim?')) return;

    setWithdrawing(claimId);
    try {
      const result = await withdrawPublicClaim(claimId);
      if (result.success) {
        toast.success('Claim withdrawn successfully');
        fetchClaims();
      } else {
        toast.error(result.error || 'Failed to withdraw claim');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setWithdrawing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'selected':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingClaims = claims.filter((c) => c.status === 'pending');
  const selectedClaims = claims.filter((c) => c.status === 'selected');
  const rejectedClaims = claims.filter((c) => c.status === 'rejected');
  const withdrawnClaims = claims.filter((c) => c.status === 'withdrawn');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            My Public Claims
          </h1>
          <p className="text-slate-600 text-base">
            Track your submitted proposals and selected cases.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-8 text-primary animate-spin" />
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
            <AlertCircle className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Claims Yet</h3>
            <p className="text-slate-600 mb-4">
              You haven't submitted any proposals yet. Browse public requests to get started.
            </p>
            <Link
              href="/lawyer/public-requests"
              className="inline-block px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Public Requests
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Claims */}
            {pendingClaims.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="size-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Pending Proposals ({pendingClaims.length})
                  </h2>
                </div>
                <div className="grid gap-4">
                  {pendingClaims.map((claim) => (
                    <ClaimCard
                      key={claim.id}
                      claim={claim}
                      onWithdraw={() => handleWithdraw(claim.id)}
                      isWithdrawing={withdrawing === claim.id}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Selected Claims */}
            {selectedClaims.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="size-5 text-green-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Selected Cases ({selectedClaims.length})
                  </h2>
                </div>
                <div className="grid gap-4">
                  {selectedClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-gradient-to-r from-green-50 to-white rounded-xl p-6 shadow-sm border border-green-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-slate-500">
                              {claim.case.request_number}
                            </span>
                            <Badge
                              className={`${getPriorityColor(claim.case.priority)} border px-2 py-1 text-xs font-semibold uppercase`}
                            >
                              {claim.case.priority}
                            </Badge>
                            <Badge className="bg-green-100 text-green-700 border-green-300 border px-2 py-1 text-xs font-semibold uppercase">
                              Selected
                            </Badge>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {claim.case.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-4">
                            Client:{' '}
                            <span className="font-semibold">{claim.case.client.full_name}</span>
                          </p>

                          {/* Your Proposal */}
                          <div className="bg-white rounded-lg p-4 mb-4 border border-slate-200">
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                              Your Proposal
                            </p>
                            <p className="text-sm text-slate-700">{claim.interest_message}</p>
                          </div>

                          {/* Meta Info */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {claim.timeline_estimate && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="size-4 text-slate-400" />
                                <span>{claim.timeline_estimate}</span>
                              </div>
                            )}
                            {claim.fee_estimate && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <IndianRupee className="size-4 text-slate-400" />
                                <span>
                                  {claim.fee_currency} {claim.fee_estimate.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <Link
                            href={`/lawyer/assigned/${claim.case_id}`}
                            className="inline-block px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
                          >
                            View Case
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Claims */}
            {rejectedClaims.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Rejected Proposals ({rejectedClaims.length})
                </h2>
                <div className="grid gap-4">
                  {rejectedClaims.map((claim) => (
                    <ClaimCard
                      key={claim.id}
                      claim={claim}
                      onWithdraw={() => {}}
                      isWithdrawing={false}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                      disabled
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Withdrawn Claims */}
            {withdrawnClaims.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Withdrawn Proposals ({withdrawnClaims.length})
                </h2>
                <div className="grid gap-4">
                  {withdrawnClaims.map((claim) => (
                    <ClaimCard
                      key={claim.id}
                      claim={claim}
                      onWithdraw={() => {}}
                      isWithdrawing={false}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                      disabled
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ClaimCard({
  claim,
  onWithdraw,
  isWithdrawing,
  getStatusColor,
  getPriorityColor,
  formatDate,
  disabled = false,
}: {
  claim: Claim;
  onWithdraw: () => void;
  isWithdrawing: boolean;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  formatDate: (date: string) => string;
  disabled?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-slate-500">
              {claim.case.request_number}
            </span>
            <Badge
              className={`${getPriorityColor(claim.case.priority)} border px-2 py-1 text-xs font-semibold uppercase`}
            >
              {claim.case.priority}
            </Badge>
            <Badge
              className={`${getStatusColor(claim.status)} border px-2 py-1 text-xs font-semibold uppercase`}
            >
              {claim.status}
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{claim.case.title}</h3>
          <p className="text-sm text-slate-600 mb-3">
            {claim.case.department.name} • Submitted {formatDate(claim.created_at)}
          </p>

          {/* Proposal Summary */}
          <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200">
            <p className="text-sm text-slate-700 line-clamp-2">{claim.interest_message}</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            {claim.timeline_estimate && (
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="size-4 text-slate-400" />
                <span>{claim.timeline_estimate}</span>
              </div>
            )}
            {claim.fee_estimate && (
              <div className="flex items-center gap-1 text-slate-600">
                <IndianRupee className="size-4 text-slate-400" />
                <span>{claim.fee_estimate.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {claim.status === 'pending' && !disabled && (
          <button
            onClick={onWithdraw}
            disabled={isWithdrawing}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-300 font-semibold text-sm hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isWithdrawing ? (
              <>
                <Loader className="size-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Withdraw
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
