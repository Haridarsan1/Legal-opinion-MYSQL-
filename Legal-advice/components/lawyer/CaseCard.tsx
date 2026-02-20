import Link from 'next/link';
import { Calendar, AlertCircle } from 'lucide-react';

interface CaseCardProps {
  caseId: string;
  caseNumber: string;
  title: string;
  client: string;
  category: string;
  dueDate: string;
  status: 'new' | 'in_progress' | 'urgent' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  actionText: string;
  actionHref: string;
}

const statusConfig = {
  new: {
    badge: 'New',
    badgeClass: 'bg-blue-100 text-blue-700',
    borderColor: 'border-l-blue-500',
  },
  in_progress: {
    badge: 'In Progress',
    badgeClass: 'bg-orange-100 text-orange-700',
    borderColor: 'border-l-orange-500',
  },
  urgent: {
    badge: 'High Priority',
    badgeClass: 'bg-red-100 text-red-700',
    borderColor: 'border-l-red-500',
  },
  completed: {
    badge: 'Completed',
    badgeClass: 'bg-green-100 text-green-700',
    borderColor: 'border-l-green-500',
  },
};

export default function CaseCard({
  caseId,
  caseNumber,
  title,
  client,
  category,
  dueDate,
  status,
  actionText,
  actionHref,
}: CaseCardProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 border-l-4 ${config.borderColor} p-5 hover:shadow-md transition-shadow`}
    >
      {/*Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">{caseNumber}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badgeClass}`}>
            {config.badge}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">{title}</h3>

      {/* Client */}
      <p className="text-sm text-slate-600 mb-4">
        Client: <span className="font-medium">{client}</span>
      </p>

      {/* Category & Due Date */}
      <div className="flex items-center gap-4 mb-4 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">{category}</div>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Due {dueDate}</span>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={actionHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {actionText}
        <span>→</span>
      </Link>
    </div>
  );
}
