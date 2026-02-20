import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function Card({ children, className, hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden',
        hover && 'transition-all hover:border-primary/30 hover:shadow-md',
        gradient &&
          'before:absolute before:-right-4 before:-bottom-4 before:size-24 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:rounded-full before:z-0',
        className
      )}
    >
      {children}
    </div>
  );
}
