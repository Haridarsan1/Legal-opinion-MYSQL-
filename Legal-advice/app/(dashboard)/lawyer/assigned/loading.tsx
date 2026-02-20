import SkeletonTable from '@/components/shared/skeletons/SkeletonTable';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1400px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="bg-slate-200 h-6 w-48 rounded animate-pulse" />
        <div className="bg-slate-200 h-10 w-64 rounded-lg animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-slate-200 h-10 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Requests list skeleton */}
      <SkeletonTable rows={8} cols={3} />
    </div>
  );
}
