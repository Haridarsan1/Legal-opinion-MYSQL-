'use client';

interface SkeletonLineProps {
  widthClass?: string;
  heightClass?: string;
  className?: string;
}

export default function SkeletonLine({
  widthClass = 'w-full',
  heightClass = 'h-4',
  className = '',
}: SkeletonLineProps) {
  return (
    <div
      className={`bg-slate-200 ${widthClass} ${heightClass} rounded animate-pulse ${className}`}
    ></div>
  );
}
