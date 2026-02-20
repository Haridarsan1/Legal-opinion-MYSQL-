'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Star, Briefcase, Clock, MapPin, Shield, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

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
  consultation_fee?: number;
}

interface LawyerQuickViewModalProps {
  lawyer: Lawyer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LawyerQuickViewModal({
  lawyer,
  isOpen,
  onClose,
}: LawyerQuickViewModalProps) {
  if (!lawyer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/50 backdrop-blur-md hover:bg-white rounded-full transition-all text-slate-500 hover:text-slate-900 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Image & Key Badge */}
            <div className="w-full md:w-2/5 bg-slate-50 relative min-h-[250px] md:min-h-full">
              {lawyer.avatar_url ? (
                <Image
                  src={lawyer.avatar_url}
                  alt={lawyer.full_name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                  <span className="text-6xl font-bold">
                    {lawyer.full_name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />

              {/* Mobile Name Overlay */}
              <div className="absolute bottom-4 left-4 text-white md:hidden">
                <h2 className="text-xl font-bold">{lawyer.full_name}</h2>
                <p className="text-white/80 text-sm">{lawyer.title || 'Legal Consultant'}</p>
              </div>
            </div>

            {/* Right Side: Details */}
            <div className="flex-1 p-6 md:p-8 flex flex-col">
              {/* Header (Desktop) */}
              <div className="hidden md:block mb-6">
                <h2 className="text-2xl font-bold text-slate-900 md:pr-8">{lawyer.full_name}</h2>
                <p className="text-slate-500 font-medium">{lawyer.title || 'Legal Consultant'}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {lawyer.specialization?.slice(0, 3).map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-primary/5 text-primary text-xs font-semibold rounded-full border border-primary/10"
                  >
                    {spec}
                  </span>
                ))}
                {(lawyer.specialization?.length || 0) > 3 && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">
                    +{(lawyer.specialization?.length || 0) - 3} more
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-900 font-bold text-lg">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {lawyer.rating?.toFixed(1) || 'N/A'}
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mt-1">
                    Rating
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-900 font-bold text-lg">
                    <Briefcase className="w-4 h-4 text-primary" />
                    {lawyer.totalCases || 0}
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mt-1">
                    Cases
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-900 font-bold text-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                    {lawyer.years_of_experience || 0}+
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mt-1">
                    Years
                  </p>
                </div>
              </div>

              {/* Short Bio */}
              <div className="flex-1 mb-6">
                <h4 className="text-sm font-bold text-slate-900 mb-2">About</h4>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                  {lawyer.bio ||
                    `Specialized legal professional with over ${lawyer.years_of_experience || 0} years of experience in ${lawyer.specialization?.join(', ') || 'various legal fields'}. Committed to providing expert legal counsel.`}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                {lawyer.location || 'Location not specified'}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-auto">
                <Link
                  href={`/client/lawyers/${lawyer.id}`}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-bold rounded-xl transition-colors text-center"
                >
                  View Full Profile
                </Link>
                <button className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/25">
                  Book Consultation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
