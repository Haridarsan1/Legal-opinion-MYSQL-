'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'checklists' | 'templates'>(
    'departments'
  );

  const departments = [
    {
      id: '1',
      name: 'Corporate Law',
      code: 'CL',
      head: { name: 'Sarah Jenkins', avatar: '/avatars/sarah.jpg' },
      activeCases: 42,
      status: 'Active',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: '2',
      name: 'Intellectual Property',
      code: 'IP',
      head: { name: 'David Chen', avatar: '/avatars/david.jpg' },
      activeCases: 18,
      status: 'Active',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: '3',
      name: 'Litigation',
      code: 'LG',
      head: { name: 'Amanda Ross', avatar: '/avatars/amanda.jpg' },
      activeCases: 64,
      status: 'Under Review',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: '4',
      name: 'Employment Law',
      code: 'EL',
      head: { name: 'Robert Fox', avatar: '/avatars/robert.jpg' },
      activeCases: 5,
      status: 'Inactive',
      color: 'bg-slate-100 text-slate-600',
    },
    {
      id: '5',
      name: 'Real Estate',
      code: 'RE',
      head: { name: 'Emily Wong', avatar: '/avatars/emily.jpg' },
      activeCases: 29,
      status: 'Active',
      color: 'bg-teal-100 text-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <span>Home</span>
              <span>/</span>
              <span>Admin</span>
              <span>/</span>
              <span className="text-slate-900 font-medium">Content Management</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
            <p className="text-slate-600 mt-1">
              Manage legal departments, dynamic checklists for requests, and opinion templates.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('departments')}
            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'departments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('checklists')}
            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'checklists'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Request Checklists
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Opinion Templates
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {activeTab === 'departments' && (
          <div className="bg-white rounded-xl border border-slate-200">
            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Department Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Head of Dept
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Active Cases
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${dept.color} flex items-center justify-center font-semibold text-sm`}
                          >
                            {dept.code}
                          </div>
                          <span className="font-medium text-slate-900">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                            {dept.head.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <span className="text-sm text-slate-900">{dept.head.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900">{dept.activeCases}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            dept.status === 'Active'
                              ? 'bg-green-50 text-green-700'
                              : dept.status === 'Under Review'
                                ? 'bg-orange-50 text-orange-700'
                                : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          •••
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">Showing 1 to 5 of 12 entries</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm text-white bg-blue-600 rounded">Next</button>
              </div>
            </div>
          </div>
        )}

        {
  activeTab === 'checklists' && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600">Request Checklists Management - Coming Soon</p>
          </div>
        )}

        {
  activeTab === 'templates' && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600">Opinion Templates Management - Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
