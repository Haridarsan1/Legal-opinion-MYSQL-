import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  stats: {
    total: number;
    pending: number;
    reviewed: number;
    needsClarification: number;
  };
  onFilterClick: (filter: string) => void;
  activeFilter: string;
}

export default function DocumentStats({ stats, onFilterClick, activeFilter }: Props) {
  const cards = [
    {
      id: 'all',
      label: 'Total Documents',
      value: stats.total,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      borderColor: activeFilter === 'all' ? 'border-blue-600' : 'border-slate-200',
    },
    {
      id: 'pending',
      label: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      borderColor: activeFilter === 'pending' ? 'border-amber-600' : 'border-slate-200',
    },
    {
      id: 'reviewed',
      label: 'Reviewed',
      value: stats.reviewed,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      borderColor: activeFilter === 'reviewed' ? 'border-green-600' : 'border-slate-200',
    },
    {
      id: 'needs_clarification',
      label: 'Needs Clarification',
      value: stats.needsClarification,
      icon: AlertCircle,
      color: 'bg-orange-50 text-orange-600',
      borderColor:
        activeFilter === 'needs_clarification' ? 'border-orange-600' : 'border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onFilterClick(card.id)}
            className={`bg-white rounded-xl p-5 border-2 ${card.borderColor} hover:shadow-md transition-all text-left`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-600">{card.label}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
