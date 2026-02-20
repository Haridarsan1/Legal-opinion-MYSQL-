import { createClient } from '@/lib/supabase/server';
/**
 * Example Integration of Enterprise Lawyer Workspace
 *
 * This file demonstrates how to integrate all the new components
 * into the existing lawyer review page. Copy sections as needed.
 */

import { Metadata } from 'next';
import { getRequestDetails, listClarifications } from '@/app/actions/requests';
import {
  toggleRiskFlag,
  markDocumentReviewed,
  unmarkDocumentReviewed,
  pauseSLA,
  resumeSLA,
  escalateToFirm,
  createInternalNote,

  getInternalNotes,
} from '@/app/actions/lawyer-workspace';
import { resolveLifecycleStatus } from '@/app/domain/lifecycle/LifecycleResolver';
import Link from 'next/link';
import { cookies } from 'next/headers';

// Import new components
import EnhancedCaseHeader from './components/EnhancedCaseHeader';
import LegalContextSection from './components/LegalContextSection';
import AuditGradeDocuments from './components/AuditGradeDocuments';
import ControlPanel from './components/ControlPanel';

// Existing components
import ClarificationsSection from '@/components/shared/ClarificationsSection';
import OpinionSubmissionSection from '@/components/shared/OpinionSubmissionSection';

export const metadata: Metadata = {
  title: 'Review Case - Lawyer Dashboard',
  description: 'Professional case workspace for lawyers',
};

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function EnhancedReviewCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch request details with expanded fields
  const supabase = await getSupabaseClient();

  const { data: request, error } = await supabase
    .from('legal_requests')
    .select(
      `
            *,
            department:departments(*),
            assigned_by_profile:assigned_by(id, full_name, role),
            escalation_owner_profile:escalation_owner(id, full_name, role)
        `
    )
    .eq('id', id)
    .single();

  if (error || !request) {
    return (
      <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Case Not Found</h1>
          <p className="text-slate-500 mb-4">Unable to load case details.</p>
          <Link
            href="/lawyer/assigned"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
          >
            Back to Assigned Cases
          </Link>
        </div>
      </div>
    );
  }

  // Fetch documents with review status
  const { data: documents } = await supabase
    .from('documents')
    .select(
      `
            *,
            reviewer:reviewed_by(id, full_name, role),
            uploader:uploaded_by(id, full_name, role)
        `
    )
    .eq('request_id', id)
    .order('uploaded_at', { ascending: false });

  // Fetch clarifications
  const clarificationsResult = await listClarifications(id);
  const clarifications = clarificationsResult.success ? clarificationsResult.data || [] : [];

  // Fetch internal notes
  const internalNotesResult = await getInternalNotes(id);
  const internalNotes = internalNotesResult.success ? internalNotesResult.data || [] : [];

  // Get required documents from department
  const department = Array.isArray(request.department) ? request.department[0] : request.department;
  const requiredDocuments = department?.required_documents || [];

  // Check if opinion submission is allowed
  const lifecycleState = resolveLifecycleStatus({
    ...request,
    has_pending_clarifications: clarifications.some((c: any) => !c.is_resolved),
  });
  const isInReview = lifecycleState === 'in_review';
  const hasUnresolvedClarifications = clarifications.some((c) => !c.is_resolved);
  const canSubmitOpinion = isInReview && !hasUnresolvedClarifications;

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1600px] mx-auto w-full">
      {/* Enhanced Header with SLA Countdown */}
      <EnhancedCaseHeader caseData={request} />

      {/* Main Content Grid: 2/3 Left Column,  1/3 Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Case Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Legal Context & Risk Indicators */}
          <LegalContextSection
            caseData={request}
            onToggleRiskFlag={async (flag, add) => {
              'use server';
              await toggleRiskFlag(id, flag, add);
            }}
          />

          {/* Case Description */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Case Description</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-700 leading-relaxed">
                {request.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Audit-Grade Documents */}
          <AuditGradeDocuments
            documents={documents || []}
            requiredDocuments={requiredDocuments}
            requestId={id}
            onMarkReviewed={async (docId, reqId) => {
              'use server';
              await markDocumentReviewed(docId, reqId);
            }}
            onUnmarkReviewed={async (docId, reqId) => {
              'use server';
              await unmarkDocumentReviewed(docId, reqId);
            }}
          />

          {/* Clarifications */}
          <ClarificationsSection requestId={id} clarifications={clarifications} userRole="lawyer" />

          {/* Opinion Submission */}
          <OpinionSubmissionSection
            requestId={id}
            canSubmit={canSubmitOpinion}
            reason={
              !isInReview
                ? 'Case must be in review status'
                : hasUnresolvedClarifications
                  ? 'All clarifications must be resolved before submitting opinion'
                  : undefined
            }
          />
        </div>

        {/* Right Column - Control Panel */}
        <div>
          <ControlPanel
            caseData={request}
            documents={documents || []}
            clarifications={clarifications}
            internalNotes={internalNotes}
            onPauseSLA={async (reason) => {
              'use server';
              await pauseSLA(id, reason);
            }}
            onResumeSLA={async () => {
              'use server';
              await resumeSLA(id);
            }}
            onEscalate={async (note) => {
              'use server';
              await escalateToFirm(id, note);
            }}
            onCreateNote={async (text, type) => {
              'use server';
              await createInternalNote(id, text, type as any);
            }}
            onRefresh={() => {
              // Revalidate path is handled by server actions
            }}
          />
        </div>
      </div>
    </div>
  );
}
