// Next action guidance utility

export type UserRole = 'client' | 'lawyer';

export interface NextAction {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface CaseContext {
  status: string;
  hasPendingClarifications: boolean;
  hasUnreviewedDocuments: boolean;
  opinionSubmitted: boolean;
  rated: boolean;
  hasAssignedLawyer: boolean;
}

export function getNextAction(role: UserRole, context: CaseContext): NextAction | null {
  if (role === 'client') {
    return getClientNextAction(context);
  }
  return getLawyerNextAction(context);
}

function getClientNextAction(context: CaseContext): NextAction | null {
  // Opinion ready - highest priority
  if (context.status === 'opinion_ready' && !context.rated) {
    return {
      title: 'Opinion Ready',
      description: 'Your legal opinion is ready for review',
      actionLabel: 'View Opinion',
      actionHref: '?tab=opinion',
      priority: 'high',
      icon: 'Eye',
    };
  }

  // Clarification needed
  if (context.hasPendingClarifications) {
    return {
      title: 'Clarification Needed',
      description: 'Your lawyer needs additional information',
      actionLabel: 'Respond Now',
      actionHref: '?tab=clarifications',
      priority: 'high',
      icon: 'MessageCircle',
    };
  }

  // Rate service
  if (context.status === 'completed' && !context.rated) {
    return {
      title: 'Rate Your Experience',
      description: 'Help us improve by rating the service',
      actionLabel: 'Rate Lawyer',
      actionHref: '/client/ratings',
      priority: 'medium',
      icon: 'Star',
    };
  }

  // Waiting for lawyer
  if (!context.hasAssignedLawyer) {
    return {
      title: 'Assignment in Progress',
      description: 'A lawyer will be assigned to your case soon',
      actionLabel: 'View Details',
      actionHref: '?tab=overview',
      priority: 'low',
      icon: 'Clock',
    };
  }

  // Case in review
  if (context.status === 'in_review') {
    return {
      title: 'Case Under Review',
      description: 'Your lawyer is reviewing your case',
      actionLabel: 'View Progress',
      actionHref: '?tab=overview',
      priority: 'low',
      icon: 'FileText',
    };
  }

  return null;
}

function getLawyerNextAction(context: CaseContext): NextAction | null {
  // Pending clarifications to resolve
  if (context.hasPendingClarifications) {
    return {
      title: 'Review Clarifications',
      description: 'Client has responded to your clarifications',
      actionLabel: 'Review Responses',
      actionHref: '?tab=clarifications',
      priority: 'high',
      icon: 'CheckCircle',
    };
  }

  // Documents to review
  if (context.hasUnreviewedDocuments) {
    return {
      title: 'Review Documents',
      description: `${context.hasUnreviewedDocuments} documents need your review`,
      actionLabel: 'Review Now',
      actionHref: '?tab=documents',
      priority: 'high',
      icon: 'FileText',
    };
  }

  // Ready to submit opinion
  if (context.status === 'in_review' && !context.opinionSubmitted) {
    return {
      title: 'Submit Opinion',
      description: 'Review complete, ready to draft opinion',
      actionLabel: 'Draft Opinion',
      actionHref: '?tab=opinion',
      priority: 'high',
      icon: 'Edit3',
    };
  }

  // New case assignment
  if (context.status === 'assigned') {
    return {
      title: 'Begin Review',
      description: 'Start reviewing case documents and details',
      actionLabel: 'Start Review',
      actionHref: '?tab=documents',
      priority: 'medium',
      icon: 'Play',
    };
  }

  // Client confirmed, ready to close
  if (context.status === 'no_further_queries_confirmed') {
    return {
      title: 'Close Case',
      description: 'Client is satisfied. You can now close the case.',
      actionLabel: 'Close Case',
      actionHref: '?tab=opinion',
      priority: 'high',
      icon: 'CheckCircle',
    };
  }

  return null;
}
