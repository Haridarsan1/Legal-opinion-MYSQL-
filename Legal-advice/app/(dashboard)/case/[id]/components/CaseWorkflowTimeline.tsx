'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowStage, SLAMetrics } from '@/app/(dashboard)/case/utils/workflowAggregator';

interface Props {
  stages: WorkflowStage[];
  sla: SLAMetrics;
  showSLAHeader?: boolean;
  isTerminal?: boolean;
  completedAt?: string | null;
}

// Icon mapping for workflow stages
const getStageIcon = (iconName?: string, status?: string) => {
  if (status === 'blocked') return AlertCircle;

  switch (iconName) {
    case 'FileText':
      return FileText;
    case 'User':
      return User;
    case 'Eye':
      return Eye;
    case 'MessageCircle':
      return MessageCircle;
    case 'CheckCircle':
      return CheckCircle;
    case 'AlertCircle':
      return AlertCircle;
    default:
      return Circle;
  }
};

export default function CaseWorkflowTimeline({
  stages,
  sla,
  showSLAHeader = true,
  isTerminal = false,
  completedAt = null,
}: Props) {
  return (
    <div className="space-y-4">
      {/* SLA Header / Completion Status */}
      {showSLAHeader && (
        <div
          className={cn(
            'flex items-center justify-between p-3 rounded-lg border',
            sla.bgColor,
            sla.borderColor
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className={cn('w-4 h-4', sla.color)} />
            <span className={cn('text-sm font-semibold', sla.color)}>
              {isTerminal && sla.status === 'delivered' ? 'Completion Status' : 'SLA Status'}
            </span>
          </div>
          <span className={cn('text-sm font-medium', sla.color)}>
            {isTerminal && sla.status === 'delivered' && sla.deliveredAt
              ? `Completed ${formatDistanceToNow(new Date(sla.deliveredAt), { addSuffix: true })}`
              : sla.text}
          </span>
        </div>
      )}

      {/* Timeline Stages */}
      <div className="relative space-y-6">
        {/* Connecting Vertical Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

        {stages
          .filter((stage) => stage.visible)
          .map((stage, index, visibleStages) => {
            const Icon = getStageIcon(stage.iconName, stage.status);
            const isLast = index === visibleStages.length - 1;

            return (
              <div key={stage.id} className="relative flex gap-4">
                {/* Stage Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      stage.status === 'completed' && 'bg-green-500 border-green-500 text-white',
                      stage.status === 'active' &&
                        'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-50',
                      stage.status === 'blocked' &&
                        'bg-red-500 border-red-500 text-white ring-4 ring-red-50',
                      stage.status === 'pending' && 'bg-white border-slate-300 text-slate-400'
                    )}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>

                  {/* Hide connector line for last stage */}
                  {!isLast && (
                    <div className="absolute left-1/2 top-10 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
                  )}
                </div>

                {/* Stage Content */}
                <div className="flex-1 pb-6">
                  <div
                    className={cn(
                      'text-base font-semibold mb-1',
                      stage.status === 'completed' && 'text-green-900',
                      stage.status === 'active' && 'text-blue-900',
                      stage.status === 'blocked' && 'text-red-900',
                      stage.status === 'pending' && 'text-slate-500'
                    )}
                  >
                    {stage.label}
                  </div>

                  {stage.description && (
                    <p
                      className={cn(
                        'text-sm mb-2',
                        stage.status === 'pending' ? 'text-slate-400' : 'text-slate-600'
                      )}
                    >
                      {stage.description}
                    </p>
                  )}

                  {/* Timestamp and Actor */}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {stage.timestamp && (
                      <span>
                        {formatDistanceToNow(new Date(stage.timestamp), { addSuffix: true })}
                      </span>
                    )}
                    {stage.actor && stage.status !== 'pending' && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full font-medium',
                          stage.actor === 'client' && 'bg-purple-100 text-purple-700',
                          stage.actor === 'lawyer' && 'bg-blue-100 text-blue-700',
                          stage.actor === 'system' && 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {stage.actor === 'client' && 'Client'}
                        {stage.actor === 'lawyer' && 'Lawyer'}
                        {stage.actor === 'system' && 'System'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
