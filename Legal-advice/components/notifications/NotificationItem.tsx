'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  MessageCircle,
  Server,
} from 'lucide-react';
import type { NotificationRecord, NotificationRole } from './types';

const TYPE_STYLES: Record<
  string,
  {
    icon: ReactNode;
    accent: string;
    iconBg: string;
  }
> = {
  assignment: {
    icon: <Briefcase className="w-4 h-4" />,
    accent: 'border-l-blue-500',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  deadline: {
    icon: <AlertCircle className="w-4 h-4" />,
    accent: 'border-l-amber-500',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  message: {
    icon: <MessageCircle className="w-4 h-4" />,
    accent: 'border-l-violet-500',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  clarification: {
    icon: <MessageCircle className="w-4 h-4" />,
    accent: 'border-l-violet-500',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  status_update: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    accent: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  system: {
    icon: <Server className="w-4 h-4" />,
    accent: 'border-l-slate-400',
    iconBg: 'bg-slate-100 text-slate-600',
  },
  info: {
    icon: <Bell className="w-4 h-4" />,
    accent: 'border-l-sky-500',
    iconBg: 'bg-sky-100 text-sky-600',
  },
};

function getDefaultLink(role: NotificationRole, notification: NotificationRecord) {
  if (notification.link) return notification.link;
  if (notification.related_request_id) {
    if (role === 'lawyer') {
      return `/lawyer/review/${notification.related_request_id}`;
    }
    return `/client/requests/${notification.related_request_id}`;
  }
  return role === 'lawyer' ? '/lawyer/notifications' : '/client/notifications';
}

export default function NotificationItem({
  notification,
  role,
  variant = 'dropdown',
  onMarkRead,
  onToggleRead,
  onNavigate,
}: {
  notification: NotificationRecord;
  role: NotificationRole;
  variant?: 'dropdown' | 'page';
  onMarkRead?: (id: string) => void;
  onToggleRead?: (id: string, nextRead: boolean) => void;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const style = TYPE_STYLES[notification.type || 'info'] || TYPE_STYLES.info;
  const href = useMemo(() => getDefaultLink(role, notification), [role, notification]);
  const isUnread = !notification.is_read;

  const handleClick = () => {
    if (isUnread) {
      onMarkRead?.(notification.id);
    }
    onNavigate?.();
    router.push(href);
  };

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleRead?.(notification.id, !notification.is_read);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:shadow-md hover:border-slate-300 ${
        style.accent
      } ${variant === 'page' ? 'shadow-sm' : 'shadow'} ${
        isUnread ? 'bg-slate-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.iconBg} flex-shrink-0`}
        >
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {notification.title || 'Notification'}
                </h4>
                {isUnread && <span className="h-2 w-2 rounded-full bg-sky-500"></span>}
              </div>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {notification.message || ''}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </div>
          </div>
          {variant === 'page' && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">{notification.type || 'info'}</span>
              {onToggleRead && (
                <button
                  type="button"
                  onClick={handleToggle}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  {notification.is_read ? 'Mark unread' : 'Mark read'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
