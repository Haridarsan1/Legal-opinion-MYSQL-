'use client';

import { useState } from 'react';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
}

interface Props {
  onValidate: (isValid: boolean) => void;
  hasDocuments: boolean;
  hasClarifications: boolean;
  unresolvedClarifications: number;
}

export default function OpinionChecklist({
  onValidate,
  hasDocuments,
  hasClarifications,
  unresolvedClarifications,
}: Props) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'review_docs', label: 'Reviewed all client documents', checked: false, required: true },
    {
      id: 'resolve_clarifications',
      label: 'Resolved all clarifications',
      checked: unresolvedClarifications === 0,
      required: true,
    },
    { id: 'research', label: 'Completed legal research', checked: false, required: true },
    {
      id: 'citations',
      label: 'Added relevant case law citations',
      checked: false,
      required: false,
    },
    { id: 'proofreading', label: 'Proofread opinion for accuracy', checked: false, required: true },
    {
      id: 'client_review',
      label: 'Considered client-specific context',
      checked: false,
      required: true,
    },
  ]);

  const handleToggle = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);

    // Validate: all required items must be checked
    const allRequiredChecked = updated
      .filter((item) => item.required)
      .every((item) => item.checked);

    onValidate(allRequiredChecked);
  };

  const requiredComplete = checklist.filter((item) => item.required && item.checked).length;
  const requiredTotal = checklist.filter((item) => item.required).length;
  const allComplete = requiredComplete === requiredTotal;

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Pre-Submission Checklist</h3>
          <p className="text-sm text-slate-600">
            {requiredComplete} of {requiredTotal} required items completed
          </p>
        </div>
        {allComplete ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Ready to submit</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-semibold">Action required</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            allComplete ? 'bg-green-600' : 'bg-blue-600'
          }`}
          style={{ width: `${(requiredComplete / requiredTotal) * 100}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
              item.checked
                ? 'border-green-300 bg-green-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                item.checked ? 'bg-green-600 text-white' : 'border-2 border-slate-300'
              }`}
            >
              {item.checked && <CheckCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1 text-left">
              <p
                className={`text-sm font-medium ${
                  item.checked ? 'text-green-900' : 'text-slate-900'
                }`}
              >
                {item.label}
                {item.required && <span className="ml-1 text-red-500">*</span>}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Warnings */}
      {!hasDocuments && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ⚠️ No documents uploaded by client. Ensure you have all necessary information.
          </p>
        </div>
      )}

      {unresolvedClarifications > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ {unresolvedClarifications} unresolved{' '}
            {unresolvedClarifications === 1 ? 'clarification' : 'clarifications'}. Resolve before
            submitting opinion.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500">* Required items must be completed before submission</p>
    </div>
  );
}
