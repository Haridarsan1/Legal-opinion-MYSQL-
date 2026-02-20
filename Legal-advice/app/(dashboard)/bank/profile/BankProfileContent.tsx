'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
  Check,
  Building2,
  Upload,
  FileText,
  Shield,
  DollarSign,
  AlertCircle,
  Users,
  MapPin,
  Settings,
  CheckCircle,
} from 'lucide-react';
import LocationAutocomplete from '@/components/shared/LocationAutocomplete';

interface BankProfileContentProps {
  profile: Profile;
}

export default function BankProfileContent({ profile }: BankProfileContentProps) {const router = useRouter();
    const [activeTab, setActiveTab] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bankLogoUrl, setBankLogoUrl] = useState(profile.bank_logo_url || '');
  const [authLetterUrl, setAuthLetterUrl] = useState(profile.authorization_letter_url || '');

  const [formData, setFormData] = useState({    bank_name: profile.bank_name || '',
    bank_type: profile.bank_type || '',
    head_office_location: profile.head_office_location || '',
    registration_number: profile.registration_number || '',
    regulating_authority: profile.regulating_authority || 'RBI',
    authorized_person_name: profile.authorized_person_name || '',
    authorized_person_designation: profile.authorized_person_designation || '',
    official_email: profile.official_email || profile.email,
    official_phone: profile.official_phone || '',
    secondary_contact: profile.secondary_contact || '',
    legal_services_required: profile.legal_services_required || [],
    engagement_model: profile.engagement_model || '',
    operating_jurisdictions: profile.operating_jurisdictions || [],
    courts_involved: profile.courts_involved || [],
    preferred_communication_mode: profile.preferred_communication_mode || 'Portal only',
    expected_turnaround_time: profile.expected_turnaround_time || '48h',
    case_assignment_preference: profile.case_assignment_preference || 'Manual approval',
    document_sharing_consent: profile.document_sharing_consent || false,
    approval_reference_id: profile.approval_reference_id || '',
    payment_model: profile.payment_model || '',
    billing_cycle: profile.billing_cycle || '',
  });

  const tabs = [
    { id: 1, name: 'Bank Identity', icon: Building2 },
    { id: 2, name: 'Authorized Contact', icon: Users },
    { id: 3, name: 'Legal Preferences', icon: FileText },
    { id: 4, name: 'Jurisdiction', icon: MapPin },
    { id: 5, name: 'Workflow Settings', icon: Settings },
    { id: 6, name: 'Compliance', icon: Shield },
    { id: 7, name: 'Billing', icon: DollarSign },
    { id: 8, name: 'Status', icon: CheckCircle },
  ];

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {      setMessage({ type: 'error', text: 'Please upload PNG or JPEG only' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo must be less than 2MB' });
      return;
    }

    setIsUploadingLogo(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bank_logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {        data: { publicUrl },
      } = supabase.storage.from('bank_logos').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ bank_logo_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setBankLogoUrl(publicUrl);
      setMessage({ type: 'success', text: '✅ Logo uploaded!' });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload logo' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle authorization letter upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Please upload PDF only' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Document must be less than 10MB' });
      return;
    }

    setIsUploadingDocument(true);
    setMessage(null);

    try {
      const fileName = `auth_letter_${Date.now()}.pdf`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bank_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('bank_documents').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ authorization_letter_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setAuthLetterUrl(publicUrl);
      setMessage({ type: 'success', text: '✅ Authorization letter uploaded!' });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload document' });
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const checkboxValue = checkbox.value;

      if (
        name === 'legal_services_required' ||
        name === 'courts_involved' ||
        name === 'operating_jurisdictions'
      ) {
        setFormData((prev) => ({
          ...prev,
          [name]: checkbox.checked
            ? [...((prev[name as keyof typeof prev] as string[]) || []), checkboxValue]
            : ((prev[name as keyof typeof prev] as string[]) || []).filter(
                (v: string) => v !== checkboxValue
              ),
        }));
      } else if (name === 'document_sharing_consent') {
        setFormData((prev) => ({
          ...prev,
          document_sharing_consent: checkbox.checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bank_name: formData.bank_name || null,
          bank_type: formData.bank_type || null,
          head_office_location: formData.head_office_location || null,
          registration_number: formData.registration_number || null,
          regulating_authority: formData.regulating_authority || null,
          authorized_person_name: formData.authorized_person_name || null,
          authorized_person_designation: formData.authorized_person_designation || null,
          official_email: formData.official_email || null,
          official_phone: formData.official_phone || null,
          secondary_contact: formData.secondary_contact || null,
          legal_services_required: formData.legal_services_required,
          engagement_model: formData.engagement_model || null,
          operating_jurisdictions: formData.operating_jurisdictions,
          courts_involved: formData.courts_involved,
          preferred_communication_mode: formData.preferred_communication_mode || null,
          expected_turnaround_time: formData.expected_turnaround_time || null,
          case_assignment_preference: formData.case_assignment_preference || null,
          document_sharing_consent: formData.document_sharing_consent,
          approval_reference_id: formData.approval_reference_id || null,
          payment_model: formData.payment_model || null,
          billing_cycle: formData.billing_cycle || null,
          profile_status: 'Submitted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw new Error(error.message);

      setMessage({
        type: 'success',
        text: '✅ Profile submitted successfully! Pending admin verification.',
      });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const initials = formData.bank_name
    ? formData.bank_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'BK';

  const getStatusBadge = (status: string | null | undefined) => {
    const badges = {
      Verified: 'bg-green-100 text-green-700',
      Submitted: 'bg-blue-100 text-blue-700',
      Suspended: 'bg-red-100 text-red-700',
      Draft: 'bg-gray-100 text-gray-700',
    };
    return badges[status as keyof typeof badges] || badges['Draft'];
  };

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 text-2xl sm:text-3xl font-extrabold">Bank Profile</h1>
        <p className="text-slate-500 text-sm sm:text-base mt-1">
          Complete your institutional profile to engage with empanelled lawyers
        </p>
      </div>

      {/* Message */}
      {
  message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {message.type === 'success' && <Check className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Profile Preview */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {bankLogoUrl ? (
                  <img
                    src={bankLogoUrl}
                    alt="Bank Logo"
                    className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
                    {initials}
                  </div>
                )}
                {
  isUploadingLogo && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="text-center w-full">
                <h3 className="font-bold text-slate-900">{formData.bank_name || 'Bank Name'}</h3>
                <p className="text-sm text-slate-600">{formData.bank_type || 'Bank Type'}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(profile.profile_status)}`}
                >
                  {profile.profile_status || 'Draft'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Verified</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${profile.verified_by_admin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  {profile.verified_by_admin ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Complete all tabs</li>
                  <li>• Upload required documents</li>
                  <li>• Submit for verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tabbed Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="border-b border-slate-200 overflow-x-auto">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600 bg-blue-50'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                      <span className="sm:hidden">{tab.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              {/* Tab 1: Bank Identity */}
              {
  activeTab === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Bank Identity</h3>
                    <p className="text-sm text-slate-500">Institutional identification details</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Bank Logo</label>
                    <label className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors text-sm cursor-pointer w-fit">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploadingLogo}
                      />
                      <Upload className="w-4 h-4" />
                      {isUploadingLogo
                        ? 'Uploading...'
                        : bankLogoUrl
                          ? 'Change Logo'
                          : 'Upload Logo'}
                    </label>
                    <p className="text-xs text-slate-500 mt-1">PNG or JPEG, max 2MB</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleChange}
                        required
                        placeholder="State Bank of India"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Bank Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="bank_type"
                        value={formData.bank_type}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      >
                        <option value="">Select Type</option>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                        <option value="Cooperative">Cooperative</option>
                        <option value="Foreign">Foreign</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Head Office Location <span className="text-red-500">*</span>
                      </label>
                      <LocationAutocomplete
                        value={formData.head_office_location}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, head_office_location: value }))
                        }
                        required
                        placeholder="Mumbai"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleChange}
                        placeholder="REG/2024/12345"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Regulating Authority
                      </label>
                      <input
                        type="text"
                        name="regulating_authority"
                        value={formData.regulating_authority}
                        onChange={handleChange}
                        placeholder="RBI"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Authorized Contact */}
              {
  activeTab === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Authorized Contact Details
                    </h3>
                    <p className="text-sm text-slate-500">Legal communication & accountability</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Authorized Person Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="authorized_person_name"
                        value={formData.authorized_person_name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="authorized_person_designation"
                        value={formData.authorized_person_designation}
                        onChange={handleChange}
                        required
                        placeholder="Legal Head / Compliance Officer"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Official Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="official_email"
                        value={formData.official_email}
                        onChange={handleChange}
                        required
                        placeholder="legal@bankdomain.com"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Official Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="official_phone"
                        value={formData.official_phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 22 1234 5678"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Secondary Contact
                      </label>
                      <input
                        type="text"
                        name="secondary_contact"
                        value={formData.secondary_contact}
                        onChange={handleChange}
                        placeholder="Alternative contact person"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Legal Engagement Preferences */}
              {
  activeTab === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Legal Engagement Preferences
                    </h3>
                    <p className="text-sm text-slate-500">Match with correct lawyers</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Type of Legal Services Required <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {[
                        'Legal Opinions',
                        'Loan Recovery',
                        'Compliance & Regulatory',
                        'Litigation Support',
                        'Documentation & Contracts',
                      ].map((service) => (
                        <label key={service} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="legal_services_required"
                            value={service}
                            checked={formData.legal_services_required.includes(service)}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                          />
                          <span className="text-sm text-slate-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Engagement Model <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['Case-based', 'Retainer-based', 'Opinion-only'].map((model) => (
                        <label key={model} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="engagement_model"
                            value={model}
                            checked={formData.engagement_model === model}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                          />
                          <span className="text-sm text-slate-700">{model}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Jurisdiction & Court Coverage */}
              {
  activeTab === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Jurisdiction & Court Coverage
                    </h3>
                    <p className="text-sm text-slate-500">Prevent assignment mismatch</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Operating Jurisdictions (States/Countries){' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Comma-separated (e.g., Maharashtra, Karnataka, Delhi)"
                      onBlur={(e) => {
                        const jurisdictions = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setFormData((prev) => ({
                          ...prev,
                          operating_jurisdictions: jurisdictions,
                        }));
                      }}
                      defaultValue={formData.operating_jurisdictions.join(', ')}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Selected: {formData.operating_jurisdictions.join(', ') || 'None'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Courts / Forums Involved <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['District Court', 'High Court', 'DRT', 'NCLT', 'Supreme Court'].map(
                        (court) => (
                          <label key={court} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="courts_involved"
                              value={court}
                              checked={formData.courts_involved.includes(court)}
                              onChange={handleChange}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                            />
                            <span className="text-sm text-slate-700">{court}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Workflow & Communication Settings */}
              {
  activeTab === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Workflow & Communication Settings
                    </h3>
                    <p className="text-sm text-slate-500">Smooth operations</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Preferred Communication Mode <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['Portal only', 'Email alerts'].map((mode) => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="preferred_communication_mode"
                            value={mode}
                            checked={formData.preferred_communication_mode === mode}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                          />
                          <span className="text-sm text-slate-700">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Expected Turnaround Time (SLA) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="expected_turnaround_time"
                      value={formData.expected_turnaround_time}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    >
                      <option value="24h">24 hours</option>
                      <option value="48h">48 hours</option>
                      <option value="72h">72 hours</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Case Assignment Preference <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['Auto-assign', 'Manual approval'].map((pref) => (
                        <label key={pref} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="case_assignment_preference"
                            value={pref}
                            checked={formData.case_assignment_preference === pref}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                          />
                          <span className="text-sm text-slate-700">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Compliance & Authorization */}
              {
  activeTab === 6 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Compliance & Authorization
                    </h3>
                    <p className="text-sm text-slate-500">Legal validity</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Authorization Letter <span className="text-red-500">*</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors text-sm cursor-pointer w-fit">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleDocumentUpload}
                        className="hidden"
                        disabled={isUploadingDocument}
                      />
                      <Upload className="w-4 h-4" />
                      {isUploadingDocument
                        ? 'Uploading...'
                        : authLetterUrl
                          ? 'Change Document'
                          : 'Upload PDF'}
                    </label>
                    <p className="text-xs text-slate-500 mt-1">PDF only, max 10MB</p>
                    {authLetterUrl && (
                      <a
                        href={authLetterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      >
                        View uploaded document
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="document_sharing_consent"
                        checked={formData.document_sharing_consent}
                        onChange={handleChange}
                        required
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                      />
                      <span className="text-sm text-slate-700">
                        I consent to share documents with empanelled lawyers{' '}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Internal Approval Reference ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="approval_reference_id"
                      value={formData.approval_reference_id}
                      onChange={handleChange}
                      required
                      placeholder="APPR/2024/12345"
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 7: Billing Preference */}
              {
  activeTab === 7 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Billing Preference</h3>
                    <p className="text-sm text-slate-500">Commercial clarity</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Payment Model <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['Per opinion', 'Per case', 'Retainer'].map((model) => (
                        <label key={model} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="payment_model"
                            value={model}
                            checked={formData.payment_model === model}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                          />
                          <span className="text-sm text-slate-700">{model}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Billing Cycle <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['Monthly', 'Per engagement'].map((cycle) => (
                        <label key={cycle} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="billing_cycle"
                            value={cycle}
                            checked={formData.billing_cycle === cycle}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                          />
                          <span className="text-sm text-slate-700">{cycle}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 8: Profile Status (Read-only) */}
              {
  activeTab === 8 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Profile Status</h3>
                    <p className="text-sm text-slate-500">System-controlled information</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700">Current Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(profile.profile_status)}`}
                      >
                        {profile.profile_status || 'Draft'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700">
                        Verified by Admin
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${profile.verified_by_admin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {profile.verified_by_admin ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700">Last Updated</span>
                      <span className="text-sm text-slate-600">
                        {profile.updated_at
                          ? new Date(profile.updated_at).toLocaleString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 text-sm mb-2">Status Information</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>
                        • <strong>Draft:</strong> Profile not yet submitted
                      </li>
                      <li>
                        • <strong>Submitted:</strong> Awaiting admin verification
                      </li>
                      <li>
                        • <strong>Verified:</strong> Profile approved by admin
                      </li>
                      <li>
                        • <strong>Suspended:</strong> Profile access restricted
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Saving...'
                : profile.profile_status === 'Draft'
                  ? 'Submit for Verification'
                  : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
