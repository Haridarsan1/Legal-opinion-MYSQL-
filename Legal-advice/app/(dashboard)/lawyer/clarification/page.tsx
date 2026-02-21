'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ClarificationPage() {
  const [selectedCase, setSelectedCase] = useState('');
  const [message, setMessage] = useState('');

  const cases = [
    { id: '#1024', title: 'Corporate Tax Review', client: 'Tech Solutions Pvt Ltd' },
    { id: '#1023', title: 'Employment Contract', client: 'Global Logistics Ltd' },
    { id: '#102', title: 'Property Acquisition', client: 'Real Estate Holdings' },
  ];

  const previousClarifications = [
    {
      caseId: '#1020',
      title: 'IP Rights Infringement',
      question: 'Can you provide the trademark registration certificate?',
      response: 'Attached in the documents section.',
      date: 'Oct 18, 2023',
      status: 'Answered',
    },
    {
      caseId: '#1018',
      title: 'Real Estate Acquisition',
      question: 'What is the current zoning classification of the property?',
      response: 'Pending client response...',
      date: 'Oct 15, 2023',
      status: 'Pending',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send clarification request
    console.log({ selectedCase, message });
    setMessage('');
  };

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1200px] mx-auto w-full">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          Request Clarification
        </h1>
        <p className="text-slate-500 text-base">
          Ask clients for additional information or documentation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: New Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">New Clarification Request</h2>
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
                  {cases.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.title} ({c.client})
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Your Question <span className="text-danger">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  rows={8}
                  placeholder="Describe what additional information or documents you need from the client..."
                  required
                ></textarea>
                <p className="text-xs text-slate-500 mt-1">
                  Be specific about what you need and why it's required for the opinion.
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Priority Level
                </label>
                <div className="flex gap-3">
                  {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Attach Reference (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">
                    attach_file
                  </span>
                  <p className="text-sm text-slate-600">
                    Click to attach supporting documents or references
                  </p>
                </div>
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
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Previous Clarifications */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">info</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Best Practices</h3>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">•</span>
                    <span>Be specific about what you need</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">•</span>
                    <span>Explain why it's essential</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">•</span>
                    <span>Set realistic deadlines</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Clarifications */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Recent Clarifications</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {previousClarifications.map((clarification, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-slate-400">{clarification.caseId}</p>
                      <p className="text-sm font-semibold text-slate-900">{clarification.title}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        clarification.status === 'Answered'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {clarification.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">
                    <strong>Q:</strong> {clarification.question}
                  </p>
                  <p className="text-xs text-slate-500 italic mb-2">
                    <strong>A:</strong> {clarification.response}
                  </p>
                  <p className="text-[10px] text-slate-400">{clarification.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
