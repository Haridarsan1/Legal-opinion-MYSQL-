'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, XCircle, FileText, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ChecklistItem {
  id: string;
  checklist_id: string;
  document_name: string;
  description: string;
  is_mandatory: boolean;
  status: 'pending' | 'submitted' | 'verified' | 'rejected' | 'not_required';
  file_type_hints?: string;
  document_id?: string;
  notes?: string;
}

interface Props {
  requestId: string;
  caseType?: string;
  userRole: 'client' | 'lawyer';
}

export default function DocumentChecklistWidget({ requestId, caseType, userRole }: Props) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ total: 0, completed: 0, mandatory: 0, percentage: 0 });
    useEffect(() => {
    loadChecklist();
  }, [requestId]);

  const loadChecklist = async () => {
    try {
      // Fetch checklist items with associated checklist details
      const { data, error } = await supabase
        .from('document_checklist_items')
        .select(
          `
                    id,
                    checklist_id,
                    status,
                    document_id,
                    notes,
                    checklist:document_checklists (
                        document_name,
                        description,
                        is_mandatory,
                        file_type_hints,
                        display_order
                    )
                `
        )
        .eq('request_id', requestId)
        .order('checklist(display_order)', { ascending: true });

      if (error) throw error;

      // Transform data
      const items: ChecklistItem[] = (data || []).map((item: any) => ({
        id: item.id,
        checklist_id: item.checklist_id,
        document_name: item.checklist?.document_name || 'Unknown',
        description: item.checklist?.description || '',
        is_mandatory: item.checklist?.is_mandatory || false,
        status: item.status,
        file_type_hints: item.checklist?.file_type_hints,
        document_id: item.document_id,
        notes: item.notes,
      }));

      setChecklistItems(items);

      // Calculate progress
      const total = items.length;
      const mandatory = items.filter((i) => i.is_mandatory).length;
      const completed = items.filter(
        (i) => i.status === 'verified' || i.status === 'not_required'
      ).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      setProgress({ total, mandatory, completed, percentage });
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotRequired = async (itemId: string) => {
    if (userRole !== 'lawyer') return;

    try {
      const { error } = await supabase
        .from('document_checklist_items')
        .update({
          status: 'not_required',
          marked_not_required_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      loadChecklist(); // Refresh
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const getStatusIcon = (status: string, isMandatory: boolean) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'submitted':
        return <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'not_required':
        return <Circle className="w-5 h-5 text-slate-400" />;
      default:
        return isMandatory ? (
          <AlertCircle className="w-5 h-5 text-amber-600" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300" />
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      verified: 'bg-green-100 text-green-700',
      submitted: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
      not_required: 'bg-slate-100 text-slate-600',
      pending: 'bg-amber-100 text-amber-700',
    };
    const labels = {
      verified: 'Verified',
      submitted: 'Submitted',
      rejected: 'Rejected',
      not_required: 'Not Required',
      pending: 'Pending',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges] || badges.pending}`}
      >
        {labels[status as keyof typeof labels] || 'Pending'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl border border-slate-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-2 bg-slate-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!caseType || checklistItems.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-sm text-slate-600">
          {!caseType
            ? 'Set a case type to see required documents'
            : 'No document checklist available for this case type'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200">
      {/* Header with Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900">Document Checklist</h3>
          <span className="text-sm font-semibold text-slate-600">
            {progress.completed}/{progress.total} Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        <p className="text-xs text-slate-600">{progress.mandatory} mandatory documents required</p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border-2 transition-colors ${
              item.status === 'verified'
                ? 'bg-green-50 border-green-200'
                : item.status === 'rejected'
                  ? 'bg-red-50 border-red-200'
                  : item.status === 'submitted'
                    ? 'bg-blue-50 border-blue-200'
                    : item.status === 'not_required'
                      ? 'bg-slate-50 border-slate-200'
                      : item.is_mandatory
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="mt-0.5">{getStatusIcon(item.status, item.is_mandatory)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {item.document_name}
                      {
  item.is_mandatory && <span className="ml-2 text-red-600 text-xs">*</span>}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                    )}
                    {
  item.file_type_hints && (
                      <p className="text-xs text-slate-500 mt-1">
                        Suggested formats: {item.file_type_hints}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                {/* Lawyer Notes */}
                {
  item.notes && (
                  <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                    <p className="text-xs text-slate-700">{item.notes}</p>
                  </div>
                )}

                {/* Lawyer Actions */}
                {
  userRole === 'lawyer' && item.status === 'pending' && !item.is_mandatory && (
                  <button
                    onClick={() => handleMarkNotRequired(item.id)}
                    className="mt-2 text-xs text-slate-600 hover:text-slate-900 underline"
                  >
                    Mark as Not Required
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          Upload documents in the "Documents" tab. They will automatically be matched to checklist
          items.
        </p>
      </div>
    </div>
  );
}
