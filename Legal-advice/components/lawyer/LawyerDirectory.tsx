'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Star, Bookmark, Download, Filter, X, Check, User } from 'lucide-react';
import Image from 'next/image';

export interface DirectoryLawyer {
  id: string;
  full_name: string;
  specialization?: string[];
  years_of_experience?: number;
  avatar_url?: string;
  location?: string;
  rating?: number;
  reviews_count?: number;
  availability_status?: 'Available' | 'In Court' | 'Offline';
  title?: string; // e.g. Senior Counsel
  bio?: string;
  bar_council_id?: string;
  [key: string]: any;
}

interface Props {
  lawyers: DirectoryLawyer[];
  selectedId?: string;
  onSelect?: (lawyer: DirectoryLawyer) => void;
  mode?: 'browse' | 'select';
  className?: string;
}

export default function LawyerDirectory({
  lawyers,
  selectedId,
  onSelect,
  mode = 'browse',
  className = '',
}: Props) {
  const [location, setLocation] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(['All Departments']);
  const [availableNow, setAvailableNow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minExperience, setMinExperience] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  // Derived departments list from actual data
  const departments = useMemo(() => {
    const allDepts = new Set<string>();
    lawyers.forEach((l) => {
      if (Array.isArray(l.specialization)) {
        l.specialization.forEach((s) => allDepts.add(s));
      }
    });
    return ['All Departments', ...Array.from(allDepts).sort()];
  }, [lawyers]);

  // Filter Logic
  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = lawyer.full_name?.toLowerCase().includes(query);
        const matchesSpec =
          Array.isArray(lawyer.specialization) &&
          lawyer.specialization.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesSpec) return false;
      }

      // Location
      if (location) {
        if (!lawyer.location?.toLowerCase().includes(location.toLowerCase())) return false;
      }

      // Department
      if (!selectedDepartments.includes('All Departments')) {
        const hasDept =
          Array.isArray(lawyer.specialization) &&
          lawyer.specialization.some((s) => selectedDepartments.includes(s));
        if (!hasDept) return false;
      }

      // Availability
      if (availableNow) {
        if (lawyer.availability_status !== 'Available') return false;
      }

      // Experience
      if (minExperience > 0) {
        if ((lawyer.years_of_experience || 0) < minExperience) return false;
      }

      // Rating
      if (minRating > 0) {
        if ((lawyer.rating || 0) < minRating) return false;
      }

      return true;
    });
  }, [lawyers, searchQuery, location, selectedDepartments, availableNow, minExperience, minRating]);

  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700';
      case 'In Court':
        return 'bg-red-100 text-red-700';
      case 'Offline':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDepartmentToggle = (dept: string) => {
    if (dept === 'All Departments') {
      setSelectedDepartments(['All Departments']);
    } else {
      const newDepts = selectedDepartments.filter((d) => d !== 'All Departments');
      if (selectedDepartments.includes(dept)) {
        const filtered = newDepts.filter((d) => d !== dept);
        setSelectedDepartments(filtered.length === 0 ? ['All Departments'] : filtered);
      } else {
        setSelectedDepartments([...newDepts, dept]);
      }
    }
  };

  const resetFilters = () => {
    setLocation('');
    setSelectedDepartments(['All Departments']);
    setAvailableNow(false);
    setSearchQuery('');
    setMinExperience(0);
    setMinRating(0);
  };

  const viewingLawyer = viewingProfileId ? lawyers.find((l) => l.id === viewingProfileId) : null;

  return (
    <div className={`flex h-full bg-[#F9FAFB] relative ${className}`}>
      {/* Left Sidebar - Filters */}
      <div className="w-[280px] bg-white border-r border-gray-200 p-6 overflow-y-auto hidden md:block">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-[#003366]" />
          <h2 className="text-lg font-bold text-[#111827]">Filters</h2>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#111827] mb-2">Location</label>
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city (e.g. Delhi)"
              className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#003366]" />
          </div>
        </div>

        {/* Legal Department */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#111827] mb-3">Specialization</label>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
            {departments.map((dept) => (
              <label key={dept} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(dept)}
                  onChange={() => handleDepartmentToggle(dept)}
                  className="w-4 h-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366] cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-[#003366] transition-colors truncate">
                  {dept}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#111827] mb-3">Experience</label>
          <select
            value={minExperience}
            onChange={(e) => setMinExperience(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
          >
            <option value={0}>Any Experience</option>
            <option value={3}>3+ Years</option>
            <option value={5}>5+ Years</option>
            <option value={10}>10+ Years</option>
            <option value={15}>15+ Years</option>
            <option value={20}>20+ Years</option>
          </select>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#111827] mb-3">Rating</label>
          <div className="space-y-2">
            {[4.5, 4.0, 3.5, 3.0].map((rating) => (
              <label key={rating} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === rating}
                  onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                  className="w-4 h-4 text-[#003366] border-gray-300 focus:ring-[#003366] cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-700 group-hover:text-[#003366] transition-colors">
                    {rating}+ Stars
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </label>
            ))}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={minRating === 0}
                onChange={() => setMinRating(0)}
                className="w-4 h-4 text-[#003366] border-gray-300 focus:ring-[#003366] cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#003366] transition-colors">
                Any Rating
              </span>
            </label>
          </div>
        </div>

        {/* Available Now */}
        <div className="mb-6">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-semibold text-[#111827]">Available Now</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={availableNow}
                onChange={(e) => setAvailableNow(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003366]"></div>
            </div>
          </label>
        </div>

        {/* Reset Filters */}
        <button
          type="button"
          onClick={resetFilters}
          className="w-full px-4 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
        >
          Reset Filters
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[#111827] text-2xl md:text-3xl font-extrabold mb-2">
              {mode === 'select' ? 'Select a Lawyer' : 'Find a Legal Expert'}
            </h1>
            <p className="text-blue-600 text-sm md:text-base">
              Browse verified legal experts by specialization and experience.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, specialization, or keyword..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#111827]">
              Showing {filteredLawyers.length} Lawyers
            </h2>
            {mode === 'browse' && (
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export List</span>
              </button>
            )}
          </div>

          {/* Lawyers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => {
              const isSelected = selectedId === lawyer.id;
              return (
                <div
                  key={lawyer.id}
                  className={`bg-white border rounded-xl p-6 transition-all relative ${
                    isSelected
                      ? 'border-[#003366] ring-2 ring-[#003366] ring-offset-2'
                      : 'border-gray-200 hover:shadow-lg'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-[#003366] text-white p-1 rounded-full z-10">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {lawyer.avatar_url ? (
                        <Image
                          src={lawyer.avatar_url}
                          alt={lawyer.full_name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3
                          className="font-bold text-[#111827] line-clamp-1"
                          title={lawyer.full_name}
                        >
                          {lawyer.full_name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {lawyer.title || 'Legal Expert'}
                        </p>
                      </div>
                    </div>
                    {mode === 'browse' && (
                      <button
                        type="button"
                        className="text-gray-400 hover:text-[#003366] transition-colors"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-[#111827]">{lawyer.rating || 'N/A'}</span>
                    <span className="text-sm text-gray-500">
                      ({lawyer.reviews_count || 0} reviews)
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{lawyer.location || 'Consultant'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">💼</span>
                      <span>{lawyer.years_of_experience || 0} Years Experience</span>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2 mb-4 h-[52px] overflow-hidden">
                    {(Array.isArray(lawyer.specialization) ? lawyer.specialization : [])
                      .slice(0, 3)
                      .map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded truncate max-w-full"
                        >
                          {spec}
                        </span>
                      ))}
                    {Array.isArray(lawyer.specialization) && lawyer.specialization.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded">
                        +{lawyer.specialization.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-2">
                    {lawyer.availability_status && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getAvailabilityColor(lawyer.availability_status)}`}
                      >
                        ● {lawyer.availability_status}
                      </span>
                    )}

                    <div className="flex gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setViewingProfileId(lawyer.id)}
                        className="px-3 py-2 text-slate-600 text-sm font-medium hover:text-[#003366] transition-colors"
                      >
                        Details
                      </button>
                      {mode === 'select' && onSelect && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(lawyer);
                          }}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-[#003366] text-white hover:bg-[#002244]'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {
  filteredLawyers.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No lawyers found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Profile Drawer */}
      {
  viewingLawyer && (
        <div
          className="absolute inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-all"
          onClick={() => setViewingProfileId(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto p-6 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewingProfileId(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center mb-6">
              {viewingLawyer.avatar_url ? (
                <Image
                  src={viewingLawyer.avatar_url}
                  alt={viewingLawyer.full_name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-slate-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <User className="w-10 h-10" />
                </div>
              )}
              <h2 className="text-xl font-bold text-slate-900 text-center">
                {viewingLawyer.full_name}
              </h2>
              <p className="text-slate-500">{viewingLawyer.title || 'Legal Expert'}</p>

              <div className="flex gap-4 mt-4">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900">
                    {viewingLawyer.years_of_experience || 0}
                  </span>
                  <span className="text-xs text-slate-500 text-center">Years Exp.</span>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900">{viewingLawyer.rating || 'N/A'}</span>
                  <span className="text-xs text-slate-500 text-center">Rating</span>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-900">
                    {viewingLawyer.reviews_count || 0}
                  </span>
                  <span className="text-xs text-slate-500 text-center">Reviews</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  About
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {viewingLawyer.bio || 'No biography available.'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(viewingLawyer.specialization)
                    ? viewingLawyer.specialization
                    : []
                  ).map((spec, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {viewingLawyer.location && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Location
                  </h3>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{viewingLawyer.location}</span>
                  </div>
                </div>
              )}

              {
  mode === 'select' && onSelect && (
                <button
                  type="button"
                  onClick={() => {
                    onSelect(viewingLawyer);
                    setViewingProfileId(null);
                  }}
                  className="w-full py-3 bg-[#003366] text-white font-bold rounded-xl shadow-lg hover:bg-[#002244] transition-all mt-4"
                >
                  Select This Lawyer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
