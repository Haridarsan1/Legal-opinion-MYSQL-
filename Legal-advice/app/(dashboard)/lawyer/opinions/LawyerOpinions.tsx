'use client';

import { useState } from 'react';
import { FileText, TrendingUp } from 'lucide-react';
import OpinionMetrics from './components/OpinionMetrics';
import OpinionTabs from './components/OpinionTabs';
import OpinionList from './components/OpinionList';
import OpinionPreview from './components/OpinionPreview';
import EmptyState from './components/EmptyState';

interface Props {
  cases: any[];
  userId: string;
  lawyerName: string;
}

type StatusFilter = 'all' | 'draft' | 'submitted' | 'pending' | 'clarification' | 'completed';

export default function LawyerOpinions({ cases, userId, lawyerName }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedOpinion, setSelectedOpinion] = useState<any>(null);

  // Helper to check opinion status safely (handles both array and object response)
  const hasOpinionStatus = (c: any, status: string) => {
    const details = c.opinion_details;
    if (!details) return false;
    if (Array.isArray(details)) {
      return details.some((op: any) => op.status === status);
    }
    return details.status === status;
  };

  const hasPendingClarification = (c: any) => {
    return (
      c.clarifications && c.clarifications.some((clarification: any) => !clarification.is_resolved)
    );
  };

  // Filter cases by status
  const getFilteredCases = () => {
    return cases.filter((c) => {
      if (statusFilter === 'all') return true;

      if (statusFilter === 'draft') {
        return hasOpinionStatus(c, 'draft');
      }

      if (statusFilter === 'submitted') {
        return c.status === 'opinion_ready' && !c.rating;
      }

      if (statusFilter === 'pending') {
        return c.status === 'opinion_ready' && !c.rating;
      }

      if (statusFilter === 'clarification') {
        return hasPendingClarification(c);
      }

      if (statusFilter === 'completed') {
        return (
          ['completed', 'case_closed', 'no_further_queries_confirmed'].includes(c.status) ||
          c.rating
        );
      }

      return true;
    });
  };

  const filteredCases = getFilteredCases();

  // Calculate metrics
  const metrics = {
    total: cases.length,
    draft: cases.filter((c) => hasOpinionStatus(c, 'draft')).length,
    pending: cases.filter((c) => c.status === 'opinion_ready' && !c.rating).length,
    completed: cases.filter(
      (c) =>
        ['completed', 'case_closed', 'no_further_queries_confirmed'].includes(c.status) || c.rating
    ).length,
    avgRating:
      cases.filter((c) => c.rating).length > 0
        ? (
            cases.reduce((sum, c) => sum + (c.rating?.[0]?.overall_rating || 0), 0) /
            cases.filter((c) => c.rating).length
          ).toFixed(1)
        : 'N/A',
    avgTurnaround: 'N/A', // Calculate from submission - assignment dates
  };

  if (cases.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Opinions</h1>
              <p className="text-slate-600 text-sm mt-0.5">
                Track and manage all your submitted legal opinions
              </p>
            </div>
          </div>

          {/* Metrics */}
          <OpinionMetrics metrics={metrics} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Status Tabs */}
        <OpinionTabs
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
          counts={{
            all: cases.length,
            draft: cases.filter((c) => hasOpinionStatus(c, 'draft')).length,
            submitted: cases.filter((c) => c.status === 'opinion_ready' && !c.rating).length,
            pending: cases.filter((c) => c.status === 'opinion_ready' && !c.rating).length,
            clarification: cases.filter((c) => hasPendingClarification(c)).length,
            completed: cases.filter(
              (c) =>
                ['completed', 'case_closed', 'no_further_queries_confirmed'].includes(c.status) ||
                c.rating
            ).length,
          }}
        />

        {/* Opinion List */}
        <div className="mt-6">
          {filteredCases.length > 0 ? (
            <OpinionList opinions={filteredCases} onSelectOpinion={setSelectedOpinion} />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No opinions in this category
              </h3>
              <p className="text-slate-600">Try selecting a different filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Drawer */}
      {selectedOpinion && (
        <OpinionPreview opinion={selectedOpinion} onClose={() => setSelectedOpinion(null)} />
      )}
    </div>
  );
}
