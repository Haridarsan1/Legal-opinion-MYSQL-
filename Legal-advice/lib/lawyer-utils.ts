/**
 * Utility functions for lawyer workspace features
 * SLA calculations, case health, risk management
 */

import { EnhancedLegalRequest, SLAHealth } from './types';

type DashboardProfile = {
  firm_role?: 'owner' | 'senior_lawyer' | 'junior_lawyer' | null;
};

export function resolveDashboardTitle(profile: DashboardProfile | null | undefined): string {
  if (profile?.firm_role === 'senior_lawyer') {
    return 'Senior Counsel Dashboard';
  }

  if (profile?.firm_role === 'junior_lawyer') {
    return 'Junior Counsel Dashboard';
  }

  return 'Lawyer Dashboard';
}

/**
 * Calculate SLA health status with countdown timer
 */
export function calculateSLAHealth(deadline: string | Date, submittedAt: string | Date): SLAHealth {
  const now = new Date();
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const submittedDate = typeof submittedAt === 'string' ? new Date(submittedAt) : submittedAt;

  // Check if deadline is valid
  if (!deadlineDate || isNaN(deadlineDate.getTime())) {
    return {
      status: 'unknown',
      color: 'gray',
      percentRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      isOverdue: false,
    };
  }

  // Calculate time metrics
  const totalTime = deadlineDate.getTime() - submittedDate.getTime();
  const remainingTime = deadlineDate.getTime() - now.getTime();
  const percentRemaining = totalTime > 0 ? (remainingTime / totalTime) * 100 : 0;

  const hoursRemaining = Math.max(0, Math.floor(remainingTime / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(
    0,
    Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
  );

  const isOverdue = remainingTime < 0;

  // Determine health status
  let status: SLAHealth['status'];
  let color: SLAHealth['color'];

  if (isOverdue) {
    status = 'critical';
    color = 'red';
  } else if (percentRemaining > 50) {
    status = 'healthy';
    color = 'green';
  } else if (percentRemaining > 10) {
    status = 'warning';
    color = 'amber';
  } else {
    status = 'critical';
    color = 'red';
  }

  return {
    status,
    color,
    percentRemaining: Math.max(0, percentRemaining),
    hoursRemaining,
    minutesRemaining,
    isOverdue,
  };
}

/**
 * Format SLA countdown for display
 */
export function formatSLACountdown(slaHealth: SLAHealth): string {
  if (slaHealth.status === 'unknown') {
    return 'No deadline set';
  }

  if (slaHealth.isOverdue) {
    return `Overdue by ${slaHealth.hoursRemaining}h ${slaHealth.minutesRemaining}m`;
  }

  return `${slaHealth.hoursRemaining}h ${slaHealth.minutesRemaining}m remaining`;
}

/**
 * Calculate overall case health
 */
export function calculateCaseHealthClient(
  request: EnhancedLegalRequest,
  documents: any[],
  clarifications: any[]
): 'healthy' | 'at_risk' | 'blocked' {
  // Check for blockers
  const hasUnresolvedClarifications = clarifications.some((c) => !c.is_resolved);
  const slaHealth = request.sla_deadline
    ? calculateSLAHealth(request.sla_deadline, request.submitted_at)
    : null;

  if (hasUnresolvedClarifications || slaHealth?.status === 'critical') {
    return 'blocked';
  }

  // Check for risks
  const totalDocs = documents.length;
  const reviewedDocs = documents.filter((d) => d.review_status === 'reviewed').length;
  const hasRiskFlags = request.risk_flags && request.risk_flags.length > 0;

  if (
    (totalDocs > 0 && reviewedDocs < totalDocs) ||
    slaHealth?.status === 'warning' ||
    hasRiskFlags
  ) {
    return 'at_risk';
  }

  return 'healthy';
}

/**
 * Get risk flag label and color
 */
export function getRiskFlagDisplay(flag: string): {
  label: string;
  color: string;
  icon: string;
} {
  const flags: Record<string, { label: string; color: string; icon: string }> = {
    pending_litigation: {
      label: 'Pending Litigation',
      color: 'red',
      icon: 'gavel',
    },
    missing_documents: {
      label: 'Missing Documents',
      color: 'orange',
      icon: 'file-warning',
    },
    high_value_transaction: {
      label: 'High-Value Transaction',
      color: 'purple',
      icon: 'indian-rupee',
    },
    time_sensitive: {
      label: 'Time-Sensitive',
      color: 'blue',
      icon: 'clock',
    },
  };

  return (
    flags[flag] || {
      label: flag.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      color: 'gray',
      icon: 'flag',
    }
  );
}

/**
 * Get case health display properties
 */
export function getCaseHealthDisplay(health: string): {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
} {
  switch (health) {
    case 'healthy':
      return {
        label: 'Healthy',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
      };
    case 'at_risk':
      return {
        label: 'At Risk',
        color: 'amber',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
      };
    case 'blocked':
      return {
        label: 'Blocked',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
      };
    default:
      return {
        label: 'Unknown',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
      };
  }
}

/**
 * Check if self-review checklist is complete
 */
export function isSelfReviewComplete(checklist: {
  all_documents_reviewed: boolean;
  clarifications_resolved: boolean;
  legal_research_completed: boolean;
  citations_verified: boolean;
  opinion_proofread: boolean;
}): boolean {
  return Object.values(checklist).every((value) => value === true);
}
