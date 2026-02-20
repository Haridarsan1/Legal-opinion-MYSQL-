import SkeletonCard from '@/components/shared/skeletons/SkeletonCard';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-7xl mx-auto w-full">
      {/* Welcome Hero Card Skeleton */}
      <div className="bg-slate-200 rounded-2xl p-6 sm:p-8 h-48 animate-pulse shadow-sm" />

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4"
          >
            <div className="bg-slate-200 h-12 w-12 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="bg-slate-200 h-4 w-32 rounded animate-pulse" />
              <div className="bg-slate-200 h-6 w-16 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Live Status Overview Skeleton */}
      <div>
        <div className="bg-slate-200 h-6 w-48 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-4 h-32 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Active Requests Skeleton */}
      <div>
        <div className="bg-slate-200 h-6 w-48 rounded animate-pulse mb-4" />
        <SkeletonCard />
      </div>
    </div>
  );
}
