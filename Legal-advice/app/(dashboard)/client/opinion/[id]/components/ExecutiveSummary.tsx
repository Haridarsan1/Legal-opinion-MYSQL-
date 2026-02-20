'use client';

import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  summary: string;
}

export default function ExecutiveSummary({ summary }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if summary is long (more than 500 chars)
  const isLong = summary.length > 500;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Executive Summary</h2>
              <p className="text-sm text-slate-600">Plain-language overview</p>
            </div>
          </div>
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium text-slate-700"
            >
              {isExpanded ? (
                <>
                  <span>Collapse</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Expand</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        <div
          className={`prose prose-slate max-w-none transition-all duration-300 ${
            !isExpanded && isLong ? 'line-clamp-6' : ''
          }`}
        >
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
        </div>

        {!isExpanded && isLong && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            Read full summary
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
