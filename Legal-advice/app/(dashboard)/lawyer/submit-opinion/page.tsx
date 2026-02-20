'use client';

import { useState } from 'react';
import FileUploader from '@/components/shared/FileUploader';
import { Send } from 'lucide-react';

export default function SubmitOpinionPage() {
  const [selectedCase, setSelectedCase] = useState('');
  const [opinion, setOpinion] = useState('');

  const cases = [
    {
      id: '#1024',
      title: 'Corporate Tax Review',
      client: 'Tech Solutions Pvt Ltd',
      department: 'Corporate',
    },
    {
      id: '#1023',
      title: 'Employment Contract',
      client: 'Global Logistics Ltd',
      department: 'Labour',
    },
    {
      id: '#1020',
      title: 'IP Rights Infringement',
      client: 'Creative Works Studio',
      department: 'IP',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit opinion
    console.log({ selectedCase, opinion });
  };

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1200px] mx-auto w-full">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          Submit Legal Opinion
        </h1>
        <p className="text-slate-500 text-base">Draft and submit your professional legal opinion</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Opinion Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Select Case */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Select Case <span className="text-danger">*</span>
                </label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  required
                >
                  <option value="">Choose a case...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.title} ({c.client})
                    </option>
                  ))}
                </select>
              </div>

              {/* Opinion Summary */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Opinion Summary <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="e.g., Favorable for acquisition with conditions"
                  required
                />
              </div>

              {/* Detailed Opinion */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Detailed Legal Opinion <span className="text-danger">*</span>
                </label>
                <textarea
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none font-mono"
                  rows={16}
                  placeholder="Enter your comprehensive legal opinion here...

Include:
1. Case Background & Facts
2. Legal Issues Identified
3. Applicable Laws & Precedents
4. Analysis & Reasoning
5. Conclusions & Recommendations
6. Disclaimers (if any)"
                  required
                ></textarea>
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 500 words. Use professional legal language.
                </p>
              </div>

              {/* Upload Supporting Documents */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Supporting Documents
                </label>
                <FileUploader acceptedTypes={['PDF', 'DOCX']} maxFileSize={25} />
              </div>

              {/* Confidence Level */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Confidence Level
                </label>
                <div className="flex gap-3">
                  {[
                    { label: 'Low', color: 'border-slate-200' },
                    { label: 'Medium', color: 'border-amber-300' },
                    { label: 'High', color: 'border-green-300' },
                    { label: 'Very High', color: 'border-green-500' },
                  ].map((level) => (
                    <button
                      key={level.label}
                      type="button"
                      className={`flex-1 px-4 py-2 border-2 ${level.color} rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="disclaimer"
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                  required
                />
                <label htmlFor="disclaimer" className="ml-2 text-sm text-slate-700">
                  I confirm that this opinion is based on my professional assessment and complies
                  with all applicable legal and ethical standards.
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <Send className="size-4" />
                  Submit Opinion
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Guidelines */}
        <div className="space-y-6">
          {/* Guidelines Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">checklist</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-3">Opinion Checklist</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  {[
                    'Review all case documents',
                    'Verify facts and timeline',
                    'Cite relevant laws & precedents',
                    'Provide clear recommendations',
                    'Include risk assessment',
                    'Proofread for accuracy',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Template Library */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">folder_open</span>
              Opinion Templates
            </h3>
            <div className="space-y-2">
              {[
                'Corporate M&A Opinion',
                'IP Rights Opinion',
                'Real Estate Opinion',
                'Tax Advisory Opinion',
              ].map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Opinions Submitted</span>
                <span className="text-lg font-bold text-slate-900">48</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Avg. Turnaround</span>
                <span className="text-lg font-bold text-slate-900">32h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Client Satisfaction</span>
                <span className="text-lg font-bold text-green-600">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
