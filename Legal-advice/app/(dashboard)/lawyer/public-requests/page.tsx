'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Loader,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Eye,
  Paperclip,
  Shield,
  Briefcase,
  Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPublicOpenRequests } from '@/app/actions/publicRequestActions';
import { getProposalCount } from '@/app/actions/proposals';
import ProposalSubmissionModal from '../components/ProposalSubmissionModal';
import DeadlineCountdown from '../components/DeadlineCountdown';
import BookmarkButton from '../components/BookmarkButton';
import ProposalStatusTracker from '../components/ProposalStatusTracker';

interface PublicRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  priority: string;
  created_at: string;
  public_posted_at: string;
  budget_min?: number | null;
  budget_max?: number | null;
  proposal_deadline?: string | null;
  complexity_level?: 'low' | 'medium' | 'high' | null;
  required_experience_years?: number | null;
  confidentiality_type?: 'public' | 'confidential' | 'highly_confidential' | null;
  attachments_count?: number | null;
  industry_type?: string | null;
  jurisdiction?: string | null;
  department: {
    id: string;
    name: string;
  };
  client: {
    full_name: string;
    organization: string;
  };
  proposal_count: Array<any>;
  hasMyProposal?: boolean;
  myProposalStatus?: string | null;
}

interface Filters {
  departmentId?: string;
  priority?: string;
  search?: string;
}

export default function PublicRequestsPage() {
  const [requests, setRequests] = useState<PublicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; title: string } | null>(
    null
  );

  // Fetch public requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const result = await getPublicOpenRequests({
        departmentId: selectedDept || undefined,
        priority: selectedPriority || undefined,
        search: searchTerm || undefined,
        limit: 20,
      });

      if (result.success && result.data) {
        // Normalize data: Supabase returns arrays for joined relations, but we expect single objects
        const normalizedData: PublicRequest[] = result.data.map((req: any) => ({
          ...req,
          department: Array.isArray(req.department) ? req.department[0] : req.department,
          client: Array.isArray(req.client) ? req.client[0] : req.client,
        }));
        setRequests(normalizedData);
      } else {
        toast.error(result.error || 'Failed to load public requests');
      }
      setLoading(false);
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedDept, selectedPriority]);

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

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const hours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Public Legal Requests
          </h1>
          <p className="text-slate-600 text-base">
            Browse and claim public cases from clients seeking multiple proposals.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            >
              <option value="">All Departments</option>
              <option value="corporate">Corporate & Tax Law</option>
              <option value="ip">Intellectual Property</option>
              <option value="real-estate">Real Estate & Property</option>
              <option value="employment">Employment Law</option>
              <option value="banking">Banking & Finance</option>
              <option value="litigation">Litigation Support</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-8 text-primary animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
            <AlertCircle className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Public Requests Found</h3>
            <p className="text-slate-600 mb-4">
              Check back later or adjust your filters to see available public requests.
            </p>
            <Link
              href="/lawyer"
              className="inline-block text-primary font-semibold hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => {
              const proposalsCount = Array.isArray(request.proposal_count)
                ? request.proposal_count.length
                : 0;
              return (
                <Link key={request.id} href={`/lawyer/public-requests/${request.id}`}>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-slate-500">
                            {request.request_number}
                          </span>
                          <Badge
                            className={`${getPriorityColor(
                              request.priority
                            )} border px-2 py-1 text-xs font-semibold uppercase`}
                          >
                            {request.priority}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors mb-2">
                          {request.title}
                        </h3>
                        <p className="text-slate-600 line-clamp-2 text-sm mb-3">
                          {request.description}
                        </p>

                        {/* Business Evaluation Metadata */}
                        <div className="space-y-3">
                          {/* Primary Meta Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Users className="size-4 text-slate-400" />
                              <span>
                                {proposalsCount} proposal{proposalsCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-4 text-slate-400" />
                              <span>{timeAgo(request.public_posted_at)}</span>
                            </div>
                            {request.attachments_count != null && request.attachments_count > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="size-4 text-slate-400" />
                                <span>
                                  {request.attachments_count} document
                                  {request.attachments_count !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Business Metadata Badges */}
                          <div className="flex flex-wrap gap-2">
                            {/* Budget Range */}
                            {(request.budget_min != null || request.budget_max != null) && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 border border-green-200 text-sm">
                                <span className="text-green-700 font-semibold">
                                  {request.budget_min && request.budget_max
                                    ? `₹${request.budget_min.toLocaleString('en-IN')} – ₹${request.budget_max.toLocaleString('en-IN')}`
                                    : request.budget_min
                                      ? `₹${request.budget_min.toLocaleString('en-IN')}+`
                                      : `Up to ₹${request.budget_max?.toLocaleString('en-IN')}`}
                                </span>
                              </div>
                            )}

                            {/* Complexity Level */}
                            {request.complexity_level && (
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium ${
                                  request.complexity_level === 'high'
                                    ? 'bg-red-50 border-red-200 text-red-700'
                                    : request.complexity_level === 'medium'
                                      ? 'bg-orange-50 border-orange-200 text-orange-700'
                                      : 'bg-blue-50 border-blue-200 text-blue-700'
                                }`}
                              >
                                <Briefcase className="w-3.5 h-3.5" />
                                <span className="capitalize">
                                  {request.complexity_level} Complexity
                                </span>
                              </div>
                            )}

                            {/* Required Experience */}
                            {request.required_experience_years != null && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 border border-purple-200 text-sm">
                                <Award className="w-3.5 h-3.5 text-purple-600" />
                                <span className="text-purple-700 font-medium">
                                  {request.required_experience_years}+ years exp.
                                </span>
                              </div>
                            )}

                            {/* Confidentiality */}
                            {request.confidentiality_type &&
                              request.confidentiality_type !== 'public' && (
                                <div
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium ${
                                    request.confidentiality_type === 'highly_confidential'
                                      ? 'bg-slate-900 border-slate-900 text-white'
                                      : 'bg-slate-100 border-slate-300 text-slate-700'
                                  }`}
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  <span>
                                    {request.confidentiality_type === 'highly_confidential'
                                      ? 'Highly Confidential'
                                      : 'Confidential'}
                                  </span>
                                </div>
                              )}

                            {/* Deadline Countdown */}
                            {request.proposal_deadline && (
                              <DeadlineCountdown deadline={request.proposal_deadline} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col items-end gap-3 md:min-w-[200px]">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                            Department
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {request.department?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                            Posted By
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {request.client?.full_name}
                          </p>
                        </div>

                        {/* Proposal Status or Submit Button */}
                        {request.hasMyProposal ? (
                          <div className="mt-auto space-y-2">
                            {/* Proposal Status Tracker */}
                            {request.myProposalStatus && (
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                                <ProposalStatusTracker
                                  currentStatus={request.myProposalStatus as any}
                                  size="small"
                                />
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.location.href = `/lawyer/public-requests/${request.id}`;
                                }}
                                className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <Eye className="size-4" />
                                View
                              </button>
                              <BookmarkButton
                                requestId={request.id}
                                initialIsSaved={false}
                                className="flex-1"
                              />
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = '/lawyer/my-proposals';
                              }}
                              className="w-full px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                            >
                              View My Proposal
                            </button>
                          </div>
                        ) : (
                          <div className="mt-auto space-y-2">
                            <div className="flex gap-2">
                              <button
                                className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedRequest({ id: request.id, title: request.title });
                                  setShowProposalModal(true);
                                }}
                              >
                                <FileText className="size-4" />
                                Submit Proposal
                              </button>
                              <BookmarkButton
                                requestId={request.id}
                                initialIsSaved={false}
                                showLabel
                              />
                            </div>
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

      {/* Proposal Submission Modal */}
      {showProposalModal && selectedRequest && (
        <ProposalSubmissionModal
          requestId={selectedRequest.id}
          requestTitle={selectedRequest.title}
          onClose={() => {
            setShowProposalModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            // Refresh the requests list
            setSearchTerm((prev) => prev); // Trigger useEffect
          }}
        />
      )}
    </div>
  );
}
