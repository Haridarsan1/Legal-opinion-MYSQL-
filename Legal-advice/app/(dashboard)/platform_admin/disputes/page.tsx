'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  Plus,
  DollarSign,
  AlertCircle,
  Clock,
  FileText,
  Check,
  Ban,
} from 'lucide-react';

export default function DisputeResolutionPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <span>Dashboard</span>
              <span>›</span>
              <span className="text-slate-900 font-medium">Dispute Resolution</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Dispute Resolution Center</h1>
            <p className="text-slate-600 mt-1">
              Manage complaints, refunds, and mediation workflows between clients and legal
              professionals.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Create Case
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Open Disputes</p>
                <p className="text-3xl font-bold text-slate-900">12</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Require action today</span>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                +2 New
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Funds in Escrow</p>
                <p className="text-3xl font-bold text-slate-900">$4,500</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">Frozen pending resolution</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">In Mediation</p>
                <p className="text-3xl font-bold text-slate-900">5</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">Active negotiation phase</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Avg. Time</p>
                <p className="text-3xl font-bold text-slate-900">48h</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-green-600 font-medium">-2h</span>
              <span className="text-slate-500">To case closure</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search disputes..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Status: All</option>
            <option>Open</option>
            <option>In Mediation</option>
            <option>Resolved</option>
          </select>
          <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Priority: All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Reason: Any</option>
            <option>Quality</option>
            <option>Delivery</option>
            <option>Communication</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">
            More Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Case Detail + Actions */}
        <div className="grid grid-cols-3 gap-6">
          {/* Case Timeline */}
          <div className="col-span-2 bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Case #4921 Timeline</h2>
                <p className="text-sm text-slate-500">Smith vs. Jones Legal • Started Oct 24</p>
              </div>
              <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Download className="w-4 h-4" />
                Download Log
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Timeline Item 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 w-0.5 bg-slate-200 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">Complaint Filed</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Client alleges non-delivery of contract draft by agreed deadline (Oct 23).
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">Oct 24, 09:30 AM</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                      agreement_v1.pdf
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 w-0.5 bg-slate-200 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">System Action: Funds Frozen</p>
                      <p className="text-sm text-slate-600 mt-1 italic">
                        Escrow amount of $500.00 has been locked pending resolution.
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">Oct 24, 09:31 AM</span>
                  </div>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-blue-600">Lawyer Response Required</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Lawyer has been notified. Response deadline: Oct 26, 09:30 AM
                      </p>
                    </div>
                    <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">
                      Current Step
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Resolution Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Check className="w-4 h-4" />
                Resolve Case
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                <FileText className="w-4 h-4" />
                Request Info
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <DollarSign className="w-4 h-4" />
                Release Funds
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                <Ban className="w-4 h-4" />
                Refund Client
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3">Admin Notes</h4>
              <textarea
                placeholder="Add internal notes about this case..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <button className="mt-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
