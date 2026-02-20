'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  stages: {
    id: string;
    label: string;
    completed: boolean;
    active: boolean;
  }[];
}

export default function CaseProgressStepper({ stages }: Props) {
  // Calculate progress percentage based on completed stages
  const completedCount = stages.filter((s) => s.completed).length;
  const activeIndex = stages.findIndex((s) => s.active);
  const progressPercentage =
    activeIndex >= 0
      ? (activeIndex / (stages.length - 1)) * 100
      : (completedCount / (stages.length - 1)) * 100;

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between w-full">
        {/* Connecting Lines Layer */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full -z-10" />

        {/* Active Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full -z-10 transition-all duration-500 ease-in-out"
          style={{
            width: `${progressPercentage}%`,
          }}
        />

        {stages.map((stage, index) => {
          const isCompleted = stage.completed;
          const isCurrent = stage.active;
          const isFuture = !stage.completed && !stage.active;

          return (
            <div key={stage.id} className="relative flex flex-col items-center group">
              {/* Icon Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10',
                  isCompleted && 'bg-blue-600 border-blue-600 text-white',
                  isCurrent &&
                    'bg-white border-blue-600 text-blue-600 scale-110 shadow-lg ring-4 ring-blue-50',
                  isFuture && 'bg-white border-slate-200 text-slate-300'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <Circle className="w-5 h-5" fill={isCurrent ? 'currentColor' : 'none'} />
                )}
              </div>

              {/* Label */}
              <div
                className={cn(
                  'absolute top-14 whitespace-nowrap text-sm font-medium transition-colors duration-300',
                  isCurrent
                    ? 'text-blue-900 font-bold'
                    : isCompleted
                      ? 'text-blue-700'
                      : 'text-slate-400'
                )}
              >
                {stage.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
