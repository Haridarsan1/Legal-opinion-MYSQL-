'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, MessageSquare, File, BookOpen, Calendar } from 'lucide-react';

export default function LawyerRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    'overview' | 'clarifications' | 'documents' | 'opinion' | 'timeline'
  >('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'clarifications', label: 'Clarifications', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: File },
    { id: 'opinion', label: 'Opinion', icon: BookOpen },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
  ] as const;

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lawyer/requests" className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Case Details</h1>
          <p className="text-slate-600 mt-1">ID: {requestId}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-t-lg">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg p-8 min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Case Overview</h3>
              <p className="text-slate-600">
                Case details including client information, request description, and case status will
                be displayed here.
              </p>
              <p className="text-sm text-slate-500 mt-4">Request ID: {requestId}</p>
            </div>
          </div>
        )}

        {activeTab === 'clarifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Clarifications</h3>
              <p className="text-slate-600">
                Structured clarifications you've sent to the client will appear here (separate from
                messages).
              </p>
              <p className="text-sm text-slate-500 mt-4">
                Use this section to request specific information needed for your legal opinion.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Case Documents</h3>
              <p className="text-slate-600">
                All uploaded case documents with version history and review tracking will appear
                here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'opinion' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Legal Opinion</h3>
              <p className="text-slate-600">
                Draft and finalized legal opinions, including peer review versions and signatures,
                will appear here.
              </p>
              <p className="text-sm text-slate-500 mt-4">
                You can create draft opinions, share with other lawyers for peer review, and
                finalize with digital signature.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Case Timeline</h3>
              <p className="text-slate-600">
                Complete audit trail of all case events including acceptance, clarifications,
                document reviews, and opinion submission.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
