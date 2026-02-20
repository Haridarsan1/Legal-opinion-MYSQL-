'use client';

import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';

interface StatusStep {
  key: string;
  label: string;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: 'submitted', label: 'Requested', description: 'Case submitted by client' },
  { key: 'assigned', label: 'Assigned', description: 'Lawyer assigned to case' },
  { key: 'in_review', label: 'Under Review', description: 'Lawyer reviewing case' },
  {
    key: 'documents_pending',
    label: 'Documents Pending',
    description: 'Awaiting client documents',
  },
  {
    key: 'clarification_required',
    label: 'Clarification Raised',
    description: 'Awaiting client response',
  },
  {
    key: 'drafting_opinion',
    label: 'Drafting Opinion',
    description: 'Legal opinion being prepared',
  },
  { key: 'opinion_ready', label: 'Opinion Ready', description: 'Final opinion prepared' },
  { key: 'client_acknowledged', label: 'Acknowledged', description: 'Client acknowledged receipt' },
  {
    key: 'no_further_queries_confirmed',
    label: 'Client Confirmed',
    description: 'Client satisfied with opinion',
  },
  { key: 'case_closed', label: 'Closed', description: 'Case formally closed' },
  { key: 'completed', label: 'Completed', description: 'Case archived' },
];

interface Props {
  currentStatus: string;
  slaDeadline?: string | null;
}

export default function CaseStatusFlow({ currentStatus, slaDeadline }: Props) {
  // Calculate current step index
  let currentStepIndex = STATUS_STEPS.findIndex((step) => step.key === currentStatus);

  // Treat 'case_closed' as reaching the 'completed' step
  if (currentStatus === 'case_closed') {
    const completedIndex = STATUS_STEPS.findIndex((step) => step.key === 'completed');
    if (completedIndex !== -1) {
      currentStepIndex = completedIndex;
    }
  }

  // Calculate SLA status
  const getSlaStatus = () => {
    if (
      !slaDeadline ||
      [
        'completed',
        'cancelled',
        'case_closed',
        'no_further_queries_confirmed',
        'opinion_ready',
        'client_acknowledged',
      ].includes(currentStatus)
    ) {
      return null;
    }

    const deadline = new Date(slaDeadline);
    const now = new Date();
    const msRemaining = deadline.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { status: 'overdue', daysRemaining, color: 'red' };
    } else if (daysRemaining <= 2) {
      return { status: 'warning', daysRemaining, color: 'amber' };
    } else {
      return { status: 'onTrack', daysRemaining, color: 'green' };
    }
  };

  const slaStatus = getSlaStatus();

  return (
    <div className="space-y-4">
      {/* SLA Indicator */}
      {
  slaStatus && (
        <div
          className={`p-3 rounded-lg border-2 ${
            slaStatus.color === 'red'
              ? 'bg-red-50 border-red-200'
              : slaStatus.color === 'amber'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {slaStatus.color === 'red' ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <Clock
                className={`w-5 h-5 ${
                  slaStatus.color === 'amber' ? 'text-amber-600' : 'text-green-600'
                }`}
              />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  slaStatus.color === 'red'
                    ? 'text-red-900'
                    : slaStatus.color === 'amber'
                      ? 'text-amber-900'
                      : 'text-green-900'
                }`}
              >
                {slaStatus.status === 'overdue' && 'SLA Overdue'}
                {
  slaStatus.status === 'warning' && 'SLA Deadline Approaching'}
                {
  slaStatus.status === 'onTrack' && 'On Track'}
              </p>
              <p
                className={`text-xs ${
                  slaStatus.color === 'red'
                    ? 'text-red-700'
                    : slaStatus.color === 'amber'
                      ? 'text-amber-700'
                      : 'text-green-700'
                }`}
              >
                {slaStatus.daysRemaining < 0
                  ? `${Math.abs(slaStatus.daysRemaining)} days overdue`
                  : `${slaStatus.daysRemaining} days remaining`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Flow Timeline */}
      <div className="relative">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <div key={step.key} className="relative pb-8 last:pb-0">
              {/* Connection Line */}
              {
  index < STATUS_STEPS.length - 1 && (
                <div
                  className={`absolute left-3 top-6 w-0.5 h-full ${
                    isCompleted ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Step Content */}
              <div className="relative flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-blue-600 ring-4 ring-blue-100'
                        : 'bg-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <Circle className="w-3 h-3 text-white fill-white" />
                  ) : (
                    <Circle className="w-3 h-3 text-slate-400" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 pt-0.5">
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-blue-900'
                        : isCompleted
                          ? 'text-green-900'
                          : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-xs ${
                      isCurrent
                        ? 'text-blue-700'
                        : isCompleted
                          ? 'text-green-700'
                          : 'text-slate-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Current Badge */}
                {
  isCurrent && (
                  <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                    Current
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Special States */}
      {
  currentStatus === 'cancelled' && (
        <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900">Case Cancelled</p>
          <p className="text-xs text-red-700">This case has been cancelled and will not proceed.</p>
        </div>
      )}
    </div>
  );
}
