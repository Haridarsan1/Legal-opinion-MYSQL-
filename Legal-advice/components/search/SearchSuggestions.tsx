'use client';

import { SearchResult, GroupedResults } from '@/app/actions/searchActions';
import { User, Briefcase, ChevronRight, Search } from 'lucide-react';
import Image from 'next/image';

interface Props {
  results: GroupedResults;
  isLoading: boolean;
  onSelect: (result: SearchResult) => void;
  visible: boolean;
}

export default function SearchSuggestions({ results, isLoading, onSelect, visible }: Props) {
  if (!visible) return null;

  const hasResults =
    results.lawyers.length > 0 || results.practiceAreas.length > 0 || results.services.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
      {isLoading ? (
        <div className="p-4 flex items-center justify-center text-slate-500">
          <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
          Searching...
        </div>
      ) : !hasResults ? (
        <div className="p-4 text-center text-slate-500 text-sm">No results found.</div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {/* Practice Areas Section */}
          {results.practiceAreas.length > 0 && (
            <div className="py-2">
              <h3 className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Practice Areas
              </h3>
              <ul>
                {results.practiceAreas.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelect(item)}
                      className="w-full px-4 py-2 hover:bg-slate-50 flex items-center justify-between group transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Briefcase className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">Explore experts</p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lawyers Section */}
          {results.lawyers.length > 0 && (
            <div className="py-2 border-t border-slate-100">
              <h3 className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Legal Experts
              </h3>
              <ul>
                {results.lawyers.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelect(item)}
                      className="w-full px-4 py-2 hover:bg-slate-50 flex items-center justify-between group transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="size-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="size-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">{item.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Footer - Quick Actions */}
      <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Press <strong>Enter</strong> to search all results
        </span>
        <span className="flex items-center gap-2">
          Trending:{' '}
          <span className="font-medium text-primary cursor-pointer hover:underline">
            Property Dispute
          </span>
        </span>
      </div>
    </div>
  );
}
