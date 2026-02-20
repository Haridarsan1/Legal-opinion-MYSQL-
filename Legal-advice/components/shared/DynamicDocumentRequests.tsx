'use client';

import { useState } from 'react';
import { Plus, FileText, CheckCircle, Clock, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DocumentRequest {
  id: string;
  document_name: string;
  document_description: string | null;
  is_mandatory: boolean;
  is_submitted: boolean;
  submitted_document_id: string | null;
  requested_at: string;
  submitted_at: string | null;
}

interface DynamicDocumentRequestsProps {
  requestId: string;
  documentRequests: DocumentRequest[];
  userRole: 'lawyer' | 'client';
  canEdit: boolean;
}

export default function DynamicDocumentRequests({
  requestId,
  documentRequests,
  userRole,
  canEdit,
}: DynamicDocumentRequestsProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [isMandatory, setIsMandatory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDocument = async () => {
    if (!newDocName.trim()) {
      toast.error('Document name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/requests/document-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          documentName: newDocName,
          documentDescription: newDocDescription || null,
          isMandatory,
        }),
      });

      if (response.ok) {
        toast.success('Document request added');
        setNewDocName('');
        setNewDocDescription('');
        setIsMandatory(true);
        setShowAddForm(false);
        router.refresh();
      } else {
        toast.error('Failed to add document request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = async (docRequestId: string) => {
    if (!confirm('Remove this document request?')) return;

    try {
      const response = await fetch(`/api/requests/document-requests/${docRequestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Document request removed');
        router.refresh();
      } else {
        toast.error('Failed to remove document request');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const submittedCount = documentRequests.filter((d) => d.is_submitted).length;
  const totalCount = documentRequests.length;
  const progress = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Required Documents</h2>
            <p className="text-sm text-slate-600 mt-1">
              {userRole === 'lawyer'
                ? 'Request specific documents from the client'
                : 'Upload the documents requested by your lawyer'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {submittedCount}/{totalCount}
            </p>
            <p className="text-xs text-slate-500">Submitted</p>
          </div>
        </div>

        {/* Progress Bar */}
        {
  totalCount > 0 && (
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Document Requests List */}
        {
  documentRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="size-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-2">No documents requested yet</p>
            <p className="text-sm text-slate-500">
              {userRole === 'lawyer'
                ? 'Request documents from the client using the button below'
                : "Your lawyer hasn't requested any documents yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {documentRequests.map((docReq) => (
              <div
                key={docReq.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  docReq.is_submitted
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      docReq.is_submitted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {docReq.is_submitted ? (
                      <CheckCircle className="size-6" />
                    ) : (
                      <Clock className="size-6" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{docReq.document_name}</h3>
                          {docReq.is_mandatory && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                              Required
                            </span>
                          )}
                        </div>
                        {docReq.document_description && (
                          <p className="text-sm text-slate-600">{docReq.document_description}</p>
                        )}
                      </div>

                      {userRole === 'lawyer' && canEdit && !docReq.is_submitted && (
                        <button
                          onClick={() => handleDeleteRequest(docReq.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Remove request"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Requested {new Date(docReq.requested_at).toLocaleDateString()}</span>
                      {docReq.is_submitted && docReq.submitted_at && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-semibold">
                            Submitted {new Date(docReq.submitted_at).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {docReq.is_submitted && docReq.submitted_document_id && (
                      <div className="mt-3">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
                          <Download className="size-4" />
                          Download Submitted File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Document Request Form (Lawyer Only) */}
        {
  userRole === 'lawyer' && canEdit && (
          <div>
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 text-slate-600 hover:text-primary font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="size-5" />
                Request Additional Document
              </button>
            ) : (
              <div className="border-2 border-primary/30 rounded-xl p-5 bg-blue-50">
                <h3 className="font-bold text-slate-900 mb-4">Request New Document</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Document Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="e.g., Property Tax Receipt 2024"
                      className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newDocDescription}
                      onChange={(e) => setNewDocDescription(e.target.value)}
                      placeholder="Provide details about what should be included..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mandatory"
                      checked={isMandatory}
                      onChange={(e) => setIsMandatory(e.target.checked)}
                      className="size-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="mandatory" className="text-sm font-medium text-slate-700">
                      This document is mandatory
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddDocument}
                      disabled={isSubmitting || !newDocName.trim()}
                      className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Request'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewDocName('');
                        setNewDocDescription('');
                        setIsMandatory(true);
                      }}
                      disabled={isSubmitting}
                      className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-lg border border-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
