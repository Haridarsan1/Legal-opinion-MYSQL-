import SkeletonCard from '@/components/shared/skeletons/SkeletonCard';
import SkeletonTable from '@/components/shared/skeletons/SkeletonTable';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="bg-slate-200 h-4 w-28 rounded animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 h-8 w-64 rounded animate-pulse" />
          <div className="bg-slate-200 h-6 w-24 rounded animate-pulse" />
        </div>
        <div className="bg-slate-200 h-4 w-80 rounded animate-pulse" />
      </div>

      {/* Case Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="bg-slate-200 h-4 w-24 rounded animate-pulse mb-2" />
            <div className="bg-slate-200 h-6 w-32 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <SkeletonCard />
          {/* Documents list skeleton */}
          <SkeletonCard />
          {/* Clarifications */}
          <SkeletonCard />
          {/* Opinion section */}
          <SkeletonTable rows={4} cols={3} />
        </div>
        <div className="space-y-6">
          {/* Ratings submission skeleton */}
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
