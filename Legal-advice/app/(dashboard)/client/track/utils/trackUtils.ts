import { formatDistanceToNow, addHours, isPast, isFuture } from 'date-fns';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  MessageCircle,
  Eye,
  Star,
  ArrowRight,
  Download,
  Activity,
} from 'lucide-react';
import type { LegalRequest } from '@/lib/types';

// --- Constants & Types ---

export type Request = Omit<LegalRequest, 'department'> & {
  lawyer?: { full_name: string; id: string; avatar_url?: string };
  department?: { name: string; sla_hours: number };
  documents?: any[];
  has_pending_clarifications?: boolean;
  has_unread_messages?: boolean;
  opinion_viewed?: boolean;
  rated?: boolean;
  // Client-side computed props
  urgencyLevel?: 'on-track' | 'at-risk' | 'overdue';
  urgencyText?: string;
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

export type StatusFilter =
  | 'all'
  | 'submitted'
  | 'assigned'
  | 'in_review'
  | 'clarification_requested'
  | 'opinion_ready'
  | 'completed'
  | 'action_needed'
  | 'in_progress';
export type ViewMode = 'grid' | 'table';
export type SortOption = 'newest' | 'oldest' | 'urgency' | 'sla_risk' | 'priority' | 'last_updated';
export type VisibilityFilter = 'all' | 'private' | 'public';

// --- Color & Status Mapping ---

export const STATUS_CONFIG: Record<string, { label: string; color: string; urgency: string }> = {
  // Canonical States
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-500', urgency: 'low' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', urgency: 'low' },
  marketplace_posted: { label: 'Posted', color: 'bg-emerald-100 text-emerald-700', urgency: 'low' },
  claimed: { label: 'Claimed', color: 'bg-indigo-100 text-indigo-700', urgency: 'medium' },
  assigned: { label: 'Assigned', color: 'bg-indigo-100 text-indigo-700', urgency: 'medium' },
  clarification_pending: {
    label: 'Clarification Needed',
    color: 'bg-amber-100 text-amber-700',
    urgency: 'high',
  },
  in_review: { label: 'In Review', color: 'bg-purple-100 text-purple-700', urgency: 'medium' },
  opinion_ready: { label: 'Opinion Ready', color: 'bg-green-100 text-green-700', urgency: 'high' },
  delivered: { label: 'Delivered', color: 'bg-green-50 text-green-700', urgency: 'low' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-700', urgency: 'low' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-500', urgency: 'low' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', urgency: 'low' },

  // Legacy / Fallback Maps
  requested: { label: 'Requested', color: 'bg-blue-100 text-blue-700', urgency: 'low' },
  under_review: {
    label: 'Under Review',
    color: 'bg-purple-100 text-purple-700',
    urgency: 'medium',
  },
  clarification_requested: {
    label: 'Clarification Needed',
    color: 'bg-amber-100 text-amber-700',
    urgency: 'high',
  },
};

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

// --- Lifecycle Resolution Engine ---

export type LifecycleStatus =
  // Private Flow
  | 'requested'
  | 'assigned'
  | 'under_review'
  | 'drafting'
  | 'submitted' // Opinion Submitted/Ready
  | 'client_review' // Delivered
  | 'completed'
  | 'closed'
  // Public Flow Additions
  | 'posted'
  | 'open'
  | 'claimed';

const PRIVATE_STEPS: LifecycleStatus[] = [
  'requested',
  'assigned',
  'under_review',
  'submitted',
  'completed',
];

const PUBLIC_STEPS: LifecycleStatus[] = [
  'posted',
  'open',
  'claimed',
  'under_review',
  'submitted',
  'completed',
];

// Terminal statuses that cannot regress
const TERMINAL_STATUSES: LifecycleStatus[] = ['completed', 'closed'];

/**
 * Priority-based lifecycle resolver
 * Determines authoritative lifecycle state from multiple sources
 *
 * Priority Order:
 * 1. Audit log events (highest authority)
 * 2. Opinion status
 * 3. Request status (fallback)
 */
export const resolveLifecycleStatus = (caseData: ExtendedRequest): LifecycleStatus => {
  // PRIORITY 1: Check audit events for completion/closure (highest authority)
  if (caseData.audit_events && caseData.audit_events.length > 0) {
    // Sort by most recent first
    const sortedEvents = [...caseData.audit_events].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Check for terminal status events
    for (const event of sortedEvents) {
      if (event.action === 'case_closed' || event.action === 'completed') {
        return 'completed';
      }

      // Check status_changed events
      if (event.action === 'status_changed' && event.details) {
        const newStatus = event.details.new_status || event.details.status;
        if (
          newStatus === 'completed' ||
          newStatus === 'case_closed' ||
          newStatus === 'client_acknowledged'
        ) {
          return 'completed';
        }
      }
    }
  }

  // PRIORITY 2: Check opinion status
  if (caseData.latest_opinion_version) {
    const { is_draft, submitted_at } = caseData.latest_opinion_version;

    // If opinion is submitted (not draft) and has timestamp, it's ready
    if (!is_draft && submitted_at) {
      return 'submitted';
    }

    // If there's a draft, we're in drafting phase
    if (is_draft) {
      return 'under_review'; // Or 'drafting' depending on preference
    }
  }

  // PRIORITY 3: Fallback to request status mapping
  return getCanonicalStatus(caseData);
};

/**
 * Prevents lifecycle regression for terminal states
 * Once completed/closed, status cannot downgrade
 */
export const preventRegression = (
  currentLifecycle: LifecycleStatus,
  newLifecycle: LifecycleStatus
): LifecycleStatus => {
  if (TERMINAL_STATUSES.includes(currentLifecycle)) {
    return currentLifecycle; // Immutable - cannot regress
  }
  return newLifecycle;
};

export const getCanonicalStatus = (req: Request): LifecycleStatus => {
  const isPublic = (req.visibility || 'private') === 'public';

  if (isPublic) {
    // Map public status logic here
    // If assigned, it merges into private flow somewhat
    if (req.status === 'completed') return 'completed';
    if (req.status === 'opinion_ready') return 'submitted'; // Opinion ready = Submitted to client
    if (req.status === 'submitted' && req.public_status === 'PUBLIC_OPEN') return 'open';
    if (req.status === 'submitted') return 'posted'; // Default for just created
    if (req.status === 'assigned') return 'claimed';
    // Fallback to private mapping for reviewing states
  }

  switch (req.status) {
    case 'submitted':
      return 'requested';
    case 'assigned':
      return 'assigned';
    case 'in_review':
      return 'under_review';
    case 'clarification_requested':
      return 'under_review'; // Still under review, just paused
    case 'opinion_ready':
      return 'submitted'; // Opinion is ready/submitted
    case 'delivered':
      return 'client_review';
    case 'completed':
      return 'completed';
    default:
      return 'requested';
  }
};

export const getCaseProgress = (req: Request | ExtendedRequest) => {
  const isPublic = (req.visibility || 'private') === 'public';

  // Use resolved lifecycle if available (ExtendedRequest), otherwise fallback to canonical mapping
  const status =
    'audit_events' in req || 'latest_opinion_version' in req
      ? resolveLifecycleStatus(req as ExtendedRequest)
      : getCanonicalStatus(req);

  const steps = isPublic ? PUBLIC_STEPS : PRIVATE_STEPS;

  // Normalize status for steps array finding
  // Some statuses might map to the same step visually or logically
  let currentStepIndex = steps.indexOf(status);

  // Handle 'drafting' mapping to 'under_review' if not explicitly in steps
  if (currentStepIndex === -1) {
    if (status === 'drafting') currentStepIndex = steps.indexOf('under_review');
    if (status === 'client_review') currentStepIndex = steps.indexOf('submitted'); // Reviewing the submitted opinion
    if (status === 'closed') currentStepIndex = steps.indexOf('completed');
  }

  if (currentStepIndex === -1) currentStepIndex = 0; // Default start

  return {
    currentStep: currentStepIndex + 1,
    totalSteps: steps.length,
    progress: Math.round(((currentStepIndex + 1) / steps.length) * 100),
    label: getLifecycleLabel(status),
    steps: steps.map((s) => ({
      id: s,
      label: getLifecycleLabel(s),
      completed: steps.indexOf(s) <= currentStepIndex,
    })),
  };
};

const getLifecycleLabel = (status: LifecycleStatus): string => {
  switch (status) {
    case 'requested':
      return 'Requested';
    case 'posted':
      return 'Posted';
    case 'open':
      return 'Open for Lawyers';
    case 'claimed':
      return 'Claimed';
    case 'assigned':
      return 'Assigned';
    case 'under_review':
      return 'Under Review';
    case 'drafting':
      return 'Drafting';
    case 'submitted':
      return 'Opinion Ready';
    case 'client_review':
      return 'In Review';
    case 'completed':
      return 'Completed';
    case 'closed':
      return 'Closed';
    default:
      return 'Unknown';
  }
};

// --- SLA Logic ---

export const calculateSLA = (req: Request) => {
  if (!req.sla_deadline) return null;
  // Fix: Stop SLA if completed or opinion ready
  if (['completed', 'opinion_ready', 'delivered'].includes(req.status))
    return { status: 'completed', text: 'Delivered', color: 'text-slate-500' };

  const deadline = new Date(req.sla_deadline);
  const now = new Date();
  const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft < 0) {
    return {
      status: 'overdue',
      text: `Overdue by ${formatDistanceToNow(deadline)}`,
      color: 'text-red-600 bg-red-50 border-red-200',
    };
  } else if (hoursLeft < 24) {
    return {
      status: 'at-risk',
      text: `Due in ${Math.ceil(hoursLeft)}h`,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    };
  } else {
    return {
      status: 'on-track',
      text: `Due in ${Math.ceil(hoursLeft / 24)}d`,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
  }
};

// --- Action Logic ---

export const getNextAction = (req: Request) => {
  const status = getCanonicalStatus(req);

  // 1. Client Action Required
  if (req.status === 'clarification_requested')
    return { label: 'Respond to Clarification', type: 'client', urgent: true };
  if (status === 'submitted' || req.status === 'opinion_ready')
    return { label: 'Review Opinion', type: 'client', urgent: true };
  if (status === 'completed' && !req.rated)
    return { label: 'Rate Service', type: 'client', urgent: false };

  // 2. Lawyer Action Required
  if (status === 'requested' || status === 'posted')
    return { label: 'Waiting for Assignment', type: 'system', urgent: false };
  if (status === 'open') return { label: 'Waiting for Claims', type: 'system', urgent: false };
  if (status === 'assigned') return { label: 'Lawyer Reviewing', type: 'lawyer', urgent: false };
  if (status === 'under_review')
    return { label: 'Drafting Opinion', type: 'lawyer', urgent: false };

  return { label: 'No Action Needed', type: 'none', urgent: false };
};
