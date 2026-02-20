'use client';

import { useState } from 'react';
import { Download, Plus, Search, Check, X, Eye, Filter } from 'lucide-react';

export default function UserManagementPage() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending'>('all');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Mock data
  const pendingVerifications = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@legalmail.com',
      role: 'Lawyer',
      submitted: '2 hours ago',
      documents: 'License',
    },
    {
      id: '2',
      name: 'Sarah Connor',
      email: 's.connor@connorlaw.com',
      role: 'Firm Admin',
      submitted: '5 hours ago',
      documents: 'Certs',
    },
  ];

  const allUsers = [
    {
      id: '1',
      name: 'Michael Chen',
      email: 'michael@example.com',
      role: 'Client',
      organization: '-',
      status: 'Active',
      lastActive: 'Oct 24, 2023',
    },
    {
      id: '2',
      name: 'Chase Bank Ops',
      email: 'admin@chase-legal.com',
      role: 'Bank Admin',
      organization: 'JP Morgan Chase',
      status: 'Active',
      lastActive: 'Just now',
    },
    {
      id: '3',
      name: 'Amanda Lowery',
      email: 'a.lowery@firm.com',
      role: 'Lawyer',
      organization: 'Pearson Specter',
      status: 'Suspended',
      lastActive: '2 months ago',
    },
    {
      id: '4',
      name: 'Robert King',
      email: 'r.king@kingpartners.com',
      role: 'Firm Admin',
      organization: 'King & Partners',
      status: 'Pending',
      lastActive: 'Yesterday',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-2">
              <span>Home</span>
              <span>/</span>
              <span>Admin</span>
              <span>/</span>
              <span className="text-slate-900 font-medium">Users</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Manage user roles, verify accounts, and oversee platform access.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New User</span>
              <span className="sm:hidden">Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Pending Verifications</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">12</p>
              <span className="text-xs sm:text-sm font-medium text-orange-600 bg-orange-50 px-1.5 sm:px-2 py-0.5 rounded">
                +2 today
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Active Users</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">1,240</p>
              <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded">
                +5% wk
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Lawyers</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">340</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Firms</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">85</p>
          </div>
        </div>

        {/* Pending Verifications Section */}
        <div className="bg-white rounded-xl border border-slate-200 mb-4 sm:mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <h2 className="text-lg font-bold text-slate-900">Needs Action</h2>
              <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                3 Urgent
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingVerifications.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-600">ROLE</p>
                    <p className="text-sm text-blue-600">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">SUBMITTED</p>
                    <p className="text-sm text-slate-900">{user.submitted}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">DOCUMENTS</p>
                    <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View {user.documents}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">All Users</h2>
          </div>
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Roles</option>
                <option>Client</option>
                <option>Lawyer</option>
                <option>Firm Admin</option>
                <option>Bank Admin</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name / Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{user.organization}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Active'
                            ? 'bg-green-50 text-green-700'
                            : user.status === 'Suspended'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-orange-50 text-orange-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{user.lastActive}</span>
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
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">Showing 1 to 4 of 1,240 results</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded">
                Previous
              </button>
              <button className="px-3 py-1 text-sm text-white bg-blue-600 rounded">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
