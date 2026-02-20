'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, Upload, Lock, Globe } from 'lucide-react';

export default function NewRequestDetailsUploadPage() {
  const [selectedDepartment] = useState('Corporate'); // Would come from previous step
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');

  // Dynamic checklist based on department
  const checklistByDepartment: Record<string, string[]> = {
    Corporate: [
      'Company Registration',
      'Board Resolution Copy',
      'Shareholder Agreement',
      'Audit Reports (Last 2 Yrs)',
    ],
    Property: [
      'Title Deed / Sale Deed',
      'Encumbrance Certificate',
      'Property Tax Receipts',
      'Approved Building Plan',
    ],
    IP: [
      'Trademark Registration',
      'Patent Documents',
      'Copyright Certificates',
      'Prior Art Search Results',
    ],
  };

  const checklist = checklistByDepartment[selectedDepartment] || [];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black  leading-tight tracking-tight text-slate-900">
            Request Details & Documentation
          </h1>
          <p className="text-slate-500 text-base md:text-lg">
            Provide case details and upload required documents.
          </p>
        </div>

        {/* Stepper */}
        <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full"></div>

            {/* Active Progress Line - 66% */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary w-2/3 rounded-full"></div>

            {/* Step 1 (Completed) */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-success text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-white">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="text-sm font-medium text-success whitespace-nowrap">Department</span>
            </div>

            {/* Step 2 (Active) */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-white">
                <span className="material-symbols-outlined text-sm md:text-base">description</span>
              </div>
              <span className="text-sm font-bold text-primary whitespace-nowrap">Case Details</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold ring-4 ring-white border-2 border-slate-200">
                <span className="material-symbols-outlined text-sm md:text-base">check_circle</span>
              </div>
              <span className="text-sm font-medium text-slate-400 whitespace-nowrap">Review</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Form */}
          <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col gap-8">
              {/* Case Title */}
              <div className="flex flex-col gap-3">
                <label className="text-slate-900 text-base font-bold flex items-center gap-2">
                  Case Title
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-4 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="e.g., Property Acquisition Legal Review"
                />
                <p className="text-sm text-slate-500">
                  Provide a brief, descriptive title for your case.
                </p>
              </div>

              {/* Visibility Toggle */}
              <div className="flex flex-col gap-3">
                <label className="text-slate-900 text-base font-bold flex items-center gap-2">
                  Request Visibility
                  <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      visibility === 'private'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`size-12 rounded-full flex items-center justify-center ${
                          visibility === 'private'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Lock className="size-6" />
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm ${
                            visibility === 'private' ? 'text-primary' : 'text-slate-900'
                          }`}
                        >
                          Private Request
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Assign to a specific lawyer. Details visible only after acceptance.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      visibility === 'public'
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`size-12 rounded-full flex items-center justify-center ${
                          visibility === 'public'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Globe className="size-6" />
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm ${
                            visibility === 'public' ? 'text-blue-600' : 'text-slate-900'
                          }`}
                        >
                          Public Request
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Open to all qualified lawyers. Get multiple responses.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-xl flex-shrink-0">
                    info
                  </span>
                  <p className="text-sm text-blue-900">
                    {visibility === 'private'
                      ? "With private requests, you'll select a lawyer who must accept before you provide full case details."
                      : 'Public requests allow multiple lawyers to view and respond. You can select the best proposal.'}
                  </p>
                </div>
              </div>

              {/* Case Description */}
              <div className="flex flex-col gap-3">
                <label className="text-slate-900 text-base font-bold flex items-center gap-2">
                  Detailed Description
                  <span className="text-danger">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-4 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  rows={6}
                  placeholder="Describe your legal matter in detail. Include relevant background, specific questions, and any deadlines or concerns..."
                ></textarea>
                <p className="text-sm text-slate-500">
                  Minimum 100 characters. Be as specific as possible.
                </p>
              </div>

              {/* File Upload Section */}
              <div className="flex flex-col gap-3">
                <label className="text-slate-900 text-base font-bold">Upload Documents</label>

                {/* Drag & Drop Zone */}
                <div className="w-full relative group">
                  <input
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    multiple
                    type="file"
                  />
                  <div className="flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 group-hover:bg-primary/5 group-hover:border-primary/50 transition-all duration-200 cursor-pointer">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      <Upload className="size-8" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900 mb-1">
                      <span className="text-primary hover:underline">Click to upload</span> or drag
                      and drop
                    </p>
                    <p className="text-sm text-slate-500">PDF, JPG, PNG or DOCX (max. 10MB each)</p>
                  </div>
                </div>

                {/* Uploaded Files List */}
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                        <FileText className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-900">
                          preliminary_brief_v1.pdf
                        </p>
                        <p className="text-xs text-slate-500">2.4 MB • Uploaded just now</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-5 text-success" />
                      <button className="text-slate-400 hover:text-danger transition-colors p-2">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="flex flex-col gap-3">
                <label className="text-slate-900 text-base font-bold">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-4 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  rows={3}
                  placeholder="Any other information that might be helpful..."
                ></textarea>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <Link
                href="/client/request/new"
                className="text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back
              </Link>
              <button className="bg-primary hover:bg-primary/90 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-md flex items-center gap-2 transition-all">
                Submit Request
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Checklist */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            {/* Dynamic Checklist */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">fact_check</span>
                <h3 className="font-bold text-slate-900">Required Documents</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Based on <strong>{selectedDepartment} Law</strong>, we recommend preparing these
                files:
              </p>
              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="material-symbols-outlined text-success text-lg">
                    check_circle
                  </span>
                  <span className="line-through decoration-slate-400 text-slate-400">
                    {checklist[0]}
                  </span>
                </li>
                {checklist.slice(1).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="size-4 rounded-full border-2 border-slate-300 mt-0.5 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 p-3 rounded-lg bg-blue-50 border border-blue-100 flex gap-3">
                <span className="material-symbols-outlined text-primary text-lg">info</span>
                <p className="text-xs text-primary leading-relaxed">
                  Missing documents can be uploaded later, but may delay the initial assessment.
                </p>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-900 mb-2 text-sm">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Our support team is available 24/7 to assist you with your submission.
              </p>
              <button className="w-full bg-white border border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                Chat with Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
