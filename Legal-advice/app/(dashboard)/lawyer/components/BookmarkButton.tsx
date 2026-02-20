'use client';

import { Bookmark } from 'lucide-react';
import { useState } from 'react';
import { saveRequest, unsaveRequest } from '@/app/actions/savedRequests';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  requestId: string;
  initialIsSaved?: boolean;
  className?: string;
  showLabel?: boolean;
}

export default function BookmarkButton({
  requestId,
  initialIsSaved = false,
  className = '',
  showLabel = false,
}: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if in a link
    e.stopPropagation();

    setIsLoading(true);

    try {
      if (isSaved) {
        const result = await unsaveRequest(requestId);
        if (result.success) {
          setIsSaved(false);
          toast.success('Bookmark removed');
        } else {
          toast.error(result.error || 'Failed to remove bookmark');
        }
      } else {
        const result = await saveRequest(requestId);
        if (result.success) {
          setIsSaved(true);
          toast.success('Request bookmarked!');
        } else {
          toast.error(result.error || 'Failed to bookmark request');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
        isSaved
          ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isSaved ? 'Remove bookmark' : 'Bookmark this request'}
    >
      <Bookmark
        className={`w-4 h-4 transition-all ${isSaved ? 'fill-current' : ''} ${
          isLoading ? 'animate-pulse' : ''
        }`}
      />
      {showLabel && <span className="text-sm font-medium">{isSaved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
