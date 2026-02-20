'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  Check,
  Star,
  IndianRupee,
  MapPin,
  Briefcase,
  Clock,
  Calendar,
} from 'lucide-react';
import LocationAutocomplete from '@/components/shared/LocationAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterToolbarProps {
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

  // Mobile Interactions
  onOpenMobileFilters: () => void;
}

export default function LawyerFilterToolbar({
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
  onOpenMobileFilters,
}: FilterToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('.filter-dropdown-container') === null) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-[70px] z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all mb-6">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors shadow-md"
          >
            <Filter className="w-4 h-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Desktop Horizontal Filters */}
          <div className="hidden lg:flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar filter-dropdown-container">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
              Filter By:
            </span>

            {/* Location Dropdown */}
            <FilterDropdown
              label="Location"
              isActive={!!locationQuery}
              isOpen={openDropdown === 'location'}
              onToggle={() => toggleDropdown('location')}
              icon={<MapPin className="w-4 h-4" />}
              activeValue={locationQuery}
            >
              <div className="p-4 w-72">
                <LocationAutocomplete
                  value={locationQuery}
                  onChange={setLocationQuery}
                  placeholder="Search city..."
                  className="w-full"
                />
              </div>
            </FilterDropdown>

            {/* Practice Area Dropdown */}
            <FilterDropdown
              label="Practice Area"
              isActive={selectedSpecializations.length > 0}
              isOpen={openDropdown === 'specialization'}
              onToggle={() => toggleDropdown('specialization')}
              icon={<Briefcase className="w-4 h-4" />}
              activeValue={
                selectedSpecializations.length > 0
                  ? `${selectedSpecializations.length} selected`
                  : ''
              }
            >
              <div className="p-2 w-72 max-h-80 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  {allSpecializations.map((spec) => (
                    <label
                      key={spec}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                          selectedSpecializations.includes(spec)
                            ? 'bg-primary border-primary'
                            : 'border-slate-300 bg-white group-hover:border-primary'
                        }`}
                      >
                        {selectedSpecializations.includes(spec) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedSpecializations.includes(spec)}
                        onChange={() => handleSpecializationToggle(spec)}
                        className="hidden"
                      />
                      <span
                        className={`text-sm truncate ${
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
              </div>
            </FilterDropdown>

            {/* Experience Dropdown */}
            <FilterDropdown
              label="Experience"
              isActive={minExperience > 0}
              isOpen={openDropdown === 'experience'}
              onToggle={() => toggleDropdown('experience')}
              icon={<Clock className="w-4 h-4" />}
              activeValue={minExperience > 0 ? `${minExperience}+ Years` : ''}
            >
              <div className="p-2 w-56">
                {[0, 3, 5, 10, 15, 20].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => {
                      setMinExperience(exp);
                      toggleDropdown('experience');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      minExperience === exp
                        ? 'bg-primary/5 text-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {exp === 0 ? 'Any Experience' : `${exp}+ Years`}
                    {minExperience === exp && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </FilterDropdown>

            {/* Rating Dropdown */}
            <FilterDropdown
              label="Rating"
              isActive={minRating > 0}
              isOpen={openDropdown === 'rating'}
              onToggle={() => toggleDropdown('rating')}
              icon={<Star className="w-4 h-4" />}
              activeValue={minRating > 0 ? `${minRating}+ Stars` : ''}
            >
              <div className="p-2 w-56">
                {[4.5, 4.0, 3.5, 3.0, 0].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => {
                      setMinRating(rating);
                      toggleDropdown('rating');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      minRating === rating
                        ? 'bg-primary/5 text-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {rating === 0 ? 'Any Rating' : `${rating}+ Stars`}
                      {rating > 0 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                    </span>
                    {minRating === rating && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </FilterDropdown>

            {/* Fee Visual Dropdown */}
            <FilterDropdown
              label="Consultation Fee"
              isActive={false}
              isOpen={openDropdown === 'fee'}
              onToggle={() => toggleDropdown('fee')}
              icon={<IndianRupee className="w-4 h-4" />}
            >
              <div className="p-4 w-72">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-4">
                  <span>₹500</span>
                  <span>₹5000+</span>
                </div>
                <div className="relative h-1.5 bg-slate-200 rounded-full mb-2">
                  <div className="absolute left-[0%] right-[0%] top-0 bottom-0 bg-primary/30 rounded-full"></div>
                  <div className="absolute left-[0%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow cursor-grab"></div>
                  <div className="absolute right-[0%] top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow cursor-grab"></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">Adjust fee range</p>
              </div>
            </FilterDropdown>

            <div className="w-px h-6 bg-slate-200 mx-2" />

            {/* Availability Toggle */}
            <button
              onClick={() => setAvailableNow(!availableNow)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                availableNow
                  ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                  : 'bg-white text-slate-600 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
              suppressHydrationWarning
            >
              <Calendar className="w-4 h-4" />
              Available Now
              {availableNow && <CheckCircleIcon />}
            </button>

            {/* Clear All */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips (Desktop) */}
        {activeFilterCount > 0 && (
          <div className="hidden lg:flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            {locationQuery && (
              <ActiveFilterChip label={locationQuery} onRemove={() => setLocationQuery('')} />
            )}
            {selectedSpecializations.map((spec) => (
              <ActiveFilterChip
                key={spec}
                label={spec}
                onRemove={() => handleSpecializationToggle(spec)}
              />
            ))}
            {minExperience > 0 && (
              <ActiveFilterChip
                label={`${minExperience}+ Years`}
                onRemove={() => setMinExperience(0)}
              />
            )}
            {minRating > 0 && (
              <ActiveFilterChip label={`${minRating}+ Stars`} onRemove={() => setMinRating(0)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({ label, isActive, isOpen, onToggle, children, icon, activeValue }: any) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
          isActive
            ? 'bg-primary/5 text-primary border-primary/20 shadow-sm ring-1 ring-primary/10'
            : isOpen
              ? 'bg-slate-50 text-slate-900 border-slate-300'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
        suppressHydrationWarning
      >
        {icon}
        <span className="truncate max-w-[100px]">{activeValue || label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-slate-400`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden min-w-[200px]"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-200 group whitespace-nowrap">
      {label}
      <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function CheckCircleIcon() {
  return (
    <div className="bg-green-100 rounded-full p-0.5">
      <Check className="w-3 h-3 text-green-600" />
    </div>
  );
}
