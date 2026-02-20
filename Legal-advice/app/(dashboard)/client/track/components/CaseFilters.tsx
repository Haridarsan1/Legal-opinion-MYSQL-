import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import { StatusFilter, VisibilityFilter, SortOption, ViewMode } from '../utils/trackUtils';

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;
  visibilityFilter: VisibilityFilter;
  setVisibilityFilter: (v: VisibilityFilter) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}

export default function CaseFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  visibilityFilter,
  setVisibilityFilter,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode,
}: Props) {
  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      {/* Top Row: Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">Newest First</option>
            <option value="last_updated">Last Updated</option>
            <option value="sla_risk">SLA Urgency</option>
            <option value="priority">Priority</option>
          </select>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'action_needed', 'in_review', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter as StatusFilter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Visibility:
          </span>
          <div className="flex gap-1">
            {(['all', 'private', 'public'] as const).map((vis) => (
              <button
                key={vis}
                onClick={() => setVisibilityFilter(vis as VisibilityFilter)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  visibilityFilter === vis
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {vis.charAt(0).toUpperCase() + vis.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
