'use client';

import { useState } from 'react';
import { FileText, CheckCircle, Upload, AlertTriangle } from 'lucide-react';
import { isSelfReviewComplete } from '@/lib/lawyer-utils';

interface ProfessionalOpinionSubmissionProps {
  requestId: string;
  canSubmit: boolean;
  reason?: string;
  onSubmit: (data: OpinionFormData) => Promise<void>;
}

interface OpinionFormData {
  opinionType: 'preliminary' | 'final';
  assumptions: string;
  limitations: string;
  validityPeriod: string;
  file: File | null;
  isFinal: boolean;
  selfReviewChecklist: {
    all_documents_reviewed: boolean;
    clarifications_resolved: boolean;
    legal_research_completed: boolean;
    citations_verified: boolean;
    opinion_proofread: boolean;
  };
}

export default function ProfessionalOpinionSubmission({
  requestId,
  canSubmit,
  reason,
  onSubmit,
}: ProfessionalOpinionSubmissionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OpinionFormData>({
    opinionType: 'preliminary',
    assumptions: '',
    limitations: '',
    validityPeriod: '6 months from submission',
    file: null,
    isFinal: false,
    selfReviewChecklist: {
      all_documents_reviewed: false,
      clarifications_resolved: false,
      legal_research_completed: false,
      citations_verified: false,
      opinion_proofread: false,
    },
  });

  const handleChecklistToggle = (key: keyof typeof formData.selfReviewChecklist) => {
    setFormData({
      ...formData,
      selfReviewChecklist: {
        ...formData.selfReviewChecklist,
        [key]: !formData.selfReviewChecklist[key],
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSelfReviewComplete(formData.selfReviewChecklist)) {
      alert('Please complete all self-review checklist items');
      return;
    }

    if (!formData.file) {
      alert('Please upload opinion document');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        opinionType: 'preliminary',
        assumptions: '',
        limitations: '',
        validityPeriod: '6 months from submission',
        file: null,
        isFinal: false,
        selfReviewChecklist: {
          all_documents_reviewed: false,
          clarifications_resolved: false,
          legal_research_completed: false,
          citations_verified: false,
          opinion_proofread: false,
        },
      });
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checklistComplete = isSelfReviewComplete(formData.selfReviewChecklist);
  const canMarkFinal = checklistComplete && formData.file !== null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Professional Opinion Submission</h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your legal opinion with professional metadata
            </p>
          </div>
          {!canSubmit && reason && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="size-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">{reason}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {!canSubmit ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
            <FileText className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium mb-1">Opinion submission not available</p>
            <p className="text-sm text-slate-500">{reason}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opinion Metadata */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Opinion Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Opinion Type *
                  </label>
                  <select
                    value={formData.opinionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opinionType: e.target.value as 'preliminary' | 'final',
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="preliminary">Preliminary Opinion</option>
                    <option value="final">Final Opinion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Validity Period *
                  </label>
                  <input
                    type="text"
                    value={formData.validityPeriod}
                    onChange={(e) => setFormData({ ...formData, validityPeriod: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 6 months from submission"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Assumptions</label>
                <textarea
                  value={formData.assumptions}
                  onChange={(e) => setFormData({ ...formData, assumptions: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="List key assumptions underlying your opinion..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Limitations</label>
                <textarea
                  value={formData.limitations}
                  onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Specify scope limitations and disclaimers..."
                />
              </div>
            </div>

            {/* Self-Review Checklist */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Self-Review Checklist *</h3>
              <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-4">
                {[
                  { key: 'all_documents_reviewed', label: 'All documents have been reviewed' },
                  { key: 'clarifications_resolved', label: 'All clarifications are resolved' },
                  {
                    key: 'legal_research_completed',
                    label: 'Legal research is complete and verified',
                  },
                  { key: 'citations_verified', label: 'All citations and references are accurate' },
                  { key: 'opinion_proofread', label: 'Opinion has been proofread for errors' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.selfReviewChecklist[
                          item.key as keyof typeof formData.selfReviewChecklist
                        ]
                      }
                      onChange={() =>
                        handleChecklistToggle(item.key as keyof typeof formData.selfReviewChecklist)
                      }
                      className="size-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">{item.label}</span>
                    {formData.selfReviewChecklist[
                      item.key as keyof typeof formData.selfReviewChecklist
                    ] && <CheckCircle className="size-4 text-green-500 ml-auto" />}
                  </label>
                ))}

                {
  checklistComplete && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mt-3">
                    <CheckCircle className="size-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Self-review checklist complete
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Opinion Document *
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="opinion-upload"
                />
                <label
                  htmlFor="opinion-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="size-8 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {formData.file ? formData.file.name : 'Click to upload opinion PDF/DOCX'}
                  </span>
                  <span className="text-xs text-slate-500">Maximum file size: 10MB</span>
                </label>
              </div>
            </div>

            {/* Mark as Final */}
            {
  canMarkFinal && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFinal}
                    onChange={(e) => setFormData({ ...formData, isFinal: e.target.checked })}
                    className="size-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-amber-900 block">
                      Mark as Final Opinion
                    </span>
                    <span className="text-xs text-amber-700">
                      Final opinions cannot be edited. Only one final opinion is allowed per case.
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting || !checklistComplete || !formData.file}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="size-5" />
                    Submit Professional Opinion
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
