'use client';

import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SecondOpinionShare from '@/components/shared/SecondOpinionShare';

interface CaseSecondOpinionProps {
  requestId: string;
  userId: string;
  userRole: 'lawyer' | 'client';
}

export default function CaseSecondOpinion({ requestId, userId, userRole }: CaseSecondOpinionProps) {
  const [opinionVersionId, setOpinionVersionId] = useState<string | null>(null);
  const [availableLawyers, setAvailableLawyers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the latest opinion version
        const { data: opinion } = await supabase
          .from('legal_opinions')
          .select(
            `
                        id,
                        versions:opinion_versions(id, version_number, is_draft)
                    `
          )
          .eq('request_id', requestId)
          .maybeSingle();

        if (opinion && opinion.versions && opinion.versions.length > 0) {
          // Get the latest version
          const latestVersion = opinion.versions.sort(
            (a: any, b: any) => b.version_number - a.version_number
          )[0];
          setOpinionVersionId(latestVersion.id);
        }

        // Fetch available lawyers (excluding current user)
        const { data: lawyers } = await supabase
          .from('profiles')
          .select('id, full_name, bar_council_id, specialization')
          .eq('role', 'lawyer')
          .neq('id', userId)
          .limit(20);

        setAvailableLawyers(lawyers || []);
      } catch (error) {
        console.error('Error fetching second opinion data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [requestId, userId, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!opinionVersionId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Draft Opinion Yet</h3>
        <p className="text-sm text-slate-600 max-w-md">
          Save a draft opinion first before requesting an internal review from another lawyer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Request Internal Review</h3>
            <p className="text-sm text-slate-600">
              Share your draft opinion with another lawyer for peer review or get an internal review
              on complex cases.
            </p>
          </div>
        </div>
      </div>

      <SecondOpinionShare
        requestId={requestId}
        opinionVersionId={opinionVersionId}
        userRole={userRole}
        availableLawyers={availableLawyers}
      />
    </div>
  );
}
