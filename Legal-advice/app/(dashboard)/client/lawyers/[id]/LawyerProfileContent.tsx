'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Briefcase,
  Calendar,
  Award,
  Mail,
  Phone,
  MapPin,
  Check,
  MessageCircle,
  Video,
  MessageSquare,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/lib/types';
import RequestConsultationModal from './components/RequestConsultationModal';
import SendMessageModal from './components/SendMessageModal';

import RatingsDisplay from '@/components/shared/RatingsDisplay';

interface Department {
  id: string;
  name: string;
}

interface LawyerProfileContentProps {
  lawyer: Profile;
  stats: {
    cases: number | null;
    rating: number | null;
    experience: number | null;
    successRate: number | null;
  };
  departments: Department[];
  clientId: string;
  reviews: any[]; // Using any[] temporarily or we can import the Review type if accessible
}

export default function LawyerProfileContent({
  lawyer,
  stats,
  departments,
  clientId,
  reviews,
}: LawyerProfileContentProps) {
  const router = useRouter();
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Availability status styling
  const getAvailabilityStyle = (status: string | null | undefined) => {
    switch (status) {
      case 'Available':
        return { color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-600', icon: '🟢' };
      case 'Busy':
        return { color: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-600', icon: '🟡' };
      case 'Offline':
        return { color: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-600', icon: '🔴' };
      default:
        return { color: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-400', icon: '⚪' };
    }
  };

  const availabilityStyle = getAvailabilityStyle(lawyer.availability_status);
  const initials = lawyer.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Truncate bio if needed
  const maxBioLength = 200;
  const shouldTruncateBio = (lawyer.bio?.length || 0) > maxBioLength;
  const displayBio = shouldTruncateBio
    ? lawyer.bio?.substring(0, maxBioLength) + '...'
    : lawyer.bio;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Lawyers List</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Lawyer Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Identity Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center mb-6">
                {lawyer.avatar_url ? (
                  <img
                    src={lawyer.avatar_url}
                    alt={lawyer.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {initials}
                  </div>
                )}
                <h2 className="text-xl font-bold text-slate-900 text-center">{lawyer.full_name}</h2>
                <p className="text-slate-600 text-center mt-1">
                  {lawyer.specialization || 'Legal Professional'}
                </p>

                {/* Rating */}
                {lawyer.average_rating &&
                  lawyer.average_rating > 0 &&
                  lawyer.total_reviews &&
                  lawyer.total_reviews > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-slate-900">
                        {lawyer.average_rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({lawyer.total_reviews} reviews)
                      </span>
                    </div>
                  )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700 truncate">{lawyer.email}</span>
                </div>
                {lawyer.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-700">{lawyer.phone}</span>
                  </div>
                )}
                {lawyer.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-700">{lawyer.location}</span>
                  </div>
                )}
                {lawyer.years_of_experience && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-700">
                      {lawyer.years_of_experience} years experience
                    </span>
                  </div>
                )}
              </div>

              {/* Verified Badge */}
              {lawyer.bar_council_id && (
                <div className="flex items-center justify-center gap-2 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    <span>Verified Lawyer</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowConsultationModal(true)}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Request Consultation
                </button>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Availability & Response Info */}
            {(lawyer.availability_status || lawyer.response_time || lawyer.consultation_modes) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Availability & Response</h3>
                <div className="flex flex-wrap gap-4">
                  {lawyer.availability_status && (
                    <div
                      className={`flex items-center gap-2 px-3 py-2 ${availabilityStyle.bg} ${availabilityStyle.color} rounded-lg`}
                    >
                      <span className={`w-2 h-2 ${availabilityStyle.dot} rounded-full`}></span>
                      <span className="text-sm font-medium">{lawyer.availability_status}</span>
                    </div>
                  )}
                  {lawyer.response_time && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Responds within {lawyer.response_time}
                      </span>
                    </div>
                  )}
                </div>
                {lawyer.consultation_modes && lawyer.consultation_modes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600 mb-2">Consultation Modes:</p>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.consultation_modes.includes('chat') && (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          💬 Chat
                        </span>
                      )}
                      {lawyer.consultation_modes.includes('call') && (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          📞 Call
                        </span>
                      )}
                      {lawyer.consultation_modes.includes('video') && (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          📹 Video
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. About */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">About</h3>
              {lawyer.bio ? (
                <div>
                  <p className="text-slate-600 leading-relaxed">{displayBio}</p>
                  {shouldTruncateBio && (
                    <button className="text-primary hover:text-primary/80 text-sm font-medium mt-2">
                      Read more
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 italic">No bio available yet.</p>
              )}
            </div>

            {/* 3. Areas of Expertise */}
            {lawyer.specialization && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {lawyer.specialization
                    .split(',')
                    .slice(0, 6)
                    .map((area: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        {area.trim()}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* 4. Credentials & Trust Proof */}
            {(lawyer.bar_council_id || lawyer.degree || lawyer.license_status) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Credentials & Licensing</h3>
                <div className="space-y-4">
                  {lawyer.bar_council_id && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Bar Council Certified</p>
                        <p className="text-sm text-slate-600">ID: {lawyer.bar_council_id}</p>
                      </div>
                    </div>
                  )}
                  {lawyer.degree && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{lawyer.degree}</p>
                        <p className="text-sm text-slate-600">Legal Degree</p>
                      </div>
                    </div>
                  )}
                  {lawyer.license_status && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Licensed to Practice</p>
                        <p className="text-sm text-slate-600">Status: {lawyer.license_status}</p>
                      </div>
                    </div>
                  )}
                  {lawyer.enrollment_year && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 ml-11">
                      <span>Enrolled: {lawyer.enrollment_year}</span>
                    </div>
                  )}
                  {lawyer.jurisdiction && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 ml-11">
                      <span>Jurisdiction: {lawyer.jurisdiction}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Experience Snapshot */}
            {(lawyer.years_of_experience || lawyer.total_cases_handled) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Experience Snapshot</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {lawyer.years_of_experience && (
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-3xl font-bold text-slate-900">
                        {lawyer.years_of_experience}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">Years of Practice</div>
                    </div>
                  )}
                  {lawyer.total_cases_handled && (
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-3xl font-bold text-slate-900">
                        ~{lawyer.total_cases_handled}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">Cases Handled</div>
                    </div>
                  )}
                  {lawyer.specialization && (
                    <div className="col-span-2 sm:col-span-1">
                      <div className="text-sm font-medium text-slate-900 mb-2">Case Types:</div>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specialization
                          .split(',')
                          .slice(0, 3)
                          .map((type: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {type.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Client Feedback (Reviews) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Client Feedback</h3>
              <RatingsDisplay
                ratings={reviews}
                averageRating={lawyer.average_rating || 0}
                totalReviews={lawyer.total_reviews || 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        lawyer={{
          id: lawyer.id,
          full_name: lawyer.full_name,
          specialization: lawyer.specialization || undefined,
          years_of_experience: lawyer.years_of_experience || undefined,
        }}
        departments={departments}
        clientId={clientId}
      />
      <SendMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        lawyer={{
          id: lawyer.id,
          full_name: lawyer.full_name,
          specialization: lawyer.specialization || undefined,
        }}
        clientId={clientId}
      />
    </div>
  );
}

// Add Clock icon import
function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
