'use client';

import { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Department {
  id: string;
  name: string;
}

interface Lawyer {
  id: string;
  full_name: string;
  specialization?: string | string[];
  years_of_experience?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lawyer: Lawyer;
  departments: Department[];
  clientId: string;
}

type ConsultationType = 'preliminary' | 'detailed' | 'property' | 'other';
type Urgency = 'normal' | 'high' | 'urgent';

const CONSULTATION_TYPES = [
  {
    value: 'preliminary' as ConsultationType,
    label: 'Preliminary Advice',
    description: 'Quick legal guidance on your matter',
  },
  {
    value: 'detailed' as ConsultationType,
    label: 'Detailed Legal Opinion',
    description: 'Comprehensive legal analysis',
  },
  {
    value: 'property' as ConsultationType,
    label: 'Property / Bank-related',
    description: 'Real estate or banking matters',
  },
  { value: 'other' as ConsultationType, label: 'Other', description: 'Other legal matters' },
];

const URGENCY_LEVELS = [
  {
    value: 'normal' as Urgency,
    label: 'Normal',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    value: 'high' as Urgency,
    label: 'High',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  { value: 'urgent' as Urgency, label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function RequestConsultationModal({
  isOpen,
  onClose,
  lawyer,
  departments,
  clientId,
}: Props) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form data
  const [departmentId, setDepartmentId] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('preliminary');
  const [urgency, setUrgency] = useState<Urgency>('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((file) => {
        const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        return isValidType && isValidSize;
      });
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Create legal request
      const { data: request, error: requestError } = await supabase
        .from('legal_requests')
        .insert({
          client_id: clientId,
          department_id: departmentId,
          title: title,
          description: description,
          priority: urgency === 'urgent' ? 'urgent' : urgency === 'high' ? 'high' : 'medium',
          status: 'submitted',
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Upload files if any
      if (files.length > 0 && request) {
        for (const file of files) {
          const fileName = `${request.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue;
          }

          // Create document record
          await supabase.from('documents').insert({
            request_id: request.id,
            uploaded_by: clientId,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
            document_type: 'supporting_document',
          });
        }
      }

      // Create notification for lawyer
      await supabase.from('notifications').insert({
        user_id: lawyer.id,
        type: 'consultation_request',
        title: 'New Consultation Request',
        message: `New request: ${title}`,
        request_id: request?.id,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit consultation request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = departmentId && consultationType && urgency;
  const canProceedStep2 = title.trim().length >= 5 && description.trim().length >= 50;

  const handleClose = () => {
    setStep(1);
    setDepartmentId('');
    setConsultationType('preliminary');
    setUrgency('normal');
    setTitle('');
    setDescription('');
    setFiles([]);
    setError('');
    setSuccess(false);
    onClose();
  };

  // Success Screen
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Consultation Requested Successfully
          </h3>
          <p className="text-slate-600 mb-6">
            The lawyer will review your request and respond shortly.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                handleClose();
                router.push('/client/track');
              }}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Go to Track Status
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request Consultation</h2>
            <p className="text-sm text-slate-600">
              Share your legal requirement with {lawyer.full_name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    s <= step ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 md:w-20 h-0.5 mx-2 ${s < step ? 'bg-primary' : 'bg-slate-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Legal Context */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Legal Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Consultation Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {CONSULTATION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setConsultationType(type.value)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        consultationType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{type.label}</div>
                          <div className="text-sm text-slate-600">{type.description}</div>
                        </div>
                        {consultationType === type.value && (
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Urgency <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {URGENCY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setUrgency(level.value)}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                        urgency === level.value
                          ? level.color + ' border-current'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Case Summary */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Subject / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for your legal matter"
                  maxLength={100}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <div className="mt-1 text-xs text-slate-500">{title.length}/100 characters</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly explain your legal issue. Avoid sharing sensitive personal data."
                  rows={8}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className={description.length < 50 ? 'text-amber-600' : 'text-green-600'}>
                    {description.length < 50
                      ? `${50 - description.length} characters needed`
                      : 'Minimum met ✓'}
                  </span>
                  <span className="text-slate-500">{description.length}/1000</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Attachments */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Supporting Documents (Optional)
                </label>
                <p className="text-sm text-slate-600 mb-4">
                  Upload relevant documents (PDF, JPG, PNG - max 10MB each)
                </p>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-slate-500">PDF, JPG, PNG (max 10MB)</span>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Documents are securely shared only after the lawyer
                    accepts the request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Lawyer Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium text-slate-900">{lawyer.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Specialization:</span>
                    <span className="font-medium text-slate-900">
                      {Array.isArray(lawyer.specialization)
                        ? lawyer.specialization[0]
                        : lawyer.specialization || 'Legal Expert'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Experience:</span>
                    <span className="font-medium text-slate-900">
                      {lawyer.years_of_experience || 0} years
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-slate-900 mb-2">Your Request</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-slate-600">Department:</div>
                    <div className="font-medium text-slate-900">
                      {departments.find((d) => d.id === departmentId)?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600">Type:</div>
                    <div className="font-medium text-slate-900">
                      {CONSULTATION_TYPES.find((t) => t.value === consultationType)?.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600">Title:</div>
                    <div className="font-medium text-slate-900">{title}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Attachments:</div>
                    <div className="font-medium text-slate-900">{files.length} file(s)</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> This is a consultation request. The lawyer may accept,
                  decline, or request clarification. You will be notified of their response.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Request Consultation
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
