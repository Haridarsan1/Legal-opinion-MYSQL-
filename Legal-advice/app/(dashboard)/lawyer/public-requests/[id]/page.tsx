'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader,
  AlertCircle,
  Clock,
  User,
  Building2,
  FileText,
  Calendar,
  TrendingUp,
  Eye,
  CheckSquare,
  Download,
  Globe,
  Shield,
  Briefcase,
  Award,
  DollarSign,
  Paperclip,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProposalSubmissionModal from '../../components/ProposalSubmissionModal';
import { getPublicRequestDetails } from '@/app/actions/publicRequestActions';
import DeadlineCountdown from '../../components/DeadlineCountdown';
import BookmarkButton from '../../components/BookmarkButton';
import ProposalStatusTracker from '../../components/ProposalStatusTracker';
import MarketInsightsPanel from '../../components/MarketInsightsPanel';

interface RequestDetails {
  id: string;
  request_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
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
  expected_deliverables?: any[] | null;
  department: {
    name: string;
  } | null;
  client: {
    full_name: string;
    organization: string;
  } | null;
  proposal_count: Array<any>;
  hasMyProposal?: boolean;
  myProposalStatus?: string | null;
  myProposalDetails?: {
    id: string;
    proposed_fee: number;
    timeline_days: number;
    proposal_message: string;
    status: string;
  } | null;
  isBookmarked?: boolean;
  marketStats?: any;
}

export default function PublicRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const result = await getPublicRequestDetails(requestId);

      if (result.success && result.data) {
        setRequest(result.data as any);
      } else {
        toast.error(result.error || 'Failed to load request details');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load request details');
    }
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInMs = now.getTime() - posted.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="size-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Request Not Found</h2>
        <button
          onClick={() => router.push('/lawyer/public-requests')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Public Requests
        </button>
      </div>
    );
  }

  const proposalsCount = Array.isArray(request.proposal_count) ? request.proposal_count.length : 0;
  // Mock deliverables if none present to show UI
  const deliverables = request.expected_deliverables || [
    'Legal Opinion Document',
    'Citations and References',
    'Executive Summary',
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-start gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 mt-1 hover:bg-slate-200 rounded-lg transition-colors self-start"
            title="Go Back"
          >
            <ArrowLeft className="size-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-slate-500">
                #{request.request_number}
              </span>
              <Badge className={getPriorityColor(request.priority)}>
                {request.priority?.toUpperCase()} Priority
              </Badge>
              <div className="flex items-center text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                <Clock className="w-3 h-3 mr-1" />
                Posted {timeAgo(request.public_posted_at)}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{request.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {request.department?.name && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{request.department.name} Department</span>
                </div>
              )}
              {
  request.jurisdiction && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>{request.jurisdiction}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Main Content (66%) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Client Context Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Client Context
                </h3>
                {request.client?.organization && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Corporate Client
                  </Badge>
                )}
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Client Name</p>
                  <p className="font-medium text-slate-900 text-lg">
                    {request.client?.full_name || 'Anonymous Client'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Organization
                  </p>
                  <p className="font-medium text-slate-900 text-lg">
                    {request.client?.organization || 'Individual'}
                  </p>
                </div>
                {request.industry_type && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Industry</p>
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      <Building2 className="size-4 text-slate-400" />
                      {request.industry_type}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Confidentiality
                  </p>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium ${
                      request.confidentiality_type === 'highly_confidential'
                        ? 'bg-slate-900 text-white'
                        : request.confidentiality_type === 'confidential'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-green-50 text-green-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="capitalize">
                      {request.confidentiality_type?.replace('_', ' ') || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Description */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Case Description
                </h3>
              </div>
              <div className="p-6">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
                  {request.description}
                </p>
              </div>
            </div>

            {/* Expected Deliverables */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="size-4 text-primary" />
                  Expected Deliverables
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {deliverables.map((item: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="mt-0.5 bg-white p-0.5 rounded border border-slate-300">
                        <CheckSquare className="size-4 text-slate-400" />
                      </div>
                      <span className="text-slate-700 font-medium">
                        {typeof item === 'string' ? item : item.label || 'Deliverable item'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Attachments Section */}
            {
  request.attachments_count ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Paperclip className="size-4 text-primary" />
                    Case Documents ({request.attachments_count})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <FileText className="size-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Case Files Bundle</p>
                        <p className="text-xs text-slate-500">
                          {request.attachments_count} files • ZIP archive
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      <Download className="size-4" />
                      Download All
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5" />
                    These documents contain sensitive information. Please maintain confidentiality
                    as per the platform agreement.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* RIGHT COLUMN - Sidebar (33%) */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden sticky top-6">
              <div className="p-6 space-y-6">
                {/* Deadline Timer */}
                <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    Proposal Deadline
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">
                      {request.proposal_deadline
                        ? new Date(request.proposal_deadline).toLocaleDateString()
                        : 'Open Indefinitely'}
                    </span>
                    {request.proposal_deadline && (
                      <DeadlineCountdown deadline={request.proposal_deadline} />
                    )}
                  </div>
                </div>

                {request.hasMyProposal ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-3">
                        Your Proposal Status
                      </p>
                      <ProposalStatusTracker
                        currentStatus={request.myProposalStatus as any}
                        size="small"
                      />
                    </div>
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
                    >
                      Manage My Proposal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="w-full px-4 py-3 rounded-lg bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <FileText className="size-5" />
                      Submit Proposal
                    </button>
                    <BookmarkButton
                      requestId={request.id}
                      initialIsSaved={!!request.isBookmarked}
                      className="w-full justify-center"
                      showLabel
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Market Insights Panel */}
            <MarketInsightsPanel
              stats={
                request.marketStats || {
                  total_proposals: proposalsCount,
                  average_fee: null,
                  lowest_fee: null,
                  highest_fee: null,
                  average_timeline: null,
                }
              }
            />

            {/* Job Metadata Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Request Metadata
              </h3>

              {/* Budget */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <DollarSign className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Client Budget</p>
                  <p className="font-medium text-slate-900">
                    {request.budget_min && request.budget_max
                      ? `₹${request.budget_min.toLocaleString()} – ₹${request.budget_max.toLocaleString()}`
                      : request.budget_min
                        ? `From ₹${request.budget_min.toLocaleString()}`
                        : 'Negotiable / Open'}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <Award className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Required Experience
                  </p>
                  <p className="font-medium text-slate-900">
                    {request.required_experience_years
                      ? `${request.required_experience_years}+ Years`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Complexity */}
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    request.complexity_level === 'high'
                      ? 'bg-red-50 text-red-600'
                      : request.complexity_level === 'medium'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Complexity</p>
                  <p className="font-medium text-slate-900 capitalize">
                    {request.complexity_level || 'Medium'} Level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProposalModal && (
        <ProposalSubmissionModal
          requestId={request.id}
          requestTitle={request.title}
          minBudget={request.budget_min}
          maxBudget={request.budget_max}
          initialData={request.myProposalDetails}
          onClose={() => setShowProposalModal(false)}
          onSuccess={() => {
            setShowProposalModal(false);
            fetchRequestDetails(); // Refresh to show submitted status
          }}
        />
      )}
    </div>
  );
}
