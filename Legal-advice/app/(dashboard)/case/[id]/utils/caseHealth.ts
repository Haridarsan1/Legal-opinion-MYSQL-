// Case health computation utility

export type CaseHealthStatus = 'healthy' | 'at_risk' | 'blocked';

interface CaseHealthFactors {
  slaStatus: 'on_track' | 'at_risk' | 'delayed';
  pendingClarifications: number;
  unreviewedDocuments: number;
  daysSinceLastActivity: number;
  hasAssignedLawyer: boolean;
}

interface CaseHealthResult {
  status: CaseHealthStatus;
  label: string;
  color: string;
  bgColor: string;
  reasons: string[];
}

export function computeCaseHealth(factors: CaseHealthFactors): CaseHealthResult {
  const reasons: string[] = [];

  // Critical blockers
  if (factors.slaStatus === 'delayed') {
    reasons.push('SLA deadline passed');
    return {
      status: 'blocked',
      label: 'Blocked',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      reasons,
    };
  }

  if (factors.pendingClarifications > 3) {
    reasons.push(`${factors.pendingClarifications} pending clarifications`);
    return {
      status: 'blocked',
      label: 'Blocked',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      reasons,
    };
  }

  if (!factors.hasAssignedLawyer) {
    reasons.push('Awaiting lawyer assignment');
    return {
      status: 'blocked',
      label: 'Blocked',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      reasons,
    };
  }

  // Risk indicators
  if (factors.slaStatus === 'at_risk') {
    reasons.push('SLA deadline approaching');
  }

  if (factors.pendingClarifications > 0) {
    reasons.push(
      `${factors.pendingClarifications} pending ${factors.pendingClarifications === 1 ? 'clarification' : 'clarifications'}`
    );
  }

  if (factors.unreviewedDocuments > 2) {
    reasons.push(`${factors.unreviewedDocuments} documents need review`);
  }

  if (factors.daysSinceLastActivity > 3) {
    reasons.push(`No activity for ${factors.daysSinceLastActivity} days`);
  }

  if (reasons.length > 0) {
    return {
      status: 'at_risk',
      label: 'At Risk',
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      reasons,
    };
  }

  // Healthy state
  return {
    status: 'healthy',
    label: 'Healthy',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    reasons: ['On track', 'All actions completed'],
  };
}

export function getSLAStatus(deadline?: string): {
  status: 'on_track' | 'at_risk' | 'delayed';
  hoursRemaining: number;
  label: string;
  color: string;
} {
  if (!deadline) {
    return {
      status: 'on_track',
      hoursRemaining: Infinity,
      label: 'No deadline set',
      color: 'text-slate-500',
    };
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursRemaining < 0) {
    return {
      status: 'delayed',
      hoursRemaining,
      label: 'Overdue',
      color: 'text-red-600',
    };
  }

  if (hoursRemaining < 24) {
    return {
      status: 'at_risk',
      hoursRemaining,
      label: 'Due soon',
      color: 'text-amber-600',
    };
  }

  return {
    status: 'on_track',
    hoursRemaining,
    label: 'On track',
    color: 'text-green-600',
  };
}

export function formatTimeRemaining(hours: number): string {
  if (hours === Infinity) return 'No deadline';
  if (hours < 0) return `${Math.abs(Math.floor(hours))}h overdue`;
  if (hours < 1) return `${Math.floor(hours * 60)}m remaining`;
  if (hours < 24) return `${Math.floor(hours)}h remaining`;

  const days = Math.floor(hours / 24);
  return `${days}d remaining`;
}
