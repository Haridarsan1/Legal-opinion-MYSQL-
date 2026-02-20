'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { acceptCase, rejectCase } from '@/app/actions/caseActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  requestId: string;
  lawyerName: string;
}

export default function LawyerAcceptanceCard({ requestId, lawyerName }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const result = await acceptCase(requestId);
      if (result.success) {
        toast.success('Case accepted successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to accept case');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await rejectCase(requestId, rejectReason);
      if (result.success) {
        toast.success('Case rejected. It will be reassigned to another lawyer.');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to reject case');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  return (
    <>
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Case Assignment</h3>
            <p className="text-sm text-blue-700">
              This case has been assigned to you. Please accept or decline this assignment.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Accept Case
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Decline Case
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Decline Case Assignment</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for declining this case. It will be reassigned to another
              lawyer.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Conflict of interest, workload capacity, outside my specialization..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
