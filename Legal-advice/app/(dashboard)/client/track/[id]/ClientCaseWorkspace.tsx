'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building2,
  Calendar,
  MessageCircle,
  ArrowLeft,
  Send,
  Eye,
  Star,
  Lock,
  ChevronRight,
  X,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Components
import CaseHeader from '@/app/(dashboard)/case/[id]/components/CaseHeader';
import CaseProgressTracker from '../components/CaseProgressTracker';
import { ReviewModal } from '@/components/reviews/ReviewModal';

// Types
import { type NextAction } from '@/app/(dashboard)/case/[id]/utils/nextAction';
import { type LifecycleSummary, TERMINAL_STATUSES } from '@/app/domain/lifecycle/LifecycleResolver';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  document_type?: string;
}

interface Clarification {
  id: string;
  message: string;
  created_at: string;
  response?: string;
  responded_at?: string;
  is_resolved: boolean;
  priority?: string;
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
  legalOpinion?: {
    id: string;
    status: string;
    current_version: number;
    versions: Array<{
      id: string;
      version_number: number;
      content: string;
      is_draft: boolean;
      created_at: string;
      submitted_at?: string;
    }>;
  };
  rating?: {
    overall_rating: number;
    feedback: string;
    created_at: string;
  };
  userId: string;
  auditLogs: any[];
  proposals: any[];
}

export default function ClientCaseWorkspace({
  request: initialRequest,
  clarifications,
  legalOpinion,
  rating,
  userId,
  auditLogs,
  proposals,
}: Props) {  const router = useRouter();
    // Debug: Log received props
  console.log('[CLIENT WORKSPACE DEBUG] Received legalOpinion:', {
    exists: !!legalOpinion,
    opinionId: legalOpinion?.id,
    status: legalOpinion?.status,
    versionsCount: legalOpinion?.versions?.length || 0,
    versions: legalOpinion?.versions,
  });

  // State
  const [request, setRequest] = useState(initialRequest);
  const [lifecycleSummary, setLifecycleSummary] = useState<LifecycleSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [clarificationResponse, setClarificationResponse] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Fetch Lifecycle Summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/requests/${request.id}/lifecycle-summary`);
        if (!res.ok) throw new Error('Failed to fetch lifecycle summary');
        // API returns the summary object directly now
        const data = await res.json();
        setLifecycleSummary(data);
      } catch (error) {
        console.error('Error fetching lifecycle summary, using fallback:', error);

        // Fallback Logic to prevent UI blocking
        const isTerminal =
          TERMINAL_STATUSES.includes(request.status as any) ||
          ['case_closed', 'client_acknowledged', 'no_further_queries_confirmed'].includes(
            request.status
          );

        // Construct a minimal valid summary
        const fallbackSummary: LifecycleSummary = {
          id: request.id,
          title: request.title,
          request_number: request.request_number,
          created_at: request.created_at,
          updated_at: new Date().toISOString(),
          visibility: 'private', // safe default
          priority: request.priority,
          status: request.status,

          lifecycleState: request.status as any, // unsafe cast but strictly for display
          dashboardBucket: isTerminal ? 'COMPLETED' : 'ACTIVE',
          urgencyScore: 0,

          sla: {
            status: 'none',
            text: isTerminal ? 'Completed' : 'System Offline',
            color: 'text-slate-500',
            bgColor: 'bg-slate-50',
            borderColor: 'border-slate-200',
            dueDate: null,
            isOverdue: false,
            isAtRisk: false,
            deliveredAt: undefined,
          },
          nextStep: {
            title: 'Status: ' + request.status,
            description: 'System is reconnecting...',
            type: 'none',
            priority: 'low',
            iconName: 'Activity',
          },
          progress: {
            currentStep: 1,
            totalSteps: 5,
            progress: 0,
            label: request.status,
            steps: [],
          },

          meta: {
            lastUpdated: new Date().toISOString(),
            isTerminal: isTerminal,
          },
          workflow: {
            stage: request.status as any,
            progress: 0,
            health: 'active',
            next_action: {              title: 'Reconnecting',
              description: 'Attempting to reconnect...',
              type: 'none',
              priority: 'low',
            },
            sla_status: {
              status: 'none',
              text: 'Offline',
              color: 'text-slate-500',
              bgColor: 'bg-slate-50',
              borderColor: 'border-slate-200',
              dueDate: null,
              isOverdue: false,
              isAtRisk: false,
            },
            timeline: []
          }
        };
        setLifecycleSummary(fallbackSummary);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchSummary();

    // Optional: Poll for updates
    // const interval = setInterval(fetchSummary, 30000)
    // return () => clearInterval(interval)
  }, [request.id]);

  // Auto-trigger review modal based on lifecycle state
  useEffect(() => {    if (lifecycleSummary?.lifecycleState === 'completed' && !rating) {      const key = `review_prompt_${request.id}`;
      const hasSeenModal = sessionStorage.getItem(key);
      if (!hasSeenModal) {        const timer = setTimeout(() => {          setIsReviewModalOpen(true);
          sessionStorage.setItem(key, 'true');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [lifecycleSummary?.lifecycleState, request.id, rating]);

  // Derived Status (use lifecycle summary if available, fallback to request status)
  const currentStatus = lifecycleSummary?.lifecycleState || request.status;

  // Workflow Data
  const workflow = lifecycleSummary?.workflow;
  const progress = workflow?.progress ?? lifecycleSummary?.progress?.progress ?? 0;
  const health = workflow?.health ?? 'active';
  const stageLabel = workflow?.stage ?? lifecycleSummary?.lifecycleState;

  // Map Lifecycle Action to UI Next Action
  const nextActionOverride: NextAction | null | undefined = lifecycleSummary?.nextStep
    ? {
      title: lifecycleSummary.nextStep.title,
      description: lifecycleSummary.nextStep.description,
      actionLabel: lifecycleSummary.nextStep.actionLabel || 'View Details',
      actionHref: lifecycleSummary.nextStep.actionUrl || '#',
      priority: lifecycleSummary.nextStep.priority,
      icon: 'AlertCircle', // Using string because we pass it to CaseHeader which might expect that or we need to check CaseHeader implementation details again.
      // Actually CaseHeader expects the icon to be passed in object or...
      // Let's check CaseHeader's usage. It doesn't render icon from prop in the card?
      // Ah, CaseHeader computes generic icon or uses fallback.
      // Looking at CaseHeader.tsx, nextAction object has 'icon' string in NextAction type but isn't used in render?
      // Wait, CaseHeader render (line 154+) doesn't seem to use `nextAction.icon`.
      // It's fine.
    }
    : undefined;

  // Ensure fallback action scrolls to details
  if (nextActionOverride && nextActionOverride.actionHref === '#') {
    nextActionOverride.actionHref = '#case-details';
  }

  // Map Lifecycle SLA to UI SLA
  const slaOverride = lifecycleSummary?.sla
    ? {
      status: lifecycleSummary.sla.status,
      label: lifecycleSummary.sla.text,
      color: lifecycleSummary.sla.color,
      hoursRemaining: 0, // Not strictly needed for display if we trust label
    }
    : undefined;

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of uploadedFiles) {
        const fileName = `${request.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await (await __getSupabaseClient()).storage
          .from('legal-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = (await __getSupabaseClient()).storage.from('legal-documents').getPublicUrl(fileName);

        await (await __getSupabaseClient()).from('documents').insert({
          request_id: request.id,
          file_name: file.name,
          file_url: publicUrl,
          uploaded_by: userId,
          document_type: 'supporting',
        });
      }

      setUploadedFiles([]);
      router.refresh();
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitClarificationResponse = async (clarificationId: string) => {
    if (!clarificationResponse.trim()) return;

    try {
      (await __getSupabaseClient()).from('clarifications')
        .update({
          response: clarificationResponse,
          responded_at: new Date().toISOString(),
          is_resolved: true,
        })
        .eq('id', clarificationId);

      setClarificationResponse('');
      setRespondingTo(null);
      router.refresh();
      toast.success('Response submitted');
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'timeline', label: 'Timeline', icon: Clock },
    { key: 'documents', label: 'Documents', icon: Upload, badge: request.documents?.length || 0 },
    {
      key: 'clarifications',
      label: 'Clarifications',
      icon: AlertCircle,
      badge: clarifications?.filter((c: any) => !c.is_resolved).length || 0,
    },
    { key: 'messages', label: 'Messages', icon: MessageCircle },
    {
      key: 'opinion',
      label: 'Legal Opinion',
      icon: Eye,
      locked: !(legalOpinion && legalOpinion.versions && legalOpinion.versions.length > 0),
    },
  ];

  if (isLoadingSummary) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Main Layout matches dashboard structure */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm hidden">
        {/* Placeholder for standard dashboard header if needed, but usually redundant if layout provides it */}
      </div>

      {/* Case Header */}
      <CaseHeader
        caseId={request.id}
        caseNumber={request.request_number}
        title={request.title}
        status={currentStatus} // Use resolved status
        priority={request.priority}
        createdAt={request.created_at}
        slaDeadline={request.sla_deadline}
        userRole="client"
        backHref="/client/track"
        // Computed / Fallback Props
        pendingClarifications={clarifications.filter((c: any) => !c.is_resolved).length}
        unreviewedDocuments={0}
        hasAssignedLawyer={!!request.lawyer}
        opinionSubmitted={
          !!request.opinion_submitted_at ||
          ['opinion_ready', 'delivered', 'completed'].includes(currentStatus)
        }
        rated={!!rating}
        // Overrides
        slaStatus={slaOverride}
        nextActionOverride={nextActionOverride}
        isTerminal={lifecycleSummary?.meta?.isTerminal}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 w-full">
        {/* Unified Progress Tracker */}
        {
  lifecycleSummary?.progress && (
          <CaseProgressTracker
            currentStep={lifecycleSummary.progress.currentStep}
            totalSteps={lifecycleSummary.progress.totalSteps}
            steps={lifecycleSummary.progress.steps}
            label={lifecycleSummary.progress.label}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Content - Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div
              id="case-details"
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
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

              <div className="p-6">
                {/* Overview Tab */}
                {
  activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-2">Case Description</h2>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {request.description || 'No description provided'}
                      </p>
                    </div>

                    {request.lawyer ? (
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
                    ) : (
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
  request.firm && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Assigned Firm</p>
                        <p className="font-semibold text-slate-900">{request.firm.organization}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline Tab */}
                {
  activeTab === 'timeline' && (
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-900">Activity Timeline</h3>
                    <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
                      {auditLogs.length > 0 ? (
                        auditLogs.map((log) => (
                          <div key={log.id} className="relative">
                            <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100" />
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 font-medium mb-1">
                                {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                              <p className="text-sm font-semibold text-slate-900">
                                {log.action.replace(/_/g, ' ').toUpperCase()}
                              </p>
                              {log.details && (
                                <p className="text-sm text-slate-600 mt-1">
                                  {JSON.stringify(log.details)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm italic">No activity recorded yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {
  activeTab === 'documents' && (
                  <div className="space-y-6">
                    {[
                      'submitted',
                      'marketplace_posted',
                      'assigned',
                      'clarification_pending',
                      'in_review',
                    ].includes(currentStatus) && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Upload Supporting Documents
                          </label>
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                            <input
                              type="file"
                              multiple
                              onChange={(e) => {
                                if (e.target.files) {
                                  setUploadedFiles(Array.from(e.target.files));
                                }
                              }}
                              className="hidden"
                              id="doc-upload"
                              accept=".pdf,.doc,.docx"
                            />
                            <label htmlFor="doc-upload" className="cursor-pointer block">
                              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm font-medium text-slate-700">
                                Click to upload documents
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                PDF, DOC, DOCX up to 10MB each
                              </p>
                            </label>
                          </div>

                          {uploadedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {uploadedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                  <span className="text-sm text-slate-700">{file.name}</span>
                                  <button
                                    onClick={() =>
                                      setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={handleFileUpload}
                                disabled={isUploading}
                                className="w-full px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 mt-2"
                              >
                                {isUploading ? 'Uploading...' : 'Upload Files'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Uploaded Documents</h3>
                      {request.documents.length > 0 ? (
                        <div className="space-y-3">
                          {request.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {doc.file_name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(doc.uploaded_at), {
                                      addSuffix: true,
                                    })}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm">No documents uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clarifications Tab */}
                {
  activeTab === 'clarifications' && (
                  <div className="space-y-4">
                    {clarifications.length > 0 ? (
                      <>
                        {clarifications.map((clarification) => (
                          <div
                            key={clarification.id}
                            className={`p-4 rounded-xl border-2 ${clarification.is_resolved
                              ? 'border-green-200 bg-green-50'
                              : 'border-amber-200 bg-amber-50'
                              }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              {clarification.is_resolved ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 text-sm mb-1">
                                  {clarification.is_resolved ? 'Resolved' : 'Response Required'}
                                </p>
                                <p className="text-slate-700 text-sm mb-2">
                                  {clarification.message}
                                </p>

                                {clarification.response && (
                                  <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-600 mb-1">
                                      Your Response:
                                    </p>
                                    <p className="text-slate-700 text-sm">
                                      {clarification.response}
                                    </p>
                                  </div>
                                )}

                                {!clarification.is_resolved && (
                                  <>
                                    {respondingTo === clarification.id ? (
                                      <div className="mt-4 space-y-3">
                                        <textarea
                                          value={clarificationResponse}
                                          onChange={(e) => setClarificationResponse(e.target.value)}
                                          rows={4}
                                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                          placeholder="Type your response..."
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() =>
                                              handleSubmitClarificationResponse(clarification.id)
                                            }
                                            className="flex-1 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                                          >
                                            Submit Response
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRespondingTo(null);
                                              setClarificationResponse('');
                                            }}
                                            className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setRespondingTo(clarification.id)}
                                        className="mt-3 px-4 py-2 bg-white border border-amber-300 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-colors text-sm"
                                      >
                                        Respond Now
                                      </button>
                                    )}
                                  </>
                                )}

                                <p className="text-xs text-slate-500 mt-2">
                                  {formatDistanceToNow(new Date(clarification.created_at), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No clarifications requested yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Messages Tab */}
                {
  activeTab === 'messages' && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm mb-4">Case-linked messaging coming soon</p>
                    <Link
                      href="/client/messages"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Open Messages
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Opinion Tab */}
                {
  activeTab === 'opinion' && (
                  <div className="space-y-4">
                    {legalOpinion && legalOpinion.versions && legalOpinion.versions.length > 0 ? (
                      <>
                        {(() => {
                          // Get the latest published (non-draft) version, or the latest draft if no published version exists
                          const publishedVersions = legalOpinion.versions
                            .filter((v) => !v.is_draft)
                            .sort((a, b) => b.version_number - a.version_number);
                          const latestPublished = publishedVersions[0];
                          const latestVersion =
                            latestPublished ||
                            legalOpinion.versions.sort(
                              (a, b) => b.version_number - a.version_number
                            )[0];

                          return (
                            <>
                              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <p className="font-semibold text-green-900 text-sm">
                                    {latestVersion.is_draft
                                      ? 'Draft Opinion Available'
                                      : 'Opinion Delivered'}
                                  </p>
                                </div>
                                {latestVersion.submitted_at && (
                                  <p className="text-sm text-green-700">
                                    Submitted{' '}
                                    {
  formatDistanceToNow(new Date(latestVersion.submitted_at), {
                                      addSuffix: true,
                                    })}
                                  </p>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-semibold text-slate-900">Legal Opinion</h3>
                                  <span className="text-xs text-slate-500">
                                    Version {latestVersion.version_number}
                                    {
  latestVersion.is_draft && (
                                      <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                                        DRAFT
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                  <div
                                    className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: latestVersion.content }}
                                  />
                                </div>
                              </div>

                              {!rating && !latestVersion.is_draft && (
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                  <div className="flex items-start gap-3">
                                    <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-semibold text-blue-900 text-sm mb-1">
                                        Rate This Service
                                      </p>
                                      <p className="text-sm text-blue-700 mb-3">
                                        Help us improve by rating your experience
                                      </p>
                                      <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                      >
                                        Submit Rating
                                        <ChevronRight className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Eye className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">
                          Legal opinion will appear here once completed
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Action Panel */}
          <div className="space-y-6">
            {/* Action Panel is now handled by CaseHeader mostly, but we can keep simplified info here or remove. 
                             The original design had a "Next Action Card" here. 
                             If CaseHeader already has it, we might not need duplication.
                             However, for this refactor I will remove the duplicate card if CaseHeader already shows it nicely.
                             Wait, CaseHeader shows a small action button. The original sidebar had a big card.
                             Let's keep the Case Health summary here.
                         */}

            {/* Case Health Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Case Health</h3>

              {/* Health Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${health === 'active' ? 'bg-green-100 text-green-800' :
                  health === 'at_risk' ? 'bg-red-100 text-red-800' :
                    health === 'awaiting_lawyer' ? 'bg-yellow-100 text-yellow-800' :
                      health === 'payment_pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-800'
                  }`}>
                  {stageLabel}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Documents</span>
                  <span className="font-semibold text-slate-900">{request.documents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Pending Clarifications</span>
                  <span
                    className={`font-semibold ${clarifications.filter((c: any) => !c.is_resolved).length > 0
                      ? 'text-amber-600'
                      : 'text-green-600'
                      }`}
                  >
                    {clarifications.filter((c: any) => !c.is_resolved).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">SLA Status</span>
                  <span
                    className={`font-semibold ${lifecycleSummary?.sla?.color || 'text-slate-500'}`}
                  >
                    {lifecycleSummary?.sla?.text || 'Checking...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Case Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
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
            </div>
          </div>
        </div>
      </main>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        requestId={request.id}
        lawyerName={request.lawyer?.full_name}
        onSuccess={() => {
          setIsReviewModalOpen(false);
          router.refresh();
        }}
      />
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
