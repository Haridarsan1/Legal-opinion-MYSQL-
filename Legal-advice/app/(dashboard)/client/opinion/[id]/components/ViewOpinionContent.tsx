'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import OpinionHeader from './OpinionHeader';
import ExecutiveSummary from './ExecutiveSummary';
import OpinionContent from './OpinionContent';
import SupportingDocuments from './SupportingDocuments';
import AuditTimeline from './AuditTimeline';
import ActionGuidanceSidebar from './ActionGuidanceSidebar';
import RequestClarificationModal from './RequestClarificationModal';
import RatingModal from './RatingModal';
import AcceptOpinionAction from './AcceptOpinionAction';

interface Props {
  request: any;
  auditLogs: any[];
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
}

import { LifecycleStatus, resolveLifecycleStatus } from '@/app/domain/lifecycle/LifecycleResolver';

export default function ViewOpinionContent({
  request: initialRequest,
  auditLogs: initialAuditLogs,
  currentUser,
}: Props) {
  const [request, setRequest] = useState(initialRequest);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleAcceptOpinion = () => setShowAcceptModal(true);

  // Dummy handlers for now to fix build - ideally these would update state/DB
  const handleAcceptComplete = () => {
    setShowAcceptModal(false);
    // Refresh logic would go here
  };

  const handleRatingComplete = () => {
    setShowRatingModal(false);
  };

  // Derive Lifecycle Status
  const lifecycleState = resolveLifecycleStatus({
    ...request,
    audit_events: auditLogs,
    latest_opinion_version: request.opinion_versions?.sort(
      (a: any, b: any) => b.version_number - a.version_number
    )[0],
    has_pending_clarifications: request.clarifications?.some((c: any) => !c.is_resolved),
    opinion_viewed: request.opinion_viewed, // Make sure this field exists on request or handle it
    rated: request.lawyer_reviews && request.lawyer_reviews.length > 0,
  });

  const isOpinionAccepted = request.opinion_accepted;
  const hasRating = request.lawyer_reviews && request.lawyer_reviews.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <OpinionHeader
        caseId={request.request_number}
        title={request.title}
        department={request.department}
        lawyer={request.lawyer}
        status={lifecycleState} // Pass lifecycleState instead of request.status
        submittedAt={request.opinion_submitted_at}
        isAccepted={isOpinionAccepted}
        acceptedAt={request.opinion_accepted_at}
      />

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left/Main Content - 8 columns on desktop */}
          <div className="lg:col-span-8 space-y-8">
            {/* Executive Summary */}
            {
  request.executive_summary && <ExecutiveSummary summary={request.executive_summary} />}

            {/* Full Legal Opinion */}
            <OpinionContent
              opinionText={request.opinion_text}
              submittedAt={request.opinion_submitted_at}
            />

            {/* Supporting Documents */}
            <SupportingDocuments documents={request.documents || []} requestId={request.id} />

            {/* Audit & Compliance Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Case Activity Timeline</h2>
              <AuditTimeline auditLogs={auditLogs} requestId={request.id} />
            </div>
          </div>

          {/* Right Sidebar - 4 columns on desktop */}
          <div className="lg:col-span-4">
            <ActionGuidanceSidebar
              request={request}
              onRequestClarification={() => setShowClarificationModal(true)}
              onAcceptOpinion={handleAcceptOpinion}
              onRateOpinion={() => setShowRatingModal(true)}
              isAccepted={isOpinionAccepted}
              hasRating={hasRating}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {
  showClarificationModal && (
        <RequestClarificationModal
          requestId={request.id}
          onClose={() => setShowClarificationModal(false)}
          currentUserId={currentUser.id}
        />
      )}

      {
  showAcceptModal && (
        <AcceptOpinionAction
          requestId={request.id}
          requestNumber={request.request_number}
          onClose={() => setShowAcceptModal(false)}
          onComplete={handleAcceptComplete}
          currentUserId={currentUser.id}
        />
      )}

      {
  showRatingModal && (
        <RatingModal
          requestId={request.id}
          lawyerId={request.lawyer?.id}
          lawyerName={request.lawyer?.full_name}
          onClose={() => setShowRatingModal(false)}
          onComplete={handleRatingComplete}
          currentUserId={currentUser.id}
        />
      )}
    </div>
  );
}
