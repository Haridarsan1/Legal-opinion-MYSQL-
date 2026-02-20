'use client';

interface SkeletonBlockProps {
  widthClass?: string;
  heightClass?: string;
  roundedClass?: string;
  className?: string;
}

export default function SkeletonBlock({
  widthClass = 'w-full',
  heightClass = 'h-24',
  roundedClass = 'rounded-lg',
  className = '',
}: SkeletonBlockProps) {
  return (
    <div
      className={`bg-slate-200 ${widthClass} ${heightClass} ${roundedClass} animate-pulse ${className}`}
    ></div>
  );
}
