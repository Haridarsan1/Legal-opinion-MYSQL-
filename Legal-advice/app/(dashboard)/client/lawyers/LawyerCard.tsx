'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Briefcase,
  Award,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Heart,
  ShieldCheck,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Lawyer {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  specialization?: string[];
  years_of_experience?: number;
  bio?: string;
  bar_council_id?: string;
  totalCases?: number;
  completedCases?: number;
  location?: string;
  rating?: number;
  reviews_count?: number;
  availability_status?: 'Available' | 'In Court' | 'Offline';
  title?: string;
}

interface LawyerCardProps {
  lawyer: Lawyer;
  viewMode: 'grid' | 'list';
  onPreview?: (lawyer: Lawyer) => void;
}

export default function LawyerCard({ lawyer, viewMode, onPreview }: LawyerCardProps) {
  const specArray = lawyer.specialization
    ? Array.isArray(lawyer.specialization)
      ? lawyer.specialization
      : [lawyer.specialization]
    : [];
  const primarySpecialization = specArray[0] || 'Legal Expert';
  const initials = lawyer.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const isOnline = lawyer.availability_status === 'Available';

  // Mock "Verified" status for visuals
  const isVerified = true;
  const rating = lawyer.rating || 0;
  const isTopRated = rating >= 4.8;
  const isRisingStar = rating >= 4.0 && rating < 4.8;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary/20 transition-all group flex flex-col md:flex-row gap-6 relative overflow-hidden"
      >
        {/* Selection Highlight Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />

        {/* Avatar */}
        <div
          className="relative shrink-0 cursor-pointer"
          onClick={() => onPreview?.(lawyer)}
          suppressHydrationWarning
        >
          {lawyer.avatar_url ? (
            <Image
              src={lawyer.avatar_url}
              alt={lawyer.full_name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl object-cover hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">
              {initials}
            </div>
          )}
          {
  lawyer.availability_status === 'Available' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Middle Content */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {lawyer.full_name}
                </h3>
                {isVerified && <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-50" />}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-slate-600 truncate">
                  {lawyer.title || primarySpecialization}
                </p>
                {isTopRated && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide rounded-full border border-amber-200 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Top Rated
                  </span>
                )}
                {
  isRisingStar && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wide rounded-full border border-blue-200">
                    Rising Star
                  </span>
                )}
              </div>

              {/* Rating Row */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {lawyer.rating || 'N/A'}
                  <span className="text-slate-500 font-normal">
                    ({lawyer.reviews_count || 0} reviews)
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {lawyer.location || 'Remote'}
                </div>
              </div>
            </div>

            {/* Favorite Button */}
            <button
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              suppressHydrationWarning
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 mt-4 pt-4 border-t border-slate-100 w-fit">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Experience
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {lawyer.years_of_experience || 0} Years
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Cases</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {lawyer.totalCases || 0} Handled
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fee</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                ₹1500<span className="text-xs text-slate-400 font-normal">/hr</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col justify-center gap-3 w-full md:w-56 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <Link
            href={`/client/lawyers/${lawyer.id}`}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            View Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/client/messages?lawyer=${lawyer.id}`}
            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Link>
        </div>
      </motion.div>
    );
  }

  // Grid View (Default)
  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="group relative bg-white rounded-3xl border border-slate-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col overflow-hidden"
      >
        {/* Header Background */}
        <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className="p-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white text-slate-500 hover:text-red-500 shadow-sm transition-colors"
              suppressHydrationWarning
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Image & Badges */}
        <div className="px-6 -mt-12 flex justify-between items-end relative">
          <div
            className="relative cursor-pointer"
            onClick={() => onPreview?.(lawyer)}
            title="Click to preview"
            suppressHydrationWarning
          >
            {lawyer.avatar_url ? (
              <Image
                src={lawyer.avatar_url}
                alt={lawyer.full_name}
                width={112}
                height={112}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md relative z-10 transition-transform group-hover:scale-105"
                priority
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-slate-400 relative z-10 transition-transform group-hover:scale-105">
                <span className="text-3xl font-bold">{initials}</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 z-20 bg-white rounded-full p-1 shadow-sm">
              <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>

          {/* Status Badges */}
          {
  isOnline && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold">Online</span>
            </div>
          )}
        </div>

        {/* Name & Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors flex items-center justify-center gap-1.5">
          {lawyer.full_name}
          {
  isVerified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
        </h3>
        <p className="text-sm font-medium text-slate-500 mb-2 truncate px-4">
          {lawyer.title || primarySpecialization}
        </p>

        <div className="flex justify-center gap-2 mb-3 px-4">
          {isTopRated && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-200 flex items-center gap-1">
              <Award className="w-3 h-3" />
              TOP RATED
            </span>
          )}
          {
  isRisingStar && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              RISING STAR
            </span>
          )}
        </div>

        {/* Chips */}
        {
  specArray.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {specArray.slice(0, 2).map((spec, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-100"
              >
                {spec}
              </span>
            ))}
            {
  specArray.length > 2 && (
              <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-lg border border-slate-100">
                +{specArray.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="px-4 py-3 bg-slate-50/50 border-y border-slate-100 grid grid-cols-3 divide-x divide-slate-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-bold text-sm">
              {lawyer.rating || 'N/A'}
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-[10px] items-center text-slate-500 font-medium mt-0.5">Ratio</div>
          </div>
          <div className="text-center">
            <div className="text-slate-900 font-bold text-sm">
              {lawyer.years_of_experience || 0}y
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Exp.</div>
          </div>
          <div className="text-center">
            <div className="text-slate-900 font-bold text-sm">{lawyer.totalCases || 0}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Cases</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 flex flex-col gap-2.5 mt-auto">
          <Link
            href={`/client/lawyers/${lawyer.id}`}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-200 hover:shadow-lg flex items-center justify-center gap-2 group/btn"
          >
            View Profile
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/client/messages?lawyer=${lawyer.id}`}
              className="py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Message
            </Link>
            <button
              className="py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
              suppressHydrationWarning
            >
              <Clock className="w-3.5 h-3.5" />
              Consult
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
}
