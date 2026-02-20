'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Clock,
  User,
  FileText,
  MessageCircle,
  CheckCircle,
  Upload,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Image from 'next/image';

interface TimelineEvent {
  id: string;
  actor: {
    name: string;
    role: 'client' | 'lawyer' | 'system';
    avatar?: string;
  };
  action: string;
  entity?: string;
  timestamp: string;
  icon: 'upload' | 'message' | 'check' | 'eye' | 'file' | 'clock';
}

interface Props {
  events: TimelineEvent[];
  userRole: 'client' | 'lawyer';
  defaultCollapsed?: boolean;
}

export default function AuditTimeline({ events, userRole, defaultCollapsed = false }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'upload':
        return Upload;
      case 'message':
        return MessageCircle;
      case 'check':
        return CheckCircle;
      case 'eye':
        return Eye;
      case 'file':
        return FileText;
      case 'clock':
        return Clock;
      default:
        return FileText;
    }
  };

  const getIconColor = (iconType: string) => {
    switch (iconType) {
      case 'upload':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-purple-100 text-purple-600';
      case 'check':
        return 'bg-green-100 text-green-600';
      case 'eye':
        return 'bg-amber-100 text-amber-600';
      case 'file':
        return 'bg-slate-100 text-slate-600';
      case 'clock':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">No activity yet</p>
      </div>
    );
  }

  const displayEvents = isCollapsed ? events.slice(0, 3) : events;

  return (
    <div className="space-y-4">
      {displayEvents.map((event, index) => {
        const Icon = getIcon(event.icon);
        const iconColorClass = getIconColor(event.icon);
        const isLast = index === displayEvents.length - 1 && !isCollapsed;

        return (
          <div key={event.id} className="flex gap-3 relative">
            {/* Timeline line */}
            {!isLast && <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-slate-200" />}

            {/* Icon */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColorClass} transition-all`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2 flex-1">
                  {/* Actor Avatar */}
                  {
  event.actor.role !== 'system' &&
                    (event.actor.avatar ? (
                      <Image
                        src={event.actor.avatar}
                        alt={event.actor.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-500" />
                      </div>
                    ))}

                  {/* Actor & Action */}
                  <p className="text-sm text-slate-900">
                    <span className="font-semibold">{event.actor.name}</span>{' '}
                    <span className="text-slate-600">{event.action}</span>
                    {event.entity && (
                      <>
                        {' '}
                        <span className="font-medium text-slate-900">{event.entity}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </span>
              </div>

              {/* Role badge for clarity */}
              <span
                className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                  event.actor.role === 'client'
                    ? 'bg-blue-50 text-blue-700'
                    : event.actor.role === 'lawyer'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-slate-50 text-slate-600'
                }`}
              >
                {event.actor.role === 'client'
                  ? 'Client'
                  : event.actor.role === 'lawyer'
                    ? 'Lawyer'
                    : 'System'}
              </span>
            </div>
          </div>
        );
      })}

      {/* Collapse/Expand Button */}
      {
  events.length > 3 && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <>
              <span>
                Show {events.length - 3} more {events.length - 3 === 1 ? 'event' : 'events'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
