'use client';

import { useState, useEffect } from 'react';
import { X, Loader, IndianRupee, Clock, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createProposal, updateProposal, withdrawProposal } from '@/app/actions/proposals';

interface ProposalSubmissionModalProps {
  requestId: string;
  requestTitle: string;
  minBudget?: number | null;
  maxBudget?: number | null;
  initialData?: {
    id: string;
    proposed_fee: number;
    timeline_days: number;
    proposal_message: string;
    status: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProposalSubmissionModal({
  requestId,
  requestTitle,
  minBudget,
  maxBudget,
  initialData,
  onClose,
  onSuccess,
}: ProposalSubmissionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [formData, setFormData] = useState({
    proposedFee: initialData ? initialData.proposed_fee.toString() : '',
    timelineDays: initialData ? initialData.timeline_days.toString() : '',
    proposalMessage: initialData ? initialData.proposal_message : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!initialData;
  const isReadOnly = !!(initialData && !['submitted', 'shortlisted'].includes(initialData.status));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const fee = parseFloat(formData.proposedFee);

    if (!formData.proposedFee || fee <= 0) {
      newErrors.proposedFee = 'Please enter a valid fee amount';
    } else {
      if (minBudget && fee < minBudget) {
        newErrors.proposedFee = `Fee cannot be less than minimum budget of ₹${minBudget.toLocaleString()}`;
      }
      if (maxBudget && fee > maxBudget) {
        newErrors.proposedFee = `Fee cannot exceed maximum budget of ₹${maxBudget.toLocaleString()}`;
      }
    }

    if (!formData.timelineDays || parseInt(formData.timelineDays) <= 0) {
      newErrors.timelineDays = 'Please enter a valid timeline';
    }

    if (!formData.proposalMessage || formData.proposalMessage.length < 50) {
      newErrors.proposalMessage = 'Proposal message must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) return;

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditMode && initialData) {
        // Update existing proposal
        const updates = {
          proposedFee: parseFloat(formData.proposedFee),
          timelineDays: parseInt(formData.timelineDays),
          proposalMessage: formData.proposalMessage,
        };

        const result = await updateProposal(initialData.id, updates);

        if (result.success) {
          toast.success('Proposal updated successfully!');
          onSuccess();
          onClose();
        } else {
          toast.error(result.error || 'Failed to update proposal');
        }
      } else {
        // Create new proposal
        const formDataObj = new FormData();
        formDataObj.append('requestId', requestId);
        formDataObj.append('proposedFee', formData.proposedFee);
        formDataObj.append('timelineDays', formData.timelineDays);
        formDataObj.append('proposalMessage', formData.proposalMessage);

        const result = await createProposal(formDataObj);

        if (result.success) {
          toast.success('Proposal submitted successfully!');
          onSuccess();
          onClose();
        } else {
          toast.error(result.error || 'Failed to submit proposal');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!initialData) return;

    if (
      !confirm('Are you sure you want to withdraw this proposal? This action cannot be undone.')
    ) {
      return;
    }

    setWithdrawing(true);
    try {
      const result = await withdrawProposal(initialData.id);
      if (result.success) {
        toast.success('Proposal withdrawn successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Failed to withdraw proposal');
      }
    } catch (error) {
      toast.error('Failed to withdraw proposal');
    } finally {
      setWithdrawing(false);
    }
  };

  // Helper to determine slider min/max
  const sliderMin = minBudget ? Math.max(0, minBudget - minBudget * 0.2) : 0;
  const sliderMax = maxBudget
    ? maxBudget + maxBudget * 0.2
    : parseInt(formData.proposedFee) * 2 || 10000;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">
                {isEditMode ? 'Manage Proposal' : 'Submit Proposal'}
              </h2>
              {initialData && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(initialData.status)}`}
                >
                  {initialData.status}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">{requestTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={submitting || withdrawing}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Read Only Warning */}
          {
  isReadOnly && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                This proposal cannot be edited because it has been{' '}
                <strong>{initialData?.status}</strong>.
              </p>
            </div>
          )}

          {/* Budget Context Banner */}
          {(minBudget || maxBudget) && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                <IndianRupee className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Client Budget Range</p>
                <p className="text-lg font-bold text-blue-700">
                  {minBudget ? `₹${minBudget.toLocaleString()}` : 'Open'}
                  {' - '}
                  {
  maxBudget ? `₹${maxBudget.toLocaleString()}` : 'Open'}
                </p>
              </div>
            </div>
          )}

          {/* Proposed Fee using Two-Column Layout if slider applicable */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <IndianRupee className="size-4" />
                Proposed Fee <span className="text-red-500">*</span>
              </div>
            </label>

            <div className="space-y-4">
              {/* Slider (only if range exists or at least max exists) */}
              {
  maxBudget && !isReadOnly && (
                <div className="px-1">
                  <input
                    type="range"
                    min={minBudget || 0}
                    max={maxBudget}
                    step={50}
                    value={Math.min(parseFloat(formData.proposedFee) || 0, maxBudget)}
                    onChange={(e) => setFormData({ ...formData, proposedFee: e.target.value })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    disabled={submitting || isReadOnly}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>₹{minBudget?.toLocaleString() || 0}</span>
                    <span>₹{maxBudget.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.proposedFee}
                  onChange={(e) => setFormData({ ...formData, proposedFee: e.target.value })}
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                    errors.proposedFee ? 'border-red-300' : 'border-slate-300'
                  } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-lg disabled:bg-slate-100 disabled:text-slate-500`}
                  placeholder="Enter your quoted fee"
                  disabled={submitting || isReadOnly}
                />
              </div>
            </div>

            {errors.proposedFee && (
              <p className="text-sm font-medium text-red-600 mt-1">{errors.proposedFee}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              The amount you will charge for this legal service
            </p>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                Timeline (Days) <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="number"
              min="1"
              value={formData.timelineDays}
              onChange={(e) => setFormData({ ...formData, timelineDays: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.timelineDays ? 'border-red-300' : 'border-slate-300'
              } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:bg-slate-100 disabled:text-slate-500`}
              placeholder="Number of days to complete"
              disabled={submitting || isReadOnly}
            />
            {errors.timelineDays && (
              <p className="text-xs text-red-600 mt-1">{errors.timelineDays}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Estimated time to complete the work and deliver the opinion
            </p>
          </div>

          {/* Proposal Message */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="size-4" />
                Your Proposal <span className="text-red-500">*</span>
              </div>
            </label>
            <textarea
              value={formData.proposalMessage}
              onChange={(e) => setFormData({ ...formData, proposalMessage: e.target.value })}
              rows={8}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.proposalMessage ? 'border-red-300' : 'border-slate-300'
              } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none disabled:bg-slate-100 disabled:text-slate-500`}
              placeholder="Explain your approach, relevant experience, and why you're the best fit for this case. Be specific and professional."
              disabled={submitting || isReadOnly}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.proposalMessage && (
                <p className="text-xs text-red-600">{errors.proposalMessage}</p>
              )}
              <p
                className={`text-xs ml-auto ${
                  formData.proposalMessage.length < 50 ? 'text-red-600' : 'text-slate-500'
                }`}
              >
                {formData.proposalMessage.length} / 50 minimum
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Describe your qualifications, approach to this case, and what makes you uniquely
              qualified
            </p>
          </div>

          {/* Info Box */}
          {!isReadOnly && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">
                💡 Tips for a Strong Proposal
              </h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Highlight relevant experience and specializations</li>
                <li>Explain your specific approach to handling this case</li>
                <li>Be competitive with pricing while valuing your expertise</li>
                <li>Set a realistic timeline based on case complexity</li>
                <li>Proofread for professionalism</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            {isEditMode && !isReadOnly && (
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={submitting || withdrawing}
                className="px-4 py-3 rounded-lg bg-red-white border border-red-200 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {withdrawing ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Withdraw
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={submitting || withdrawing}
              className="flex-1 px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                disabled={submitting || withdrawing}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="size-5 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Submitting...'}
                  </>
                ) : isEditMode ? (
                  'Update Proposal'
                ) : (
                  'Submit Proposal'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
