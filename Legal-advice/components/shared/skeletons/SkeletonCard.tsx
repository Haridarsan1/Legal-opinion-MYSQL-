'use client';

import SkeletonLine from './SkeletonLine';
import SkeletonBlock from './SkeletonBlock';

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export default function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <SkeletonLine widthClass="w-40" heightClass="h-5" />
      </div>
      <div className="p-6 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} />
        ))}
        <SkeletonBlock heightClass="h-24" />
      </div>
    </div>
  );
}
