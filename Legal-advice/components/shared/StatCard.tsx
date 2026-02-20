import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-primary',
  trend,
  trendValue,
  subtitle,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors',
        className
      )}
    >
      <div className="flex justify-between items-start z-10">
        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
          <p className="text-slate-900 text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={cn('p-2 rounded-lg', iconBgColor, iconColor)}>
          <Icon className="size-6" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm z-10">
        {trend && trendValue && (
          <span
            className={cn(
              'flex items-center px-2 py-0.5 rounded text-xs font-bold',
              trend === 'up' && 'text-green-600 bg-green-50',
              trend === 'down' && 'text-red-600 bg-red-50',
              trend === 'neutral' && 'text-slate-600 bg-slate-50'
            )}
          >
            {trend === 'up' && '+'}
            {
  trend === 'down' && '-'}
            {
  trendValue}
          </span>
        )}
        {
  subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
      </div>

      {/* Gradient decoration */}
      <div className="absolute -right-4 -bottom-4 size-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full z-0 group-hover:scale-110 transition-transform duration-500"></div>
    </div>
  );
}
