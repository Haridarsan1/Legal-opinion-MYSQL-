'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building2,
  Calendar,
  MessageCircle,
  Eye,
  Lock,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import CaseHeader from './components/CaseHeader';
import AuditTimeline from './components/AuditTimeline';
import CaseStatusFlow from './components/CaseStatusFlow';
import CaseProgressStepper from './components/CaseProgressStepper';
import CaseWorkflowTimeline from './components/CaseWorkflowTimeline';
import LawyerAcceptanceCard from './components/LawyerAcceptanceCard';
import DocumentChecklistWidget from './components/DocumentChecklistWidget';
import CaseDocuments from './CaseDocuments';
import CaseMessages from './CaseMessages';
import CaseClarifications from './CaseClarifications';
import CaseOpinion from './CaseOpinion';
import { generateTimeline } from './utils/generateTimeline';

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  uploaded_at: string;
  document_type?: string;
  uploaded_by?: string;
  review_status?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

interface Clarification {
  id: string;
  message: string;
  created_at: string;
  response?: string;
  responded_at?: string;
  is_resolved: boolean;
  priority?: string;
  parent_id?: string;
  created_by_role?: string;
  resolved_by?: string;
  resolved_at?: string;
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
  lawyer_acceptance_status?: 'pending' | 'accepted' | 'rejected';
  lawyer_accepted_at?: string;
  lawyer_rejected_at?: string;
  priority: string;
  case_type?: string;
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  sla_deadline?: string;
  opinion_text?: string;
  opinion_submitted_at?: string;
  client_confirmed_at?: string;
  client_id: string;
  assigned_lawyer_id?: string;
  visibility?: 'public' | 'private';
  audit_events?: any[];
  lawyer?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    specialization?: string;
  };
  firm?: {
    organization: string;
    full_name: string;
  };
  department_info?: {
    name: string;
    description: string;
  };
  documents: Document[];
}

interface Props {
  request: LegalRequest;
  clarifications: Clarification[];
  messages: Message[];
  documentRequests: DocumentRequest[];
  review?: {
    rating: number;
    review_text: string | null;
    created_at: string;
  };
  userId: string;
  userRole: 'client' | 'lawyer';
  userProfile: {
    full_name: string;
    avatar_url?: string;
  };
  secondOpinionRequests: any[];
  hasDraftOpinion: boolean;
  workflowSummary: import('../utils/workflowAggregator').WorkflowSummary;
}

export default function CaseWorkspace({
  request,
  clarifications: initialClarifications,
  messages: initialMessages,
  documentRequests: initialDocumentRequests,
  review,
  userId,
  userRole,
  userProfile,
  hasDraftOpinion,
  secondOpinionRequests,
  workflowSummary,
}: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [activeTab, setActiveTab] = useState('overview');
  const [clarifications, setClarifications] = useState<Clarification[]>(initialClarifications);
  const [documentRequests, setDocumentRequests] =
    useState<DocumentRequest[]>(initialDocumentRequests);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real-time subscriptions disabled during MySQL/Prisma migration
  useEffect(() => {
    // TODO: Implement polling or WebSockets for real-time Prisma updates
  }, [request.id, router]);

  // Real-time subscriptions

  const statusConfig: Partial<Record<string, { label: string; color: string; bg: string }>> = {
    draft: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
    submitted: { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-100' },
    marketplace_posted: { label: 'Marketplace', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    assigned: { label: 'Assigned', color: 'text-purple-700', bg: 'bg-purple-100' },
    clarification_pending: {
      label: 'Clarification Requested',
      color: 'text-amber-700',
      bg: 'bg-amber-100',
    },
    in_review: { label: 'Under Review', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    opinion_ready: { label: 'Opinion Ready', color: 'text-green-700', bg: 'bg-green-100' },
    delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100' },
    completed: { label: 'Completed', color: 'text-slate-700', bg: 'bg-slate-100' },
    archived: { label: 'Archived', color: 'text-slate-500', bg: 'bg-slate-100' },
    cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
  };

  const currentLifecycleState = workflowSummary.lifecycleState;
  const currentStatusConfig = statusConfig[currentLifecycleState] || statusConfig.submitted;

  // SLA logic now handled by WorkflowSummary
  const slaStatus = {
    label: workflowSummary.sla.text,
    color: workflowSummary.sla.color,
    isDelayed: workflowSummary.sla.status === 'overdue',
  };

  const pendingClarifications = clarifications.filter((c: any) => !c.is_resolved && !c.parent_id).length;
  const unreviewedDocuments = request.documents.filter(
    (d) => !d.review_status || d.review_status === 'pending'
  ).length;

  // Compute last activity timestamp
  const lastActivityAt = useMemo(() => {
    const timestamps = [
      request.created_at,
      ...clarifications.map((c: any) => c.created_at),
      ...request.documents.map((d: any) => d.uploaded_at),
    ].filter(Boolean);

    return timestamps.length > 0
      ? new Date(Math.max(...timestamps.map((t) => new Date(t).getTime()))).toISOString()
      : request.created_at;
  }, [request, clarifications]);

  const timelineEvents = useMemo(
    () =>
      generateTimeline({
        request: {
          created_at: request.created_at,
          assigned_at: request.assigned_at,
          opinion_submitted_at: request.opinion_submitted_at,
          status: currentLifecycleState,
          lawyer_acceptance_status: request.lawyer_acceptance_status,
          lawyer_accepted_at: request.lawyer_accepted_at,
          lawyer_rejected_at: request.lawyer_rejected_at,
        },
        client: userProfile,
        lawyer: request.lawyer,
        documents: request.documents.map((doc) => ({
          ...doc,
          uploaded_by: doc.uploaded_by || 'Unknown',
        })),
        clarifications,
        messages: [],
      }),
    [request, clarifications, userProfile]
  );

  // Lock behavior
  const lawyerAccepted = request.lawyer_acceptance_status === 'accepted';
  const lockUntilAccepted = !lawyerAccepted && !!request.assigned_lawyer_id;

  // Lock Second Opinion until draft exists
  // Also hidden for Client unless we want to show it? Assuming Lawyer only for now as requested.
  // Check if user is the assigned lawyer (even if they are also the client in test scenarios)
  const isLawyer = userRole === 'lawyer' || request.assigned_lawyer_id === userId;
  const lockSecondOpinion = !hasDraftOpinion;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FileText, locked: false },
    {
      key: 'documents',
      label: 'Documents',
      icon: Upload,
      badge: request.documents.length,
      locked: lockUntilAccepted,
    },
    {
      key: 'clarifications',
      label: 'Clarifications',
      icon: AlertCircle,
      badge: pendingClarifications,
      locked: lockUntilAccepted,
    },
    // Opinion Tab Logic:
    // - Lawyer: Always visible, labeled "Draft Opinion"
    // - Client: Visible if there's opinion data (hasDraftOpinion) OR if status indicates opinion is ready
    ...(userRole === 'client' &&
      !hasDraftOpinion &&
      !['opinion_ready', 'delivered', 'completed', 'archived'].includes(currentLifecycleState)
      ? []
      : [
        {
          key: 'opinion',
          label: userRole === 'client' ? 'Legal Opinion' : 'Draft Opinion',
          icon: Eye,
          locked: lockUntilAccepted,
        },
      ]),
    ...(isLawyer
      ? [
        {
          key: 'internal_review',
          label: 'Internal Review',
          icon: Building2,
          locked: lockUntilAccepted || lockSecondOpinion,
          badge: secondOpinionRequests?.length || 0,
        },
      ]
      : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Unified Case Header */}
      <CaseHeader
        caseId={request.id}
        caseNumber={request.request_number}
        title={request.title || request.request_number}
        status={currentLifecycleState}
        lawyerAcceptanceStatus={request.lawyer_acceptance_status}
        lawyerName={request.lawyer?.full_name}
        priority={request.priority}
        createdAt={request.created_at}
        slaDeadline={request.sla_deadline}
        userRole={userRole}
        backHref={userRole === 'client' ? '/client/track' : '/lawyer/requests'}
        pendingClarifications={pendingClarifications}
        unreviewedDocuments={unreviewedDocuments}
        lastActivityAt={lastActivityAt}
        hasAssignedLawyer={!!request.lawyer}
        opinionSubmitted={!!request.opinion_submitted_at}
        rated={!!review}
        isTerminal={workflowSummary.isTerminal}
        completedAt={workflowSummary.completedAt}
        slaStatus={{
          status: workflowSummary.sla.status,
          label: workflowSummary.sla.text,
          color: workflowSummary.sla.color,
          hoursRemaining: workflowSummary.sla.hoursRemaining,
        }}
        nextActionOverride={
          workflowSummary.nextStep
            ? {
              title: workflowSummary.nextStep.title,
              description: workflowSummary.nextStep.description,
              actionLabel: workflowSummary.nextStep.actionLabel || 'View Details',
              actionHref: workflowSummary.nextStep.actionUrl || '#',
              priority: workflowSummary.nextStep.priority,
              icon: 'AlertCircle',
            }
            : undefined
        }
      />

      {/* Progress Timeline */}
      {/* Progress Timeline */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
          <CaseProgressStepper stages={workflowSummary.horizontalStages} />

          {isMounted && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {workflowSummary.isTerminal ? (
                // Terminal state: show completion date
                <>
                  <CheckCircle className="w-4 h-4 text-green-700" />
                  <span className="text-sm font-medium text-green-700">
                    Completed{' '}
                    {
                      workflowSummary.completedAt
                        ? formatDistanceToNow(new Date(workflowSummary.completedAt), {
                          addSuffix: true,
                        })
                        : format(new Date(request.updated_at), 'MMM d, yyyy')}
                  </span>
                </>
              ) : request.sla_deadline ? (
                // Active case: show SLA deadline
                <>
                  <Clock className={`w-4 h-4 ${slaStatus.color}`} />
                  <span className={`text-sm font-medium ${slaStatus.color}`}>
                    Expected by {format(new Date(request.sla_deadline), 'MMM d, yyyy')} •{' '}
                    {
                      slaStatus.label}
                  </span>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Content - Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-slate-200 p-2 overflow-x-auto">
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => !tab.locked && setActiveTab(tab.key)}
                      disabled={tab.locked}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.key
                          ? 'bg-slate-900 text-white'
                          : tab.locked
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      title={
                        tab.locked && tab.key === 'internal_review'
                          ? 'Draft opinion must be saved first'
                          : ''
                      }
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {
                        tab.locked && <Lock className="w-3 h-3" />}
                      {
                        tab.badge !== undefined && tab.badge > 0 && !tab.locked && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-bold ${activeTab === tab.key
                                ? 'bg-white text-slate-900'
                                : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 min-h-[500px]">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-2">Case Description</h2>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {request.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Lawyer Acceptance Card */}
                    {
                      userRole === 'lawyer' &&
                      request.lawyer_acceptance_status === 'pending' &&
                      request.assigned_lawyer_id === userId && (
                        <LawyerAcceptanceCard
                          requestId={request.id}
                          lawyerName={userProfile.full_name}
                        />
                      )}

                    {/* Next Step Widget */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${workflowSummary.nextStep.priority === 'high'
                              ? 'bg-red-500'
                              : workflowSummary.nextStep.priority === 'medium'
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                            }`}
                        >
                          <span className="text-white text-xl">ℹ️</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {workflowSummary.nextStep.title}
                          </h3>
                          <p className="text-slate-700 mb-3">
                            {workflowSummary.nextStep.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${workflowSummary.nextStep.actor === 'client'
                                  ? 'bg-purple-100 text-purple-700'
                                  : workflowSummary.nextStep.actor === 'lawyer'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                            >
                              {workflowSummary.nextStep.actor === 'client' && 'Client Action'}
                              {
                                workflowSummary.nextStep.actor === 'lawyer' && 'Lawyer Action'}
                              {
                                workflowSummary.nextStep.actor === 'system' && 'System Process'}
                            </span>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${workflowSummary.nextStep.priority === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : workflowSummary.nextStep.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                            >
                              {workflowSummary.nextStep.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Workflow Timeline */}
                    <div className="p-6 bg-white rounded-xl border border-slate-200">
                      <h2 className="text-lg font-bold text-slate-900 mb-6">Case Progress</h2>
                      <CaseWorkflowTimeline
                        stages={workflowSummary.timelineStages}
                        sla={workflowSummary.sla}
                        showSLAHeader={true}
                        isTerminal={workflowSummary.isTerminal}
                        completedAt={workflowSummary.completedAt}
                      />
                    </div>

                    {/* Document Checklist */}
                    <DocumentChecklistWidget
                      requestId={request.id}
                      caseType={request.case_type}
                      userRole={userRole}
                    />

                    {request.lawyer && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-3">Assigned Lawyer</p>
                        <div className="flex items-center gap-3">
                          {request.lawyer.avatar_url ? (
                            <Image
                              src={request.lawyer.avatar_url}
                              alt={request.lawyer.full_name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">
                              {request.lawyer.full_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {request.lawyer.specialization || 'Legal Consultant'}
                            </p>
                            <p className="text-xs text-slate-500">{request.lawyer.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!request.lawyer && userRole === 'client' && (
                      <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-blue-900 text-sm mb-1">
                              Assignment in Progress
                            </p>
                            <p className="text-sm text-blue-700">
                              A lawyer will be assigned to your case soon.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {
                      request.lawyer &&
                      request.lawyer_acceptance_status === 'pending' &&
                      userRole === 'client' && (
                        <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-amber-900 text-sm mb-1">
                                Waiting for Lawyer Confirmation
                              </p>
                              <p className="text-sm text-amber-700">
                                {request.lawyer.full_name} needs to accept this case before
                                collaboration can begin.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {
                      request.lawyer &&
                      request.lawyer_acceptance_status === 'rejected' &&
                      userRole === 'client' && (
                        <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-red-900 text-sm mb-1">
                                Case Rejected
                              </p>
                              <p className="text-sm text-red-700">
                                {request.lawyer.full_name} has declined this case. A new lawyer will
                                be assigned.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {
                      request.firm && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-xs font-semibold text-slate-600 mb-1">Assigned Firm</p>
                          <p className="font-semibold text-slate-900">{request.firm.organization}</p>
                        </div>
                      )}

                    {/* Audit Timeline */}
                    <div className="mt-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-4">Activity Timeline</h2>
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                        <AuditTimeline events={timelineEvents} userRole={userRole} />
                      </div>
                    </div>
                  </div>
                )}

                {
                  activeTab === 'documents' && (
                    <CaseDocuments
                      requestId={request.id}
                      documents={request.documents}
                      documentRequests={documentRequests}
                      userRole={userRole}
                      userId={userId}
                      requestStatus={currentLifecycleState}
                    />
                  )}

                {
                  activeTab === 'clarifications' && (
                    <CaseClarifications
                      requestId={request.id}
                      clarifications={clarifications}
                      userRole={userRole}
                      userId={userId}
                      clientId={request.client_id}
                      documents={
                        request.documents?.map((d: any) => ({
                          id: d.id,
                          file_name: d.file_name,
                          file_path: d.file_path,
                          uploader_id: d.uploaded_by,
                        })) || []
                      }
                    />
                  )}

                {
                  activeTab === 'opinion' && (
                    <CaseOpinion
                      requestId={request.id}
                      opinionText={request.opinion_text}
                      opinionSubmittedAt={request.opinion_submitted_at}
                      userRole={userRole}
                      userId={userId}
                      requestStatus={currentLifecycleState}
                      pendingClarifications={pendingClarifications}
                      hasDocuments={request.documents.length > 0}
                      review={review}
                    />
                  )}

                {
                  activeTab === 'internal_review' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Internal Review Requests</h2>
                        <Link
                          href={`/case/${request.id}/request-second-opinion`}
                          className="inline-flex items-center bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          New Request
                        </Link>
                      </div>

                      {secondOpinionRequests && secondOpinionRequests.length > 0 ? (
                        <div className="space-y-4">
                          {secondOpinionRequests.map((req: any) => (
                            <div
                              key={req.id}
                              className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-all bg-white"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  {req.reviewer?.avatar_url ? (
                                    <Image
                                      src={req.reviewer.avatar_url}
                                      alt={req.reviewer.full_name}
                                      width={48}
                                      height={48}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                      <User className="w-6 h-6 text-slate-500" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {req.reviewer?.full_name || 'Unknown Lawyer'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      Sent on {new Date(req.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${req.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : req.status === 'rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                                >
                                  {req.status?.replace('_', ' ')}
                                </span>
                              </div>
                              {req.reviewer_notes && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                                  <p className="font-medium text-slate-900 mb-1">Notes:</p>
                                  {req.reviewer_notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-slate-900">No requests sent</h3>
                          <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            You haven't requested an internal review for this case yet. You can ask a
                            colleague to review your draft.
                          </p>
                          <Link
                            href={`/case/${request.id}/request-second-opinion`}
                            className="inline-flex items-center text-blue-600 font-medium hover:underline"
                          >
                            Request a review
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Case Health */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Case Health</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Documents</span>
                  <span className="font-semibold text-slate-900">{request.documents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Pending Clarifications</span>
                  <span
                    className={`font-semibold ${pendingClarifications > 0 ? 'text-amber-600' : 'text-green-600'}`}
                  >
                    {pendingClarifications}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">SLA Status</span>
                  <span className={`font-semibold ${slaStatus.color}`}>{slaStatus.label}</span>
                </div>
              </div>
            </div>

            {/* Case Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Case Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Case ID</p>
                  <p className="font-mono font-semibold text-slate-900">{request.request_number}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Priority</p>
                  <p className="font-semibold text-slate-900 capitalize">
                    {request.priority || 'Normal'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Created</p>
                  <p className="font-semibold text-slate-900">
                    {format(new Date(request.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Your Role</p>
                  <p className="font-semibold text-blue-600 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
