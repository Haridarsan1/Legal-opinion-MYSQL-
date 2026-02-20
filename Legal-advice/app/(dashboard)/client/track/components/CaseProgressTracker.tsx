'use client';

import { CheckCircle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  completed: boolean;
  current?: boolean;
}

interface Props {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  label: string;
}

export default function CaseProgressTracker({ currentStep, totalSteps, steps, label }: Props) {
  // Ensure accurate progress calculation for visual bar
  // If completed (terminal), force 100%
  // Otherwise calculate based on step index
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Case Progress</h3>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>

      <div className="relative mb-6">
        {/* Visual Progress Bar */}
        <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-100 mb-6">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-slate-900 transition-all duration-500 ease-out"
          />
        </div>

        {/* Steps Visualisation */}
        <div className="flex items-center justify-between relative">
          {/* Connector Line Layer */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />

          {steps.map((step, index) => {
            const isCompleted = step.completed;
            const isCurrent = step.current;

            return (
              <div key={step.id} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all border-4 border-white ${
                    isCompleted
                      ? 'bg-slate-900 text-white'
                      : isCurrent
                        ? 'bg-white border-slate-900 text-slate-900 ring-2 ring-slate-900'
                        : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span>{index + 1}</span>}
                </div>
                <p
                  className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                    isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
