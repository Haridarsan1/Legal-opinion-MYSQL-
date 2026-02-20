'use client';

import { CheckCircle2, Circle, XCircle } from 'lucide-react';

interface ProposalStatusTrackerProps {
  currentStatus: 'submitted' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const statusSteps = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'final', label: 'Final Decision' },
];

export default function ProposalStatusTracker({
  currentStatus,
  className = '',
  size = 'medium',
}: ProposalStatusTrackerProps) {
  const getCurrentStepIndex = () => {
    if (currentStatus === 'withdrawn') return -1;
    if (currentStatus === 'submitted') return 0;
    if (currentStatus === 'shortlisted') return 1;
    if (currentStatus === 'accepted' || currentStatus === 'rejected') return 2;
    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const isRejected = currentStatus === 'rejected';
  const isAccepted = currentStatus === 'accepted';
  const isWithdrawn = currentStatus === 'withdrawn';

  const sizeClasses = {
    small: {
      icon: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-1.5',
      line: 'h-0.5',
    },
    medium: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-2',
      line: 'h-0.5',
    },
    large: {
      icon: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-3',
      line: 'h-1',
    },
  };

  const classes = sizeClasses[size];

  if (isWithdrawn) {
    return (
      <div className={`flex items-center ${classes.gap} text-slate-500 ${className}`}>
        <XCircle className={`${classes.icon}`} />
        <span className={`${classes.text} font-medium`}>Withdrawn</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {statusSteps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isLast = index === statusSteps.length - 1;

        // Special handling for final decision step
        const isFinalStep = step.key === 'final';
        const finalStepCompleted = isAccepted || isRejected;
        const finalStepCurrent = currentStepIndex === 2;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                {isFinalStep ? (
                  <>
                    {isAccepted ? (
                      <CheckCircle2 className={`${classes.icon} text-green-600 fill-green-100`} />
                    ) : isRejected ? (
                      <XCircle className={`${classes.icon} text-red-600 fill-red-100`} />
                    ) : finalStepCurrent ? (
                      <Circle className={`${classes.icon} text-blue-600`} />
                    ) : (
                      <Circle className={`${classes.icon} text-slate-300`} />
                    )}
                  </>
                ) : (
                  <>
                    {isCompleted || isCurrent ? (
                      <CheckCircle2
                        className={`${classes.icon} ${
                          isCurrent ? 'text-blue-600' : 'text-green-600'
                        } ${isCurrent ? '' : 'fill-green-100'}`}
                      />
                    ) : (
                      <Circle className={`${classes.icon} text-slate-300`} />
                    )}
                  </>
                )}
              </div>

              {/* Step label */}
              <span
                className={`mt-1 ${classes.text} font-medium ${
                  isFinalStep && isAccepted
                    ? 'text-green-700'
                    : isFinalStep && isRejected
                      ? 'text-red-700'
                      : isCompleted || isCurrent
                        ? 'text-slate-700'
                        : 'text-slate-400'
                }`}
              >
                {isFinalStep
                  ? isAccepted
                    ? 'Accepted'
                    : isRejected
                      ? 'Rejected'
                      : 'Pending'
                  : step.label}
              </span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div
                className={`w-12 ${classes.line} mx-2 rounded-full ${
                  index < currentStepIndex ? 'bg-green-600' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
