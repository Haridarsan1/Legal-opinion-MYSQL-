import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Download, Upload, X, Eye, Check, Plus, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Modal from '@/components/shared/Modal';
import { requestRequiredDocuments, notifyDocumentsUploaded } from '@/app/actions/phase2_workflows';

interface Document {
  id: string;
  file_name: string;
  file_path?: string;
  file_url?: string;
  uploaded_at: string;
  document_type?: string;
  uploaded_by?: string;
  review_status?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  document_request_id?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  lawyer_comment?: string;
}

interface DocumentRequest {
  id: string;
  request_id: string;
  title: string;
  description?: string;
  requested_by: string;
  status: 'pending' | 'fulfilled';
  created_at: string;
}

interface Props {
  requestId: string;
  documents: Document[];
  documentRequests?: DocumentRequest[];
  userRole: 'client' | 'lawyer';
  userId: string;
  requestStatus: string;
}

export default function CaseDocuments({
  requestId,
  documents,
  documentRequests = [],
  userRole,
  userId,
  requestStatus,
}: Props) {
  const router = useRouter();
  // Initialize supabase client once per component mount
  const [supabase] = useState(() => createClient());

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Verification State
  const [verifyingDoc, setVerifyingDoc] = useState<string | null>(null);
  const [verifyComment, setVerifyComment] = useState('');

  // Request Document State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestDesc, setNewRequestDesc] = useState('');
  const [activeRequestUpload, setActiveRequestUpload] = useState<string | null>(null);

  const canUpload =
    userRole === 'client' ? ['submitted', 'assigned', 'in_review'].includes(requestStatus) : true; // Lawyers can always upload opinion documents

  // Generate signed URL for document preview
  const getSignedUrl = async (filePath: string) => {try {
      const { data, error } = await (await __getSupabaseClient()).storage
        .from('legal-documents')
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
  };

  const handleCreateRequest = async () => {if (!newRequestTitle.trim()) return;

    try {
      const { data, error } = (await __getSupabaseClient()).from('document_requests')
        .insert({
          request_id: requestId,
          title: newRequestTitle,
          description: newRequestDesc,
          requested_by: userId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document request:', error);
        toast.error(error.message || 'Failed to create request');
        return;
      }

      // TRIGGER STATUS UPDATE: Documents Requested
      await requestRequiredDocuments(requestId, `Requested: ${newRequestTitle}`);

      setIsRequestModalOpen(false);
      setNewRequestTitle('');
      setNewRequestDesc('');
      toast.success('Document request created');
      router.refresh();
    } catch (error) {
      console.error('Error creating document request:', error);
      toast.error('Failed to create request');
    }
  };

  const handleFileUpload = async (requestTargetId?: string) => {if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({});
    setCurrentUploadIndex(0);

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setCurrentUploadIndex(i + 1);
        const fileName = `${requestId}/${Date.now()}_${file.name}`;

        // Set progress to 0 when starting this file
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        // 1. Upload to Storage
        const { error: uploadError } = await (await __getSupabaseClient()).storage
          .from('legal-documents')
          .upload(fileName, file);

        // Set progress to 100 when file is uploaded
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

        if (uploadError) {
          console.error('Storage Upload Error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = (await __getSupabaseClient()).storage.from('legal-documents').getPublicUrl(fileName);

        // 2. Insert into DB
        const { error: dbError } = await (await __getSupabaseClient()).from('documents').insert({
          request_id: requestId,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          file_url: publicUrl,
          uploaded_by: userId,
          document_type: userRole === 'lawyer' ? 'legal_opinion' : 'supporting_document',
          review_status: 'pending',
          document_request_id: requestTargetId || null,
        });

        if (dbError) {
          console.error('Database Insert Error:', dbError);
          throw new Error(`Database save failed: ${dbError.message}`);
        }

        // 3. Update Request Status (if applicable)
        if (requestTargetId) {
          const { error: updateError } = (await __getSupabaseClient()).from('document_requests')
            .update({ status: 'fulfilled' })
            .eq('id', requestTargetId);

          if (updateError) {
            console.error('Status Update Error:', updateError);
            // Don't throw here, as file is already uploaded
            toast.error('File uploaded but status update failed');
          }
        }
      }

      // TRIGGER STATUS UPDATE: Documents Uploaded
      if (userRole === 'client') {
        await notifyDocumentsUploaded(requestId);
      }

      setUploadedFiles([]);
      setActiveRequestUpload(null);
      setUploadProgress({});
      setCurrentUploadIndex(0);
      toast.success('Documents uploaded successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      setCurrentUploadIndex(0);
    }
  };

  const handleVerifyDocument = async (documentId: string, status: 'verified' | 'rejected') => {if (userRole !== 'lawyer') return;

    try {
      const { data, error } = (await __getSupabaseClient()).from('documents')
        .update({
          verification_status: status,
          verified_by: userId,
          verified_at: new Date().toISOString(),
          lawyer_comment: verifyComment.trim() || null,
        })
        .eq('id', documentId)
        .select();

      if (error) {
        console.error('Verification error:', error);
        toast.error(
          `Failed to ${status === 'verified' ? 'verify' : 'reject'} document: ${error.message}`
        );
        return;
      }

      console.log('Document verification response:', data);
      toast.success(`Document ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
      setVerifyingDoc(null);
      setVerifyComment('');
      router.refresh();
    } catch (error: any) {
      console.error('Error verifying document:', error);
      toast.error(error?.message || 'Failed to update document status');
    }
  };

  const supportingDocs = documents.filter(
    (d) => d.document_type !== 'opinion' && !d.document_request_id
  );
  const opinionDocs = documents.filter((d: any) => d.document_type === 'opinion');
  const requestedDocs = documentRequests;

  return (
    <div className="space-y-8">
      {/* Requested Documents Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Requested Documents</h3>
          {userRole === 'lawyer' && (
            <>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Request Document
              </button>

              <Modal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                title="Request Document from Client"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                      Document Title
                    </label>
                    <input
                      id="title"
                      placeholder="e.g. Bank Statement, ID Proof"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newRequestTitle}
                      onChange={(e) => setNewRequestTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="desc" className="block text-sm font-medium text-slate-700">
                      Description (Optional)
                    </label>
                    <input
                      id="desc"
                      placeholder="Additional details..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newRequestDesc}
                      onChange={(e) => setNewRequestDesc(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setIsRequestModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRequest}
                      className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              </Modal>
            </>
          )}
        </div>

        {requestedDocs.length > 0 ? (
          <div className="space-y-3">
            {requestedDocs.map((req: any) => {
              const relatedDocs = documents.filter((d: any) => d.document_request_id === req.id);
              const isFulfilled = req.status === 'fulfilled' || relatedDocs.length > 0;

              return (
                <div
                  key={req.id}
                  className={`border rounded-xl p-4 ${isFulfilled ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{req.title}</h4>
                        {isFulfilled ? (
                          <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                            Fulfilled
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-sm text-slate-600 mt-1">{req.description}</p>
                      )}
                    </div>
                    {userRole === 'client' && !isFulfilled && (
                      <button
                        onClick={() => {
                          setActiveRequestUpload(req.id);
                          setUploadedFiles([]);
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Upload
                      </button>
                    )}
                  </div>

                  {/* Uploaded files for this request */}
                  {
  relatedDocs.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-slate-300">
                      {relatedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">{doc.file_name}</span>
                          </div>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area for specific request */}
                  {
  activeRequestUpload === req.id && (
                    <div className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-blue-300">
                      <div className="mb-4">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              setUploadedFiles((prev) => [
                                ...prev,
                                ...Array.from(e.target.files || []),
                              ]);
                            }
                          }}
                          className="block w-full text-sm text-slate-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700
                                                        hover:file:bg-blue-100 mb-2"
                        />
                        <p className="text-xs text-slate-500 mb-4">
                          Select files to upload. You can select multiple files or add more after
                          selection.
                        </p>

                        {/* Selected Files List */}
                        {
  uploadedFiles.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                              >
                                <button
                                  onClick={() => {
                                    setPreviewFile(file);
                                    const url = URL.createObjectURL(file);
                                    setPreviewUrl(url);
                                  }}
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline flex-1 truncate"
                                >
                                  <Eye className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                </button>
                                <button
                                  onClick={() =>
                                    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
                                  }
                                  className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setActiveRequestUpload(null);
                            setUploadedFiles([]);
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleFileUpload(req.id)}
                          disabled={uploadedFiles.length === 0 || isUploading}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isUploading
                            ? 'Uploading...'
                            : `Submit ${uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''} Documents`}
                        </button>
                      </div>

                      {/* Upload Progress for Requested Docs */}
                      {
  isUploading && Object.keys(uploadProgress).length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-blue-900">
                              Uploading {currentUploadIndex} of {uploadedFiles.length} files
                            </p>
                            <p className="text-xs text-blue-600">
                              {Math.round((currentUploadIndex / uploadedFiles.length) * 100)}%
                              Complete
                            </p>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(uploadProgress).map(([fileName, percentage]) => (
                              <div key={fileName} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-slate-700 truncate max-w-[70%]">
                                    {fileName}
                                  </span>
                                  <span className="text-xs font-semibold text-blue-600">
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No specific documents requested.</p>
          </div>
        )}
      </div>

      {/* General Upload Section */}
      {
  canUpload && (
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            General {userRole === 'lawyer' ? 'Opinion' : 'Supporting'} Documents
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                }
              }}
              className="hidden"
              id="doc-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label htmlFor="doc-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                Click to upload general documents
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG up to 10MB each
              </p>
            </label>
          </div>

          {uploadedFiles.length > 0 && !activeRequestUpload && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <button
                    onClick={() => {
                      setPreviewFile(file);
                      const url = URL.createObjectURL(file);
                      setPreviewUrl(url);
                    }}
                    className="flex-1 text-left text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {file.name}
                  </button>
                  <button
                    onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Upload Progress Bars */}
              {
  isUploading && Object.keys(uploadProgress).length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-blue-900">
                      Uploading {currentUploadIndex} of {uploadedFiles.length} files
                    </p>
                    <p className="text-xs text-blue-600">
                      {Math.round((currentUploadIndex / uploadedFiles.length) * 100)}% Complete
                    </p>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([fileName, percentage]) => (
                      <div key={fileName} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-700 truncate max-w-[70%]">
                            {fileName}
                          </span>
                          <span className="text-xs font-semibold text-blue-600">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setUploadedFiles([])}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFileUpload()}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} file(s)`}
                </button>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {
  previewFile && previewUrl && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setPreviewFile(null);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}
            >
              <div
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{previewFile.name}</h3>
                  <button
                    onClick={() => {
                      setPreviewFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-slate-50">
                  {previewFile.type.startsWith('image/') ? (
                    <img
                      src={previewUrl}
                      alt={previewFile.name}
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                  ) : previewFile.type === 'application/pdf' ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-[70vh] rounded-lg shadow-lg"
                      title={previewFile.name}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">
                        Preview not available for this file type
                      </p>
                      <a
                        href={previewUrl}
                        download={previewFile.name}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Document Preview Modal */}
          {
  previewDocument && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setPreviewDocument(null);
                setPreviewDocUrl(null);
              }}
            >
              <div
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {previewDocument.file_name}
                  </h3>
                  <button
                    onClick={() => {
                      setPreviewDocument(null);
                      setPreviewDocUrl(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-slate-50">
                  {previewDocument.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={previewDocument.file_url}
                      alt={previewDocument.file_name}
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                  ) : previewDocument.file_name.match(/\.pdf$/i) ? (
                    <iframe
                      src={previewDocument.file_url}
                      className="w-full h-[70vh] rounded-lg shadow-lg"
                      title={previewDocument.file_name}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">
                        Preview not available for this file type
                      </p>
                      <a
                        href={previewDocUrl || undefined}
                        download={previewDocument.file_name}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supporting Documents (Unsolicited) */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Other Supporting Documents</h3>
        {supportingDocs.length > 0 ? (
          <div className="space-y-3">
            {supportingDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-slate-50 rounded-xl hover:bg-white transition-colors border border-slate-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <button
                        onClick={async () => {
                          if (doc.file_path) {
                            setPreviewDocument(doc);
                            setLoadingPreview(true);
                            const signedUrl = await getSignedUrl(doc.file_path);
                            setPreviewDocUrl(signedUrl);
                            setLoadingPreview(false);
                          }
                        }}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {doc.file_name}
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                        </p>
                        {/* Verification Status Badge */}
                        {
  doc.verification_status && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              doc.verification_status === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : doc.verification_status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {doc.verification_status === 'verified' && '✓ Verified'}
                            {
  doc.verification_status === 'rejected' && '✗ Rejected'}
                            {
  doc.verification_status === 'pending' && '⏳ Pending Verification'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Lawyer Comment Display */}
                {
  doc.lawyer_comment && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Lawyer Comment:</p>
                    <p className="text-sm text-slate-700">{doc.lawyer_comment}</p>
                  </div>
                )}

                {/* Verification Actions (Lawyer Only) */}
                {
  userRole === 'lawyer' &&
                  (!doc.verification_status || doc.verification_status === 'pending') &&
                  (verifyingDoc === doc.id ? (
                    <div className="mt-3 space-y-3 p-3 bg-white rounded-lg border-2 border-blue-200">
                      <textarea
                        value={verifyComment}
                        onChange={(e) => setVerifyComment(e.target.value)}
                        placeholder="Add comment (optional)..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyDocument(doc.id, 'verified')}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✓ Verify
                        </button>
                        <button
                          onClick={() => handleVerifyDocument(doc.id, 'rejected')}
                          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ✗ Reject
                        </button>
                        <button
                          onClick={() => {
                            setVerifyingDoc(null);
                            setVerifyComment('');
                          }}
                          className="px-3 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setVerifyingDoc(doc.id)}
                      className="mt-3 w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Review Document
                    </button>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No general documents uploaded.</p>
          </div>
        )}
      </div>

      {/* Opinion Documents */}
      {
  opinionDocs.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Opinion Documents</h3>
          <div className="space-y-3">
            {opinionDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{doc.file_name}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
