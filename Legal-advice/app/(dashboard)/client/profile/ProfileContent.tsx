'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Shield,
  Bell,
  Upload,
  Edit2,
  Check,
  X,
  Loader2,
  Calendar,
  LogOut,
  Trash2,
  Camera,
  ChevronDown,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import type { Profile } from '@/lib/types';
import Image from 'next/image';
import LocationAutocomplete from '@/components/shared/LocationAutocomplete';

interface Props {
  profile: Profile | null;
}

type Tab = 'personal' | 'contact' | 'security' | 'preferences';

export default function ProfileContent({ profile }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    organization: profile?.organization || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    address_line: (profile as any)?.address_line || '',
    city: (profile as any)?.city || '',
    state: (profile as any)?.state || '',
    country: (profile as any)?.country || 'India',
    postal_code: (profile as any)?.postal_code || '',
    email_notifications: (profile as any)?.email_notifications ?? true,
    in_app_notifications: (profile as any)?.in_app_notifications ?? true,
    language: (profile as any)?.language || 'en',
    timezone: (profile as any)?.timezone || 'Asia/Kolkata',
  });

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
          await supabase.storage.from('avatars').remove([`${profile.id}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
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
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          organization: formData.organization || null,
          location: formData.location || null,
          bio: formData.bio || null,
          phone: formData.phone || null,
          address_line: formData.address_line || null,
          city: formData.city || null,
          state: formData.state || null,
          country: formData.country || null,
          postal_code: formData.postal_code || null,
          email_notifications: formData.email_notifications,
          in_app_notifications: formData.in_app_notifications,
          language: formData.language,
          timezone: formData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

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
    setFormData({
      full_name: profile.full_name || '',
      organization: profile.organization || '',
      location: profile.location || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      address_line: (profile as any).address_line || '',
      city: (profile as any).city || '',
      state: (profile as any).state || '',
      country: (profile as any).country || 'India',
      postal_code: (profile as any).postal_code || '',
      email_notifications: (profile as any).email_notifications ?? true,
      in_app_notifications: (profile as any).in_app_notifications ?? true,
      language: (profile as any).language || 'en',
      timezone: (profile as any).timezone || 'Asia/Kolkata',
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
    : 'U';

  const tabs = [
    { id: 'personal' as Tab, label: 'Personal Info', icon: User },
    { id: 'contact' as Tab, label: 'Contact & Address', icon: MapPin },
    { id: 'security' as Tab, label: 'Account & Security', icon: Shield },
    { id: 'preferences' as Tab, label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-600">Manage your personal account settings and preferences</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
          {message.type === 'error' && <X className="w-5 h-5 flex-shrink-0" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={profile.full_name}
                width={120}
                height={120}
                loading="eager"
                className="w-24 h-24 sm:w-30 sm:h-30 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-30 sm:h-30 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white/20 shadow-xl backdrop-blur">
                {initials}
              </div>
            )}

            {/* Upload overlay on hover */}
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

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-2">{profile.full_name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium backdrop-blur">
                Client
              </span>
              {profile.location && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-sm backdrop-blur">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location}
                </span>
              )}
            </div>
            <p className="text-white/90 mb-3">{profile.email}</p>
            {profile.created_at && (
              <p className="text-white/70 text-sm flex items-center gap-1.5 justify-center sm:justify-start">
                <Calendar className="w-4 h-4" />
                Member since{' '}
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            className="px-6 py-2.5 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg"
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50/50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Company / Organization
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Acme International Ltd."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Location (City, Country)
                </label>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                  disabled={!isEditing}
                  placeholder="Mumbai"
                  className={`w-full ${!isEditing ? 'bg-slate-50 text-slate-700' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Short Bio <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  maxLength={200}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 resize-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-1 text-right">{formData.bio.length}/200</p>
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Email Address
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
                      Email cannot be changed directly for security reasons
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
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Address (Optional)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Address Line
                    </label>
                    <input
                      type="text"
                      name="address_line"
                      value={formData.address_line}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="123 Main Street, Apartment 4B"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      State / Region
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="India"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="400001"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account & Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Account Email</h4>
                      <p className="text-sm text-slate-600">{profile.email}</p>
                    </div>
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {(profile as any).last_sign_in_at && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Last Login</h4>
                        <p className="text-sm text-slate-600">
                          {formatDistanceToNow(new Date((profile as any).last_sign_in_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                )}

                {profile.created_at && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Account Created</h4>
                        <p className="text-sm text-slate-600">
                          {new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Shield className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Security Actions</h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
                    onClick={() => router.push('/reset-password')}
                  >
                    Change Password
                  </button>

                  <button
                    type="button"
                    className="w-full px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/login');
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-600">Receive updates via email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="email_notifications"
                      checked={formData.email_notifications}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">In-App Notifications</p>
                        <p className="text-sm text-slate-600">Show notifications in the platform</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="in_app_notifications"
                      checked={formData.in_app_notifications}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Regional Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Time Zone
                    </label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-50 disabled:text-slate-700 transition-all"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="America/New_York">America/New York (EST)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Save Bar */}
        {isEditing && (
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
      </div>
    </div>
  );
}
