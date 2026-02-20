import { useState } from 'react';
import { FileText, Download, ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Props {
  documents: any[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
}

export default function CaseDocsTab({ documents, viewMode, searchQuery }: Props) {
  const filteredDocs = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.file_name?.toLowerCase().includes(searchLower) ||
      doc.request?.request_number?.toLowerCase().includes(searchLower) ||
      doc.document_type?.toLowerCase().includes(searchLower)
    );
  });

  if (filteredDocs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {searchQuery ? 'No case documents found' : 'No case documents yet'}
        </h3>
        <p className="text-slate-600">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Case documents from your assigned cases will appear here'}
        </p>
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
                Document Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Case Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Reviewed
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <CaseDocRow key={doc.id} document={doc} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseDocRow({ document }: { document: any }) {
  const [isReviewed, setIsReviewed] = useState(false);

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
        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded capitalize">
          {document.document_type?.replace(/_/g, ' ') || 'document'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
      </td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={() => setIsReviewed(!isReviewed)}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          {isReviewed ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600">Reviewed</span>
            </>
          ) : (
            <>
              <Circle className="w-5 h-5 text-slate-400" />
              <span className="text-slate-500">Mark as reviewed</span>
            </>
          )}
        </button>
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
