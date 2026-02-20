'use client';

import Link from 'next/link';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface Department {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

interface Props {
  departments: Department[];
}

export default function DepartmentsListContent({ departments }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Departments');

  // Define department data with images and categories
  const departmentData = [
    {
      id: '1',
      name: 'Corporate & Commercial',
      icon: '🏢',
      description:
        'Mergers, acquisitions, joint ventures, and general corporate advisory for domestic and international businesses.',
      category: 'Corporate',
      bgGradient: 'from-[#1e3a5f] to-[#2d5a8c]',
    },
    {
      id: '2',
      name: 'Intellectu al Property',
      icon: '💡',
      description:
        'Comprehensive protection including trademarks, patents, copyright registration, and infringement disputes.',
      category: 'Advisory',
      bgGradient: 'from-[#1a3552] to-[#264d73]',
    },
    {
      id: '3',
      name: 'Dispute Resolution',
      icon: '⚖️',
      description:
        'Strategic representation in arbitration, mediation, and complex commercial litigation across all levels.',
      category: 'Litigation',
      bgGradient: 'from-[#1c3a5a] to-[#2a5280]',
    },
    {
      id: '4',
      name: 'Real Estate',
      icon: '🏘️',
      description:
        'Handling property transactions, leasing agreements, land due diligence, and regulatory compliance matters.',
      category: 'Corporate',
      bgGradient: 'from-[#203d61] to-[#2f5d8f]',
    },
    {
      id: '5',
      name: 'Taxation',
      icon: '💰',
      description:
        'Expert advisory on direct and indirect tax matters, planning, and representation before tax authorities.',
      category: 'Advisory',
      bgGradient: 'from-[#1b3856] to-[#285076]',
    },
    {
      id: '6',
      name: 'Employment & Labor',
      icon: '👥',
      description:
        'Guidance on HR policies, employment contracts, compliance audits, and dispute resolution in workplace matters.',
      category: 'Advisory',
      bgGradient: 'from-[#1f3c5d] to-[#2c5785]',
    },
  ];

  const filters = ['All Departments', 'Corporate', 'Litigation', 'Advisory'];

  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[#111827] text-3xl font-extrabold tracking-tight">Legal Departments</h1>
        <p className="text-gray-600 text-base">
          Browse our specialized practice areas to find the expertise you need. Initiate requests
          directly or explore detailed capabilities.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a practice area, service, or keyword..."
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">FILTERS:</span>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === filter
                  ? 'bg-[#003366] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-[#003366] text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors">
          <Filter className="w-4 h-4" />
          Advanced Filters
        </button>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentData.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group border border-gray-100"
          >
            {/* Card Header with Gradient Background */}
            <div
              className={`relative h-48 bg-gradient-to-br ${dept.bgGradient} flex items-center justify-center overflow-hidden`}
            >
              {/* Icon Badge */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-lg z-10">
                {dept.icon}
              </div>

              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

              {/* Decorative pattern (optional) */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 bg-white">
              <h3 className="text-xl font-bold text-[#111827] mb-2">{dept.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {dept.description}
              </p>

              <Link
                href={`/client/request/new?department=${dept.id}`}
                className="flex items-center justify-between w-full px-6 py-3 bg-[#003366] text-white font-semibold rounded-lg hover:bg-[#002244] transition-colors group"
              >
                <span>New Request</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center py-6">
        <button className="flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Load more departments
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
