import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'page' | 'inline' | 'button';
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'inline',
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-8',
    lg: 'size-12',
    xl: 'size-16',
  };

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-slate-200 border-t-primary',
        sizeClasses[size]
      )}
    />
  );

  if (variant === 'page') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div
          className={cn(
            'animate-spin rounded-full border-4 border-slate-200 border-t-primary',
            sizeClasses.xl
          )}
        />
        {text && <p className="text-slate-500 text-sm font-medium">{text}</p>}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-white/30 border-t-white',
          sizeClasses.sm
        )}
      />
    );
  }

  // inline variant
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      {spinner}
      {text && <span className="text-slate-500 text-sm font-medium">{text}</span>}
    </div>
  );
}
