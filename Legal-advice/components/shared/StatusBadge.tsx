import type { RequestStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: RequestStatus;
  showPulse?: boolean;
}

export default function StatusBadge({ status, showPulse = true }: StatusBadgeProps) {
  const statusConfig: Record<
    RequestStatus,
    { bg: string; text: string; dot: string; label: string }
  > = {
    submitted: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dot: 'bg-slate-600',
      label: 'Submitted',
    },
    accepting_proposals: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      dot: 'bg-indigo-600',
      label: 'Accepting Proposals',
    },
    assigned: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-600',
      label: 'Assigned',
    },
    in_review: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-600',
      label: 'In Progress',
    },
    clarification_requested: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
      label: 'Clarification Needed',
    },
    opinion_ready: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      dot: 'bg-purple-600',
      label: 'Opinion Ready',
    },
    delivered: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-600',
      label: 'Delivered',
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-600',
      label: 'Completed',
    },
    // New Strict Workflow Statuses
    pending_lawyer_response: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      dot: 'bg-yellow-600',
      label: 'Pending Response',
    },
    accepted: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-600',
      label: 'Accepted',
    },
    awaiting_payment: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      dot: 'bg-orange-600',
      label: 'Awaiting Payment',
    },
    drafting: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      dot: 'bg-indigo-600',
      label: 'Drafting',
    },
    review: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      dot: 'bg-purple-600',
      label: 'Initial Review',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-600',
      label: 'Rejected',
    },
    awarded: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-600',
      label: 'Awarded',
    },
    expired: {
      bg: 'bg-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-500',
      label: 'Expired',
    },
    open: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-green-500',
      label: 'Open',
    },
  };

  // Get status config, fallback to default if status is undefined or not found
  const config = statusConfig[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-600',
    label: status
      ? String(status)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
      : 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
    >
      <span
        className={`size-1.5 rounded-full ${config.dot} ${showPulse && (status === 'in_review' || status === 'clarification_requested')
            ? 'animate-pulse'
            : ''
          }`}
      ></span>
      {config.label}
    </span>
  );
}
