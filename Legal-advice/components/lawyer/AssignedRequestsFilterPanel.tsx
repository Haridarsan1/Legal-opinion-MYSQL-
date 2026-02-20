'use client';

import { useState, useEffect } from 'react';
import { X, Filter, Check, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterState {
  priority: string[];
  caseType: string[];
  status: string[];
  department: string[];
  dateRange: { start: string | null; end: string | null };
  sla: string[];
  clientType: string[];
}

export const initialFilterState: FilterState = {
  priority: [],
  caseType: [],
  status: [],
  department: [],
  dateRange: { start: null, end: null },
  sla: [],
  clientType: [],
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  departments: { id: string; name: string }[];
  onApply: () => void;
  onClear: () => void;
}

export default function AssignedRequestsFilterPanel({
  isOpen,
  onClose,
  filters,
  setFilters,
  departments,
  onApply,
  onClear,
}: Props) {
  // Local state for temporary changes before applying
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    priority: true,
    status: true,
    department: true,
    date: false,
    sla: false,
    client: false,
  });

  // Sync when panel opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArrayFilter = (key: keyof Omit<FilterState, 'dateRange'>, value: string) => {
    setLocalFilters((prev) => {
      const current = prev[key] as string[];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApply();
  };

  const handleClear = () => {
    setLocalFilters(initialFilterState);
    setFilters(initialFilterState);
    onClear();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Priority */}
          <FilterSection
            title="Case Priority"
            isExpanded={expandedSections.priority}
            onToggle={() => toggleSection('priority')}
          >
            <div className="grid grid-cols-2 gap-2">
              {['High', 'Medium', 'Low', 'Urgent'].map((option) => (
                <CheckboxOption
                  key={option}
                  label={option}
                  checked={localFilters.priority.includes(option)}
                  onChange={() => toggleArrayFilter('priority', option)}
                  colorClass={
                    option === 'High' || option === 'Urgent'
                      ? 'text-red-700 bg-red-50 border-red-200'
                      : option === 'Medium'
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-slate-700 bg-slate-50 border-slate-200'
                  }
                />
              ))}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection
            title="Workflow Stage"
            isExpanded={expandedSections.status}
            onToggle={() => toggleSection('status')}
          >
            <div className="space-y-2">
              {[
                'Pending Acceptance',
                'Accepted',
                'Rejected',
                'Draft In Progress',
                'Review',
                'Completed',
              ].map((option) => (
                <CheckboxRow
                  key={option}
                  label={option}
                  checked={localFilters.status.includes(option)}
                  onChange={() => toggleArrayFilter('status', option)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Department */}
          <FilterSection
            title="Practice Area"
            isExpanded={expandedSections.department}
            onToggle={() => toggleSection('department')}
          >
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <FilterChip
                  key={dept.id}
                  label={dept.name}
                  selected={localFilters.department.includes(dept.name)}
                  onClick={() => toggleArrayFilter('department', dept.name)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Date Range */}
          <FilterSection
            title="Date Range & SLA"
            isExpanded={expandedSections.date}
            onToggle={() => toggleSection('date')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Start Date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={localFilters.dateRange.start || ''}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">End Date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={localFilters.dateRange.end || ''}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Due Today', 'Overdue', 'This Week'].map((opt) => (
                    <FilterChip
                      key={opt}
                      label={opt}
                      selected={localFilters.sla.includes(opt)}
                      onClick={() => toggleArrayFilter('sla', opt)}
                      variant="outline"
                    />
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Client Type */}
          <FilterSection
            title="Client Type"
            isExpanded={expandedSections.client}
            onToggle={() => toggleSection('client')}
          >
            <div className="space-y-2">
              {['Individual', 'Corporate', 'Firm', 'Government'].map((option) => (
                <CheckboxRow
                  key={option}
                  label={option}
                  checked={localFilters.clientType.includes(option)}
                  onChange={() => toggleArrayFilter('clientType', option)}
                />
              ))}
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <button
            onClick={handleClear}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

function FilterSection({
  title,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-sm text-gray-800">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

function CheckboxOption({
  label,
  checked,
  onChange,
  colorClass = 'bg-white border-gray-200 text-gray-700',
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  colorClass?: string;
}) {
  return (
    <label
      className={`
                flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all select-none text-sm font-medium
                ${
                  checked
                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                    : `${colorClass} hover:bg-gray-50`
                }
            `}
    >
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group">
      <div
        className={`
                w-5 h-5 rounded border flex items-center justify-center transition-colors
                ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}
            `}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
        {label}
      </span>
    </label>
  );
}

function FilterChip({
  label,
  selected,
  onClick,
  variant = 'default',
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: 'default' | 'outline';
}) {
  return (
    <button
      onClick={onClick}
      className={`
                px-3 py-1.5 text-xs font-medium rounded-full transition-all border
                ${
                  selected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }
            `}
    >
      {label}
    </button>
  );
}
