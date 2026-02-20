'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock,
  IndianRupee,
  Badge as BadgeIcon,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getInterestedLawyers,
  selectLawyerForPublicRequest,
} from '@/app/actions/publicRequestActions';

interface InterestedLawyer {
  id: string;
  lawyer_id: string;
  status: 'pending' | 'selected';
  interest_message: string;
  timeline_estimate?: string;
  fee_estimate?: number;
  fee_currency: string;
  conflict_confirmed: boolean;
  created_at: string;
  lawyer: {
    id: string;
    full_name: string;
    bar_council_id?: string;
    specialization?: string[];
    years_of_experience?: number;
    avatar_url?: string;
    bio?: string;
    email?: string;
  };
}

interface Props {
  caseId: string;
  publicStatus?: string;
}

export default function InterestedLawyersTab({ caseId, publicStatus }: Props) {
  const [lawyers, setLawyers] = useState<InterestedLawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    fetchLawyers();
  }, [caseId]);

  const fetchLawyers = async () => {
    setLoading(true);
    const result = await getInterestedLawyers(caseId);
    if (result.success && result.data) {
      setLawyers(result.data as unknown as InterestedLawyer[]);
    } else {
      toast.error(result.error || 'Failed to load interested lawyers');
    }
    setLoading(false);
  };

  const handleSelectLawyer = async (claimId: string) => {
    if (!confirm('Are you sure you want to select this lawyer? Other lawyers will be notified.')) {
      return;
    }

    setSelecting(claimId);
    try {
      const result = await selectLawyerForPublicRequest(caseId, claimId);
      if (result.success) {
        toast.success('Lawyer selected successfully!');
        // Refresh to see updated status
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to select lawyer');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSelecting(null);
    }
  };

  const selectedLawyer = lawyers.find((l) => l.status === 'selected');
  const pendingLawyers = lawyers.filter((l) => l.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  if (lawyers.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
        <Users className="size-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Lawyers Yet</h3>
        <p className="text-slate-600">
          Lawyers are still reviewing your request. Check back soon for proposals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Selected Lawyer Section */}
      {
  selectedLawyer && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600" />
            Selected Lawyer
          </h3>
          <LawyerCard lawyer={selectedLawyer} isSelected={true} />
        </div>
      )}

      {/* Pending Lawyers Section */}
      {
  pendingLawyers.length > 0 && !selectedLawyer && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="size-5 text-blue-600" />
            Interested Lawyers ({pendingLawyers.length})
          </h3>
          <div className="space-y-4">
            {pendingLawyers.map((lawyer) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                isSelected={false}
                onSelect={() => handleSelectLawyer(lawyer.id)}
                isSelecting={selecting === lawyer.id}
              />
            ))}
          </div>
        </div>
      )}

      {
  pendingLawyers.length > 0 && selectedLawyer && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="size-5 text-slate-600" />
            Other Proposals
          </h3>
          <div className="space-y-4">
            {pendingLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200 opacity-60"
              >
                <p className="text-sm text-slate-600">This proposal was not selected.</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface LawyerCardProps {
  lawyer: InterestedLawyer;
  isSelected: boolean;
  onSelect?: () => void;
  isSelecting?: boolean;
}

function LawyerCard({ lawyer, isSelected, onSelect, isSelecting }: LawyerCardProps) {
  return (
    <div
      className={`rounded-xl p-6 shadow-sm border transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-green-50 to-white border-green-300 ring-2 ring-green-100'
          : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Lawyer Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-start gap-4">
            {lawyer.lawyer.avatar_url ? (
              <img
                src={lawyer.lawyer.avatar_url}
                alt={lawyer.lawyer.full_name}
                className="size-12 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {lawyer.lawyer.full_name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">{lawyer.lawyer.full_name}</h4>
              {lawyer.lawyer.years_of_experience && (
                <p className="text-xs text-slate-600">
                  {lawyer.lawyer.years_of_experience}+ years experience
                </p>
              )}
              {
  lawyer.lawyer.bar_council_id && (
                <p className="text-xs text-slate-600">Bar ID: {lawyer.lawyer.bar_council_id}</p>
              )}
            </div>
          </div>

          {/* Specializations */}
          {
  lawyer.lawyer.specialization && lawyer.lawyer.specialization.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lawyer.lawyer.specialization.slice(0, 3).map((spec, i) => (
                <span
                  key={i}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Proposal Message */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Proposal</p>
            <p className="text-sm text-slate-700 line-clamp-3">{lawyer.interest_message}</p>
          </div>

          {lawyer.lawyer.bio && (
            <p className="text-sm text-slate-600 line-clamp-2">{lawyer.lawyer.bio}</p>
          )}
        </div>

        {/* Details & Action */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Timeline */}
          {
  lawyer.timeline_estimate && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Clock className="size-5 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Timeline</p>
                <p className="text-sm font-semibold text-slate-900">{lawyer.timeline_estimate}</p>
              </div>
            </div>
          )}

          {/* Fee */}
          {
  lawyer.fee_estimate && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <IndianRupee className="size-5 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Proposed Fee</p>
                <p className="text-sm font-semibold text-slate-900">
                  {lawyer.fee_estimate.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isSelected && onSelect && (
            <button
              onClick={onSelect}
              disabled={isSelecting}
              className="mt-auto px-4 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSelecting ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Selecting...
                </>
              ) : (
                <>
                  <CheckCircle className="size-4" />
                  Select This Lawyer
                </>
              )}
            </button>
          )}

          {
  isSelected && (
            <div className="mt-auto p-3 rounded-lg bg-green-50 border border-green-300 text-center">
              <p className="text-xs font-bold text-green-700">✓ Selected Lawyer</p>
              <p className="text-sm text-green-700 font-semibold mt-1">Case in Progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
