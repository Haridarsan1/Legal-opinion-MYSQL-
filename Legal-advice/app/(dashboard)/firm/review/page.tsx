'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export default function SeniorReviewPage() {
  const [comment, setComment] = useState('');

  const pendingReviews = [
    {
      id: '#1023',
      title: 'Employment Contract Legal Opinion',
      juniorLawyer: 'Sarah Chen',
      submittedDate: 'Oct 23, 2023',
      wordCount: 2500,
      status: 'Pending Review',
    },
    {
      id: '#1022',
      title: 'Real Estate Due Diligence',
      juniorLawyer: 'Emily Davis',
      submittedDate: 'Oct 22, 2023',
      wordCount: 3200,
      status: 'Pending Review',
    },
  ];

  const handleApprove = () => {
    // TODO: Approve opinion
    console.log('Approved');
  };

  const handleReject = () => {
    // TODO: Reject opinion with comments
    console.log('Rejected', { comment });
  };

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          Senior Review Queue
        </h1>
        <p className="text-slate-500 text-base">
          Review and approve opinions drafted by junior lawyers
        </p>
      </div>

      {/* Pending Reviews List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Pending Reviews (18)</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-400">{review.id}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      {review.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{review.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span>
                      {review.juniorLawyer}
                    </span>
                    <span>•</span>
                    <span>{review.submittedDate}</span>
                    <span>•</span>
                    <span>{review.wordCount} words</span>
                  </div>
                </div>
                <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors">
                  Review Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draft Opinion - Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Draft Opinion: Employment Contract
                </h2>
                <p className="text-sm text-slate-500">By Sarah Chen • Oct 23, 2023</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined">download</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined">print</span>
                </button>
              </div>
            </div>

            {/* Opinion Content */}
            <div className="p-8">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Legal Opinion on Employment Contract Review
                </h3>

                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>Case Background:</strong> The client, Global Logistics Ltd, has requested
                  a comprehensive review of their standard employment contract template for
                  compliance with the Industrial Employment (Standing Orders) Act, 1946 and allied
                  labor laws in India.
                </p>

                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>Legal Issues Identified:</strong>
                </p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                  <li>
                    Compliance with mandatory provisions under the Industrial Employment (Standing
                    Orders) Act, 1946
                  </li>
                  <li>Adequacy of termination clauses under the Industrial Disputes Act, 1947</li>
                  <li>
                    Non-compete and confidentiality provisions under Contract Act and common law
                  </li>
                  <li>Compliance with Equal Remuneration Act, 1976</li>
                </ul>

                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>Analysis:</strong> Upon detailed review of the employment contract
                  template, we note several areas requiring modification to ensure full compliance
                  with applicable Indian labor laws...
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
                  <p className="text-sm text-yellow-800">
                    <strong className="material-symbols-outlined text-sm mr-1 align-middle">
                      edit_note
                    </strong>
                    <strong>Senior Review Note:</strong> This section requires expansion with
                    specific statutory references and case law citations.
                  </p>
                </div>

                <p className="text-slate-700 leading-relaxed mb-4">
                  <strong>Recommendations:</strong>
                </p>
                <ol className="list-decimal pl-6 text-slate-700 space-y-2 mb-4">
                  <li>
                    Revise termination clause to align with Section 25F of the Industrial Disputes
                    Act
                  </li>
                  <li>
                    Include specific provisions for notice period as per industry practice (30-90
                    days)
                  </li>
                  <li>
                    Ensure non-compete clauses are reasonable in scope, duration, and geography
                  </li>
                </ol>

                <p className="text-slate-700 leading-relaxed">
                  <strong>Conclusion:</strong> Subject to the modifications recommended above, the
                  employment contract template is generally compliant with applicable Indian labor
                  laws.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Actions - Sidebar */}
        <div className="space-y-6">
          {/* Review Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Review Checklist</h3>
            <div className="space-y-3">
              {[
                'Legal accuracy verified',
                'Citations properly formatted',
                'Recommendations are actionable',
                'Language is professional',
                'No grammatical errors',
                'Appropriate scope of opinion',
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Review Comments */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Review Comments</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              rows={6}
              placeholder="Add your feedback for the junior lawyer..."
            ></textarea>
          </div>

          {/* Actions */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Review Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                className="w-full px-4 py-3 bg-success hover:bg-success/90 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <ThumbsUp className="size-5" />
                Approve & Send to Client
              </button>
              <button className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="size-5" />
                Request Revisions
              </button>
              <button
                onClick={handleReject}
                className="w-full px-4 py-3 bg-danger hover:bg-danger/90 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <ThumbsDown className="size-5" />
                Reject Draft
              </button>
            </div>
          </div>

          {/* Junior Lawyer Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h4 className="font-bold text-slate-900 mb-3 text-sm">Author Information</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full bg-slate-300"></div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Sarah Chen</p>
                <p className="text-xs text-slate-500">Junior Associate</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Cases Completed:</span>
                <span className="font-medium">16</span>
              </div>
              <div className="flex justify-between">
                <span>Approval Rate:</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
