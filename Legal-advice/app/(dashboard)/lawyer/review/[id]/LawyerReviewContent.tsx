'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
  Building2,
  ArrowLeft,
  BookOpen,
  Users,
  Signature,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import CaseDocuments from '@/app/(dashboard)/case/[id]/CaseDocuments';
import CaseClarifications from '@/app/(dashboard)/case/[id]/CaseClarifications';
import CaseOpinion from '@/app/(dashboard)/case/[id]/CaseOpinion';
import CaseSecondOpinion from '@/app/(dashboard)/case/[id]/CaseSecondOpinion';
import { updateSecondOpinionStatus } from '@/app/actions/lawyer-workspace';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import CaseProgressTracker from '@/app/(dashboard)/client/track/components/CaseProgressTracker';
import type { LifecycleStatus, ProgressMetrics } from '@/app/domain/lifecycle/LifecycleResolver';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  file_type?: string;
  document_type?: string;
  document_request_id?: string;
  review_status?: string;
}

interface Clarification {
  id: string;
  message: string;
  created_at: string;
  response?: string;
  responded_at?: string;
  is_resolved: boolean;
}

interface DocumentRequest {
  id: string;
  request_id: string;
  title: string;
  description?: string;
  requested_by: string;
  status: 'pending' | 'fulfilled';
  created_at: string;
}

interface LegalRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  department: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_at?: string;
  sla_deadline?: string;
  opinion_text?: string;
  opinion_submitted_at?: string;
  client?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  department_info?: {
    name: string;
    description: string;
  };
  documents: Document[];
}

interface Message {
  id: string;
  sender_id: string;
  sender_role: 'client' | 'lawyer';
  message: string;
  created_at: string;
  attachments?: any[];
  read_by?: string[];
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Props {
  request: LegalRequest;
  clarifications: Clarification[];
  messages: Message[];
  documentRequests: DocumentRequest[];
  lawyerId: string;
  userProfile: {
    full_name: string;
    avatar_url?: string;
  };
  secondOpinionRequest?: any;
  hasDraftOpinion: boolean;
  secondOpinionRequests?: any[];
  lifecycleStatus: LifecycleStatus;
  progressMetrics: ProgressMetrics;
}

export default function LawyerReviewContent({
  request,
  clarifications,
  messages,
  documentRequests,
  lawyerId,
  userProfile,
  secondOpinionRequest,
  hasDraftOpinion,
  secondOpinionRequests,
  lifecycleStatus,
  progressMetrics,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewNotes, setReviewNotes] = useState(secondOpinionRequest?.reviewer_notes || '');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const pendingClarifications = clarifications.filter((c: any) => !c.is_resolved);
  const pendingDocuments = documentRequests.filter((d: any) => d.status === 'pending');

  const isReviewer = !!secondOpinionRequest;

  // Lifecycle-based Status Badge Configuration
  const statusBadgeConfig: Partial<
    Record<LifecycleStatus, { label: string; color: string; bg: string }>
  > = {
    draft: { label: 'Client Drafting', color: 'text-slate-600', bg: 'bg-slate-100' },
    submitted: { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-100' },
    marketplace_posted: { label: 'Marketplace', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    claimed: { label: 'Claimed', color: 'text-purple-700', bg: 'bg-purple-100' },
    assigned: { label: 'Assigned', color: 'text-purple-700', bg: 'bg-purple-100' },
    clarification_pending: {
      label: 'Needs Clarification',
      color: 'text-amber-700',
      bg: 'bg-amber-100',
    },
    in_review: { label: 'In Review', color: 'text-blue-700', bg: 'bg-blue-100' },
    opinion_ready: { label: 'Opinion Ready', color: 'text-green-700', bg: 'bg-green-100' },
    delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100' },
    completed: { label: 'Completed', color: 'text-slate-700', bg: 'bg-slate-100' },
    archived: { label: 'Archived', color: 'text-slate-500', bg: 'bg-slate-100' },
    cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
  };

  // Fallback for unknown statuses
  const currentStatus = statusBadgeConfig[lifecycleStatus] || {
    label: lifecycleStatus.replace(/_/g, ' '),
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText, badge: request.documents.length },
    {
      id: 'clarifications',
      label: 'Clarifications',
      icon: AlertCircle,
      badge: pendingClarifications.length > 0 ? pendingClarifications.length : undefined,
    },
    { id: 'opinion', label: 'Draft Opinion', icon: BookOpen },
    {
      id: 'second_opinion',
      label: 'Internal Review',
      icon: Users,
      badge: secondOpinionRequests?.length || 0,
      locked: !hasDraftOpinion,
    },
  ];

  const handleReviewSubmit = async (status: 'completed' | 'rejected') => {
    setIsSubmittingReview(true);
    try {
      const result = await updateSecondOpinionStatus(secondOpinionRequest.id, status, reviewNotes);
      if (result.success) {
        toast.success(`Review ${status === 'completed' ? 'submitted' : 'rejected'} successfully`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update review');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-7xl mx-auto w-full bg-slate-50/50">
      {/* Header with Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link
            href="/lawyer/requests"
            className="hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {request.title || request.request_number}
              </h1>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.bg} ${currentStatus.color}`}
              >
                {currentStatus.label}
              </span>
              {request.priority === 'urgent' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  URGENT
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm">
              Case #{request.request_number} • Submitted{' '}
              {
  format(new Date(request.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Due Date</span>
          </div>
          <p
            className={`text-lg font-bold ${!request.sla_deadline ? 'text-slate-400' : 'text-slate-900'}`}
          >
            {request.sla_deadline
              ? format(new Date(request.sla_deadline), 'MMM d, yyyy')
              : 'Not set'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Department</span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {request.department_info?.name || request.department}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Documents</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{request.documents?.length || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Clarifications</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-slate-900">{pendingClarifications.length}</p>
            <span className="text-xs text-slate-500">pending</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Tabs & Content vs Sidebar */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 p-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.locked && setActiveTab(tab.id)}
                  disabled={tab.locked}
                  title={
                    tab.locked && tab.id === 'second_opinion'
                      ? 'Draft opinion must be saved first'
                      : ''
                  }
                  className={`
                                        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                        ${tab.locked ? 'opacity-50 cursor-not-allowed' : ''}
                                        ${
                                          activeTab === tab.id
                                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }
                                    `}
                >
                  <tab.icon
                    className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}
                  />
                  {tab.label}
                  {
  tab.badge !== undefined && (
                    <span
                      className={`
                                            ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none
                                            ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}
                                        `}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[500px]">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-400" />
                      Case Description
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {request.description || 'No description provided for this case.'}
                    </div>
                  </div>
                </div>
              )}

              {
  activeTab === 'documents' && (
                <div className="animate-in fade-in duration-300">
                  <CaseDocuments
                    requestId={request.id}
                    documents={request.documents}
                    documentRequests={documentRequests}
                    userRole="lawyer"
                    userId={lawyerId}
                    requestStatus={lifecycleStatus}
                  />
                </div>
              )}

              {
  activeTab === 'clarifications' && (
                <div className="animate-in fade-in duration-300">
                  <CaseClarifications
                    requestId={request.id}
                    clarifications={clarifications}
                    userRole="lawyer"
                    userId={lawyerId}
                    clientId={request.client?.id || ''}
                  />
                </div>
              )}

              {
  activeTab === 'opinion' && (
                <CaseOpinion
                  requestId={request.id}
                  opinionText={request.opinion_text}
                  opinionSubmittedAt={request.opinion_submitted_at}
                  userRole="lawyer"
                  userId={lawyerId}
                  requestStatus={lifecycleStatus}
                  pendingClarifications={pendingClarifications.length}
                  hasDocuments={request.documents.length > 0}
                />
              )}

              {
  activeTab === 'second_opinion' && (
                <div className="animate-in fade-in duration-300">
                  <CaseSecondOpinion requestId={request.id} userId={lawyerId} userRole="lawyer" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Client & Timeline (Always Visible) */}
        <div className="space-y-6">
          {/* Internal Review Reviewer Card */}
          {
  isReviewer && secondOpinionRequest && (
            <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 p-4 opacity-5">
                <Signature className="w-40 h-40 text-indigo-900" />
              </div>

              <h3 className="font-bold text-slate-900 mb-2 relative z-10 flex items-center gap-2">
                <Signature className="w-5 h-5 text-indigo-600" />
                Internal Review Action
              </h3>

              {secondOpinionRequest.status === 'pending' ||
              secondOpinionRequest.status === 'in_progress' ? (
                <div className="space-y-4 relative z-10">
                  <p className="text-sm text-slate-600">
                    Please review the case details and the draft opinion provided. Submit your
                    internal review feedback or approval below.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Your Notes / Feedback
                    </label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Enter your observations, suggested changes, or approval notes..."
                      className="min-h-[120px] bg-indigo-50/30 border-indigo-100 focus:border-indigo-300"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleReviewSubmit('completed')}
                      disabled={isSubmittingReview}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isSubmittingReview ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Complete Review
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleReviewSubmit('rejected')}
                    disabled={isSubmittingReview}
                    variant="outline"
                    className="w-full bg-white text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  <div
                    className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                      secondOpinionRequest.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {secondOpinionRequest.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    Review {secondOpinionRequest.status === 'completed' ? 'Submitted' : 'Rejected'}
                  </div>

                  {secondOpinionRequest.reviewer_notes && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Your Notes:</p>
                      {secondOpinionRequest.reviewer_notes}
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    Submitted on{' '}
                    {
  format(
                      new Date(secondOpinionRequest.updated_at || secondOpinionRequest.created_at),
                      'MMM d, yyyy'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {
  request.client && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                Client Details
                <span className="text-xs font-normal text-slate-500 px-2 py-1 bg-slate-100 rounded-lg">
                  Verified
                </span>
              </h3>
              <div className="flex flex-col items-center text-center mb-6">
                {request.client.avatar_url ? (
                  <Image
                    src={request.client.avatar_url}
                    alt={request.client.full_name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover mb-3 ring-4 ring-slate-50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-3 ring-4 ring-slate-50">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                )}
                <h4 className="text-lg font-bold text-slate-900">{request.client.full_name}</h4>
                <p className="text-sm text-slate-500">Legal Assistance Requester</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Email</span>
                  <span
                    className="font-medium text-slate-900 truncate max-w-[150px]"
                    title={request.client.email}
                  >
                    {request.client.email}
                  </span>
                </div>
                {request.client.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-900">{request.client.phone}</span>
                  </div>
                )}
                <button className="w-full mt-4 py-2 px-4 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  View Full Profile
                </button>
              </div>
            </div>
          )}

          <CaseProgressTracker
            currentStep={progressMetrics.currentStep}
            totalSteps={progressMetrics.totalSteps}
            steps={progressMetrics.steps}
            label={progressMetrics.label}
          />
        </div>
      </div>
    </div>
  );
}
