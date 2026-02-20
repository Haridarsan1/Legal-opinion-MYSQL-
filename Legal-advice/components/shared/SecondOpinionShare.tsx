'use client';

import { useState } from 'react';
import { Share2, Users, Send, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SecondOpinionShareProps {
  requestId: string;
  opinionVersionId: string | null;
  userRole: 'lawyer' | 'client';
  availableLawyers?: Array<{
    id: string;
    full_name: string;
    bar_council_id: string;
    specialization: string[];
  }>;
}

export default function SecondOpinionShare({
  requestId,
  opinionVersionId,
  userRole,
  availableLawyers = [],
}: SecondOpinionShareProps) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [shareType, setShareType] = useState<'peer_review' | 'second_opinion'>('second_opinion');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async () => {
    if (!selectedLawyer) {
      toast.error('Please select a lawyer');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/second-opinion/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          opinionVersionId,
          sharedWithLawyerId: selectedLawyer,
          shareType,
          note,
        }),
      });

      if (response.ok) {
        toast.success(
          `Opinion shared for ${shareType === 'peer_review' ? 'peer review' : 'internal review'}`
        );
        setShowShareModal(false);
        setSelectedLawyer('');
        setNote('');
        router.refresh();
      } else {
        toast.error('Failed to share opinion');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowShareModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Share2 className="size-5" />
        Request Internal Review
      </button>

      {/* Share Modal */}
      {
  showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Share for Expert Review</h2>
                    <p className="text-purple-100 text-sm">
                      Get another lawyer's perspective on this opinion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-5">
                {/* Share Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Purpose <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShareType('second_opinion')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        shareType === 'second_opinion'
                          ? 'border-purple-600 bg-purple-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div
                          className={`size-10 rounded-full flex items-center justify-center ${
                            shareType === 'second_opinion'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Share2 className="size-5" />
                        </div>
                        <div>
                          <p
                            className={`font-bold text-sm ${shareType === 'second_opinion' ? 'text-purple-600' : 'text-slate-900'}`}
                          >
                            Internal Review
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Alternative legal perspective
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareType('peer_review')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        shareType === 'peer_review'
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div
                          className={`size-10 rounded-full flex items-center justify-center ${
                            shareType === 'peer_review'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <CheckCircle className="size-5" />
                        </div>
                        <div>
                          <p
                            className={`font-bold text-sm ${shareType === 'peer_review' ? 'text-blue-600' : 'text-slate-900'}`}
                          >
                            Peer Review
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Quality check & feedback</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Select Lawyer */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Select Lawyer <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedLawyer}
                    onChange={(e) => setSelectedLawyer(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    disabled={isSubmitting}
                  >
                    <option value="">Choose a lawyer...</option>
                    {availableLawyers.map((lawyer) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.full_name} - {lawyer.bar_council_id}
                        {
  lawyer.specialization?.length > 0 && ` (${lawyer.specialization[0]})`}
                      </option>
                    ))}
                  </select>
                  {availableLawyers.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ No other lawyers available. Please try again later.
                    </p>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any specific areas you'd like them to focus on..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-blue-600 flex-shrink-0">
                      info
                    </span>
                    <div className="text-sm text-blue-900">
                      <p className="font-bold mb-1">How it works:</p>
                      <ul className="space-y-1 text-blue-800">
                        <li>• The selected lawyer will receive a notification</li>
                        <li>• They can review the opinion and provide feedback</li>
                        <li>• You'll be notified when they complete their review</li>
                        <li>• The original opinion remains unchanged</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-6 flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border-2 border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={isSubmitting || !selectedLawyer || availableLawyers.length === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-xl transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Send className="size-5" />
                {isSubmitting ? 'Sharing...' : 'Share Opinion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
