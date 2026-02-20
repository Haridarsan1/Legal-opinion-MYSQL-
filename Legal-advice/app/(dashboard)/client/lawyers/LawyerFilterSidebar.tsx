'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, Check, Star, IndianRupee } from 'lucide-react';
import LocationAutocomplete from '@/components/shared/LocationAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  // Filter State
  locationQuery: string;
  setLocationQuery: (val: string) => void;
  selectedSpecializations: string[];
  handleSpecializationToggle: (spec: string) => void;
  minExperience: number;
  setMinExperience: (val: number) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  availableNow: boolean;
  setAvailableNow: (val: boolean) => void;

  // Data
  allSpecializations: string[];
  activeFilterCount: number;
  clearFilters: () => void;

  // UI State
  isOpen: boolean;
  onClose: () => void;
}

export default function LawyerFilterSidebar({
  locationQuery,
  setLocationQuery,
  selectedSpecializations,
  handleSpecializationToggle,
  minExperience,
  setMinExperience,
  minRating,
  setMinRating,
  availableNow,
  setAvailableNow,
  allSpecializations,
  activeFilterCount,
  clearFilters,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  // Collapsible Logic
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    location: true,
    specialization: true,
    experience: true,
    rating: true,
    availability: true,
    fee: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [feeRange, setFeeRange] = useState([500, 5000]); // Mock fee state for UI

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 bg-white border-r border-slate-200 h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-900" />
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Location Section */}
          <FilterSection
            title="Location"
            isOpen={openSections.location}
            onToggle={() => toggleSection('location')}
          >
            <LocationAutocomplete
              value={locationQuery}
              onChange={setLocationQuery}
              placeholder="Enter city..."
              className="w-full"
            />
          </FilterSection>

          {/* Specialization Section */}
          <FilterSection
            title="Practice Areas"
            isOpen={openSections.specialization}
            onToggle={() => toggleSection('specialization')}
          >
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {allSpecializations.map((spec) => (
                <label key={spec} className="flex items-center gap-3 cursor-pointer group py-1">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      selectedSpecializations.includes(spec)
                        ? 'bg-primary border-primary'
                        : 'border-slate-300 bg-white group-hover:border-primary'
                    }`}
                  >
                    {selectedSpecializations.includes(spec) && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedSpecializations.includes(spec)}
                    onChange={() => handleSpecializationToggle(spec)}
                    className="hidden"
                  />
                  <span
                    className={`text-sm transition-colors truncate ${
                      selectedSpecializations.includes(spec)
                        ? 'text-slate-900 font-medium'
                        : 'text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    {spec}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Experience Section */}
          <FilterSection
            title="Experience"
            isOpen={openSections.experience}
            onToggle={() => toggleSection('experience')}
          >
            <div className="space-y-2">
              {[0, 3, 5, 10, 15, 20].map((exp) => (
                <label key={exp} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      minExperience === exp
                        ? 'border-primary'
                        : 'border-slate-300 group-hover:border-primary'
                    }`}
                  >
                    {minExperience === exp && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <input
                    type="radio"
                    name="experience"
                    checked={minExperience === exp}
                    onChange={() => setMinExperience(exp)}
                    className="hidden"
                  />
                  <span
                    className={`text-sm ${minExperience === exp ? 'text-slate-900 font-medium' : 'text-slate-600'}`}
                  >
                    {exp === 0 ? 'Any Experience' : `${exp}+ Years`}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Rating Section */}
          <FilterSection
            title="Rating"
            isOpen={openSections.rating}
            onToggle={() => toggleSection('rating')}
          >
            <div className="space-y-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      minRating === rating
                        ? 'border-primary'
                        : 'border-slate-300 group-hover:border-primary'
                    }`}
                  >
                    {minRating === rating && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-sm ${minRating === rating ? 'text-slate-900 font-medium' : 'text-slate-600'}`}
                    >
                      & Up
                    </span>
                  </div>
                </label>
              ))}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    minRating === 0
                      ? 'border-primary'
                      : 'border-slate-300 group-hover:border-primary'
                  }`}
                >
                  {minRating === 0 && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 0}
                  onChange={() => setMinRating(0)}
                  className="hidden"
                />
                <span
                  className={`text-sm ${minRating === 0 ? 'text-slate-900 font-medium' : 'text-slate-600'}`}
                >
                  Any Rating
                </span>
              </label>
            </div>
          </FilterSection>

          {/* Consultation Fee (Mock/Visual) */}
          <FilterSection
            title="Consultation Fee"
            isOpen={openSections.fee}
            onToggle={() => toggleSection('fee')}
          >
            <div className="px-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-4">
                <span>₹{feeRange[0]}</span>
                <span>₹{feeRange[1]}+</span>
              </div>
              {/* Visual Slider Mock */}
              <div className="relative h-1.5 bg-slate-200 rounded-full mb-2">
                <div className="absolute left-[0%] right-[0%] top-0 bottom-0 bg-primary/30 rounded-full"></div>
                <div className="absolute left-[0%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow cursor-grab"></div>
                <div className="absolute right-[0%] top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow cursor-grab"></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Adjust range to filter by fee</p>
            </div>
          </FilterSection>

          {/* Availability Section */}
          <div className="pt-4 border-t border-slate-200">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                Available Now
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={availableNow}
                  onChange={(e) => setAvailableNow(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>

          {/* Apply Button (Mobile Only usually, but good for heavy data) */}
          <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all active:scale-[0.98]">
            Apply Filters
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Re-use logic for mobile content or extract to shared renders above if strictly needed. 
                                 For now, duplicating structural logic for clarity in this component file 
                                 (or typically we'd just render the aside content here sans the 'hidden lg:block' wrapper)
                              */}
              <div className="p-6 space-y-8 pb-24">
                {/* Location */}
                <FilterSection
                  title="Location"
                  isOpen={openSections.location}
                  onToggle={() => toggleSection('location')}
                >
                  <LocationAutocomplete
                    value={locationQuery}
                    onChange={setLocationQuery}
                    placeholder="Enter city..."
                    className="w-full"
                  />
                </FilterSection>
                {/* Specialization */}
                <FilterSection
                  title="Practice Areas"
                  isOpen={openSections.specialization}
                  onToggle={() => toggleSection('specialization')}
                >
                  <div className="space-y-2">
                    {allSpecializations.map((spec) => (
                      <label key={spec} className="flex items-center gap-3 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={selectedSpecializations.includes(spec)}
                          onChange={() => handleSpecializationToggle(spec)}
                          className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
                {/* ... Other sections can be added similarly for mobile if identical */}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-4 group"
        suppressHydrationWarning
      >
        <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
