'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface Props {
  requestId: string;
  currentPdfUrl?: string | null;
  onUploadComplete: (url: string) => void;
  isLawyer: boolean;
  disabled?: boolean;
}

export default function OpinionPDFUploader({
  requestId,
  currentPdfUrl,
  onUploadComplete,
  isLawyer,
  disabled = false,
}: Props) {const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setUploadError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileName = `${requestId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('opinion-pdfs').upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('opinion-pdfs').getPublicUrl(fileName);

      onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      setUploadError(error.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {isLawyer && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Upload Opinion PDF</h3>
              <p className="text-slate-500 text-sm">
                Upload a PDF version of the legal opinion. This will be visible to the client.
              </p>
            </div>
            {currentPdfUrl && (
              <a
                href={currentPdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4 rotate-180" />
                Download PDF
              </a>
            )}
          </div>

          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || disabled}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Choose PDF'}
            </button>
            {uploadError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <X className="w-4 h-4" />
                {uploadError}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
        {currentPdfUrl ? (
          <iframe
            src={`${currentPdfUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title="Legal Opinion PDF"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No PDF uploaded yet</p>
            {isLawyer && <p className="text-sm">Upload a PDF to see it here</p>}
          </div>
        )}
      </div>
    </div>
  );
}
