'use client';

import { useState } from 'react';
import { FileText, Download, Eye, X, FileIcon, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  document_type?: string;
  created_at: string;
  uploaded_by: string;
}

interface Props {
  documents: Document[];
  requestId: string;
}

export default function SupportingDocuments({ documents, requestId }: Props) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️';
    return '📎';
  };

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    if (filterType === 'all') return true;
    return doc.document_type === filterType;
  });

  // Get unique document types for filter
  const documentTypes = Array.from(new Set(documents.map((d: any) => d.document_type || 'other')));

  const handleDownloadAll = async () => {
    // Download all documents (in a real app, you'd create a zip file)
    documents.forEach((doc) => {
      const link = document.createElement('a');
      link.href = doc.file_url;
      link.download = doc.file_name;
      link.click();
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileIcon className="w-5 h-5 text-slate-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Supporting Documents</h2>
              <p className="text-sm text-slate-500">{documents.length} documents attached</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter */}
            {
  documentTypes.length > 1 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Download All */}
            {
  documents.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="p-6">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="group p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{getFileIcon(doc.file_name)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate mb-1">
                      {doc.file_name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">{formatFileSize(doc.file_size)}</p>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <a
                    href={doc.file_url}
                    download={doc.file_name}
                    className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {
  selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900">{selectedDocument.file_name}</h3>
                <p className="text-sm text-slate-500">
                  {formatFileSize(selectedDocument.file_size)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {selectedDocument.file_name.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedDocument.file_url}
                  className="w-full h-[600px] rounded-lg border border-slate-200"
                  title={selectedDocument.file_name}
                />
              ) : selectedDocument.file_name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={selectedDocument.file_url}
                  alt={selectedDocument.file_name}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Preview not available for this file type</p>
                  <a
                    href={selectedDocument.file_url}
                    download={selectedDocument.file_name}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <Download className="w-5 h-5" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
