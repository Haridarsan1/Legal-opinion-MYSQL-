'use client';

import { useState } from 'react';
import { Upload, FileText, Trash2, Download, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { uploadDocument, deleteDocument } from '@/app/actions/requests';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface DocumentManagerProps {
  requestId: string;
  documents: any[];
  canUpload: boolean;
}

export default function DocumentManager({ requestId, documents, canUpload }: DocumentManagerProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const result = await uploadDocument(file, requestId);
        if (result.success) {
          toast.success(`${file.name} uploaded successfully`);
        } else {
          toast.error(`Failed to upload ${file.name}: ${result.error}`);
        }
      }
      router.refresh();
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (documentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    setDeletingIds((prev) => new Set(prev).add(documentId));

    const result = await deleteDocument(documentId);

    if (result.success) {
      toast.success('Document deleted successfully');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete document');
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(documentId);
      return next;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Documents</h2>
          <p className="text-sm text-slate-600">{documents.length} file(s) uploaded</p>
        </div>

        {canUpload && (
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors disabled:opacity-50">
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload Files</span>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      <div className="p-6">
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc: any) => {
              const isDeleting = deletingIds.has(doc.id);

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {doc.file_name || 'Document'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>
                          {doc.file_size
                            ? `${(doc.file_size / 1024).toFixed(1)} KB`
                            : 'Unknown size'}
                        </span>
                        <span>•</span>
                        <span>
                          {doc.uploaded_at
                            ? formatDistanceToNow(new Date(doc.uploaded_at), {
                                addSuffix: true,
                              })
                            : 'Recently uploaded'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.file_path && (
                      <a
                        href={doc.file_path}
                        download
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(doc.id, doc.file_name)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeleting ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm mb-2">No documents uploaded yet</p>
            {canUpload && (
              <p className="text-slate-400 text-xs">Click "Upload Files" to add documents</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
