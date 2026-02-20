'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { searchGlobal, GroupedResults, SearchResult } from '@/app/actions/searchActions';
import SearchSuggestions from './SearchSuggestions';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useRouter } from 'next/navigation';

export default function SmartSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GroupedResults>({
    lawyers: [],
    practiceAreas: [],
    services: [],
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Handle outside click to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to trigger search
  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.trim().length < 2) {
        setResults({ lawyers: [], practiceAreas: [], services: [] });
        return;
      }

      setIsLoading(true);
      const response = await searchGlobal(debouncedQuery);
      if (response.success && response.data) {
        setResults(response.data);
      }
      setIsLoading(false);
    }

    performSearch();
  }, [debouncedQuery]);

  const handleSelectResult = (result: SearchResult) => {
    setIsFocused(false);
    if (result.type === 'lawyer') {
      router.push(`/lawyers/${result.id}`); // Assuming lawyer profile route
    } else if (result.type === 'practice_area') {
      router.push(`/dashboard/client/departments?filter=${result.id}`); // Direct to directory
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`
                relative flex items-center w-full rounded-2xl border-2 bg-white shadow-sm transition-all duration-300
                ${
                  isFocused
                    ? 'border-primary ring-4 ring-primary/10 shadow-lg scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300'
                }
            `}
    >
      {/* Category/Filter Trigger */}
      <div className="relative flex-shrink-0 border-r border-slate-100 pl-2">
        <button className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 rounded-l-xl transition-colors">
          <Filter className="size-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Smart Input */}
      <div className="flex-1 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className={`size-5 transition-colors ${isFocused ? 'text-primary' : ''}`} />
        </div>
        <input
          className="block w-full border-0 bg-transparent py-3 pl-10 pr-10 text-gray-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
          placeholder="Search "
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        {/* Clear Button */}
        {
  query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Location (Future Scope - Visual Only for now) */}
      <div className="hidden md:flex items-center border-l border-slate-100 px-3 py-2 text-slate-500 hover:text-primary cursor-pointer transition-colors">
        <MapPin className="size-4 mr-2" />
        <span className="text-sm font-medium">New York</span>
      </div>

      {/* Search Button */}
      <button className="m-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary/90 shadow-md">
        <Search className="size-5" />
      </button>

      {/* Suggestions Dropdown */}
      <SearchSuggestions
        results={results}
        isLoading={isLoading}
        visible={isFocused && (query.length > 0 || isLoading)}
        onSelect={handleSelectResult}
      />
    </div>
  );
}
