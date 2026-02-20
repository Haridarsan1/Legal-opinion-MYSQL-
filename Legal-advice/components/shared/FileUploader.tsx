'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface FileUploaderProps {
  onUpload?: (files: File[]) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  checklist?: string[];
}

export default function FileUploader({
  onUpload,
  maxFileSize = 10,
  acceptedTypes = ['PDF', 'JPG', 'PNG', 'DOCX'],
  checklist = [],
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [onUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    if (onUpload) {
      onUpload(files);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'text-red-600 bg-red-100';
    if (type.includes('image')) return 'text-blue-600 bg-blue-100';
    if (type.includes('word') || type.includes('document')) return 'text-blue-600 bg-blue-100';
    return 'text-slate-600 bg-slate-100';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drag & Drop Zone */}
      <div
        className={`w-full relative group ${isDragging ? 'scale-[1.02]' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          multiple
          type="file"
          onChange={handleFileSelect}
          accept={acceptedTypes.map((t) => `.${t.toLowerCase()}`).join(',')}
        />
        <div
          className={`flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-slate-300 bg-slate-50 group-hover:bg-primary/5 group-hover:border-primary/50'
          }`}
        >
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Upload className="size-8" />
          </div>
          <p className="text-lg font-semibold text-slate-900 mb-1">
            <span className="text-primary hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-slate-500">
            {acceptedTypes.join(', ')} (max. {maxFileSize}MB each)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {
  uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`size-10 rounded-lg flex items-center justify-center ${getFileIcon(
                    file.type
                  )}`}
                >
                  <FileText className="size-5" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)} • Uploaded just now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-success flex-shrink-0" />
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-slate-400 hover:text-danger transition-colors p-1"
                  aria-label="Remove file"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checklist (if provided) */}
      {
  checklist.length > 0 && (
        <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">task_alt</span>
            Recommended Documents
          </h4>
          <ul className="flex flex-col gap-2">
            {checklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <div className="size-4 rounded-full border-2 border-slate-300 mt-0.5 flex-shrink-0"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
