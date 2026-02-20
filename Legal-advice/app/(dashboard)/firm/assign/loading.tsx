import SkeletonTable from '@/components/shared/skeletons/SkeletonTable';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1400px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="bg-slate-200 h-6 w-56 rounded animate-pulse" />
        <div className="bg-slate-200 h-10 w-64 rounded-lg animate-pulse" />
      </div>
      {/* Assignment table skeleton */}
      <SkeletonTable rows={10} cols={3} />
    </div>
  );
}
