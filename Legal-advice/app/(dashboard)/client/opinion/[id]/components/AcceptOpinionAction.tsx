'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface Props {
  requestId: string;
  requestNumber: string;
  onClose: () => void;
  onComplete: () => void;
  currentUserId: string;
}

export default function AcceptOpinionAction({
  requestId,
  requestNumber,
  onClose,
  onComplete,
  currentUserId,
}: Props) {const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [understood, setUnderstood] = useState(false);

  const handleAccept = async () => {
    if (!understood) {
      setError('Please confirm that you understand before proceeding');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update request to mark opinion as accepted
      const { error: updateError } = await supabase
        .from('legal_requests')
        .update({
          opinion_accepted: true,
          opinion_accepted_at: new Date().toISOString(),
          opinion_accepted_by: currentUserId,
          status: 'completed',
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create audit log
      await supabase.from('audit_logs').insert({
        user_id: currentUserId,
        action: 'opinion_accepted',
        entity_type: 'legal_request',
        entity_id: requestId,
        details: {
          request_number: requestNumber,
          accepted_at: new Date().toISOString(),
        },
      });

      onComplete();
    } catch (err) {
      console.error('Error accepting opinion:', err);
      setError('Failed to accept opinion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {isConfirming ? (
          // Confirmation Step
          <>
            <div className="px-6 py-4 border-b border-slate-200 bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Confirm Acceptance</h2>
                  <p className="text-sm text-slate-600">Please review before confirming</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-blue-900">What happens when you accept?</h3>
                </div>
                <ul className="text-sm text-blue-800 space-y-2 ml-7">
                  <li>• The case will be marked as completed</li>
                  <li>• Your acceptance will be recorded and timestamped</li>
                  <li>• The opinion becomes the final legal advice for this matter</li>
                  <li>• You'll be prompted to rate your lawyer's service</li>
                </ul>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="understand"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="understand" className="text-sm text-slate-700 cursor-pointer">
                  I understand that accepting this opinion marks the case as completed and
                  represents my formal acknowledgment of the legal advice provided.
                </label>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setIsConfirming(false)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleAccept}
                disabled={!understood || isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                {isSubmitting ? 'Processing...' : 'Confirm Acceptance'}
              </button>
            </div>
          </>
        ) : (
          // Initial Step
          <>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Accept Legal Opinion</h2>
                    <p className="text-sm text-slate-600">Case {requestNumber}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Ready to accept this opinion?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  By accepting this legal opinion, you acknowledge that you have reviewed the advice
                  provided and are satisfied with the legal analysis. This action will:
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 text-sm">Finalize the case</p>
                    <p className="text-xs text-green-700">Mark this legal request as completed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 text-sm">Record your acceptance</p>
                    <p className="text-xs text-green-700">
                      Create a timestamped record for compliance
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 text-sm">Enable rating</p>
                    <p className="text-xs text-green-700">
                      You'll be able to rate the lawyer's service
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 text-sm mb-1">Before accepting</p>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>• Ensure you've read the entire opinion thoroughly</li>
                      <li>• Review all supporting documents</li>
                      <li>• Resolve any outstanding clarifications</li>
                      <li>• Consult with stakeholders if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Not Yet
              </button>
              <button
                onClick={() => setIsConfirming(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Accept Opinion
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
