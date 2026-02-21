import { createClient } from '@/lib/supabase/server';
/**
 * Case Workflow Aggregator
 *
 * Unified service for computing workflow state, stage progression, timeline visualization,
 * SLA integration, and next-step guidance for case detail pages.
 *
 * This replaces scattered workflow logic across components with a single source of truth.
 */

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import {
  resolveLifecycleStatus,
  calculateLifecycleSLA,
  getLifecycleAction,
  getLifecycleProgress,
  type LifecycleStatus,
  type ExtendedRequest,
} from '@/app/domain/lifecycle/LifecycleResolver';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface WorkflowStage {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending' | 'blocked';
  actor?: 'client' | 'lawyer' | 'system';
  timestamp?: string;
  description?: string;
  iconName?: string;
  visible: boolean;
}

export interface SLAMetrics {
  deadline: string;
  status: 'on-track' | 'at-risk' | 'overdue' | 'delivered';
  daysRemaining: number;
  hoursRemaining: number;
  color: string;
  bgColor: string;
  borderColor: string;
  text: string;
  deliveredAt?: string; // Actual completion timestamp for terminal states
}

export interface NextStep {
  actor: 'client' | 'lawyer' | 'system';
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
  iconName?: string;
}

export interface CaseHealth {
  isBlocked: boolean;
  blockReason?: string;
  documentsCount: number;
  clarificationsCount: number;
  pendingDocumentsCount: number;
  pendingClarificationsCount: number;
}

export interface StageMetrics {
  stageDurations: Record<string, number>; // seconds per stage
  totalDuration: number;
  predictedETA?: string;
}

export interface WorkflowSummary {
  lifecycleState: LifecycleStatus;
  currentStageIndex: number;
  isTerminal: boolean; // True if lifecycle state is completed/archived/cancelled
  completedAt: string | null; // Timestamp when case reached terminal state

  // Horizontal Progress (for progress bar)
  horizontalStages: {
    id: string;
    label: string;
    completed: boolean;
    active: boolean;
  }[];

  // Vertical Timeline (for detailed view)
  timelineStages: WorkflowStage[];

  // SLA Integration
  sla: SLAMetrics;

  // Next Step Guidance
  nextStep: NextStep;

  // Case Health Metrics
  health: CaseHealth;

  // Analytics (optional)
  metrics?: StageMetrics;
}

// ============================================================================
// CANONICAL WORKFLOW STAGES
// ============================================================================

const CANONICAL_STAGES = [
  { id: 'requested', label: 'Requested', clientVisible: true },
  { id: 'assigned', label: 'Assigned', clientVisible: true },
  { id: 'in_review', label: 'Under Review', clientVisible: true },
  { id: 'opinion_ready', label: 'Opinion Ready', clientVisible: true },
  { id: 'completed', label: 'Completed', clientVisible: true },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect if case is blocked (waiting for client action)
 */
function detectBlockedState(
  lifecycleState: LifecycleStatus,
  clarifications: any[],
  documentRequests: any[]
): { isBlocked: boolean; blockReason?: string } {
  // Check for pending clarifications needing client response
  const pendingClarifications = clarifications.filter((c: any) => !c.is_resolved && !c.response);
  if (pendingClarifications.length > 0) {
    return {
      isBlocked: true,
      blockReason: `${pendingClarifications.length} clarification${pendingClarifications.length > 1 ? 's' : ''} need your response`,
    };
  }

  // Check for unfulfilled document requests
  const pendingDocRequests = documentRequests.filter((dr) => dr.status === 'pending');
  if (pendingDocRequests.length > 0) {
    return {
      isBlocked: true,
      blockReason: `${pendingDocRequests.length} document${pendingDocRequests.length > 1 ? 's' : ''} requested`,
    };
  }

  // Check for acknowledgment required
  if (lifecycleState === 'opinion_ready') {
    return {
      isBlocked: false, // Opinion ready is actionable but not "blocked"
      blockReason: undefined,
    };
  }

  return { isBlocked: false };
}

/**
 * Build detailed timeline stages
 */
function buildTimelineStages(
  lifecycleState: LifecycleStatus,
  request: any,
  blockedState: { isBlocked: boolean; blockReason?: string },
  userRole: 'client' | 'lawyer'
): WorkflowStage[] {
  const stages: WorkflowStage[] = [];

  // Stage 1: Requested
  stages.push({
    id: 'requested',
    label: 'Requested',
    status: 'completed',
    actor: 'client',
    timestamp: request.created_at,
    description: 'Case submitted by client',
    iconName: 'FileText',
    visible: true,
  });

  // Stage 2: Assigned
  const isAssigned = !['submitted', 'marketplace_posted', 'draft'].includes(lifecycleState);
  stages.push({
    id: 'assigned',
    label: 'Assigned',
    status: isAssigned ? 'completed' : 'pending',
    actor: 'lawyer',
    timestamp: request.assigned_at,
    description: request.lawyer
      ? `Assigned to ${request.lawyer.full_name}`
      : 'Awaiting lawyer assignment',
    iconName: 'User',
    visible: true,
  });

  // Stage 3: Under Review
  const isInReview = [
    'in_review',
    'clarification_pending',
    'opinion_ready',
    'delivered',
    'completed',
  ].includes(lifecycleState);
  const reviewStatus =
    lifecycleState === 'clarification_pending' && blockedState.isBlocked
      ? 'blocked'
      : lifecycleState === 'in_review' || lifecycleState === 'clarification_pending'
        ? 'active'
        : isInReview
          ? 'completed'
          : 'pending';

  stages.push({
    id: 'in_review',
    label: reviewStatus === 'blocked' ? 'Clarification Needed' : 'Under Review',
    status: reviewStatus,
    actor: 'lawyer',
    timestamp: reviewStatus === 'active' ? new Date().toISOString() : undefined,
    description: reviewStatus === 'blocked' ? blockedState.blockReason : 'Lawyer reviewing case',
    iconName: reviewStatus === 'blocked' ? 'AlertCircle' : 'Eye',
    visible: true,
  });

  // Stage 4: Opinion Ready
  const isOpinionReady = ['opinion_ready', 'delivered', 'completed'].includes(lifecycleState);
  stages.push({
    id: 'opinion_ready',
    label: 'Opinion Ready',
    status:
      lifecycleState === 'opinion_ready' ? 'active' : isOpinionReady ? 'completed' : 'pending',
    actor: 'lawyer',
    timestamp: request.opinion_submitted_at,
    description: 'Legal opinion prepared',
    iconName: 'FileText',
    visible: isOpinionReady || userRole === 'lawyer',
  });

  // Stage 5: Completed
  stages.push({
    id: 'completed',
    label: 'Completed',
    status: lifecycleState === 'completed' ? 'completed' : 'pending',
    actor: 'client',
    timestamp: request.completed_at,
    description:
      lifecycleState === 'completed' ? 'Case successfully completed' : 'Awaiting completion',
    iconName: 'CheckCircle',
    visible: true,
  });

  return stages;
}

/**
 * Calculate stage duration metrics from audit logs
 */
function calculateStageMetrics(auditEvents: any[]): StageMetrics | undefined {
  if (!auditEvents || auditEvents.length === 0) return undefined;

  const sortedEvents = [...auditEvents].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const stageDurations: Record<string, number> = {};
  let currentStage = 'requested';
  let stageStartTime = new Date(sortedEvents[0].created_at).getTime();

  for (const event of sortedEvents) {
    if (event.action === 'status_changed' && event.details?.new_status) {
      const duration = (new Date(event.created_at).getTime() - stageStartTime) / 1000;
      stageDurations[currentStage] = (stageDurations[currentStage] || 0) + duration;
      currentStage = event.details.new_status;
      stageStartTime = new Date(event.created_at).getTime();
    }
  }

  // Add current stage duration
  const currentDuration = (Date.now() - stageStartTime) / 1000;
  stageDurations[currentStage] = (stageDurations[currentStage] || 0) + currentDuration;

  const totalDuration = Object.values(stageDurations).reduce((sum, duration) => sum + duration, 0);

  return {
    stageDurations,
    totalDuration,
    predictedETA: undefined, // Future ML-based prediction
  };
}

// ============================================================================
// MAIN RESOLVER FUNCTION
// ============================================================================

/**
 * Resolve complete workflow state for a case
 *
 * @param requestId - The case/request ID
 * @param userRole - Current user's role (client or lawyer)
 * @param options - Optional configuration
 * @returns Complete workflow summary with all visualization data
 */
export async function resolveCaseWorkflow(
  requestId: string,
  userRole: 'client' | 'lawyer',
  options?: {
    includeMetrics?: boolean;
  }
): Promise<WorkflowSummary> {


  // Fetch request with all related data
  const { data: request, error } = await (await __getSupabaseClient()).from('legal_requests')
    .select(
      `
      *,
      lawyer:assigned_lawyer_id(id, full_name, email, avatar_url),
      department_info:departments(name, sla_hours),
      documents(*),
      audit_events:audit_logs(action, created_at, details)
    `
    )
    .eq('id', requestId)
    .single();

  if (error || !request) {
    throw new Error(`Failed to fetch request: ${error?.message}`);
  }

  // Fetch clarifications
  const { data: clarifications = [] } = await (await __getSupabaseClient()).from('clarifications')
    .select('*')
    .eq('request_id', requestId);

  // Fetch document requests
  const { data: documentRequests = [] } = await (await __getSupabaseClient()).from('document_requests')
    .select('*')
    .eq('request_id', requestId);

  // Compute lifecycle state using existing resolver
  // We need to cast request to ExtendedRequest. Ideally fetch relations to match ExtendedRequest structure if needed.
  // ExtendedRequest expects specific opinion structure which might be missing here if not fetched.
  // IMPORTANT: The query above does NOT fetch legal_opinions!
  // We must fetch legal_opinions to accurately resolve lifecycle (e.g. opinion_status).

  // Fetch opinions separately or update query above. Let's fetch separately to be safe/easy.
  const { data: opinions } = await (await __getSupabaseClient()).from('legal_opinions')
    .select('*, opinion_versions(*)')
    .eq('request_id', requestId);

  const latestOpinion = opinions?.[0];
  // Sort versions
  const versions =
    latestOpinion?.opinion_versions?.sort(
      (a: any, b: any) => b.version_number - a.version_number
    ) || [];

  const extendedRequest: ExtendedRequest = {
    ...request,
    latest_opinion_version: versions[0],
    audit_events: request.audit_events,
  };

  const lifecycleState = resolveLifecycleStatus(extendedRequest);

  // Determine if this is a terminal state and find completion timestamp
  const isTerminal = ['completed', 'archived', 'cancelled'].includes(lifecycleState);

  // Use domain SLA calculator
  const slaMetrics = calculateLifecycleSLA(extendedRequest, lifecycleState);

  // Map domain SLA to Workflow SLA (they are slightly different types)
  const sla: SLAMetrics = {
    deadline: slaMetrics.dueDate || '', // simplified
    status: (slaMetrics.status === 'completed' ? 'delivered' : slaMetrics.status) as any,
    // Note: SLAMetrics in resolver has 'completed', here we expect 'delivered'. Mapping needed.
    // Actually 'completed' in resolver maps to 'delivered' here effectively.
    daysRemaining: 0, // Need to calc if not provided
    hoursRemaining: 0,
    color: slaMetrics.color,
    bgColor: slaMetrics.bgColor,
    borderColor: slaMetrics.borderColor,
    text: slaMetrics.text,
    deliveredAt: slaMetrics.deliveredAt,
  };

  // Detect blocked state (skip for terminal states)
  const blockedState = isTerminal
    ? { isBlocked: false }
    : detectBlockedState(lifecycleState, clarifications || [], documentRequests || []);

  // Use domain Next Step
  const actionAdvice = getLifecycleAction(extendedRequest, lifecycleState);
  const nextStep: NextStep = {
    actor: actionAdvice.type as any,
    title: actionAdvice.title,
    description: actionAdvice.description,
    actionLabel: actionAdvice.actionLabel,
    actionUrl: actionAdvice.actionUrl,
    priority: actionAdvice.priority,
    iconName: actionAdvice.iconName,
  };

  // Use domain Progress
  const progressMetrics = getLifecycleProgress(extendedRequest, lifecycleState);
  const horizontalStages = progressMetrics.steps.map(
    (step: { id: string; label: string; completed: boolean; current: boolean }) => ({
      id: step.id,
      label: step.label,
      completed: step.completed,
      active: step.current,
    })
  );

  const currentStageIndex = progressMetrics.currentStep - 1;

  // Build timeline stages (Keep local as it is rich and specific to timeline view)
  const timelineStages = buildTimelineStages(lifecycleState, request, blockedState, userRole);

  // Calculate case health
  const health: CaseHealth = {
    isBlocked: blockedState.isBlocked,
    blockReason: blockedState.blockReason,
    documentsCount: request.documents?.length || 0,
    clarificationsCount: clarifications?.length || 0,
    pendingDocumentsCount: documentRequests?.filter((dr: any) => dr.status === 'pending').length || 0,
    pendingClarificationsCount: clarifications?.filter((c: any) => !c.is_resolved).length || 0,
  };

  // Calculate metrics if requested
  const metrics =
    options?.includeMetrics && request.audit_events
      ? calculateStageMetrics(request.audit_events)
      : undefined;

  return {
    lifecycleState,
    currentStageIndex,
    isTerminal,
    completedAt: slaMetrics.deliveredAt || null,
    horizontalStages,
    timelineStages,
    sla,
    nextStep,
    health,
    metrics,
  };
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
