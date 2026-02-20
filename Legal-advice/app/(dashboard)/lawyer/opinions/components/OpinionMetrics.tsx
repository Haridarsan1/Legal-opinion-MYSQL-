import { FileText, Clock, CheckCircle, Star } from 'lucide-react';

interface Props {
  metrics: {
    total: number;
    pending: number;
    completed: number;
    avgRating: string | number;
    avgTurnaround: string;
  };
}

export default function OpinionMetrics({ metrics }: Props) {
  const cards = [
    {
      label: 'Total Opinions',
      value: metrics.total,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      trend: null,
    },
    {
      label: 'Pending Review',
      value: metrics.pending,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      trend: null,
    },
    {
      label: 'Completed',
      value: metrics.completed,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      trend: null,
    },
    {
      label: 'Avg Rating',
      value: metrics.avgRating,
      icon: Star,
      color: 'bg-purple-50 text-purple-600',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-600">{card.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
