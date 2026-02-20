'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';

interface Props {
  request: LifecycleSummary;
}

export default function ExpandedRowDetails({ request }: Props) {
  return (
    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Case Metadata */}
        <div className="space-y-4">
          {request.department && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Department
              </h4>
              <p className="text-sm text-slate-900 font-medium">{request.department.name}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Created</span>
                <p className="font-semibold text-slate-900">
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </p>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Priority</span>
                <p className="font-semibold text-slate-900 capitalize">
                  {request.priority || 'Normal'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Progress & Metrics */}
        <div className="space-y-4">
          {/* Lifecycle Stages */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Progress Timeline
            </h4>
            <div className="space-y-2">
              {request.progress.steps.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.completed
                        ? 'bg-green-100 text-green-700'
                        : step.current
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                  >
                    {step.completed ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-sm ${step.completed || step.current
                        ? 'text-slate-900 font-medium'
                        : 'text-slate-400'
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
        <Link
          href={`/case/${request.id}`}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          View Full Case
        </Link>
        {request.nextStep.actionLabel && request.nextStep.actionUrl && (
          <Link
            href={`/case/${request.id}${request.nextStep.actionUrl}`}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {request.nextStep.actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
