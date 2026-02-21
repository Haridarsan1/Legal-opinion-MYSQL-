import { Filter } from 'lucide-react';

interface Props {
  documents: any[];
  statusFilter: string;
  caseFilter: string;
  dateFilter: string;
  onStatusChange: (status: string) => void;
  onCaseChange: (caseId: string) => void;
  onDateChange: (date: string) => void;
}

export default function DocumentFilters({
  documents,
  statusFilter,
  caseFilter,
  dateFilter,
  onStatusChange,
  onCaseChange,
  onDateChange,
}: Props) {
  // Get unique cases
  const uniqueCases = Array.from(
    new Map(documents.filter((d: any) => d.request).map((d: any) => [d.request.id, d.request])).values()
  );

  const hasActiveFilters = statusFilter !== 'all' || caseFilter !== 'all' || dateFilter !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-slate-600" />
        <h3 className="font-semibold text-slate-900 text-sm">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={() => {
              onStatusChange('all');
              onCaseChange('all');
              onDateChange('all');
            }}
            className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Case Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Case</label>
          <select
            value={caseFilter}
            onChange={(e) => onCaseChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Cases</option>
            {uniqueCases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.request_number} - {caseItem.title?.substring(0, 30)}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Date Range</label>
          <select
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Document Type Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Document Type</label>
          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">All Types</option>
            <option value="client">Client Documents</option>
            <option value="working">Working Files</option>
            <option value="opinion">Opinion Files</option>
          </select>
        </div>
      </div>
    </div>
  );
}
