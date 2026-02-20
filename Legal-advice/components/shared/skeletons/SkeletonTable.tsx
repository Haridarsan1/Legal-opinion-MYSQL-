'use client';

import SkeletonLine from './SkeletonLine';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export default function SkeletonTable({ rows = 5, cols = 3 }: SkeletonTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <SkeletonLine widthClass="w-56" heightClass="h-5" />
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="grid grid-cols-12 gap-3 items-center">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <SkeletonLine
                  key={cIdx}
                  widthClass={
                    cIdx === 0 ? 'col-span-6' : cIdx === cols - 1 ? 'col-span-2' : 'col-span-4'
                  }
                  heightClass="h-4"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
