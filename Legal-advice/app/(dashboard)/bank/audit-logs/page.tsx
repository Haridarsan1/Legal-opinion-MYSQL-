'use client';

import { useState } from 'react';
import { Download, Search, ChevronDown } from 'lucide-react';

export default function BankAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock activity data
  const activities = [
    {
      id: '1',
      timestamp: 'Today, 09:41 AM',
      user: { name: 'John Doe', role: 'Loan Officer', avatar: 'JD', color: 'bg-blue-500' },
      actionType: 'Assignment',
      actionColor: 'bg-blue-100 text-blue-700',
      description: 'Assigned Case #4029 to "Smith & Associates"',
      caseId: '#4029',
    },
    {
      id: '2',
      timestamp: 'Today, 09:30 AM',
      user: { name: 'System', role: 'Automation', avatar: '⚙', color: 'bg-gray-500' },
      actionType: 'Sync',
      actionColor: 'bg-gray-100 text-gray-700',
      description: 'Automated Integration Sync Completed',
      caseId: null,
    },
    {
      id: '3',
      timestamp: 'Today, 08:15 AM',
      user: { name: 'Sarah Lee', role: 'Admin', avatar: 'SL', color: 'bg-purple-500' },
      actionType: 'Upload',
      actionColor: 'bg-green-100 text-green-700',
      description: 'Uploaded "Property_Deed_v2.pdf"',
      caseId: '#4010',
    },
    {
      id: '4',
      timestamp: 'Yesterday, 04:55 PM',
      user: { name: 'Mike Chen', role: 'Manager', avatar: 'MC', color: 'bg-orange-500' },
      actionType: 'Status Change',
      actionColor: 'bg-orange-100 text-orange-700',
      description: 'Changed status to "Under Review"',
      caseId: '#3998',
    },
    {
      id: '5',
      timestamp: 'Yesterday, 09:00 AM',
      user: { name: 'Rachel Jones', role: 'Auditor', avatar: 'RJ', color: 'bg-teal-500' },
      actionType: 'Login',
      actionColor: 'bg-teal-100 text-teal-700',
      description: 'Successful login from New Device (IP: 192.168.1.42)',
      caseId: null,
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[#111827] text-3xl font-extrabold mb-2">Audit Logs</h1>
          <p className="text-blue-600">
            Track and monitor system activity, user interactions, and file movements within the
            platform.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚡</span>
            <p className="text-xs font-semibold text-gray-600 uppercase">Total Actions Today</p>
          </div>
          <p className="text-3xl font-bold text-[#111827]">142</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👥</span>
            <p className="text-xs font-semibold text-gray-600 uppercase">Active Users</p>
          </div>
          <p className="text-3xl font-bold text-[#111827]">18</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📁</span>
            <p className="text-xs font-semibold text-gray-600 uppercase">Files Uploaded</p>
          </div>
          <p className="text-3xl font-bold text-[#111827]">34</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚠️</span>
            <p className="text-xs font-semibold text-gray-600 uppercase">Errors</p>
          </div>
          <p className="text-3xl font-bold text-red-600">2</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, User, or Description..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm">Last 7 Days</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm">All Actions</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                Timestamp
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                User
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                Action Type
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                Description
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                Case ID
              </th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Timestamp */}
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-900">{activity.timestamp}</span>
                </td>

                {/* User */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${activity.user.color} flex items-center justify-center text-white font-semibold text-xs`}
                    >
                      {activity.user.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{activity.user.name}</p>
                      <p className="text-xs text-gray-500">{activity.user.role}</p>
                    </div>
                  </div>
                </td>

                {/* Action Type */}
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${activity.actionColor}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {activity.actionType}
                  </span>
                </td>

                {/* Description */}
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-700">{activity.description}</p>
                </td>

                {/* Case ID */}
                <td className="py-4 px-6">
                  {activity.caseId ? (
                    <a href="#" className="text-sm text-blue-600 hover:underline font-medium">
                      {activity.caseId}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>

                {/* Arrow */}
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-xl">›</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">1-5</span> of{' '}
            <span className="font-semibold">142</span> results
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 disabled:opacity-50">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
