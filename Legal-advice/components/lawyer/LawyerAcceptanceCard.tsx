'use client';

import { useState } from 'react';
import { Check, X, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface LawyerAcceptanceCardProps {
  requestId: string;
  requestTitle: string;
  clientName: string;
  department: string;
  priority: string;
  submittedAt: string;
  acceptanceStatus: 'pending' | 'accepted' | 'rejected';
}

export default function LawyerAcceptanceCard({
  requestId,
  requestTitle,
  clientName,
  department,
  priority,
  submittedAt,
  acceptanceStatus,
}: LawyerAcceptanceCardProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/requests/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'accept',
          note: note || 'Request accepted',
        }),
      });

      if (response.ok) {
        toast.success('Request accepted! Client can now provide full details.');
        router.refresh();
      } else {
        toast.error('Failed to accept request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/requests/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'reject',
          note,
        }),
      });

      if (response.ok) {
        toast.success('Request declined');
        router.refresh();
      } else {
        toast.error('Failed to decline request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
      setShowNoteInput(false);
      setNote('');
    }
  };

  if (acceptanceStatus === 'accepted') {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="size-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-900">Request Accepted</h3>
            <p className="text-sm text-green-700">
              You accepted this request. Client can now provide detailed case information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (acceptanceStatus === 'rejected') {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-red-100 flex items-center justify-center">
            <X className="size-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-900">Request Declined</h3>
            <p className="text-sm text-red-700">
              You declined this request. It will be reassigned to another lawyer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Clock className="size-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-blue-900 mb-2">Review & Accept Request</h3>
          <p className="text-blue-700 text-sm">
            The client has submitted a request and is waiting for your response. Review the basic
            details below and decide whether to accept this case.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-blue-200 p-5 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Request Title</p>
            <p className="text-sm font-bold text-slate-900">{requestTitle}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Client</p>
            <p className="text-sm font-bold text-slate-900">{clientName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Department</p>
            <p className="text-sm font-bold text-slate-900">{department}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Priority</p>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                priority === 'urgent'
                  ? 'bg-red-100 text-red-700'
                  : priority === 'high'
                    ? 'bg-orange-100 text-orange-700'
                    : priority === 'medium'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
              }`}
            >
              {priority.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Submitted{' '}
            {
  new Date(submittedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <FileText className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-1">What happens next?</p>
            <ul className="space-y-1 text-blue-800">
              <li>
                • <strong>If you accept:</strong> Client will provide detailed case description and
                documents
              </li>
              <li>
                • <strong>If you decline:</strong> Request will be reassigned to another lawyer
              </li>
            </ul>
          </div>
        </div>
      </div>

      {!showNoteInput ? (
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
          >
            <Check className="size-5" />
            {isProcessing ? 'Processing...' : 'Accept Request'}
          </button>

          <button
            onClick={() => setShowNoteInput(true)}
            disabled={isProcessing}
            className="flex-1 bg-white hover:bg-slate-50 disabled:bg-slate-100 text-slate-700 font-bold py-3.5 px-6 rounded-xl border-2 border-slate-300 hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <X className="size-5" />
            Decline Request
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Reason for declining (required)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Please provide a brief explanation for the client..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={isProcessing || !note.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Processing...' : 'Confirm Decline'}
            </button>
            <button
              onClick={() => {
                setShowNoteInput(false);
                setNote('');
              }}
              disabled={isProcessing}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-300 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
