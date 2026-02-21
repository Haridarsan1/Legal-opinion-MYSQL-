import { ViewMode } from '../utils/trackUtils';
import { LifecycleSummary } from '@/app/domain/lifecycle/LifecycleResolver';
import CaseCard from './CaseCard';
import { FileText } from 'lucide-react';

interface Props {
  requests: LifecycleSummary[];
  viewMode: ViewMode;
}

export default function CaseList({ requests, viewMode }: Props) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No cases found</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Try adjusting your filters or search query to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
          : 'flex flex-col gap-4 max-w-4xl mx-auto'
      }
    >
      {requests.map((req: any) => (
        <CaseCard key={req.id} request={req} />
      ))}
    </div>
  );
}
