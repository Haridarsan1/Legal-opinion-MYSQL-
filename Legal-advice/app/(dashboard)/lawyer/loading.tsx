import SkeletonCard from '@/components/shared/skeletons/SkeletonCard';
import SkeletonBlock from '@/components/shared/skeletons/SkeletonBlock';
import SkeletonTable from '@/components/shared/skeletons/SkeletonTable';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-slate-200 h-6 w-48 rounded animate-pulse" />
          <div className="bg-slate-200 h-4 w-72 rounded animate-pulse" />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="flex gap-3">
          <div className="bg-slate-200 h-10 w-40 rounded-lg animate-pulse" />
          <div className="bg-slate-200 h-10 w-40 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="bg-slate-200 h-4 w-24 rounded animate-pulse mb-2" />
            <div className="bg-slate-200 h-6 w-16 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Recent cases & priority sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard />
          <SkeletonTable rows={6} cols={3} />
        </div>
        <div className="space-y-6">
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
