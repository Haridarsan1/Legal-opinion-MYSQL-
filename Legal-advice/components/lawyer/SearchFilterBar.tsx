'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFilterBarProps {
  onSearch?: (query: string) => void;
  onStatusFilter?: (status: string) => void;
  onDepartmentFilter?: (dept: string) => void;
}

export default function SearchFilterBar({
  onSearch,
  onStatusFilter,
  onDepartmentFilter,
}: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Case ID, Client, or Subject..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full h-11 pl-11 pr-4 border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Status Filter */}
      <select
        onChange={(e) => onStatusFilter?.(e.target.value)}
        className="h-11 pl-4 pr-10 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="">All Status</option>
        <option value="new">New</option>
        <option value="in_progress">In Progress</option>
        <option value="urgent">Urgent</option>
        <option value="completed">Completed</option>
      </select>

      {/* Departments Filter */}
      <select
        onChange={(e) => onDepartmentFilter?.(e.target.value)}
        className="h-11 pl-4 pr-10 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="">All Departments</option>
        <option value="corporate">Corporate & Tax Law</option>
        <option value="ip">Intellectual Property</option>
        <option value="realestate">Real Estate</option>
        <option value="employment">Employment Law</option>
        <option value="banking">Banking & Finance</option>
        <option value="litigation">Litigation Support</option>
      </select>

      {/* More Filters Button */}
      <button className="h-11 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
        <Filter className="w-4 h-4" />
        More Filters
      </button>
    </div>
  );
}
