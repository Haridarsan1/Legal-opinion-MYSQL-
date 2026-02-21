'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Eye,
  Edit2,
  Check,
  X,
  Loader2,
  Camera,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Scale,
  Globe,
  Bell,
  Upload,
  Star,
  User,
  MapPin,
  Award,
  Briefcase,
  Shield,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import type { Profile } from '@/lib/types';
import Image from 'next/image';
import LocationAutocomplete from '@/components/shared/LocationAutocomplete';
import RatingsDisplay from '@/components/shared/RatingsDisplay';

const supabase = createClient();

interface Props {
  profile: Profile | null;
  lawyerProfile: any | null;
  reviews: any[]; // Using any[] for now, or use the inferred type
}

type Tab = 'overview' | 'practice' | 'credentials' | 'availability' | 'visibility' | 'reviews';

const PRACTICE_AREAS = [
  'Corporate Law',
  'Criminal Law',
  'Family Law',
  'Intellectual Property',
  'Real Estate',
  'Tax Law',
  'Employment Law',
  'Immigration Law',
  'Environmental Law',
  'Banking & Finance',
  'Mergers & Acquisitions',
  'Civil Litigation',
  'Constitutional Law',
  'Consumer Protection',
];

export default function LawyerProfileContent({ profile, lawyerProfile, reviews }: Props) {const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const initialPracticeAreas = Array.isArray(lawyerProfile?.practice_areas)
    ? lawyerProfile.practice_areas
    : [];

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    primary_practice_area:
      initialPracticeAreas[0] || (profile as any)?.primary_practice_area || '',
    additional_practice_areas:
      initialPracticeAreas.length > 1
        ? initialPracticeAreas.slice(1)
        : (profile as any)?.additional_practice_areas || [],
    bio: lawyerProfile?.bio || profile?.bio || '',
    years_of_experience:
      lawyerProfile?.years_of_experience ?? (profile as any)?.years_of_experience ?? 0,
    total_cases_handled: (profile as any)?.total_cases_handled || 0,
    bar_council_id: lawyerProfile?.bar_council_id || (profile as any)?.bar_council_id || '',
    degree: (profile as any)?.degree || '',
    enrollment_year:
      lawyerProfile?.year_of_enrollment ?? (profile as any)?.enrollment_year ?? '',
    license_status: (profile as any)?.license_status || 'active',
    jurisdiction: lawyerProfile?.jurisdiction || (profile as any)?.jurisdiction || '',
    availability_status: (profile as any)?.availability_status || 'available',
    response_time: (profile as any)?.response_time || 'within_24_hours',
    show_in_listings: (profile as any)?.show_in_listings ?? true,
    accept_new_requests: (profile as any)?.accept_new_requests ?? true,
  });

  // Calculate profile completeness
  const profileCompleteness = useMemo(() => {
    const fields = [
      formData.full_name,
      formData.phone,
      formData.location,
      formData.primary_practice_area,
      formData.bio,
      formData.years_of_experience > 0,
      formData.bar_council_id,
      formData.degree,
      formData.enrollment_year,
      avatarUrl,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [formData, avatarUrl]);

  if (!profile) {
    return <div className="p-8">Profile not found</div>;
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a valid image (JPEG, PNG, or WebP)' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setIsUploadingAvatar(true);
    setMessage(null);

    try {
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await (await __getSupabaseClient()).storage.from('avatars').remove([`${profile.id}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await (await __getSupabaseClient()).storage.from('avatars').upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = (await __getSupabaseClient()).storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await (await __getSupabaseClient()).from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload photo' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handlePracticeAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      additional_practice_areas: prev.additional_practice_areas.includes(area)
        ? prev.additional_practice_areas.filter((a: string) => a !== area)
        : [...prev.additional_practice_areas, area],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const profileUpdatePayload = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        location: formData.location || null,
        degree: formData.degree || null,
        enrollment_year: formData.enrollment_year || null,
        license_status: formData.license_status,
        availability_status: formData.availability_status,
        response_time: formData.response_time,
        show_in_listings: formData.show_in_listings,
        accept_new_requests: formData.accept_new_requests,
        total_cases_handled: formData.total_cases_handled,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await (await __getSupabaseClient()).from('profiles')
        .update(profileUpdatePayload)
        .eq('id', profile.id);

      if (profileError) throw profileError;

      const practiceAreas = [formData.primary_practice_area, ...formData.additional_practice_areas]
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index);

      const lawyerUpdatePayload = {
        id: profile.id,
        bar_council_id: formData.bar_council_id || null,
        year_of_enrollment: formData.enrollment_year ? parseInt(String(formData.enrollment_year), 10) : null,
        years_of_experience: formData.years_of_experience,
        practice_areas: practiceAreas,
        jurisdiction: formData.jurisdiction || null,
        bio: formData.bio || null,
        updated_at: new Date().toISOString(),
      };

      const { error: lawyerError } = await (await __getSupabaseClient()).from('lawyers')
        .upsert(lawyerUpdatePayload, { onConflict: 'id' });

      if (lawyerError) throw lawyerError;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const resetPracticeAreas = Array.isArray(lawyerProfile?.practice_areas)
      ? lawyerProfile.practice_areas
      : [];

    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      location: profile.location || '',
      primary_practice_area:
        resetPracticeAreas[0] || (profile as any).primary_practice_area || '',
      additional_practice_areas:
        resetPracticeAreas.length > 1
          ? resetPracticeAreas.slice(1)
          : (profile as any).additional_practice_areas || [],
      bio: lawyerProfile?.bio || profile.bio || '',
      years_of_experience:
        lawyerProfile?.years_of_experience ?? (profile as any).years_of_experience ?? 0,
      total_cases_handled: (profile as any).total_cases_handled || 0,
      bar_council_id: lawyerProfile?.bar_council_id || (profile as any).bar_council_id || '',
      degree: (profile as any).degree || '',
      enrollment_year:
        lawyerProfile?.year_of_enrollment ?? (profile as any).enrollment_year ?? '',
      license_status: (profile as any).license_status || 'active',
      jurisdiction: lawyerProfile?.jurisdiction || (profile as any).jurisdiction || '',
      availability_status: (profile as any).availability_status || 'available',
      response_time: (profile as any).response_time || 'within_24_hours',
      show_in_listings: (profile as any).show_in_listings ?? true,
      accept_new_requests: (profile as any).accept_new_requests ?? true,
    });
    setIsEditing(false);
  };

  const initials = profile.full_name
    ? profile.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
    : 'L';

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: User },
    { id: 'practice' as Tab, label: 'Practice & Expertise', icon: Briefcase },
    { id: 'credentials' as Tab, label: 'Credentials', icon: Award },
    { id: 'availability' as Tab, label: 'Availability', icon: Clock },
    { id: 'visibility' as Tab, label: 'Visibility & Preferences', icon: Eye },
    { id: 'reviews' as Tab, label: 'Reviews', icon: Star },
  ];

  const isVerified = (profile as any).verification_status === 'verified';

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-6xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Professional Profile
          </h1>
          <p className="text-slate-600">Manage your professional information and public profile</p>
        </div>

        <button
          onClick={() => setShowPreview(true)}
          className="px-4 py-2.5 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-2 justify-center"
        >
          <Eye className="w-4 h-4" />
          Preview Client View
        </button>
      </div>

      {/* Success/Error Message */}
      {
  message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
            }`}
        >
          {message.type === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
          {
  message.type === 'error' && <X className="w-5 h-5 flex-shrink-0" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left: Avatar & Quick Stats */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile.full_name}
                  width={120}
                  height={120}
                  loading="eager"
                  className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white/20 shadow-xl backdrop-blur">
                  {initials}
                </div>
              )}

              <label className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="text-center">
                    <Camera className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">Change</span>
                  </div>
                )}
              </label>
            </div>

            {/* Profile Completeness */}
            <div className="w-full bg-white/10 rounded-xl p-4 backdrop-blur text-center">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-lg font-bold">{profileCompleteness}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
              {profileCompleteness < 100 && (
                <p className="text-xs text-white/70 mt-2">
                  Complete your profile to attract more clients
                </p>
              )}
            </div>
          </div>

          {/* Center: Main Info */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              {isVerified && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 border border-green-400/30 rounded-lg backdrop-blur">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span className="text-xs font-semibold text-green-100">Verified</span>
                </div>
              )}
            </div>

            <p className="text-lg text-emerald-300 font-semibold mb-3">
              {formData.primary_practice_area || 'Legal Professional'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {formData.years_of_experience > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/90">
                    {formData.years_of_experience} years experience
                  </span>
                </div>
              )}
              {
  formData.jurisdiction && (
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/90">{formData.jurisdiction}</span>
                </div>
              )}
              {
  formData.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/90">{formData.location}</span>
                </div>
              )}
              {
  profile.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/90">
                    Member since {new Date(profile.created_at).getFullYear()}
                  </span>
                </div>
              )}
            </div>

            {formData.bio && (
              <p className="text-sm text-white/80 leading-relaxed line-clamp-2">{formData.bio}</p>
            )}
          </div>

          {/* Right: Action Button */}
          <button
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            className="px-6 py-2.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50/50">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${isActive
                    ? 'border-primary text-primary bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 min-h-[400px]">
          {/* Overview Tab */}
          {
  activeTab === 'overview' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Full Name{' '}
                  {
  isVerified && <span className="text-slate-500 font-normal">(Verified)</span>}
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!isEditing || isVerified}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                />
                {isVerified && (
                  <p className="text-xs text-slate-500 mt-1">
                    Verified fields cannot be edited. Contact support to make changes.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Email cannot be changed for security reasons
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Location (City, Country)
                </label>
                <div className="relative">
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                    disabled={!isEditing}
                    placeholder="Mumbai"
                    className={`w-full ${!isEditing ? 'bg-slate-50 text-slate-700' : ''}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Practice & Expertise Tab */}
          {
  activeTab === 'practice' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Primary Practice Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="primary_practice_area"
                    value={formData.primary_practice_area}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                  >
                    <option value="">Select primary area</option>
                    {PRACTICE_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    disabled={!isEditing}
                    min="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Total Cases Handled <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="total_cases_handled"
                  value={formData.total_cases_handled}
                  onChange={handleChange}
                  disabled={!isEditing}
                  min="0"
                  placeholder="e.g., 150"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Additional Practice Areas
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRACTICE_AREAS.filter((area) => area !== formData.primary_practice_area).map(
                    (area) => (
                      <label
                        key={area}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${formData.additional_practice_areas.includes(area)
                          ? 'bg-primary/5 border-primary text-primary'
                          : 'border-slate-200 hover:border-slate-300'
                          } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.additional_practice_areas.includes(area)}
                          onChange={() => handlePracticeAreaToggle(area)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Professional Bio
                </label>
                <p className="text-xs text-slate-600 mb-2">
                  Briefly describe your expertise and experience in a professional tone. This will
                  be shown to clients.
                </p>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={5}
                  maxLength={500}
                  placeholder="I specialize in corporate law with over 10 years of experience advising startups and established companies on mergers, acquisitions, and corporate governance..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 resize-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-1 text-right">{formData.bio.length}/500</p>
              </div>
            </div>
          )}

          {/* Credentials Tab */}
          {
  activeTab === 'credentials' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Credential Verification</h4>
                  <p className="text-sm text-blue-700">
                    Verified credentials build trust with clients. Changes to verified fields
                    require admin re-verification.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Bar Council ID{' '}
                    {
  isVerified && <CheckCircle className="inline w-4 h-4 text-green-600" />}
                  </label>
                  <input
                    type="text"
                    name="bar_council_id"
                    value={formData.bar_council_id}
                    onChange={handleChange}
                    disabled={!isEditing || isVerified}
                    placeholder="MH/12345/2015"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Enrollment Year
                  </label>
                  <input
                    type="text"
                    name="enrollment_year"
                    value={formData.enrollment_year}
                    onChange={handleChange}
                    disabled={!isEditing || isVerified}
                    placeholder="2015"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="LLB, University of Mumbai"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    License Status
                  </label>
                  <select
                    name="license_status"
                    value={formData.license_status}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Jurisdiction
                  </label>
                  <input
                    type="text"
                    name="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Maharashtra, India"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {
  activeTab === 'availability' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Client Impact</h4>
                  <p className="text-sm text-amber-700">
                    This information helps clients decide whether to contact you. Keep it updated
                    for better engagement.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Availability Status
                </label>
                <div className="grid gap-3">
                  {[
                    {
                      value: 'available',
                      label: 'Available',
                      desc: 'Accepting new cases',
                      color: 'green',
                    },
                    {
                      value: 'limited',
                      label: 'Limited Availability',
                      desc: 'Selective cases only',
                      color: 'amber',
                    },
                    {
                      value: 'unavailable',
                      label: 'Unavailable',
                      desc: 'Not accepting new cases',
                      color: 'red',
                    },
                  ].map((status) => (
                    <label
                      key={status.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.availability_status === status.value
                        ? `border-${status.color}-500 bg-${status.color}-50`
                        : 'border-slate-200 hover:border-slate-300'
                        } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="availability_status"
                        value={status.value}
                        checked={formData.availability_status === status.value}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-0.5 w-5 h-5"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{status.label}</p>
                        <p className="text-sm text-slate-600">{status.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Typical Response Time
                </label>
                <select
                  name="response_time"
                  value={formData.response_time}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                >
                  <option value="within_2_hours">Within 2 hours</option>
                  <option value="within_24_hours">Within 24 hours</option>
                  <option value="1_2_days">1-2 days</option>
                  <option value="3_5_days">3-5 days</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Average time to respond to client inquiries
                </p>
              </div>
            </div>
          )}

          {/* Visibility & Preferences Tab */}
          {
  activeTab === 'visibility' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Profile Visibility</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">
                          Show profile in lawyer listings
                        </p>
                        <p className="text-sm text-slate-600">
                          Clients can discover your profile in search results
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="show_in_listings"
                      checked={formData.show_in_listings}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">
                          Accept new consultation requests
                        </p>
                        <p className="text-sm text-slate-600">
                          Allow clients to send you consultation requests
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="accept_new_requests"
                      checked={formData.accept_new_requests}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {
  activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Client Reviews</h3>
                <div className="text-sm text-slate-500">
                  Total Reviews:{' '}
                  <span className="font-semibold text-slate-900">{reviews.length}</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-900">No Reviews Yet</h4>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    You haven't received any client reviews yet. Completed cases will appear here
                    once clients leave feedback.
                  </p>
                </div>
              ) : (
                <RatingsDisplay
                  ratings={reviews}
                  averageRating={profile.average_rating || 0}
                  totalReviews={profile.total_reviews || 0}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Save Bar */}
      {
  isEditing && (
        <div className="border-t border-slate-200 p-6 bg-slate-50/50 flex items-center justify-between sticky bottom-0">
          <p className="text-sm text-slate-600">You have unsaved changes</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {
  showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-slate-900">Client Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                This is how clients see your public profile
              </p>

              {/* Preview content here - simplified version of lawyer public profile */}
              <div className="space-y-4 p-6 bg-slate-50 rounded-xl">
                <div className="flex items-start gap-4">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={profile.full_name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-900">{profile.full_name}</h4>
                    <p className="text-primary font-semibold">{formData.primary_practice_area}</p>
                    <p className="text-sm text-slate-600 mt-2">
                      {formData.bio || 'No bio provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
