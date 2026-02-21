'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Lock,
  FileText,
  Upload,
  CheckCircle,
  Send,
  Users,
  AlertCircle,
  Clock,
} from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import LegalOpinionEditor from './components/LegalOpinionEditor';
import OpinionPDFUploader from './components/OpinionPDFUploader';
import { updateCaseStatus } from '@/app/actions/caseActions';
import Modal from '@/components/shared/Modal';
import { toast } from 'sonner';
import PostOpinionQueries from './components/PostOpinionQueries';
import {
  acknowledgeOpinion,
  closeCase,
  confirmNoFurtherQuestions,
} from '@/app/actions/post_opinion_workflow';

interface Props {
  requestId: string;
  opinionText?: string;
  opinionSubmittedAt?: string;
  userRole: 'client' | 'lawyer';
  userId: string;
  requestStatus: string;
  pendingClarifications: number;
  hasDocuments: boolean;
  review?: {
    rating: number;
    review_text: string | null;
    created_at: string;
  };
}

interface LegalOpinion {
  id: string;
  status: 'draft' | 'review' | 'published';
  current_version: number;
  versions: OpinionVersion[];
}

interface OpinionVersion {
  version_number: number;
  content: any; // JSON
  text_content?: string;
  pdf_url?: string;
  is_draft: boolean;
  created_at: string;
}

export default function CaseOpinion({
  requestId,
  userRole,
  userId,
  requestStatus,
  pendingClarifications,
  review,
}: Props) {
  const router = useRouter();
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [opinion, setOpinion] = useState<LegalOpinion | null>(null);
  const [activeVersion, setActiveVersion] = useState<OpinionVersion | null>(null);
  const [editMode, setEditMode] = useState<'editor' | 'pdf'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>();

  // Fetch Opinion Data
  useEffect(() => {
    fetchOpinion();
  }, [requestId]);

  const fetchOpinion = async () => {
    try {
      const { data, error } = (await __getSupabaseClient()).from('legal_opinions')
        .select(
          `
                    *,
                    versions:opinion_versions(*)
                `
        )
        .eq('request_id', requestId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows found"
        console.error('Error fetching opinion:', JSON.stringify(error, null, 2));
      }

      if (data) {
        setOpinion(data);
        // Sort versions to get latest
        const versions =
          data.versions?.sort((a: any, b: any) => b.version_number - a.version_number) || [];
        const latest = versions[0];
        setActiveVersion(latest);
        if (latest?.pdf_url) {
          setEditMode('pdf');
        }
      }
    } catch (error) {
      console.error('Error in fetchOpinion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (content: any, pdfUrl?: string) => {
    setIsSaving(true);
    try {
      // Use existing opinion or create new
      let opinionId = opinion?.id;
      let newVersionNum = (opinion?.current_version || 0) + 1;

      if (!opinionId) {
        // Create new legal_opinion
        const { data: newOpinion, error: opError } = (await __getSupabaseClient()).from('legal_opinions')
          .insert({
            request_id: requestId,
            lawyer_id: userId,
            status: 'draft',
            current_version: 1,
          })
          .select()
          .single();

        if (opError) throw opError;
        opinionId = newOpinion.id;
        setOpinion({ ...newOpinion, versions: [] });
        newVersionNum = 1;
      } else {
        // Increment version on opinion
        const { error: updateError } = (await __getSupabaseClient()).from('legal_opinions')
          .update({
            updated_at: new Date().toISOString(),
            current_version: newVersionNum,
          })
          .eq('id', opinionId);
        if (updateError) throw updateError;
      }

      // Insert new version
      const { data: versionData, error: vError } = (await __getSupabaseClient()).from('opinion_versions')
        .insert({
          opinion_id: opinionId,
          version_number: newVersionNum,
          content: pdfUrl ? null : content,
          text_content: pdfUrl ? 'PDF Upload' : JSON.stringify(content), // Simplified text extraction
          pdf_url: pdfUrl,
          is_draft: true,
        })
        .select()
        .single();

      if (vError) throw vError;

      setActiveVersion(versionData);
      setLastSavedAt(new Date().toLocaleTimeString());

      // Refresh page data to update Second Opinion tab visibility
      router.refresh();

      // Update request status to 'drafting_opinion' if needed
      if (['assigned', 'in_review'].includes(requestStatus)) {
        // Use Server Action for consistent status update & audit log
        const result = await updateCaseStatus(
          requestId,
          'drafting_opinion',
          'Started drafting opinion'
        );

        if (!result.success) {
          console.error('Failed to update status:', result.error);
          // We don't block the draft save, but maybe we should notify?
          // toast.error(`Draft saved, but status update failed: ${result.error}`)
        } else {
          router.refresh();
        }
      }

      // Refetch to ensure state is clean
      // fetchOpinion() // Optional, but local state update is faster
      setOpinion((prev) =>
        prev
          ? {
            ...prev,
            current_version: newVersionNum,
            versions: [versionData, ...(prev.versions || [])],
          }
          : null
      );
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Triggered by "Send to Client" button
  const handlePublish = () => {
    setIsPublishModalOpen(true);
  };

  const isClientAcknowledged = requestStatus === 'client_acknowledged';
  const isCaseClosed = requestStatus === 'case_closed';
  const isOpinionReady = requestStatus === 'opinion_ready';
  const isClientConfirmed = requestStatus === 'no_further_queries_confirmed';
  const canClientConfirm = isClientAcknowledged && !isCaseClosed && !isClientConfirmed;

  const handleAcknowledge = async () => {
    setIsSending(true);
    const result = await acknowledgeOpinion(requestId);
    setIsSending(false);
    if (result.success) {
      toast.success('Opinion acknowledged');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleCloseCaseClick = () => {
    setIsCloseModalOpen(true);
  };

  const executeCloseCase = async () => {
    setIsSending(true);
    const result = await closeCase(requestId);
    setIsSending(false);
    if (result.success) {
      toast.success('Case closed successfully');
      setIsCloseModalOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleConfirmNoQuestionsClick = () => {
    console.log('[CaseOpinion] No Further Questions button clicked');
    setIsConfirmModalOpen(true);
  };

  const executeConfirmNoQuestions = async () => {
    console.log('[CaseOpinion] executeConfirmNoQuestions called', { requestId });
    setIsSending(true);
    try {
      const result = await confirmNoFurtherQuestions(requestId);
      console.log('[CaseOpinion] confirmNoFurtherQuestions result:', result);

      setIsSending(false);
      if (result.success) {
        toast.success('Confirmed no further questions');
        setIsConfirmModalOpen(false);
        router.refresh();
      } else {
        console.error('[CaseOpinion] Error confirming:', result.error);
        toast.error(result.error);
      }
    } catch (err) {
      console.error('[CaseOpinion] Exception in executeConfirmNoQuestions:', err);
      setIsSending(false);
      toast.error('An unexpected error occurred');
    }
  };

  // Triggered by "Confirm" in Modal
  const executePublish = async () => {
    setIsSending(true);
    try {
      if (!opinion?.id) throw new Error('No draft to publish');

      // Update opinion status
      const { error: opError } = (await __getSupabaseClient()).from('legal_opinions')
        .update({ status: 'published' })
        .eq('id', opinion.id);

      if (opError) throw opError;

      // Determine text content for legacy support or main view
      const finalContent = activeVersion?.text_content || 'Legal Opinion';

      // Also update parent request status for compatibility
      (await __getSupabaseClient()).from('legal_requests')
        .update({
          status: 'opinion_ready',
          opinion_submitted_at: new Date().toISOString(),
          opinion_text: activeVersion?.pdf_url ? 'See attached PDF' : finalContent, // Legacy fallback
        })
        .eq('id', requestId);

      // Create Audit Log
      await (await __getSupabaseClient()).from('audit_logs').insert({
        user_id: userId,
        action: 'opinion_submitted',
        entity_type: 'legal_request',
        entity_id: requestId,
        details: {
          version: opinion.current_version,
          is_pdf: !!activeVersion?.pdf_url,
        },
      });

      // Refresh
      setOpinion((prev) => (prev ? { ...prev, status: 'published' } : null));
      setIsPublishModalOpen(false);
      router.refresh();
      toast.success('Opinion published successfully');
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to send to client');
    } finally {
      setIsSending(false);
    }
  };

  // --- RENDER ---

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Loading opinion...</div>;
  }

  // CLIENT VIEW
  if (userRole === 'client') {
    const isPublished =
      opinion?.status === 'published' ||
      ['opinion_ready', 'completed', 'case_closed'].includes(requestStatus);

    if (!isPublished) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm mb-2">Legal Opinion Pending</p>
          <p className="text-xs text-slate-400">
            Your legal opinion will appear here once the lawyer completes their review
          </p>
        </div>
      );
    }

    // Display Publishing Opinion
    return (
      <div className="space-y-6">
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 ${isCaseClosed ? 'bg-slate-100 border-slate-200' : 'bg-green-50 border-green-200'
            }`}
        >
          <div className="flex items-center gap-2">
            {isCaseClosed ? (
              <CheckCircle className="w-5 h-5 text-slate-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <div>
              <p
                className={`font-semibold text-sm ${isCaseClosed ? 'text-slate-900' : 'text-green-900'
                  }`}
              >
                {isCaseClosed ? 'Case Closed' : 'Opinion Delivered'}
              </p>
              <p className={`text-sm ${isCaseClosed ? 'text-slate-600' : 'text-green-700'}`}>
                {isCaseClosed
                  ? 'This case has been formally closed.'
                  : `Submitted ${activeVersion?.created_at && formatDistanceToNow(new Date(activeVersion.created_at), { addSuffix: true })}`}
              </p>
            </div>
          </div>

          {isOpinionReady && !isClientAcknowledged && !isCaseClosed && (
            <button
              onClick={handleAcknowledge}
              disabled={isSending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSending ? 'Processing...' : 'Acknowledge Receipt'}
            </button>
          )}
        </div>

        {activeVersion?.pdf_url ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <a
                href={activeVersion.pdf_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4 rotate-180" />
                Download PDF
              </a>
            </div>
            <div className="h-[800px] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              <iframe
                src={`${activeVersion.pdf_url}#toolbar=0`}
                className="w-full h-full border-none"
                title="Legal Opinion PDF"
              />
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Legal Opinion</h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <LegalOpinionEditor
                initialContent={activeVersion?.content}
                readOnly={true}
                onSave={() => { }}
                onSend={() => { }}
              />
            </div>
          </div>
        )}

        {/* Post Opinion Queries */}
        {/* Post Opinion Queries */}
        {(isClientAcknowledged || isCaseClosed || isClientConfirmed) && (
          <div className="pt-6 border-t border-slate-200">
            <PostOpinionQueries
              requestId={requestId}
              userRole="client"
              isCaseClosed={isCaseClosed}
              isClientConfirmed={isClientConfirmed}
            />

            {/* No Further Questions Confirmation */}
            {
              canClientConfirm && (
                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <h4 className="text-lg font-bold text-blue-900 mb-2">
                    Satisfied with the opinion?
                  </h4>
                  <p className="text-sm text-blue-700 mb-4 max-w-lg mx-auto">
                    If you have reviewed the opinion and any follow-up answers, and have no further
                    questions, please confirm below. This will allow the lawyer to formally close the
                    case.
                  </p>
                  <button
                    onClick={handleConfirmNoQuestionsClick}
                    disabled={isSending}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    No Further Questions
                  </button>
                </div>
              )}

            {
              isClientConfirmed && !isCaseClosed && (
                <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    You have confirmed no further questions. Waiting for lawyer to close the case.
                  </span>
                </div>
              )}
          </div>
        )}
        {/* Confirm No Further Questions Modal (Client) */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm No Further Questions"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  Are you sure you have no further questions?
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  By confirming, you indicate that you are satisfied with the legal opinion and the
                  case can be closed. You will not be able to raise new queries after this.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSending}
                className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmNoQuestions}
                disabled={isSending}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // LAWYER VIEW
  const isOpinionPublished = opinion?.status === 'published';
  // Extended publish check for post-workflow
  const isWorkflowActive =
    isOpinionPublished || isClientAcknowledged || isCaseClosed || isClientConfirmed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Drafting Workspace</h2>
        <div className="flex items-center gap-2">
          {isOpinionPublished && !isCaseClosed && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Published
            </div>
          )}
          {
            isCaseClosed && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                <CheckCircle className="w-4 h-4" />
                Case Closed
              </div>
            )}

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setEditMode('editor')}
              disabled={isOpinionPublished && editMode !== 'editor'} // Prevent switching if published, stay on active view? Or maybe allow switching for viewing
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${editMode === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Rich Text Editor
            </button>
            <button
              onClick={() => setEditMode('pdf')}
              disabled={isOpinionPublished && editMode !== 'pdf'} // Let's allow switching to view, but disable editing inputs
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${editMode === 'pdf' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Upload PDF
            </button>
          </div>
        </div>
      </div>

      {editMode === 'editor' ? (
        <LegalOpinionEditor
          initialContent={activeVersion?.content}
          onSave={(content) => handleSaveDraft(content, undefined)}
          onSend={handlePublish}
          isSaving={isSaving}
          isSending={isSending}
          lastSavedAt={lastSavedAt}
          readOnly={isOpinionPublished}
        />
      ) : (
        <div className="h-[600px]">
          <OpinionPDFUploader
            requestId={requestId}
            currentPdfUrl={activeVersion?.pdf_url}
            onUploadComplete={(url) => handleSaveDraft({}, url)}
            isLawyer={true}
            disabled={isOpinionPublished}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handlePublish}
              disabled={isSending || !activeVersion?.pdf_url || isOpinionPublished}
              className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isOpinionPublished
                ? 'Opinion Sent'
                : isSending
                  ? 'Sending...'
                  : 'Send PDF to Client'}
            </button>
          </div>
        </div>
      )}

      {/* Post Opinion Workflow Section for Lawyer */}
      {
        isWorkflowActive && (
          <div className="pt-6 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Post-Opinion Actions</h3>
              {/* Close Case Button */}
              {!isCaseClosed && (
                <div className="flex items-center gap-2">
                  {/* Client Status Indicator */}
                  {
                    isClientConfirmed ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Client Confirmed No Questions
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Waiting for Client Confirmation
                      </div>
                    )}

                  <button
                    onClick={handleCloseCaseClick}
                    disabled={isSending || !isClientConfirmed} // Strict rule: must confirm
                    title={
                      !isClientConfirmed ? "Client must confirm 'No Further Questions' first" : ''
                    }
                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? 'Closing...' : 'Close Case'}
                  </button>
                </div>
              )}
            </div>

            <PostOpinionQueries
              requestId={requestId}
              userRole="lawyer"
              isCaseClosed={isCaseClosed}
              isClientConfirmed={isClientConfirmed}
            />
          </div>
        )}

      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Legal Opinion"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Are you sure you want to publish?</p>
              <p className="text-sm text-amber-700 mt-1">
                This action will finalize the opinion and make it visible to the client. Updates
                after this point will require a new version.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsPublishModalOpen(false)}
              disabled={isSending}
              className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executePublish}
              disabled={isSending}
              className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirm Publish
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Case"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Are you sure you want to close this case?</p>
              <p className="text-sm text-red-700 mt-1">
                This action is irreversible. No further queries or changes will be allowed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsCloseModalOpen(false)}
              disabled={isSending}
              className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executeCloseCase}
              disabled={isSending}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Confirm Close
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
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
