'use client';

import { useState } from 'react';
import { FileText, Upload, Send } from 'lucide-react';
import { toast } from 'sonner';
import { submitOpinion } from '@/app/actions/requests';
import { useRouter } from 'next/navigation';

interface OpinionSubmissionSectionProps {
  requestId: string;
  canSubmit: boolean;
  reason?: string;
}

export default function OpinionSubmissionSection({
  requestId,
  canSubmit,
  reason,
}: OpinionSubmissionSectionProps) {
  const router = useRouter();
  const [opinionText, setOpinionText] = useState('');
  const [opinionFile, setOpinionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOpinionFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!opinionText.trim()) {
      toast.error('Please enter opinion text');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitOpinion(requestId, opinionText, opinionFile || undefined);

      if (result?.success) {
        toast.success('Opinion submitted successfully');
        setOpinionText('');
        setOpinionFile(null);
        router.refresh();
      } else {
        toast.error(result?.error || 'Failed to submit opinion');
      }
    } catch (error) {
      toast.error('An error occurred while submitting opinion');
      console.error('Submit opinion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canSubmit) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submit Opinion
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">{reason || 'Opinion submission not available'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submit Opinion
        </h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Opinion Text */}
          <div>
            <label htmlFor="opinion-text" className="block text-sm font-medium text-slate-700 mb-2">
              Legal Opinion <span className="text-red-500">*</span>
            </label>
            <textarea
              id="opinion-text"
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Enter your detailed legal opinion..."
              value={opinionText}
              onChange={(e) => setOpinionText(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Provide a comprehensive legal analysis and recommendation
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attach Opinion Document (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                id="opinion-file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
                accept=".pdf,.doc,.docx"
              />
              <label
                htmlFor="opinion-file"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {opinionFile ? opinionFile.name : 'Click to upload PDF or DOC'}
                </span>
              </label>
            </div>
            {opinionFile && (
              <div className="mt-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm text-slate-600">{opinionFile.name}</span>
                <button
                  type="button"
                  onClick={() => setOpinionFile(null)}
                  className="text-xs text-red-600 hover:text-red-700 ml-auto"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !opinionText.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Submitting...' : 'Submit Opinion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
