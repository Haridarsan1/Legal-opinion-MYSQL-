'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, File, FileCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

interface FileUploadProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  bucketName?: string;
  folder?: string;
  className?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

export default function FileUpload({
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  bucketName = 'documents',
  folder = 'uploads',
  className,
}: FileUploadProps) {const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // Validate file count
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = newFiles.filter((file) => {
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name}: File size exceeds ${maxSizeMB}MB`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('No files selected');
      return;
    }

    setUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    try {
      for (const file of files) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(filePath);

        uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          path: filePath,
        });
      }

      if (uploadedFiles.length > 0) {
        toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
        onUploadComplete(uploadedFiles);
        setFiles([]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 text-center transition-all',
          dragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary/50',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Upload className="size-6 text-slate-400" />
          </div>
          <div>
            <p className="text-slate-700 font-semibold mb-1">
              Drag and drop files here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
                type="button"
              >
                browse
              </button>
            </p>
            <p className="text-slate-500 text-xs">
              Max {maxFiles} files, {maxSizeMB}MB each. PDF, JPG, PNG, DOC, DOCX accepted.
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {
  files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="size-5 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}

          {/* Upload Button */}
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {uploading ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileCheck className="size-5" />
                Upload {files.length} File{files.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
