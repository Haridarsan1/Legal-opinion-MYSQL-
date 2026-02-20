'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Check, Star, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationAutocomplete from '@/components/shared/LocationAutocomplete';

export interface FilterState {
  location: string;
  specializations: string[];
  minExperience: number;
  minRating: number;
  availableNow: boolean;
  maxFee: number;
}

interface LawyerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
  allSpecializations: string[];
}

export default function LawyerFilterModal({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  allSpecializations,
}: LawyerFilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      location: '',
      specializations: [],
      minExperience: 0,
      minRating: 0,
      availableNow: false,
      maxFee: 10000, // Default max
    });
  };

  const toggleSpecialization = (spec: string) => {
    setFilters((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end md:items-center md:justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full md:max-w-xl h-[90vh] md:h-auto md:max-h-[85vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-900" />
                  Filters
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Refine your search results
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                suppressHydrationWarning
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Location Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </h3>
                <div className="relative z-20">
                  <LocationAutocomplete
                    value={filters.location}
                    onChange={(val) => setFilters((prev) => ({ ...prev, location: val }))}
                    className="w-full"
                  />
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              {/* Availability Toggle */}
              <section className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Available Now</h3>
                  <p className="text-xs text-slate-500 mt-1">Only show lawyers currently online</p>
                </div>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, availableNow: !prev.availableNow }))
                  }
                  className={`relative w-12 h-7 rounded-full transition-colors ${filters.availableNow ? 'bg-green-500' : 'bg-slate-200'}`}
                  suppressHydrationWarning
                >
                  <motion.div
                    animate={{ x: filters.availableNow ? 20 : 2 }}
                    className="absolute top-1 left-0 w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
              </section>

              <div className="h-px bg-slate-100" />

              {/* Specialization Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Practice Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {allSpecializations.map((spec) => {
                    const isSelected = filters.specializations.includes(spec);
                    return (
                      <button
                        key={spec}
                        onClick={() => toggleSpecialization(spec)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                        suppressHydrationWarning
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              {/* Experience Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Minimum Experience</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 3, 5, 10].map((years) => (
                    <button
                      key={years}
                      onClick={() => setFilters((prev) => ({ ...prev, minExperience: years }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                        filters.minExperience === years
                          ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900 ring-offset-2'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                      suppressHydrationWarning
                    >
                      <span className="text-sm">{years === 0 ? 'Any' : `${years}+`}</span>
                      <span className="text-[10px] font-normal opacity-70">Years</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              {/* Rating Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Minimum Rating</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFilters((prev) => ({ ...prev, minRating: star }))}
                      className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center ${
                        filters.minRating === star
                          ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500'
                          : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                      suppressHydrationWarning
                    >
                      <span className="font-bold text-sm mr-1">{star}</span>
                      <Star
                        className={`w-3.5 h-3.5 ${filters.minRating === star ? 'fill-amber-500 text-amber-500' : 'fill-slate-200 text-slate-200'}`}
                      />
                      {star < 5 && <span className="text-xs ml-0.5">+</span>}
                    </button>
                  ))}
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              {/* Fee Slider Section (Simple Visual Placeholder for now) */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Consultation Fee</h3>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                    Up to ₹{filters.maxFee}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={filters.maxFee}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxFee: parseInt(e.target.value) }))
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  suppressHydrationWarning
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                  <span>₹500</span>
                  <span>₹5,000</span>
                  <span>₹10,000+</span>
                </div>
              </section>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-md flex items-center gap-4">
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
                suppressHydrationWarning
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                suppressHydrationWarning
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
