'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, LayoutGrid, List, ArrowDownWideNarrow, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import LawyerCard from './LawyerCard';
import LawyerQuickViewModal from './LawyerQuickViewModal';
import LawyerFilterModal, { FilterState } from './LawyerFilterModal';

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

interface Department {
  id: string;
  name: string;
}

interface Props {
  lawyers: Lawyer[];
  departments: Department[];
}

type SortOption = 'rating' | 'experience' | 'cases' | 'availability' | 'reviews';

export default function LawyersListContent({ lawyers, departments }: Props) {
  // View State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('rating');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Filter State (Consolidated)
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    specializations: [],
    minExperience: 0,
    minRating: 0,
    availableNow: false,
    maxFee: 10000,
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Preview Modal State
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setIsPreviewOpen(true);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      specializations: [],
      minExperience: 0,
      minRating: 0,
      availableNow: false,
      maxFee: 10000,
    });
    setSearchQuery('');
  };

  // Derived Data: Specializations
  const allSpecializations = useMemo(() => {
    const specs = new Set<string>();
    lawyers.forEach((lawyer) => {
      if (lawyer.specialization) {
        const specArray = Array.isArray(lawyer.specialization)
          ? lawyer.specialization
          : [lawyer.specialization];
        specArray.forEach((spec) => spec && specs.add(spec));
      }
    });
    return Array.from(specs).sort();
  }, [lawyers]);

  // Filter Logic
  const filteredLawyers = useMemo(() => {
    return lawyers
      .filter((lawyer) => {
        const searchLower = searchQuery.toLowerCase();
        const specArray = lawyer.specialization
          ? Array.isArray(lawyer.specialization)
            ? lawyer.specialization
            : [lawyer.specialization]
          : [];

        // Mock Fee for filtering (since it's not in the type yet, assume random or default)
        // In real app, `lawyer.consultation_fee` should exist.
        const lawyerFee = lawyer.consultation_fee || 1500;

        const matchesSearch =
          !searchQuery ||
          lawyer.full_name.toLowerCase().includes(searchLower) ||
          specArray.some((s) => s?.toLowerCase().includes(searchLower)) ||
          lawyer.bio?.toLowerCase().includes(searchLower);

        const matchesLocation =
          !filters.location ||
          lawyer.location?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesSpecialization =
          filters.specializations.length === 0 ||
          specArray.some((s) => filters.specializations.includes(s));
        const matchesExperience =
          filters.minExperience === 0 || (lawyer.years_of_experience || 0) >= filters.minExperience;
        const matchesRating = filters.minRating === 0 || (lawyer.rating || 0) >= filters.minRating;
        const matchesAvailability =
          !filters.availableNow || lawyer.availability_status === 'Available';
        const matchesFee = lawyerFee <= filters.maxFee;

        return (
          matchesSearch &&
          matchesLocation &&
          matchesSpecialization &&
          matchesExperience &&
          matchesRating &&
          matchesAvailability &&
          matchesFee
        );
      })
      .sort((a, b) => {
        // Sort Logic
        switch (sortOption) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'experience':
            return (b.years_of_experience || 0) - (a.years_of_experience || 0);
          case 'cases':
            return (b.totalCases || 0) - (a.totalCases || 0);
          case 'availability':
            return (
              (a.availability_status === 'Available' ? -1 : 1) -
              (b.availability_status === 'Available' ? -1 : 1)
            );
          case 'reviews':
            return (b.reviews_count || 0) - (a.reviews_count || 0);
          default:
            return 0;
        }
      });
  }, [lawyers, searchQuery, filters, sortOption]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content Area */}
      <main className="min-w-0">
        {/* Mobile Filter Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search lawyers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              suppressHydrationWarning
            />
          </div>
          {/* Add Filter Button for Mobile Drawer if needed later */}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Header & Controls */}
          <div className="mb-10 space-y-8">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Find Your Legal Expert
              </h1>
              <p className="text-lg text-slate-600 mt-2 max-w-2xl">
                Connect with <span className="font-semibold text-slate-900">{lawyers.length}+</span>{' '}
                verified lawyers specializing in various fields.
              </p>
            </div>

            {/* Top Control Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Large Search */}
              <div className="relative w-full md:flex-1 h-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, specialization, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  suppressHydrationWarning
                />
              </div>

              {/* Controls Right */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Filter Button */}
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                  suppressHydrationWarning
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {/* Active Count Badge */}
                  {(filters.location ||
                    filters.specializations.length > 0 ||
                    filters.minExperience > 0 ||
                    filters.minRating > 0 ||
                    filters.availableNow ||
                    filters.maxFee < 10000) && (
                    <span className="bg-slate-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {[
                        filters.location ? 1 : 0,
                        filters.specializations.length,
                        filters.minExperience > 0 ? 1 : 0,
                        filters.minRating > 0 ? 1 : 0,
                        filters.availableNow ? 1 : 0,
                        filters.maxFee < 10000 ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </button>

                <div className="w-px h-8 bg-slate-200 hidden md:block" />

                {/* Sort Dropdown */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-sm font-medium text-slate-500 hidden sm:inline">
                    Sort by:
                  </span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer"
                    suppressHydrationWarning
                  >
                    <option value="rating">Top Rated</option>
                    <option value="reviews">Most Reviewed</option>
                    <option value="experience">Experience</option>
                    <option value="cases">Most Cases</option>
                    <option value="availability">Availability</option>
                  </select>
                  <ArrowDownWideNarrow className="w-4 h-4 text-slate-400" />
                </div>

                {/* View Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 hidden md:flex">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Grid View"
                    suppressHydrationWarning
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="List View"
                    suppressHydrationWarning
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Row */}
            {(filters.location ||
              filters.specializations.length > 0 ||
              filters.minExperience > 0 ||
              filters.minRating > 0 ||
              filters.availableNow ||
              filters.maxFee < 10000) && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active:
                </span>
                {filters.location && (
                  <FilterChip
                    label={filters.location}
                    onRemove={() => setFilters((prev) => ({ ...prev, location: '' }))}
                  />
                )}
                {filters.specializations.map((spec) => (
                  <FilterChip
                    key={spec}
                    label={spec}
                    onRemove={() =>
                      setFilters((prev) => ({
                        ...prev,
                        specializations: prev.specializations.filter((s) => s !== spec),
                      }))
                    }
                  />
                ))}
                {filters.minExperience > 0 && (
                  <FilterChip
                    label={`${filters.minExperience}+ Years Exp.`}
                    onRemove={() => setFilters((prev) => ({ ...prev, minExperience: 0 }))}
                  />
                )}
                {filters.minRating > 0 && (
                  <FilterChip
                    label={`${filters.minRating}+ Stars`}
                    onRemove={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
                  />
                )}
                {filters.availableNow && (
                  <FilterChip
                    label="Available Now"
                    onRemove={() => setFilters((prev) => ({ ...prev, availableNow: false }))}
                  />
                )}
                {filters.maxFee < 10000 && (
                  <FilterChip
                    label={`Max ₹${filters.maxFee}`}
                    onRemove={() => setFilters((prev) => ({ ...prev, maxFee: 10000 }))}
                  />
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-primary hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="min-w-0">
            {filteredLawyers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  No Verified Experts Found
                </h3>
                <p className="text-slate-500 mb-8 text-center max-w-md text-lg">
                  We couldn't find any lawyers matching your criteria. Try different keywords or
                  filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Reset Search
                </button>
              </motion.div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'
                    : 'flex flex-col gap-6 max-w-5xl mx-auto'
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredLawyers.map((lawyer) => (
                    <LawyerCard
                      key={lawyer.id}
                      lawyer={lawyer}
                      viewMode={viewMode}
                      onPreview={handlePreview}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Quick View Modal */}
        <LawyerQuickViewModal
          lawyer={selectedLawyer}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />

        {/* Filter Modal */}
        <LawyerFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          initialFilters={filters}
          allSpecializations={allSpecializations}
        />
      </main>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 group">
      {label}
      <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
