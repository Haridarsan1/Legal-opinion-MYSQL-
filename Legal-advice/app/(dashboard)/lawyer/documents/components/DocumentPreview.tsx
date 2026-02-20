'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
  MessageCircle,
  Clock,
  Upload,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

interface Props {
  document: any;
  onClose: () => void;
  onMarkReviewed?: () => void;
}

export default function DocumentPreview({ document, onClose, onMarkReviewed }: Props) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [internalNote, setInternalNote] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    globalThis.document.addEventListener('keydown', handleEscape);
    return () => globalThis.document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Determine file type
  const fileUrl = document.file_url;
  const fileName = document.file_name?.toLowerCase() || '';
  const isPDF = fileName.endsWith('.pdf');
  const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isReviewed = document.review_status === 'reviewed';

  // Get file type badge
  const getFileTypeBadge = () => {
    if (isPDF) return { label: 'PDF', color: 'bg-red-100 text-red-700' };
    if (isImage) return { label: 'Image', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Document', color: 'bg-slate-100 text-slate-700' };
  };

  const fileType = getFileTypeBadge();

  // Review intelligence
  const getReviewIntelligence = () => {
    if (isReviewed) {
      return {
        type: 'success',
        title: 'Reviewed',
        message: 'This document has been reviewed and approved.',
        icon: CheckCircle,
        color: 'bg-green-50 border-green-200 text-green-700',
      };
    }

    if (document.review_status === 'needs_clarification') {
      return {
        type: 'warning',
        title: 'Clarification Needed',
        message: 'This document requires clarification from the client.',
        icon: AlertCircle,
        color: 'bg-orange-50 border-orange-200 text-orange-700',
      };
    }

    return {
      type: 'pending',
      title: 'Review Required',
      message: 'This document needs your review. Please verify and mark as reviewed.',
      icon: Clock,
      color: 'bg-amber-50 border-amber-200 text-amber-700',
    };
  };

  const intelligence = getReviewIntelligence();
  const IntelligenceIcon = intelligence.icon;

  // Mock activity timeline
  const activities = [
    {
      id: 1,
      type: 'uploaded',
      actor: document.uploader?.full_name || 'Client',
      timestamp: document.uploaded_at,
      icon: Upload,
      color: 'bg-blue-100 text-blue-600',
    },
    document.reviewed_at && {
      id: 2,
      type: 'reviewed',
      actor: document.reviewer?.full_name || 'Lawyer',
      timestamp: document.reviewed_at,
      icon: Eye,
      color: 'bg-green-100 text-green-600',
    },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div
        className={`bg-white rounded-2xl w-full ${isFullscreen ? 'h-full' : 'h-[95vh]'} max-w-7xl flex flex-col shadow-2xl`}
      >
        {/* Header with Breadcrumb */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-slate-50">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/lawyer/documents" className="hover:text-slate-700">
              Documents
            </Link>
            <ChevronRight className="w-3 h-3" />
            {document.request && (
              <>
                <Link href={`/case/${document.request_id}`} className="hover:text-slate-700">
                  {document.request.request_number}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-slate-900 font-medium">Document Preview</span>
          </div>

          {/* Title and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-slate-900 truncate text-lg">
                  {document.file_name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${fileType.color}`}
                  >
                    {fileType.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Preview Canvas */}
          <div className="flex-1 bg-slate-100 flex flex-col p-6 overflow-hidden">
            {/* Zoom Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm border border-slate-200">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-sm font-medium text-slate-700 min-w-[4rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4 text-slate-600" />
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <button
                  onClick={() => setZoom(100)}
                  className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  Fit
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200">
              {isPDF ? (
                <iframe src={fileUrl} className="w-full h-full" title={document.file_name} />
              ) : isImage ? (
                <div className="w-full h-full flex items-center justify-center p-8 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileUrl}
                    alt={document.file_name}
                    className="block"
                    style={{
                      maxWidth: zoom === 100 ? '100%' : `${zoom}%`,
                      maxHeight: zoom === 100 ? '100%' : `${zoom}%`,
                      width: 'auto',
                      height: 'auto',
                    }}
                    onLoad={(e) => {
                      console.log('Image loaded successfully:', fileUrl);
                      console.log(
                        'Image dimensions:',
                        e.currentTarget.naturalWidth,
                        'x',
                        e.currentTarget.naturalHeight
                      );
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', fileUrl);
                      console.error('Error event:', e);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 mb-4">Preview not available for this file type</p>
                    <a
                      href={fileUrl}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Smart Action Panel */}
          <div className="w-96 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Case Context */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Case Context</h3>
                {document.request && (
                  <Link
                    href={`/case/${document.request_id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                        {document.request.request_number}
                        <ExternalLink className="w-3 h-3" />
                      </p>
                      <p className="text-sm text-slate-700 truncate mt-0.5">
                        {document.request.title}
                      </p>
                      {document.request.client && (
                        <p className="text-xs text-slate-500 mt-1">
                          Client: {document.request.client.full_name}
                        </p>
                      )}
                    </div>
                  </Link>
                )}
              </div>

              {/* Review Intelligence */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Review Intelligence</h3>
                <div className={`p-4 rounded-lg border-2 ${intelligence.color}`}>
                  <div className="flex items-start gap-3">
                    <IntelligenceIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">{intelligence.title}</p>
                      <p className="text-sm">{intelligence.message}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Activity Timeline */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Activity</h3>
                <div className="space-y-3">
                  {activities.map((activity: any, index) => {
                    const ActivityIcon = activity.icon;
                    return (
                      <div key={activity.id} className="flex gap-3 relative">
                        {index < activities.length - 1 && (
                          <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-slate-200" />
                        )}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}
                        >
                          <ActivityIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm font-medium text-slate-900 capitalize">
                            {activity.type}
                          </p>
                          <p className="text-xs text-slate-500">
                            by {activity.actor} ·{' '}
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50 space-y-3">
              {!isReviewed && onMarkReviewed && (
                <button
                  onClick={onMarkReviewed}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Reviewed
                </button>
              )}

              <Link
                href={`/case/${document.request_id}?tab=clarifications`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-amber-600 text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
                Request Clarification
              </Link>

              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Add Internal Note
              </button>

              {showNoteInput && (
                <div className="pt-3 border-t border-slate-200">
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add a private note visible only to you and your firm..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button className="w-full mt-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Save Note
                  </button>
                </div>
              )}

              <a
                href={fileUrl}
                download
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
