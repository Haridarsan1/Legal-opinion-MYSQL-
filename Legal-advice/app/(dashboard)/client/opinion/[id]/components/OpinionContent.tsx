'use client';

import { useState } from 'react';
import { FileText, Copy, Check, Printer, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  opinionText: string;
  submittedAt: string;
}

export default function OpinionContent({ opinionText, submittedAt }: Props) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(opinionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
                <html>
                    <head>
                        <title>Legal Opinion</title>
                        <style>
                            body { font-family: Georgia, serif; line-height: 1.8; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { font-size: 24px; margin-bottom: 20px; }
                            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
                            .content { white-space: pre-wrap; }
                        </style>
                    </head>
                    <body>
                        <h1>Legal Opinion</h1>
                        <div class="meta">Submitted: ${format(new Date(submittedAt), 'MMMM dd, yyyy')}</div>
                        <div class="content">${opinionText}</div>
                    </body>
                </html>
            `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-bold text-slate-900">Legal Opinion</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search in opinion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
              title="Print opinion"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        <div className="prose prose-slate max-w-none">
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-serif text-base sm:text-lg">
            {searchQuery ? highlightText(opinionText, searchQuery) : opinionText}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500 text-center">
          This legal opinion is confidential and for the intended recipient only.
        </p>
      </div>
    </div>
  );
}
