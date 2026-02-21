'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import DocumentActions from './DocumentActions';
import DocumentPreview from './DocumentPreview';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  document: any;
  userId: string;
  lawyerProfile: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function DocumentRow({ document, userId, lawyerProfile }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
    const handleMarkReviewed = async () => {
    const { error } = await (await __getSupabaseClient()).from('documents')
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
      setShowPreview(false);
    }
  };

  // File size formatting
  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Status badge
  const getStatusBadge = () => {
    const status = document.review_status;

    if (status === 'reviewed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle className="w-3.5 h-3.5" />
          Reviewed
        </span>
      );
    }

    if (status === 'needs_clarification') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          <AlertCircle className="w-3.5 h-3.5" />
          Needs Clarification
        </span>
      );
    }

    if (status === 'under_review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          <Calendar className="w-3.5 h-3.5" />
          Under Review
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <FileText className="w-3.5 h-3.5" />
        Uploaded
      </span>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
      {/* Document Info */}
      <div className="col-span-4 flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900 truncate mb-0.5">{document.file_name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{formatFileSize(document.file_size)}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Case Info */}
      <div className="col-span-3 flex items-center">
        <div>
          <Link
            href={`/case/${document.request_id}`}
            className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group mb-0.5"
          >
            {document.request?.request_number}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <p className="text-xs text-slate-500 truncate">{document.request?.client?.full_name}</p>
          {document.request?.department && (
            <p className="text-xs text-slate-400 truncate">{document.request.department.name}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="col-span-2 flex items-center">{getStatusBadge()}</div>

      {/* Reviewer */}
      <div className="col-span-2 flex items-center">
        {document.reviewed_by && document.reviewer ? (
          <div className="flex items-center gap-2">
            {document.reviewer.avatar_url ? (
              <Image
                src={document.reviewer.avatar_url}
                alt={document.reviewer.full_name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-500" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">
                {document.reviewer.full_name}
              </p>
              <p className="text-xs text-slate-500">
                {format(new Date(document.reviewed_at), 'MMM d')}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Not reviewed</span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-slate-600" />
        </button>

        {showActions && (
          <DocumentActions
            document={document}
            userId={userId}
            onClose={() => setShowActions(false)}
            onPreview={() => {
              setShowPreview(true);
              setShowActions(false);
            }}
          />
        )}
      </div>

      {/* Preview Modal */}
      {
  showPreview && (
        <DocumentPreview
          document={document}
          onClose={() => setShowPreview(false)}
          onMarkReviewed={handleMarkReviewed}
        />
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
