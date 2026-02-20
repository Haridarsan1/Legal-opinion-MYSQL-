'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<
    'departments' | 'checklists' | 'templates' | 'announcements'
  >('departments');

  const departments = [
    { id: 1, name: 'Corporate & Tax Law', icon: 'business', active: true, caseCount: 284 },
    { id: 2, name: 'Intellectual Property', icon: 'lightbulb', active: true, caseCount: 192 },
    { id: 3, name: 'Real Estate & Property', icon: 'home', active: true, caseCount: 348 },
    { id: 4, name: 'Employment Law', icon: 'badge', active: true, caseCount: 156 },
  ];

  const checklists = [
    {
      id: 1,
      name: 'Property Title Verification',
      department: 'Real Estate',
      documents: ['Sale Deed', 'Title Certificate', 'Encumbrance Certificate', 'Tax Receipts'],
    },
    {
      id: 2,
      name: 'Corporate Due Diligence',
      department: 'Corporate Law',
      documents: [
        'MOA/AOA',
        'Board Resolutions',
        'Financial Statements',
        'Compliance Certificates',
      ],
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
            Content Management
          </h1>
          <p className="text-slate-500 text-base">
            Manage legal departments, document checklists, templates, and platform announcements
          </p>
        </div>
        <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
          <Plus className="size-5" />
          Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'departments' as const, label: 'Departments', icon: 'category' },
          { id: 'checklists' as const, label: 'Document Checklists', icon: 'checklist' },
          { id: 'templates' as const, label: 'Opinion Templates', icon: 'description' },
          { id: 'announcements' as const, label: 'Announcements', icon: 'campaign' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {dept.icon}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <Edit className="size-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{dept.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{dept.caseCount} cases</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      dept.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${dept.active ? 'bg-green-600' : 'bg-slate-400'}`}
                    ></span>
                    {dept.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer min-h-[200px]">
            <div className="p-3 bg-slate-200 rounded-full mb-3">
              <Plus className="size-6 text-slate-600" />
            </div>
            <p className="font-bold text-slate-700">Add New Department</p>
            <p className="text-xs text-slate-500 mt-1">Create a new practice area</p>
          </div>
        </div>
      )}

      {/* Document Checklists Tab */}
      {activeTab === 'checklists' && (
        <div className="space-y-6">
          {checklists.map((checklist) => (
            <div
              key={checklist.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{checklist.name}</h3>
                  <p className="text-sm text-slate-500">{checklist.department}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                    <Edit className="size-5" />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-danger hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-bold text-slate-700 mb-3">Required Documents:</p>
                <ul className="space-y-2">
                  {checklist.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="material-symbols-outlined text-primary text-sm">
                        check_circle
                      </span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-slate-400 text-3xl">description</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Opinion Templates</h3>
          <p className="text-sm text-slate-500 mb-6">
            Manage standardized opinion templates for different practice areas
          </p>
          <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors">
            Create Template
          </button>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Platform Announcements</h3>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">campaign</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">System Maintenance Scheduled</h4>
                    <p className="text-sm text-slate-700 mb-2">
                      Platform will undergo maintenance on Sunday, Oct 29 from 2 AM - 4 AM IST
                    </p>
                    <p className="text-xs text-slate-500">Posted: Oct 24, 2023</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <Edit className="size-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-danger transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
