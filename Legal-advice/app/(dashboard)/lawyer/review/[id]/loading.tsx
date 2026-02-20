import SkeletonCard from '@/components/shared/skeletons/SkeletonCard';
import SkeletonBlock from '@/components/shared/skeletons/SkeletonBlock';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="space-y-2">
        <div className="bg-slate-200 h-6 w-64 rounded animate-pulse" />
        <div className="bg-slate-200 h-4 w-40 rounded animate-pulse" />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="bg-slate-200 h-4 w-24 rounded animate-pulse mb-2" />
            <div className="bg-slate-200 h-6 w-32 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Review form / content */}
      <SkeletonCard lines={4} />
      <SkeletonBlock heightClass="h-32" />
    </div>
  );
}
