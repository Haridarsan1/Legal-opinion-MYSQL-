import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}
    >
      <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="size-8 text-slate-400" />
      </div>
      <h3 className="text-slate-900 text-lg font-bold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all hover:-translate-y-0.5"
        >
          {action.icon && <action.icon className="size-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}
