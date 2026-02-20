'use client';

import { useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';

export default function DisputeResolutionPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

  const pendingDisputes = [
    {
      id: '#DSP-024',
      type: 'Quality Issue',
      complainant: 'Tech Solutions Pvt Ltd (Client)',
      respondent: 'Wilson & Associates (Firm)',
      caseId: '#1023',
      amount: '₹8,000',
      filed: 'Oct 22, 2023',
      priority: 'high' as const,
      status: 'under_review' as const,
    },
    {
      id: '#DSP-023',
      type: 'Delayed Delivery',
      complainant: 'HDFC Bank (Bank)',
      respondent: 'Legal Partners LLP (Firm)',
      caseId: '#LN-2018',
      amount: '₹5,500',
      filed: 'Oct 20, 2023',
      priority: 'medium' as const,
      status: 'pending' as const,
    },
  ];

  const resolvedDisputes = [
    {
      id: '#DSP-020',
      type: 'Refund Request',
      complainant: 'Real Estate Corp (Client)',
      respondent: 'Mumbai Law Chambers (Firm)',
      resolution: 'Partial Refund - ₹3,000',
      resolvedDate: 'Oct 18, 2023',
      outcome: 'Complainant Favor',
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          Dispute Resolution
        </h1>
        <p className="text-slate-500 text-base">Manage complaints, disputes, and refund requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Disputes</p>
          <p className="text-2xl font-bold text-slate-900">87</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Pending Resolution</p>
          <p className="text-2xl font-bold text-amber-600">12</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Resolved (30 days)</p>
          <p className="text-2xl font-bold text-green-600">38</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Avg Resolution Time</p>
          <p className="text-2xl font-bold text-slate-900">4.2d</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === 'pending'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pending Disputes (12)
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === 'resolved'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Resolved Disputes
        </button>
      </div>

      {/* Pending Disputes */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingDisputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-slate-400">{dispute.id}</span>
                      {dispute.priority === 'high' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                          <span className="size-1 rounded-full bg-red-600 animate-pulse"></span>
                          HIGH PRIORITY
                        </span>
                      )}
                      <StatusBadge status={dispute.status as any} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{dispute.type}</h3>
                    <p className="text-sm text-slate-600">
                      Related Case: {dispute.caseId} • Amount: {dispute.amount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-2">Complainant</p>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="material-symbols-outlined text-blue-600">person</span>
                      <span className="text-sm font-medium text-slate-900">
                        {dispute.complainant}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-2">Respondent</p>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="material-symbols-outlined text-amber-600">business</span>
                      <span className="text-sm font-medium text-slate-900">
                        {dispute.respondent}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-bold text-slate-900 mb-2">Complaint Details:</p>
                  <p className="text-sm text-slate-700">
                    Client claims the legal opinion provided was inadequate and did not address key
                    property title concerns. Requesting partial refund and re-review.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-500">Filed: {dispute.filed}</div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors">
                      Mediate
                    </button>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved Disputes */}
      {activeTab === 'resolved' && (
        <div className="space-y-6">
          {resolvedDisputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 bg-green-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-slate-400">{dispute.id}</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <span className="size-1.5 rounded-full bg-green-600"></span>
                        RESOLVED
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{dispute.type}</h3>
                    <p className="text-sm text-slate-600">
                      Outcome: {dispute.outcome} • Resolved: {dispute.resolvedDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Complainant</p>
                    <p className="font-semibold text-slate-900">{dispute.complainant}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Respondent</p>
                    <p className="font-semibold text-slate-900">{dispute.respondent}</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-slate-900 mb-1">Resolution:</p>
                  <p className="text-sm text-slate-700">{dispute.resolution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
