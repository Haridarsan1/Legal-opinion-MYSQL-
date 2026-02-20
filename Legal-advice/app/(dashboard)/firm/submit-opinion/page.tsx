'use client';

import { useState } from 'react';
import FileUploader from '@/components/shared/FileUploader';
import { Send, Stamp } from 'lucide-react';

export default function FirmSubmitOpinionPage() {
  const [selectedCase, setSelectedCase] = useState('');

  const cases = [
    { id: '#1023', title: 'Employment Contract', client: 'Global Logistics Ltd' },
    { id: '#1022', title: 'Real Estate Due Diligence', client: 'Property Investors' },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1200px] mx-auto w-full">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          Submit Firm-Stamped Opinion
        </h1>
        <p className="text-slate-500 text-base">
          Final submission with official firm letterhead and digital stamp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Opinion Finalization</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Select Approved Opinion */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Select Approved Opinion <span className="text-danger">*</span>
                </label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  required
                >
                  <option value="">Choose an approved opinion...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.title} ({c.client})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Only senior-approved opinions appear here
                </p>
              </div>

              {/* Firm Letterhead Preview */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Letterhead Template
                </label>
                <div className="border-2 border-slate-200 rounded-lg p-6 bg-white">
                  <div className="text-center mb-6 pb-4 border-b border-slate-200">
                    <div className="size-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-1">Wilson & Associates</h3>
                    <p className="text-sm text-slate-600">Advocates & Legal Consultants</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Bar Council of India Reg. No.: MH/1234/2015
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Address:</strong> 123 Legal Plaza, Marine Drive, Mumbai - 400001
                    </p>
                    <p>
                      <strong>Email:</strong> legal@wilsonassociates.com | <strong>Phone:</strong>{' '}
                      +91 22 1234 5678
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 italic">
                      [Opinion content will appear here]
                    </p>
                  </div>
                </div>
              </div>

              {/* Digital Stamp Settings */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Digital Stamp & Watermark
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">Apply Firm Digital Stamp</p>
                      <p className="text-xs text-slate-500">
                        Official firm seal with authorized signatory
                      </p>
                    </div>
                    <Stamp className="size-5 text-primary" />
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">
                        Add Confidentiality Watermark
                      </p>
                      <p className="text-xs text-slate-500">
                        "Confidential - Attorney-Client Privileged"
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">Add QR Code</p>
                      <p className="text-xs text-slate-500">For authenticity verification</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Authorized Signatory */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Authorized Signatory <span className="text-danger">*</span>
                </label>
                <select className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                  <option>Select senior partner...</option>
                  <option>Mr. Robert Wilson (Managing Partner)</option>
                  <option>Ms. Jennifer Lee (Senior Partner)</option>
                  <option>Mr. David Kumar (Partner)</option>
                </select>
              </div>

              {/* Additional Attachments */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Additional Attachments (Optional)
                </label>
                <FileUploader acceptedTypes={['PDF', 'DOCX']} maxFileSize={10} />
              </div>

              {/* Confirmation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirm"
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                    required
                  />
                  <label htmlFor="confirm" className="text-sm text-slate-700">
                    I confirm that this opinion has been reviewed and approved by a senior partner
                    and is ready for submission to the client with official firm credentials.
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  Save Draft
                </button>
                <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                  <Send className="size-4" />
                  Submit to Client
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Submission Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Final Checklist</h3>
            <ul className="space-y-3">
              {[
                'Opinion approved by senior partner',
                'Letterhead properly formatted',
                'Digital stamp applied',
                'Signatory authorized',
                'All attachments included',
                'Client details verified',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">info</span>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Submission Info</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Client will receive via secure portal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Email notification sent automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>All submissions are logged for audit</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
