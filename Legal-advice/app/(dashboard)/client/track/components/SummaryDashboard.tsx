import { LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';

interface Props {
  requests: LifecycleSummary[];
}

export default function SummaryDashboard({ requests }: Props) {
  const stats = {
    active: requests.filter((r: any) => r.dashboardBucket === 'ACTIVE').length,
    actionNeeded: requests.filter((r: any) => r.dashboardBucket === 'ACTION_NEEDED').length,
    atRisk: requests.filter((r: any) => r.dashboardBucket === 'SLA_RISK').length,
    completed: requests.filter((r: any) => r.dashboardBucket === 'COMPLETED').length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <DashboardCard
        label="Active Cases"
        value={stats.active}
        color="bg-blue-50 text-blue-700 border-blue-200"
      />
      <DashboardCard
        label="Action Needed"
        value={stats.actionNeeded}
        color="bg-amber-50 text-amber-700 border-amber-200"
        animate={stats.actionNeeded > 0}
      />
      <DashboardCard
        label="SLA At Risk"
        value={stats.atRisk}
        color="bg-red-50 text-red-700 border-red-200"
        animate={stats.atRisk > 0}
      />
      <DashboardCard
        label="Completed"
        value={stats.completed}
        color="bg-slate-50 text-slate-700 border-slate-200"
      />
    </div>
  );
}

function DashboardCard({
  label,
  value,
  color,
  animate,
}: {
  label: string;
  value: number;
  color: string;
  animate?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${color} flex flex-col items-center justify-center text-center`}
    >
      <span className={`text-3xl font-bold mb-1 ${animate ? 'animate-pulse' : ''}`}>{value}</span>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</span>
    </div>
  );
}
