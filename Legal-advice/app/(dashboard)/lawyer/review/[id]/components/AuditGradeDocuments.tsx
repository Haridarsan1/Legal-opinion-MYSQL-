'use client';

import { FileText, CheckCircle, Download, Eye, Clock, User, FileWarning } from 'lucide-react';
import { DocumentWithReview } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface AuditGradeDocumentsProps {
  documents: DocumentWithReview[];
  requiredDocuments: string[];
  onMarkReviewed: (documentId: string, requestId: string) => Promise<void>;
  onUnmarkReviewed: (documentId: string, requestId: string) => Promise<void>;
  requestId: string;
}

export default function AuditGradeDocuments({
  documents,
  requiredDocuments,
  onMarkReviewed,
  onUnmarkReviewed,
  requestId,
}: AuditGradeDocumentsProps) {
  const [togglingDoc, setTogglingDoc] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentWithReview | null>(null);

  const handleToggleReview = async (doc: DocumentWithReview) => {
    setTogglingDoc(doc.id);
    try {
      if (doc.review_status === 'reviewed') {
        await onUnmarkReviewed(doc.id, requestId);
      } else {
        await onMarkReviewed(doc.id, requestId);
      }
    } finally {
      setTogglingDoc(null);
    }
  };

  // Group documents by type
  const groupedDocs = documents.reduce(
    (acc, doc) => {
      const type = (doc as any).document_type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(doc);
      return acc;
    },
    {} as Record<string, DocumentWithReview[]>
  );

  // Check which required documents are uploaded
  const documentChecklist = requiredDocuments.map((reqDoc) => {
    const uploaded = documents.some(
      (doc) =>
        (doc as any).document_type?.toLowerCase().includes(reqDoc.toLowerCase()) ||
        doc.file_name?.toLowerCase().includes(reqDoc.toLowerCase())
    );
    const reviewed = documents.some(
      (doc) =>
        ((doc as any).document_type?.toLowerCase().includes(reqDoc.toLowerCase()) ||
          doc.file_name?.toLowerCase().includes(reqDoc.toLowerCase())) &&
        doc.review_status === 'reviewed'
    );
    return { name: reqDoc, uploaded, reviewed };
  });

  const totalDocs = documents.length;
  const reviewedDocs = documents.filter((d) => d.review_status === 'reviewed').length;
  const reviewProgress = totalDocs > 0 ? (reviewedDocs / totalDocs) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Documents Review</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {reviewedDocs}/{totalDocs}
            </p>
            <p className="text-xs text-slate-500">Documents Reviewed</p>
          </div>
        </div>

        {/* Review Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600">Review Progress</span>
            <span className="text-xs font-medium text-slate-600">
              {Math.round(reviewProgress)}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${reviewProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Required Documents Checklist */}
        {
  requiredDocuments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Required Documents Checklist
            </h3>
            <div className="space-y-2">
              {documentChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    item.reviewed
                      ? 'border-green-200 bg-green-50'
                      : item.uploaded
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {item.reviewed ? (
                    <CheckCircle className="size-5 text-green-600 flex-shrink-0" />
                  ) : item.uploaded ? (
                    <FileText className="size-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <FileWarning className="size-5 text-slate-400 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm font-medium flex-1 ${
                      item.reviewed
                        ? 'text-green-700'
                        : item.uploaded
                          ? 'text-blue-700'
                          : 'text-slate-500'
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.reviewed && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      Reviewed
                    </span>
                  )}
                  {
  item.uploaded && !item.reviewed && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Uploaded
                    </span>
                  )}
                  {!item.uploaded && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      Missing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Documents List */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            All Uploaded Documents ({documents.length})
          </h3>

          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => {
                const isReviewed = doc.review_status === 'reviewed';
                const isToggling = togglingDoc === doc.id;

                return (
                  <div
                    key={doc.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                      isReviewed
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {/* Document Icon */}
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        isReviewed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <FileText className="size-5" />
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {doc.file_name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="capitalize">
                              {(doc as any).document_type?.replace(/_/g, ' ') || 'Document'}
                            </span>
                            <span>•</span>
                            <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                            {doc.version && doc.version > 1 && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-blue-600">
                                  v{doc.version}
                                  {(doc as any).is_latest && (
                                    <span className="ml-1 text-[10px] bg-blue-100 px-1.5 py-0.5 rounded">
                                      LATEST
                                    </span>
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <User className="size-3" />
                          <span>Uploaded by {(doc as any).uploader?.full_name || 'Client'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="size-3" />
                          <span>
                            {(doc as any).uploaded_at
                              ? formatDistanceToNow(new Date((doc as any).uploaded_at), {
                                  addSuffix: true,
                                })
                              : 'Recently'}
                          </span>
                        </div>
                      </div>

                      {/* Review Status */}
                      {
  isReviewed && doc.reviewer && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-700">
                          <CheckCircle className="size-3.5" />
                          <span>
                            Reviewed by {doc.reviewer.full_name}
                            {
  doc.reviewed_at &&
                              ` ${formatDistanceToNow(new Date(doc.reviewed_at), { addSuffix: true })}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleReview(doc)}
                        disabled={isToggling}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          isReviewed
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isToggling ? (
                          <span className="animate-spin">⏳</span>
                        ) : isReviewed ? (
                          <>
                            <CheckCircle className="size-3.5" />
                            Reviewed
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" />
                            Mark Reviewed
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Preview document"
                      >
                        <Eye className="size-4" />
                      </button>

                      <button
                        className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Download document"
                      >
                        <Download className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <FileWarning className="size-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal (Simple placeholder) */}
      {
  previewDoc && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Document Preview</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="text-center py-8">
              <FileText className="size-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">{previewDoc.file_name}</p>
              <p className="text-sm text-slate-500">
                PDF preview will be implemented with iframe or viewer
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
