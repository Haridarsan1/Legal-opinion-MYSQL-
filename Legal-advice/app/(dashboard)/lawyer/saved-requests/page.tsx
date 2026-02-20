'use client';

import { useEffect, useState } from 'react';
import { getSavedRequests, SavedRequest } from '@/app/actions/savedRequests';
import { createProposal } from '@/app/actions/proposals';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  MapPin,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Globe,
  Lock,
  Scale,
  Bookmark,
  AlertCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import DeadlineCountdown from '../components/DeadlineCountdown';
import ProposalStatusTracker from '../components/ProposalStatusTracker';
import BookmarkButton from '../components/BookmarkButton';
import ProposalSubmissionModal from '../components/ProposalSubmissionModal';

// Reusing RequestCard logic (simplified for saved requests)
export default function SavedRequestsPage() {
  const [requests, setRequests] = useState<SavedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; title: string } | null>(
    null
  );

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const result = await getSavedRequests();
        if (result.success && result.data) {
          setRequests(result.data);
        } else {
          toast.error('Failed to load saved requests');
        }
      } catch (error) {
        console.error('Error fetching saved requests:', error);
        toast.error('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleOpenSubmitModal = (requestId: string, requestTitle: string) => {
    setSelectedRequest({ id: requestId, title: requestTitle });
    setIsSubmitModalOpen(true);
  };

  const handleProposalSubmit = async (formData: FormData) => {
    const result = await createProposal(formData);
    if (result.success) {
      toast.success('Proposal submitted successfully!');
      setIsSubmitModalOpen(false);
      // Ideally refresh headers or state here
    } else {
      toast.error(result.error || 'Failed to submit proposal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Saved Requests</h1>
          <p className="text-slate-600">Manage your bookmarked opportunities.</p>
        </div>
      </header>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Bookmark className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No saved requests</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Browse the marketplace and bookmark requests you're interested in to see them here.
          </p>
          <Link
            href="/lawyer/public-requests"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Browse Requests <ArrowRight className="size-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((saved) => {
            const r = saved.request!;
            // Calculate stats or use helper (simplified here)
            const isHighValue = (r.budget_max || 0) > 50000;
            const isUrgent =
              r.proposal_deadline &&
              new Date(r.proposal_deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={saved.id}
                className="group relative bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
              >
                {/* Header / Logic similar to RequestCard */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                        {r.request_number}
                      </span>
                      {isHighValue && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-100">
                          <DollarSign className="w-3 h-3" /> High Value
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {r.department?.name || 'General'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Posted {new Date(r.public_posted_at || r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Bookmark & Deadline */}
                  <div className="flex flex-col items-end gap-3">
                    <BookmarkButton requestId={r.id} initialIsSaved={true} />
                    {r.proposal_deadline && <DeadlineCountdown deadline={r.proposal_deadline} />}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium mb-1">Budget Range</div>
                    <div className="font-bold text-slate-900">
                      {r.budget_min
                        ? `₹${r.budget_min.toLocaleString()} - ₹${r.budget_max?.toLocaleString()}`
                        : 'Not specific'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium mb-1">Complexity</div>
                    <div
                      className={`font-bold capitalize ${
                        r.complexity_level === 'high'
                          ? 'text-orange-700'
                          : r.complexity_level === 'medium'
                            ? 'text-blue-700'
                            : 'text-slate-700'
                      }`}
                    >
                      {r.complexity_level || 'Medium'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium mb-1">Confidentiality</div>
                    <div className="font-bold text-slate-900 capitalize">
                      {r.visibility === 'public' ? 'Standard' : 'Confidential'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium mb-1">Proposals</div>
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {Array.isArray(r.proposal_count) ? r.proposal_count.length : 0}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500 italic">
                    Saved on {new Date(saved.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/lawyer/public-requests/${r.id}`}
                      className="px-4 py-2 text-slate-600 hover:text-primary font-semibold text-sm transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleOpenSubmitModal(r.id, r.title)}
                      className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm hover:shadow transition-all"
                    >
                      Submit Proposal
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {
  isSubmitModalOpen && selectedRequest && (
        <ProposalSubmissionModal
          requestId={selectedRequest.id}
          requestTitle={selectedRequest.title}
          onClose={() => setIsSubmitModalOpen(false)}
          onSuccess={() => {
            toast.success('Proposal submitted successfully');
            setIsSubmitModalOpen(false);
            // Could reload logic here
          }}
        />
      )}
    </div>
  );
}
