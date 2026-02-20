'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Plus, X, Tag, Star, Copy, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Clause {
  id: string;
  title: string;
  content: string;
  category?: string;
  department?: string;
  tags?: string[];
  usage_count: number;
  is_approved: boolean;
}

interface Props {
  onInsert?: (content: string, clauseId: string) => void;
  department?: string;
}

export default function ClauseLibraryBrowser({ onInsert, department }: Props) {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [filteredClauses, setFilteredClauses] = useState<Clause[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadClauses();
  }, [department]);

  useEffect(() => {
    filterClauses();
  }, [searchQuery, selectedCategory, clauses]);

  const loadClauses = async () => {
    try {
      let query = supabase
        .from('legal_clauses')
        .select('*')
        .eq('is_approved', true)
        .order('usage_count', { ascending: false });

      if (department) {
        query = query.eq('department', department);
      }

      const { data, error } = await query;

      if (error) throw error;

      setClauses(data || []);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set((data || []).map((c) => c.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading clauses:', error);
      toast.error('Failed to load clause library');
    } finally {
      setLoading(false);
    }
  };

  const filterClauses = () => {
    let filtered = clauses;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.content.toLowerCase().includes(query) ||
          c.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredClauses(filtered);
  };

  const handleInsertClause = async (clause: Clause) => {
    if (onInsert) {
      onInsert(clause.content, clause.id);
      toast.success(`Inserted: ${clause.title}`);
      setSelectedClause(null);
    }
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm text-slate-600 mt-3">Loading clause library...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Clause Library</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses by title, content, or tags..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({clauses.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}(
              {clauses.filter((c) => c.category === category).length})
            </button>
          ))}
        </div>
      </div>

      {/* Clause List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredClauses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {searchQuery || selectedCategory !== 'all'
                ? 'No clauses match your filters'
                : 'No approved clauses available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredClauses.map((clause) => (
              <div
                key={clause.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => setSelectedClause(clause)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{clause.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Star className="w-3 h-3" />
                    {clause.usage_count}
                  </div>
                </div>

                <p className="text-sm text-slate-700 line-clamp-2 mb-2">{clause.content}</p>

                <div className="flex flex-wrap gap-1">
                  {clause.category && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {clause.category}
                    </span>
                  )}
                  {clause.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedClause && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedClause.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClause.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                        {selectedClause.category}
                      </span>
                    )}
                    {selectedClause.department && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                        {selectedClause.department}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                      Used {selectedClause.usage_count} times
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClause(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedClause.content}
                </p>
              </div>

              {selectedClause.tags && selectedClause.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedClause.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => handleCopyToClipboard(selectedClause.content)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              {onInsert && (
                <button
                  onClick={() => handleInsertClause(selectedClause)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Insert into Opinion
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
