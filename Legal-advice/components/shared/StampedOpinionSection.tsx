'use client';

import { useState } from 'react';
import { FileText, Upload, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { submitStampedOpinion } from '@/app/actions/requests';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/shared/StatusBadge';

interface StampedOpinionSectionProps {
  cases: any[];
}

export default function StampedOpinionSection({ cases }: StampedOpinionSectionProps) {
  const router = useRouter();
  const [stampedFile, setStampedFile] = useState<Record<string, File | null>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter cases with status === 'opinion_ready'
  const opinionReadyCases = cases.filter((c) => c.status === 'opinion_ready');

  const handleFileChange = (requestId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStampedFile((prev) => ({ ...prev, [requestId]: file }));
    }
  };

  const handleSubmit = async (requestId: string) => {
    const file = stampedFile[requestId];
    if (!file) {
      toast.error('Please upload a stamped opinion document');
      return;
    }

    setSubmittingId(requestId);

    try {
      const result = await submitStampedOpinion(requestId, file, notes[requestId] || undefined);

      if (result?.success) {
        toast.success('Stamped opinion submitted and delivered to client');
        setStampedFile((prev) => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
        setNotes((prev) => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
        setExpandedId(null);
        router.refresh();
      } else {
        toast.error(result?.error || 'Failed to submit stamped opinion');
      }
    } catch (error) {
      toast.error('An error occurred while submitting stamped opinion');
      console.error('Submit stamped opinion error:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  if (opinionReadyCases.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-purple-50">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            Opinions Ready for Final Review ({opinionReadyCases.length})
          </h3>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Review, stamp, and deliver finalized legal opinions to clients
        </p>
      </div>
      <div className="divide-y divide-slate-200">
        {opinionReadyCases.map((caseItem) => {
          const isExpanded = expandedId === caseItem.id;
          const isSubmitting = submittingId === caseItem.id;

          return (
            <div key={caseItem.id} className="p-6">
              {/* Case Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-slate-900">
                      #{caseItem.request_number || caseItem.id?.substring(0, 8)}
                    </span>
                    <StatusBadge status={caseItem.status} />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">{caseItem.title}</h4>
                  <p className="text-sm text-slate-600">
                    Client:{' '}
                    {Array.isArray(caseItem.client)
                      ? caseItem.client[0]?.full_name
                      : caseItem.client?.full_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Lawyer:{' '}
                    {Array.isArray(caseItem.assigned_lawyer)
                      ? caseItem.assigned_lawyer[0]?.full_name
                      : caseItem.assigned_lawyer?.full_name || 'Unassigned'}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : caseItem.id)}
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  {isExpanded ? 'Collapse' : 'Review & Submit'}
                </button>
              </div>

              {/* Submission Form */}
              {
  isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Upload Stamped Opinion <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id={`stamped-file-${caseItem.id}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(caseItem.id, e)}
                        disabled={isSubmitting}
                        accept=".pdf,.doc,.docx"
                      />
                      <label
                        htmlFor={`stamped-file-${caseItem.id}`}
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {stampedFile[caseItem.id]
                            ? stampedFile[caseItem.id]!.name
                            : 'Click to upload firm-stamped opinion (PDF/DOC)'}
                        </span>
                      </label>
                    </div>
                    {stampedFile[caseItem.id] && (
                      <div className="mt-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-slate-600">
                          {stampedFile[caseItem.id]!.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setStampedFile((prev) => {
                              const updated = { ...prev };
                              delete updated[caseItem.id];
                              return updated;
                            })
                          }
                          className="text-xs text-red-600 hover:text-red-700 ml-auto"
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor={`notes-${caseItem.id}`}
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      id={`notes-${caseItem.id}`}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Add any notes for the client..."
                      value={notes[caseItem.id] || ''}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [caseItem.id]: e.target.value }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setExpandedId(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmit(caseItem.id)}
                      disabled={isSubmitting || !stampedFile[caseItem.id]}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      {isSubmitting ? 'Submitting...' : 'Submit & Deliver to Client'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
