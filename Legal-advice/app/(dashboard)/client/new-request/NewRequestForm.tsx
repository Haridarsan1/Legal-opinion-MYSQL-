'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Globe, Send, Loader, ArrowRight, Check, User } from 'lucide-react';
import { toast } from 'sonner';
import { createLegalRequest } from '@/app/actions/requests';
import { listAvailableLawyers } from '@/app/actions/messages';
import LawyerSelectionModal from './LawyerSelectionModal';

interface Department {
  id: string;
  name: string;
  [key: string]: any;
}

interface Lawyer {
  id: string;
  full_name: string;
  bar_council_id?: string;
  specialization?: string[];
  email?: string;
  years_of_experience?: number;
  avatar_url?: string;
  bio?: string;
  location?: string;
  rating?: number;
  reviews_count?: number;
  availability_status?: 'Available' | 'In Court' | 'Offline';
  title?: string;
}

interface Props {
  departments: Department[];
}

export default function NewRequestForm({ departments }: Props) {
  const router = useRouter();

  // Form state
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loadingLawyers, setLoadingLawyers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false);

  // Marketplace Fields State
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [expectedTimeline, setExpectedTimeline] = useState('');
  const [complexity, setComplexity] = useState('medium');
  const [experience, setExperience] = useState('');
  const [confidentiality, setConfidentiality] = useState('public');
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const [jurisdiction, setJurisdiction] = useState('');

  // Fetch available lawyers
  useEffect(() => {
    const fetchLawyers = async () => {
      setLoadingLawyers(true);
      try {
        const result = await listAvailableLawyers();
        if (result.success && result.data) {
          setLawyers(result.data);
        } else {
          toast.error('Failed to load lawyers');
        }
      } catch (error) {
        toast.error('Error loading lawyers');
      } finally {
        setLoadingLawyers(false);
      }
    };
    fetchLawyers();
  }, []);

  // Validation
  const isStep1Valid = visibility !== null;
  const isStep2Valid = visibility === 'public' || (selectedDept && selectedLawyer);
  const isStep3Valid = !!budgetMin && !!budgetMax && !!expectedTimeline;
  const isStep4Valid = title.trim().length > 0 && description.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStep4Valid) {
      toast.error('Please complete the request details');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('visibility', visibility);
      formData.append('priority', priority);

      // Append Marketplace Fields
      if (budgetMin) formData.append('budgetMin', budgetMin);
      if (budgetMax) formData.append('budgetMax', budgetMax);
      if (expectedTimeline) formData.append('expectedTimeline', expectedTimeline);
      formData.append('complexity', complexity);
      if (experience) formData.append('experience', experience);
      formData.append('confidentiality', confidentiality);
      formData.append('deliverables', JSON.stringify(deliverables.filter((d: any) => d.trim() !== '')));
      if (jurisdiction) formData.append('jurisdiction', jurisdiction);

      if (visibility === 'private') {
        formData.append('departmentId', selectedDept);
        formData.append('assignedLawyerId', selectedLawyer);
      } else {
        formData.append('departmentId', selectedDept);
      }

      const result = await createLegalRequest(formData);

      if (result.success) {
        toast.success('Request created successfully!');
        router.push('/client/track');
      } else {
        toast.error(result.error || 'Failed to create request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900">
            Request Legal Opinion
          </h1>
          <p className="text-slate-500 text-base md:text-lg">
            Get expert legal advice from qualified lawyers on your case.
          </p>
        </div>

        {/* Stepper */}
        <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full"></div>

            {/* Active Progress Line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-primary to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>

            {/* Step 1 - Visibility */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white transition-all ${
                  currentStep >= 1
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                }`}
              >
                {currentStep > 1 ? <Check className="size-5" /> : <span>1</span>}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap ${
                  currentStep >= 1 ? 'text-primary font-bold' : 'text-slate-400'
                }`}
              >
                Visibility
              </span>
            </div>

            {/* Step 2 - Context */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white transition-all ${
                  currentStep >= 2
                    ? 'bg-primary text-white'
                    : currentStep === 1
                      ? 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                      : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                }`}
              >
                {currentStep > 2 ? <Check className="size-5" /> : <span>2</span>}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap ${
                  currentStep >= 2 ? 'text-primary font-bold' : 'text-slate-400'
                }`}
              >
                Context
              </span>
            </div>

            {/* Step 3 - Specs */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white transition-all ${
                  currentStep >= 3
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                }`}
              >
                {currentStep > 3 ? <Check className="size-5" /> : <span>3</span>}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap ${
                  currentStep >= 3 ? 'text-primary font-bold' : 'text-slate-400'
                }`}
              >
                Specs
              </span>
            </div>

            {/* Step 4 - Review */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`size-10 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white transition-all ${
                  currentStep >= 4
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                }`}
              >
                {currentStep > 4 ? <Check className="size-5" /> : <span>4</span>}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap ${
                  currentStep >= 4 ? 'text-primary font-bold' : 'text-slate-400'
                }`}
              >
                Review
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Visibility Selection */}
        {
  currentStep === 1 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              How would you like to post your request?
            </h2>
            <p className="text-slate-600 mb-8">
              Choose between posting privately to a specific lawyer or publicly for any qualified
              lawyer to respond.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Private Option */}
              <button
                type="button"
                onClick={() => {
                  setVisibility('private');
                  setCurrentStep(2);
                }}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                  visibility === 'private'
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`size-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                      visibility === 'private'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-primary/5 group-hover:text-primary'
                    } transition-all`}
                  >
                    <Lock className="size-7" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-lg mb-2 ${
                        visibility === 'private' ? 'text-primary' : 'text-slate-900'
                      }`}
                    >
                      Private Request
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Assign to a specific lawyer. Only they can see your request until they accept
                      or decline.
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Benefits:</p>
                      <ul className="text-xs text-slate-600 space-y-1 mt-2">
                        <li>✓ Confidential and personalized</li>
                        <li>✓ Direct communication</li>
                        <li>✓ Dedicated attention</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </button>

              {/* Public Option */}
              <button
                type="button"
                onClick={() => {
                  setVisibility('public');
                  setSelectedLawyer('');
                  setCurrentStep(2);
                }}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                  visibility === 'public'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`size-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                      visibility === 'public'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                    } transition-all`}
                  >
                    <Globe className="size-7" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-lg mb-2 ${
                        visibility === 'public' ? 'text-blue-600' : 'text-slate-900'
                      }`}
                    >
                      Public Request
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Open to all qualified lawyers. Review proposals and choose the best match for
                      your case.
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Benefits:</p>
                      <ul className="text-xs text-slate-600 space-y-1 mt-2">
                        <li>✓ Multiple perspectives</li>
                        <li>✓ Competitive pricing</li>
                        <li>✓ Best match selection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-between items-center">
              <Link
                href="/client/requests"
                className="text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                ← Back to Requests
              </Link>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!isStep1Valid}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Continue <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Department & Lawyer Selection */}
        {
  currentStep === 2 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {visibility === 'private' ? 'Select Department & Lawyer' : 'Select Department'}
            </h2>
            <p className="text-slate-600 mb-8">
              {visibility === 'private'
                ? 'Choose the department and the specific lawyer you want to work with.'
                : 'Choose the legal department relevant to your case.'}
            </p>

            <div className="space-y-6 mb-8">
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Legal Department <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                >
                  <option value="">Choose a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-slate-500 mt-2">
                  Select the area of law relevant to your case.
                </p>
              </div>

              {/* Lawyer Selection (Private Only) */}
              {
  visibility === 'private' && (
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Select Lawyer <span className="text-red-600">*</span>
                  </label>

                  {!selectedLawyer ? (
                    <button
                      type="button"
                      onClick={() => setIsLawyerModalOpen(true)}
                      className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <User className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                            Select a Lawyer
                          </p>
                          <p className="text-sm text-slate-500">Browse verified legal experts</p>
                        </div>
                        <div className="ml-auto bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 shadow-sm group-hover:border-primary/30 group-hover:text-primary">
                          Open Directory
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="w-full p-4 border-2 border-primary/20 bg-primary/5 rounded-xl relative group">
                      <div className="flex items-start gap-4">
                        {(() => {
                          const lawyer = lawyers.find((l) => l.id === selectedLawyer);
                          if (!lawyer) return null;
                          return (
                            <>
                              {lawyer.avatar_url ? (
                                <Image
                                  src={lawyer.avatar_url}
                                  alt={lawyer.full_name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                  <div className="font-bold text-lg">
                                    {lawyer.full_name.charAt(0)}
                                  </div>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h3 className="font-bold text-slate-900">{lawyer.full_name}</h3>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
                                    Selected
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-1">
                                  {lawyer.bar_council_id}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {(Array.isArray(lawyer.specialization)
                                    ? lawyer.specialization
                                    : []
                                  )
                                    .slice(0, 2)
                                    .map((s, i) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsLawyerModalOpen(true)}
                                className="px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                Change
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-500 mt-2">
                    Choose the lawyer who best fits your legal needs.
                  </p>
                </div>
              )}

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['low', 'medium', 'high', 'urgent'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-3 px-3 rounded-xl border-2 font-semibold text-sm capitalize transition-all ${
                        priority === p
                          ? `border-${
                              p === 'low'
                                ? 'green'
                                : p === 'medium'
                                  ? 'blue'
                                  : p === 'high'
                                    ? 'orange'
                                    : 'red'
                            }-600 bg-${
                              p === 'low'
                                ? 'green'
                                : p === 'medium'
                                  ? 'blue'
                                  : p === 'high'
                                    ? 'orange'
                                    : 'red'
                            }-50 text-${
                              p === 'low'
                                ? 'green'
                                : p === 'medium'
                                  ? 'blue'
                                  : p === 'high'
                                    ? 'orange'
                                    : 'red'
                            }-600`
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={!isStep2Valid}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Continue <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Project Specifications */}
        {
  currentStep === 3 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Specifications</h2>
            <p className="text-slate-600 mb-8">
              Define the scope, budget, and requirements to attract the right lawyers.
            </p>

            <div className="space-y-8 mb-8">
              {/* Budget & Timeline Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Budget Range (₹) <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="Min"
                        className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                        min="0"
                      />
                    </div>
                    <span className="text-slate-400 font-bold">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="Max"
                        className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                        min="0"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Estimated feee range for this service.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Expected Timeline <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={expectedTimeline}
                      onChange={(e) => setExpectedTimeline(e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                      min="1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                      days
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    When do you need the final opinion/service delivered?
                  </p>
                </div>
              </div>

              {/* Complexity & Experience Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Complexity Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((c: any) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setComplexity(c)}
                        className={`py-2 px-2 rounded-lg border-2 font-semibold text-sm capitalize transition-all ${
                          complexity === c
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Min. Experience Required
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                  >
                    <option value="">Any Experience</option>
                    <option value="3">3+ Years</option>
                    <option value="5">5+ Years</option>
                    <option value="10">10+ Years</option>
                    <option value="15">15+ Years</option>
                  </select>
                </div>
              </div>

              {/* Confidentiality */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Confidentiality Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'public', label: 'Standard', desc: 'Visible to all verified lawyers' },
                    {
                      id: 'confidential',
                      label: 'Confidential',
                      desc: 'Identities hidden until matched',
                    },
                    {
                      id: 'highly_confidential',
                      label: 'Strictly Confidential',
                      desc: 'NDA required to view details',
                    },
                  ].map((conf) => (
                    <button
                      key={conf.id}
                      type="button"
                      onClick={() => setConfidentiality(conf.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        confidentiality === conf.id
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm mb-0.5">{conf.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{conf.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Expected Deliverables{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="space-y-2">
                  {deliverables.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newDeliverables = [...deliverables];
                          newDeliverables[index] = e.target.value;
                          setDeliverables(newDeliverables);
                        }}
                        placeholder={
                          index === 0 ? 'e.g. Legal Opinion Document' : 'Add another deliverable...'
                        }
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary focus:outline-none"
                      />
                      {deliverables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newDeliverables = deliverables.filter((_, i) => i !== index);
                            setDeliverables(newDeliverables);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDeliverables([...deliverables, ''])}
                    className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    + Add Deliverable
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={!isStep3Valid}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Continue <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        )}
        {
  currentStep === 4 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Title</h2>
            <p className="text-slate-600 mb-8">
              Provide a clear, concise title for your legal opinion request.
            </p>

            <div className="mb-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Opinion Request Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Property Purchase Agreement Review, Contract Dispute Consultation"
                  className="w-full px-4 py-4 border-2 border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-lg"
                  disabled={loading}
                  maxLength={200}
                />
                <div className="flex justify-between mt-3">
                  <p className="text-sm text-slate-500">
                    Be specific and descriptive for better lawyer matching.
                  </p>
                  <p className="text-sm text-slate-500 font-medium">{title.length}/200</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Case Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the background, goal, and key facts your lawyer should know."
                  className="w-full min-h-[140px] px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  disabled={loading}
                  maxLength={1200}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-slate-500">
                    Include context, documents involved, and your desired outcome. (10+ characters)
                  </p>
                  <p className="text-sm text-slate-500 font-medium">{description.length}/1200</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Request Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Type:</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    {visibility === 'private' ? (
                      <>
                        <Lock className="size-4" /> Private
                      </>
                    ) : (
                      <>
                        <Globe className="size-4" /> Public
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Department:</span>
                  <span className="font-semibold text-slate-900">
                    {departments.find((d) => d.id === selectedDept)?.name || 'Not selected'}
                  </span>
                </div>
                {visibility === 'private' && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Assigned Lawyer:</span>
                    <span className="font-semibold text-slate-900">
                      {lawyers.find((l) => l.id === selectedLawyer)?.full_name || 'Not selected'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Priority:</span>
                  <span
                    className={`font-semibold capitalize px-3 py-1 rounded-full text-xs ${
                      priority === 'low'
                        ? 'bg-green-100 text-green-700'
                        : priority === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : priority === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {priority}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Budget:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{budgetMin} - ₹{budgetMax}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Confidentiality:</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {confidentiality.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={!isStep4Valid || loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="size-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-5" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <LawyerSelectionModal
        isOpen={isLawyerModalOpen}
        onClose={() => setIsLawyerModalOpen(false)}
        onSelect={(lawyer) => setSelectedLawyer(lawyer.id)}
        lawyers={lawyers}
        selectedId={selectedLawyer}
      />
    </form>
  );
}
