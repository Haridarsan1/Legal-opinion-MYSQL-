'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function TeamManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const teamMembers = [
    {
      id: 1,
      name: 'Robert Wilson',
      email: 'robert.wilson@firm.com',
      role: 'Managing Partner',
      level: 'Senior',
      joinDate: 'Jan 2015',
      activeCases: 8,
      capacity: 75,
      rating: 4.9,
      status: 'Active',
    },
    {
      id: 2,
      name: 'James Wilson',
      email: 'james.wilson@firm.com',
      role: 'Senior Associate',
      level: 'Senior',
      joinDate: 'Mar 2018',
      activeCases: 24,
      capacity: 95,
      rating: 4.9,
      status: 'Active',
    },
    {
      id: 3,
      name: 'Sarah Chen',
      email: 'sarah.chen@firm.com',
      role: 'Associate',
      level: 'Junior',
      joinDate: 'Jul 2021',
      activeCases: 20,
      capacity: 80,
      rating: 4.8,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Michael Ross',
      email: 'michael.ross@firm.com',
      role: 'Senior Associate',
      level: 'Senior',
      joinDate: 'Sep 2019',
      activeCases: 18,
      capacity: 72,
      rating: 4.9,
      status: 'Active',
    },
    {
      id: 5,
      name: 'Emily Davis',
      email: 'emily.davis@firm.com',
      role: 'Associate',
      level: 'Junior',
      joinDate: 'Jan 2022',
      activeCases: 15,
      capacity: 60,
      rating: 4.7,
      status: 'Active',
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">Team Management</h1>
          <p className="text-slate-500 text-base">Manage lawyers, capacity, and team assignments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <UserPlus className="size-5" />
          Add Team Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Members</p>
          <p className="text-2xl font-bold text-slate-900">24</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Senior Lawyers</p>
          <p className="text-2xl font-bold text-slate-900">15</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Junior Associates</p>
          <p className="text-2xl font-bold text-slate-900">9</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Avg. Capacity</p>
          <p className="text-2xl font-bold text-slate-900">76%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition"
            placeholder="Search team members..."
            type="text"
          />
        </div>
        <div className="flex gap-3">
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Levels</option>
            <option>Senior</option>
            <option>Junior</option>
          </select>
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
          </select>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Active Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-200"></div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{member.role}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        member.level === 'Senior'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {member.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{member.activeCases}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 min-w-[80px]">
                        <div
                          className={`h-2 rounded-full ${
                            member.capacity >= 90
                              ? 'bg-red-500'
                              : member.capacity >= 75
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${member.capacity}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-slate-900 w-10">{member.capacity}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-yellow-500 text-sm">
                        star
                      </span>
                      <span className="font-bold text-slate-900">{member.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <span className="size-1.5 rounded-full bg-green-600"></span>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50 rounded transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-2xl">
                check_circle
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Optimal Capacity</p>
              <p className="text-2xl font-bold text-slate-900">12 Members</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">Can take on additional cases (&lt;75% capacity)</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Near Capacity</p>
              <p className="text-2xl font-bold text-slate-900">8 Members</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">Approaching maximum load (75-90% capacity)</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Over Capacity</p>
              <p className="text-2xl font-bold text-slate-900">4 Members</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            At maximum capacity (&gt;90% - redistribute workload)
          </p>
        </div>
      </div>
    </div>
  );
}
