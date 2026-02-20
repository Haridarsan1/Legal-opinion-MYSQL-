import { FileText, Download, ExternalLink, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Props {
  documents: any[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
}

export default function OpinionsTab({ documents, viewMode, searchQuery }: Props) {
  const filteredDocs = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.file_name?.toLowerCase().includes(searchLower) ||
      doc.practice_area?.toLowerCase().includes(searchLower) ||
      doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
      doc.request?.request_number?.toLowerCase().includes(searchLower)
    );
  });

  if (filteredDocs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {searchQuery ? 'No opinions found' : 'No legal opinions yet'}
        </h3>
        <p className="text-slate-600">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Your submitted legal opinions will appear here'}
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <OpinionCard key={doc.id} document={doc} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Opinion Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Case
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Practice Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <OpinionRow key={doc.id} document={doc} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpinionCard({ document }: { document: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1 truncate">{document.file_name}</h3>
          {document.request && (
            <Link
              href={`/lawyer/review/${document.request.id}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {document.request.request_number}
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {document.practice_area && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              {document.practice_area}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {document.opinion_type && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                document.opinion_type === 'final'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {document.opinion_type === 'final' ? 'Final Opinion' : 'Preliminary'}
            </span>
          )}
          {
  document.version && (
            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
              {document.version}
            </span>
          )}
          {
  document.status && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                document.status === 'final'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {document.status}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
        </span>
        <a
          href={`/api/download/${document.id}`}
          className="p-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function OpinionRow({ document }: { document: any }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-900">{document.file_name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {document.request ? (
          <Link
            href={`/lawyer/review/${document.request.id}`}
            className="text-primary hover:underline flex items-center gap-1"
          >
            {document.request.request_number}
            <ExternalLink className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {document.practice_area ? (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
            {document.practice_area}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {document.opinion_type ? (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              document.opinion_type === 'final'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {document.opinion_type === 'final' ? 'Final' : 'Preliminary'}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {document.status ? (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              document.status === 'final'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {document.status}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
      </td>
      <td className="px-6 py-4 text-right">
        <a
          href={`/api/download/${document.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      </td>
    </tr>
  );
}
