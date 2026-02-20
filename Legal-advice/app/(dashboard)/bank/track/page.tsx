'use client';

import { useState } from 'react';
import { Download, Upload, MoreVertical, FileText, Filter } from 'lucide-react';

export default function BankTrackStatusPage() {
  const [activeTab, setActiveTab] = useState('all');

  // Mock requests data
  const requests = [
    {
      id: '1',
      address: '450 Lexington Ave, NY',
      firm: { name: 'LexCorp', avatar: 'L' },
      status: 'Drafting Opinion',
      progress: 75,
      stages: { recvd: true, review: true, drafting: true, finalize: false },
      eta: 'Today',
      etaColor: 'text-green-600',
      actionType: null,
    },
    {
      id: '2',
      address: '789 Oak Street, Boston',
      firm: { name: 'Suits & Co', avatar: 'S' },
      status: 'Awaiting Documents',
      progress: 25,
      stages: { recvd: true, review: false, drafting: false, finalize: false },
      eta: '+2 Days',
      etaColor: 'text-orange-600',
      actionType: 'upload',
      actionLabel: 'Upload',
    },
    {
      id: '3',
      address: '123 Pine Lane, Austin',
      firm: { name: 'Hamlin & McGill', avatar: 'H' },
      status: 'Under Review',
      progress: 40,
      stages: { recvd: true, review: true, drafting: false, finalize: false },
      eta: 'Oct 24',
      etaColor: 'text-gray-600',
      actionType: null,
    },
    {
      id: '4',
      address: '567 Maple Dr, Seattle',
      firm: { name: 'LexCorp', avatar: 'L' },
      status: 'Finalizing',
      progress: 90,
      stages: { recvd: true, review: true, drafting: true, finalize: true },
      eta: 'Today',
      etaColor: 'text-green-600',
      actionType: 'view',
      actionLabel: 'View Report',
    },
    {
      id: '5',
      address: '234 Elm Court, Portland',
      firm: { name: 'Pearson Hardman', avatar: 'P' },
      status: 'Completed',
      progress: 100,
      stages: { recvd: true, review: true, drafting: true, finalize: true },
      eta: 'Oct 20',
      etaColor: 'text-gray-600',
      actionType: 'view',
      actionLabel: 'View Report',
    },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-blue-600';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-orange-400';
  };

  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[#111827] text-3xl font-extrabold mb-2">
            Active legal opinion requests
          </h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
              ⚠
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">ACTION REQUIRED</p>
          <p className="text-3xl font-bold text-[#111827]">2</p>
          <p className="text-xs text-gray-500 mt-1">Needs attention</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">⏱</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">AVG. TURNAROUND</p>
          <p className="text-3xl font-bold text-[#111827]">
            3.5 <span className="text-base font-medium text-gray-500">Days</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">COMPLETED (YTD)</p>
          <p className="text-3xl font-bold text-[#111827]">128</p>
          <p className="text-xs text-gray-500 mt-1">Stable</p>
        </div>
      </div>

      {/* Tabs and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`relative px-4 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Action
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'overdue'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overdue
          </button>
        </div>
        <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                Address
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                Assigned Firm
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                Progress & Status
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                ETA
              </th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Address */}
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900">{req.address}</p>
                </td>

                {/* Assigned Firm */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {req.firm.avatar}
                    </div>
                    <span className="font-medium text-gray-900">{req.firm.name}</span>
                  </div>
                </td>

                {/* Progress & Status */}
                <td className="py-4 px-6">
                  <div className="space-y-2">
                    {/* Status Text and Percentage */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{req.status}</span>
                      <span className="text-sm font-semibold text-gray-700">{req.progress}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(req.progress)}`}
                        style={{ width: `${req.progress}%` }}
                      ></div>
                    </div>
                    {/* Stage Pills */}
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${req.stages.recvd ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        Rec&apos;d
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${req.stages.review ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        Review
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${req.stages.drafting ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        Drafting
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${req.stages.finalize ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        Finalize
                      </span>
                    </div>
                  </div>
                </td>

                {/* ETA */}
                <td className="py-4 px-6">
                  <span className={`font-semibold ${req.etaColor}`}>{req.eta}</span>
                </td>

                {/* Actions */}
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    {req.actionType === 'upload' && (
                      <button className="px-3 py-1.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        {req.actionLabel}
                      </button>
                    )}
                    {
  req.actionType === 'view' && (
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        {req.actionLabel}
                      </button>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 disabled:opacity-50">
            Previous
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg">Next</button>
        </div>
      </div>
    </div>
  );
}
