import { Clock, User, Globe, Lock, AlertCircle, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { RequestStatus, LegalDepartment } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface RequestCardProps {
  id: string;
  title: string;
  client: string;
  department: LegalDepartment;
  status: RequestStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo?: string;
  visibility?: 'private' | 'public';
  publicStatus?: string;
  publicPostedAt?: string;
  claimCount?: number;
  onClick?: () => void;
}

export default function RequestCard({
  id,
  title,
  client,
  department,
  status,
  priority = 'medium',
  dueDate,
  assignedTo,
  visibility = 'private',
  publicStatus,
  publicPostedAt,
  claimCount = 0,
  onClick,
}: RequestCardProps) {
  const priorityColors = {
    low: 'bg-slate-500',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    urgent: 'bg-red-500',
  };

  const departmentColors = {
    Civil: 'bg-teal-50 text-teal-700 ring-teal-700/10',
    Criminal: 'bg-orange-50 text-orange-700 ring-orange-700/10',
    Corporate: 'bg-blue-50 text-blue-700 ring-blue-700/10',
    Family: 'bg-purple-50 text-purple-700 ring-purple-700/10',
    Property: 'bg-green-50 text-green-700 ring-green-700/10',
    Tax: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
    Labour: 'bg-blue-50 text-blue-700 ring-blue-700/10',
    Constitutional: 'bg-red-50 text-red-700 ring-red-700/10',
    IP: 'bg-blue-50 text-blue-700 ring-blue-700/10',
    Environmental: 'bg-green-50 text-green-700 ring-green-700/10',
    'Banking & Finance': 'bg-orange-50 text-orange-700 ring-orange-700/10',
    'Consumer Protection': 'bg-purple-50 text-purple-700 ring-purple-700/10',
  };

  const isPublic = visibility === 'public';

  return (
    <div
      className={`group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative ${onClick ? 'cursor-pointer' : ''
        }`}
      onClick={onClick}
    >
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full ${priorityColors[priority]}`}></div>

      <div className="p-6 flex flex-col gap-4 flex-1 pl-7">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
              {id}
            </span>
            {/* Visibility Badge */}
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${isPublic
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
            >
              {isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
              {
  isPublic ? 'Public' : 'Private'}
            </span>
          </div>
          {isPublic && publicStatus === 'LAWYERS_INTERESTED' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              <User className="size-3" />
              {claimCount} Interest{claimCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <StatusBadge status={status} />
          )}
        </div>

        {/* Title & Client */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          {isPublic && publicPostedAt && (
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              Published {publicPostedAt ? formatDistanceToNow(new Date(publicPostedAt)) : ''} ago
            </p>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${departmentColors[department] || departmentColors.Civil
              }`}
          >
            {department}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Clock className="size-3" />
            Due {dueDate}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
        {isPublic ? (
          <div className="flex items-center gap-2">
            {status === 'assigned' || publicStatus === 'ASSIGNED' ? (
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-medium text-slate-700">Lawyer Assigned</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-700">Accepting Proposals</span>
              </div>
            )}
          </div>
        ) : assignedTo ? (
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
              {assignedTo.charAt(0)}
            </div>
            <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
              {assignedTo}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <User className="size-4" />
            <span className="text-xs">Unassigned</span>
          </div>
        )}

        <span className="text-sm font-semibold text-primary group-hover:underline decoration-2 underline-offset-2 transition-all">
          View Details →
        </span>
      </div>
    </div>
  );
}
