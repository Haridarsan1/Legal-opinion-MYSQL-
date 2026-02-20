'use client';

import { useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import RequestCard from '@/components/shared/RequestCard';

export default function CaseOversightPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { id: 'submitted', title: 'Submitted', count: 12, color: 'bg-slate-500' },
    { id: 'assigned', title: 'Assigned', count: 8, color: 'bg-blue-500' },
    { id: 'in_review', title: 'In Progress', count: 15, color: 'bg-amber-500' },
    { id: 'opinion_ready', title: 'Review Queue', count: 18, color: 'bg-purple-500' },
    { id: 'delivered', title: 'Delivered', count: 6, color: 'bg-green-500' },
  ];

  const casesByStatus: Record<string, any[]> = {
    submitted: [
      {
        id: '#1029',
        title: 'Property Dispute',
        client: 'Real Estate Holdings',
        assignedTo: undefined,
        priority: 'high' as const,
      },
      {
        id: '#1028',
        title: 'Contract Review',
        client: 'Tech Startup Inc',
        assignedTo: undefined,
        priority: 'medium' as const,
      },
    ],
    assigned: [
      {
        id: '#1027',
        title: 'IP Trademark',
        client: 'Creative Studios',
        assignedTo: 'Sarah Chen',
        priority: 'medium' as const,
      },
    ],
    in_review: [
      {
        id: '#1024',
        title: 'Corporate Tax Review',
        client: 'Tech Solutions',
        assignedTo: 'James Wilson',
        priority: 'urgent' as const,
      },
      {
        id: '#1025',
        title: 'Merger Analysis',
        client: 'Global Corp',
        assignedTo: 'Michael Ross',
        priority: 'high' as const,
      },
    ],
    opinion_ready: [
      {
        id: '#1023',
        title: 'Employment Contract',
        client: 'Global Logistics',
        assignedTo: 'Sarah Chen',
        priority: 'high' as const,
      },
      {
        id: '#1022',
        title: 'Real Estate Due Diligence',
        client: 'Property Investors',
        assignedTo: 'Emily Davis',
        priority: 'medium' as const,
      },
    ],
    delivered: [
      {
        id: '#1020',
        title: 'IP Rights',
        client: 'Creative Works',
        assignedTo: 'Michael Ross',
        priority: 'medium' as const,
      },
    ],
  };

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">Case Oversight</h1>
          <p className="text-slate-500 text-base">Monitor all firm cases across workflow stages</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid
            </button>
          </div>
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
            placeholder="Search cases by ID, title, client..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Lawyers</option>
            <option>James Wilson</option>
            <option>Sarah Chen</option>
            <option>Michael Ross</option>
          </select>
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
          </select>
        </div>
      </div>

      {/* Kanban View */}
      {
  viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {/* Column Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`size-3 rounded-full ${column.color}`}></div>
                      <h3 className="font-bold text-slate-900">{column.title}</h3>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                      {column.count}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="p-3 space-y-3 bg-slate-50/50 min-h-[600px] max-h-[600px] overflow-y-auto">
                  {casesByStatus[column.id]?.map((case_) => (
                    <div
                      key={case_.id}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all cursor-move group"
                      draggable
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400">{case_.id}</span>
                        {case_.priority === 'urgent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            <span className="size-1 rounded-full bg-red-600 animate-pulse"></span>
                            URGENT
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{case_.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">{case_.client}</p>
                      {case_.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-slate-200"></div>
                          <span className="text-xs font-medium text-slate-600">
                            {case_.assignedTo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {
  viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(casesByStatus)
            .flat()
            .map((case_: any) => (
              <RequestCard
                key={case_.id}
                id={case_.id}
                title={case_.title}
                client={case_.client}
                department="Corporate"
                status="in_review"
                priority={case_.priority}
                dueDate="Oct 24"
                assignedTo={case_.assignedTo}
              />
            ))}
        </div>
      )}
    </div>
  );
}
