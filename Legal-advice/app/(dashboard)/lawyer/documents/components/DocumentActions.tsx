'use client';

import { useEffect, useRef } from 'react';
import { Eye, Download, ExternalLink, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  document: any;
  userId: string;
  onClose: () => void;
  onPreview: () => void;
}

export default function DocumentActions({ document, userId, onClose, onPreview }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
    // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    globalThis.document.addEventListener('mousedown', handleClickOutside);
    return () => globalThis.document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkReviewed = async () => {
    const { error } = await supabase
      .from('documents')
      .update({
        review_status: 'reviewed',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', document.id);

    if (error) {
      console.error('Error marking as reviewed:', error);
      alert('Failed to mark as reviewed');
    } else {
      router.refresh();
      onClose();
    }
  };

  const handleRequestClarification = () => {
    router.push(`/case/${document.request_id}?tab=clarifications`);
    onClose();
  };

  const handleDownload = () => {
    window.open(document.file_url, '_blank');
    onClose();
  };

  const isReviewed = document.review_status === 'reviewed';
  const canDelete = document.uploaded_by === userId;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10"
    >
      {/* Preview */}
      <button
        onClick={onPreview}
        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Preview Document
      </button>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download
      </button>

      {/* Open Case */}
      <Link
        href={`/case/${document.request_id}`}
        className="w-full block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        onClick={onClose}
      >
        <ExternalLink className="w-4 h-4" />
        Open Case
      </Link>

      <div className="border-t border-slate-100 my-1" />

      {/* Mark as Reviewed */}
      {!isReviewed && (
        <button
          onClick={handleMarkReviewed}
          className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Mark as Reviewed
        </button>
      )}

      {/* Request Clarification */}
      <button
        onClick={handleRequestClarification}
        className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2"
      >
        <AlertCircle className="w-4 h-4" />
        Request Clarification
      </button>

      {/* Delete (if lawyer uploaded) */}
      {
  canDelete && (
        <>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this document?')) {
                // TODO: Implement delete
                onClose();
              }
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </>
      )}
    </div>
  );
}
