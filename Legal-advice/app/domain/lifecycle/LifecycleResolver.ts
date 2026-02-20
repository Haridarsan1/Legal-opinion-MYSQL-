import { formatDistanceToNow, addHours, differenceInHours, isPast } from 'date-fns';
import type { LegalRequest } from '@/lib/types';

// ============================================================================
// 1. TYPE DEFINITIONS
// ============================================================================

// Base Request compatible with DB
export type Request = Omit<LegalRequest, 'department'> & {
  lawyer?: { full_name: string; id: string; avatar_url?: string; specialization?: string };
  department?: { name: string; sla_hours: number };
  department_info?: { name: string; sla_hours: number }; // Alias for some queries
  documents?: any[];
  has_pending_clarifications?: boolean;
  has_unread_messages?: boolean;
  opinion_viewed?: boolean;
  rated?: boolean;
};

// Extended Request with audit events and opinion data for lifecycle resolution
export type ExtendedRequest = Request & {
  audit_events?: Array<{
    action: string;
    created_at: string;
    details?: any;
  }>;
  opinion_status?: string;
  latest_opinion_version?: {
    is_draft: boolean;
    submitted_at?: string;
  };
};

// Canonical Lifecycle States
export type LifecycleStatus =
  | 'draft' // Client drafting
  | 'submitted' // Initial submission
  | 'marketplace_posted' // Public request posted
  | 'claimed' // Lawyer claimed public request
  | 'assigned' // Lawyer assigned (Private)
  | 'clarification_pending' // Lawyer needs info
  | 'in_review' // Lawyer reviewing/drafting
  | 'opinion_ready' // Opinion submitted by lawyer
  | 'delivered' // Client viewed opinion
  | 'completed' // Terminal Success
  | 'archived' // Terminal Archived
  | 'cancelled'; // Terminal Cancelled

export type DashboardBucket = 'ACTIVE' | 'ACTION_NEEDED' | 'SLA_RISK' | 'COMPLETED';

export const TERMINAL_STATUSES: LifecycleStatus[] = ['completed', 'archived', 'cancelled'];

// ============================================================================
// 2. CORE RESOLVER LOGIC (The State Machine)
// ============================================================================

export const resolveLifecycleStatus = (caseData: ExtendedRequest): LifecycleStatus => {
  // 🛑 PRIORITY 1: TERMINAL OVERRIDES (Highest Authority)
  // Audit logs are the single source of truth for completion
  if (caseData.audit_events && caseData.audit_events.length > 0) {
    const sortedEvents = [...caseData.audit_events].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    for (const event of sortedEvents) {
      // Check for explicit terminal actions
      if (['case_closed', 'completed'].includes(event.action)) return 'completed';
      if (event.action === 'archived') return 'archived';
      if (event.action === 'cancelled') return 'cancelled';

      // Check status_changed events for terminal values
      if (event.action === 'status_changed' && event.details) {
        const newStatus = event.details.new_status || event.details.status;
        if (['completed', 'case_closed', 'client_acknowledged'].includes(newStatus))
          return 'completed';
      }
    }
  }

  // Check raw DB status for terminal legacy support
  const rawStatus = caseData.status as string;
  if (
    ['completed', 'case_closed', 'client_acknowledged', 'no_further_queries_confirmed'].includes(
      rawStatus
    )
  )
    return 'completed';
  if (rawStatus === 'archived') return 'archived';
  if (rawStatus === 'cancelled') return 'cancelled';

  // 🛑 PRIORITY 2: OPINION STATE (Overrides In-Progress)
  // If opinion is ready/submitted, we are in 'opinion_ready' or 'delivered'
  const opinion = caseData.latest_opinion_version;
  const hasSubmittedOpinion = opinion && !opinion.is_draft && opinion.submitted_at;

  if (hasSubmittedOpinion) {
    // If client viewed it or status is delivered --> delivered
    if (rawStatus === 'delivered' || rawStatus === 'client_review' || caseData.opinion_viewed) {
      return 'delivered';
    }
    return 'opinion_ready';
  }

  // 🛑 PRIORITY 3: ACTIONABLE STATES
  // Clarification Pending
  if (rawStatus === 'clarification_requested' || caseData.has_pending_clarifications) {
    return 'clarification_pending';
  }

  // In Review / Drafting
  if (rawStatus === 'in_review' || (opinion && opinion.is_draft)) {
    return 'in_review';
  }

  // 🛑 PRIORITY 4: INITIAL STATES (Public vs Private)
  const isPublic = (caseData.visibility || 'private') === 'public';

  if (isPublic) {
    if (rawStatus === 'submitted' && (caseData as any).public_status === 'PUBLIC_OPEN')
      return 'marketplace_posted';
    if (rawStatus === 'assigned' || rawStatus === 'claimed') return 'claimed';
  } else {
    if (rawStatus === 'assigned') return 'assigned';
  }

  // Fallback default
  switch (rawStatus) {
    case 'submitted':
      return isPublic ? 'marketplace_posted' : 'submitted';
    case 'assigned':
      return 'assigned';
    default:
      return 'submitted';
  }
};

// ============================================================================
// 3. SLA ENGINE
// ============================================================================

export interface SLAMetrics {
  status: 'completed' | 'none' | 'overdue' | 'at-risk' | 'on-track';
  text: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dueDate: string | null;
  isOverdue: boolean;
  isAtRisk: boolean;
  deliveredAt?: string;
}

export const calculateLifecycleSLA = (
  req: ExtendedRequest,
  lifecycle: LifecycleStatus
): SLAMetrics => {
  // 🛑 STOP CONDITION: Terminal or Delivered
  // SLA clock stops here.
  if (TERMINAL_STATUSES.includes(lifecycle) || lifecycle === 'delivered') {
    // Try to find actual completion date from audit log or request
    let completedAt = req.completed_at || (req as any).opinion_submitted_at;

    return {
      status: 'completed',
      text: 'Delivered',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      dueDate: req.sla_deadline || null,
      isOverdue: false,
      isAtRisk: false,
      deliveredAt: completedAt,
    };
  }

  if (!req.sla_deadline) {
    return {
      status: 'none',
      text: 'No Deadline',
      color: 'text-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      dueDate: null,
      isOverdue: false,
      isAtRisk: false,
    };
  }

  try {
    const deadline = new Date(req.sla_deadline);
    if (isNaN(deadline.getTime())) throw new Error('Invalid Date');

    const now = new Date();
    const hoursLeft = differenceInHours(deadline, now);

    // 🚨 OVERDUE
    if (hoursLeft < 0) {
      let timeText = 'Overdue';
      try {
        timeText = `Overdue by ${formatDistanceToNow(deadline)}`;
      } catch (e) {}

      return {
        status: 'overdue',
        text: timeText,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        dueDate: req.sla_deadline,
        isOverdue: true,
        isAtRisk: false,
      };
      // ⚠️ AT RISK (< 24h)
    } else if (hoursLeft < 24) {
      return {
        status: 'at-risk',
        text: `Due in ${Math.ceil(hoursLeft)}h`,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        dueDate: req.sla_deadline,
        isOverdue: false,
        isAtRisk: true,
      };
      // ✅ ON TRACK
    } else {
      return {
        status: 'on-track',
        text: `Due in ${Math.ceil(hoursLeft / 24)}d`,
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        dueDate: req.sla_deadline,
        isOverdue: false,
        isAtRisk: false,
      };
    }
  } catch (error) {
    return {
      status: 'none',
      text: 'Invalid Date',
      color: 'text-slate-400',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      dueDate: null,
      isOverdue: false,
      isAtRisk: false,
    };
  }
};

// ============================================================================
// 4. URGENCY & BUCKET ENGINE (Phase 5)
// ============================================================================

export const getCaseBucket = (
  req: ExtendedRequest,
  lifecycle: LifecycleStatus,
  slaStatus: string
): DashboardBucket => {
  if (TERMINAL_STATUSES.includes(lifecycle)) return 'COMPLETED';
  if (lifecycle === 'clarification_pending') return 'ACTION_NEEDED';
  if (lifecycle === 'opinion_ready') return 'ACTION_NEEDED';
  if (slaStatus === 'overdue' || slaStatus === 'at-risk') return 'SLA_RISK';
  return 'ACTIVE';
};

export const getUrgencyScore = (
  req: ExtendedRequest,
  lifecycle: LifecycleStatus,
  slaStatus: string
): number => {
  if (TERMINAL_STATUSES.includes(lifecycle)) return 0;

  let score = 0;

  // Base Priority
  const p = req.priority?.toLowerCase();
  if (p === 'urgent') score += 100;
  if (p === 'high') score += 75;
  if (p === 'medium') score += 50;
  if (p === 'low') score += 25;

  // SLA Modifiers
  if (slaStatus === 'overdue') score += 200;
  if (slaStatus === 'at-risk') score += 150;

  // Lifecycle Modifiers
  if (lifecycle === 'clarification_pending') score += 100;
  if (lifecycle === 'opinion_ready') score += 50;

  return score;
};

// ============================================================================
// 5. NEXT ACTION ENGINE
// ============================================================================

export interface ActionAdvice {
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  type: 'client' | 'lawyer' | 'system' | 'none';
  priority: 'high' | 'medium' | 'low';
  iconName?: string;
}

export const getLifecycleAction = (
  req: ExtendedRequest,
  lifecycle: LifecycleStatus
): ActionAdvice => {
  // 1. Terminal State
  if (lifecycle === 'completed' || lifecycle === 'archived') {
    return {
      title: 'Case Completed',
      description: 'This case has been completed and closed.',
      type: 'none',
      priority: 'low',
      iconName: 'CheckCircle',
    };
  }
  if (lifecycle === 'cancelled') {
    return {
      title: 'Case Cancelled',
      description: 'This case was cancelled.',
      type: 'none',
      priority: 'low',
      iconName: 'Activity',
    };
  }

  // 2. Client Action Required
  if (lifecycle === 'clarification_pending') {
    return {
      title: 'Clarification Needed',
      description: 'Your lawyer needs additional information.',
      actionLabel: 'Respond',
      actionUrl: '?tab=clarifications',
      type: 'client',
      priority: 'high',
      iconName: 'MessageCircle',
    };
  }
  if (lifecycle === 'opinion_ready') {
    return {
      title: 'Opinion Ready',
      description: 'Your legal opinion is ready for review.',
      actionLabel: 'View Opinion',
      actionUrl: '?tab=opinion',
      type: 'client',
      priority: 'high',
      iconName: 'Eye',
    };
  }

  // 3. Lawyer Action Required (System status for client view)
  if (lifecycle === 'submitted')
    return {
      title: 'Waiting for Assignment',
      description: 'We are finding the best lawyer for your case.',
      type: 'system',
      priority: 'low',
      iconName: 'Clock',
    };

  if (lifecycle === 'marketplace_posted')
    return {
      title: 'Posted to Marketplace',
      description: 'Lawyers are reviewing your request.',
      type: 'system',
      priority: 'low',
      iconName: 'Clock',
    };

  if (lifecycle === 'assigned' || lifecycle === 'claimed')
    return {
      title: 'Lawyer Reviewing',
      description: 'Your lawyer is reviewing the case details.',
      type: 'system',
      priority: 'medium',
      iconName: 'Clock',
    };

  if (lifecycle === 'in_review')
    return {
      title: 'Drafting Opinion',
      description: 'Your lawyer is preparing the legal opinion.',
      type: 'system',
      priority: 'medium',
      iconName: 'FileText',
    };
  if (lifecycle === 'delivered')
    return {
      title: 'Opinion Delivered',
      description: 'You have received the opinion.',
      type: 'system',
      priority: 'low',
      iconName: 'Check',
    };

  return {
    title: 'No Action Needed',
    description: 'Current status does not require action.',
    type: 'none',
    priority: 'low',
    iconName: 'CheckCircle',
  };
};

// ============================================================================
// 6. PROGRESS ENGINE
// ============================================================================

export interface ProgressMetrics {
  currentStep: number;
  totalSteps: number;
  progress: number;
  label: string;
  steps: Array<{
    id: string;
    label: string;
    completed: boolean;
    current: boolean;
  }>;
}

export const getLifecycleProgress = (
  req: ExtendedRequest,
  lifecycle: LifecycleStatus
): ProgressMetrics => {
  const isPublic = (req.visibility || 'private') === 'public';

  const PUBLIC_FLOW = [
    { id: 'marketplace_posted', label: 'Posted' },
    { id: 'claimed', label: 'Claimed' },
    { id: 'in_review', label: 'In Drafting' },
    { id: 'opinion_ready', label: 'Opinion Ready' }, // Covers 'delivered' too
    { id: 'completed', label: 'Completed' },
  ];

  const PRIVATE_FLOW = [
    { id: 'submitted', label: 'Requested' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_review', label: 'In Drafting' },
    { id: 'opinion_ready', label: 'Opinion Ready' }, // Covers 'delivered' too
    { id: 'completed', label: 'Completed' },
  ];

  const steps = isPublic ? PUBLIC_FLOW : PRIVATE_FLOW;
  const stepIds = steps.map((s) => s.id);

  // Normalize lifecycle for valid steps
  // Map current lifecycle to one of the step IDs
  let activeStepId = lifecycle;

  // Mappings
  if (lifecycle === 'draft') activeStepId = 'submitted';
  if (lifecycle === 'clarification_pending') activeStepId = 'in_review';
  if (lifecycle === 'delivered') activeStepId = 'opinion_ready';
  if (lifecycle === 'archived' || lifecycle === 'cancelled') activeStepId = 'completed';

  if (isPublic && lifecycle === 'submitted') activeStepId = 'marketplace_posted';

  let currentStepIndex = stepIds.indexOf(activeStepId);
  // Fallback logic
  if (currentStepIndex === -1) {
    currentStepIndex = 0;
    if (TERMINAL_STATUSES.includes(lifecycle)) currentStepIndex = stepIds.length - 1;
  }

  const isTerminal = TERMINAL_STATUSES.includes(lifecycle);

  return {
    currentStep: currentStepIndex + 1,
    totalSteps: steps.length,
    progress: isTerminal ? 100 : Math.round(((currentStepIndex + 1) / steps.length) * 100),
    label: getLifecycleLabel(lifecycle),
    steps: steps.map((s, idx) => ({
      id: s.id,
      label: s.label,
      completed: isTerminal ? true : idx <= currentStepIndex,
      current: !isTerminal && idx === currentStepIndex,
    })),
  };
};

export const getLifecycleLabel = (status: LifecycleStatus): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'submitted':
      return 'Submitted';
    case 'marketplace_posted':
      return 'Posted';
    case 'claimed':
      return 'Claimed';
    case 'assigned':
      return 'Assigned';
    case 'clarification_pending':
      return 'Clarification Needed';
    case 'in_review':
      return 'In Review';
    case 'opinion_ready':
      return 'Opinion Ready';
    case 'delivered':
      return 'Delivered';
    case 'completed':
      return 'Completed';
    case 'archived':
      return 'Archived';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

// ============================================================================
// 7. AGGREGATOR SERVICE
// ============================================================================


// ============================================================================
// NEW: STRICT WORKFLOW RESOLVER
// ============================================================================

export interface CaseWorkflowState {
  stage:
    | 'Case Created'
    | 'Lawyer Accepted'
    | 'Payment Pending'
    | 'Investigation'
    | 'Drafting'
    | 'Review'
    | 'Opinion Ready'
    | 'Completed'
    | 'Cancelled'
    | 'Rejected'
    | 'Archived'
    | 'Awaiting Proposals'
    | 'Awarded'
    | 'Expired';
  progress: number;
  health: 'active' | 'awaiting_lawyer' | 'payment_pending' | 'at_risk' | 'closed' | 'completed' | 'awaiting_proposals';
  next_action: ActionAdvice;
  sla_status: SLAMetrics;
  timeline: any[]; // Placeholder for timeline data
}

export const resolveCaseWorkflow = (req: ExtendedRequest): CaseWorkflowState => {
  const status = req.status as string;
  const isPublic = (req.visibility || 'private') === 'public';
  const isTerminal = ['completed', 'cancelled', 'rejected', 'archived', 'expired', 'awarded'].includes(status);

  // 1. Calculate SLA first as it affects health
  // Map internal status to LifecycleStatus for compatibility with existing SLA calculator
  let compatibleStatus: LifecycleStatus = 'submitted';
  if (status === 'opinion_ready') compatibleStatus = 'opinion_ready';
  if (status === 'completed') compatibleStatus = 'completed';
  if (status === 'cancelled') compatibleStatus = 'cancelled';
  // ... map others as needed for SLA calculation logic
  
  const sla = calculateLifecycleSLA(req, compatibleStatus);

  // 2. Determine Stage & Progress
  let stage: CaseWorkflowState['stage'] = 'Case Created';
  let progress = 0;
  let health: CaseWorkflowState['health'] = 'active';

  // --- PRIVATE FLOW ---
  if (!isPublic) {
    if (status === 'pending_lawyer_response' || status === 'submitted') {
      stage = 'Case Created';
      progress = 0;
      health = 'awaiting_lawyer';
    } else if (status === 'accepted' || status === 'assigned') {
      stage = 'Lawyer Accepted';
      progress = 20;
      health = 'active';
    } else if (status === 'awaiting_payment') {
      stage = 'Payment Pending';
      progress = 30;
      health = 'payment_pending';
    } else if (status === 'in_progress' || status === 'investigation') { // 'investigation' if we add it
      stage = 'Investigation';
      progress = 50;
      health = 'active';
    } else if (status === 'drafting' || status === 'in_review') {
      stage = 'Drafting';
      progress = 60;
      health = 'active';
    } else if (status === 'review') {
      stage = 'Review';
      progress = 75;
      health = 'active';
    } else if (status === 'opinion_ready') {
      stage = 'Opinion Ready';
      progress = 90;
      health = 'active'; // or awaiting_client_action? kept active for simplicity
    } else if (status === 'completed' || status === 'delivered') {
      stage = 'Completed';
      progress = 100;
      health = 'completed';
    } else if (status === 'cancelled') {
      stage = 'Cancelled';
      progress = 100;
      health = 'closed';
    } else if (status === 'rejected') {
      stage = 'Rejected';
      progress = 100;
      health = 'closed';
    }
  } 
  // --- PUBLIC FLOW ---
  else {
    if (status === 'open' || status === 'submitted' || status === 'accepting_proposals') {
      stage = 'Awaiting Proposals';
      progress = 0;
      health = 'awaiting_proposals';
    } else if (status === 'awarded') {
      stage = 'Awarded';
      progress = 100; // The public request itself is done
      health = 'completed';
    } else if (status === 'expired') {
      stage = 'Expired';
      progress = 100;
      health = 'closed';
    }
  }

  // 3. SLA Health Override
  if (health === 'active' && sla.isOverdue) health = 'at_risk';
  if (health === 'active' && sla.isAtRisk) health = 'at_risk'; // or warning

  // 4. Next Action
  const lifecycleForAction = mapStatusToLifecycle(status, isPublic);
  const nextAction = getLifecycleAction(req, lifecycleForAction);

  return {
    stage,
    progress,
    health,
    next_action: nextAction,
    sla_status: sla,
    timeline: [] 
  };
};

function mapStatusToLifecycle(status: string, isPublic: boolean): LifecycleStatus {
   if (status === 'opinion_ready') return 'opinion_ready';
   if (status === 'completed') return 'completed';
   if (status === 'cancelled') return 'cancelled';
   if (status === 'drafting') return 'in_review';
   if (status === 'pending_lawyer_response') return 'submitted';
   if (status === 'open') return 'marketplace_posted';
   // Default fallback
   return 'submitted';
}

// ----------------------------------------------------------------------------
// AGGREGATOR UPDATE
// ----------------------------------------------------------------------------

export interface LifecycleSummary {
  id: string;
  title: string;
  request_number: string;
  created_at: string;
  updated_at: string;
  visibility: 'public' | 'private';
  lawyer?: { full_name: string; id: string; avatar_url?: string };
  department?: { name: string; sla_hours: number };
  priority: string;
  status: string; 

  // New Workflow Props
  workflow: CaseWorkflowState;

  // Legacy Props (Keep for compatibility until frontend fully migrated)
  lifecycleState: LifecycleStatus;
  dashboardBucket: DashboardBucket;
  urgencyScore: number;
  public_status?: string;
  public_posted_at?: string;
  claim_count?: number;
  proposal_count?: number;
  
  // Rich Objects
  sla: SLAMetrics;
  nextStep: ActionAdvice;
  progress: ProgressMetrics;

  meta?: {
    lastUpdated: string;
    isTerminal: boolean;
  };
}

export const aggregateCaseData = (requests: any[], userId: string): LifecycleSummary[] => {
  return requests.map((req: any) => {
    // Prepare Extended Request
    const rawVersions =
      req.legal_opinions?.[0]?.opinion_versions || req.opinion_versions || [];

    const versions =
      rawVersions.sort((a: any, b: any) => b.version_number - a.version_number) || [];
    const latestVersion = versions[0];
    const latestOpinion = latestVersion
      ? { ...latestVersion, submitted_at: latestVersion.submitted_at || latestVersion.created_at }
      : undefined;

    const extendedRequest: ExtendedRequest = {
      ...req,
      has_pending_clarifications: req.clarifications?.some((c: any) => !c.is_resolved) || false,
      has_unread_messages:
        req.case_messages?.some((m: any) => !m.read_by?.includes(userId)) || false,
      latest_opinion_version: latestOpinion,
      visibility: req.visibility || 'private',
      rated: req.lawyer_reviews && req.lawyer_reviews.length > 0,
    };

    // Run Logic
    const workflow = resolveCaseWorkflow(extendedRequest);
    
    // Legacy mapping (to be deprecated)
    const lifecycleState = mapStatusToLifecycle(req.status, req.visibility === 'public'); 
    const bucket = getCaseBucket(extendedRequest, lifecycleState, workflow.sla_status.status);
    const urgencyScore = getUrgencyScore(extendedRequest, lifecycleState, workflow.sla_status.status);
    const progressLegacy = getLifecycleProgress(extendedRequest, lifecycleState);


    // Proposal count handling
    let proposal_count = 0;
    if (req.proposal_count) {
      if (Array.isArray(req.proposal_count)) {
        if (req.proposal_count.length > 0 && req.proposal_count[0].count !== undefined) {
          proposal_count = req.proposal_count[0].count;
        } else {
          proposal_count = req.proposal_count.length;
        }
      }
    } else if (req.proposals) {
      proposal_count = req.proposals.length;
    }

    return {
      id: req.id,
      title: req.title,
      request_number: req.request_number,
      created_at: req.created_at,
      updated_at: req.updated_at,
      visibility: extendedRequest.visibility,
      lawyer: req.lawyer,
      department: req.department,
      priority: req.priority,
      status: req.status,

      workflow,

      // Legacy
      public_status: req.public_status,
      public_posted_at: req.public_posted_at,
      claim_count: req.claim_count,
      proposal_count: proposal_count || 0,
      lifecycleState,
      dashboardBucket: bucket,
      urgencyScore,
      sla: workflow.sla_status,
      nextStep: workflow.next_action,
      progress: progressLegacy,

      meta: {
        lastUpdated: new Date().toISOString(),
        isTerminal: TERMINAL_STATUSES.includes(lifecycleState),
      },
    };
  });
};

