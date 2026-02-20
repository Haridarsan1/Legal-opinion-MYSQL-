'use client';

import { useState } from 'react';
import { Search, Star, ChevronDown, Building2 } from 'lucide-react';

export default function AssignToFirmPage() {
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null);

  // Mock firms data
  const firms = [
    {
      id: '1',
      name: 'Smith & Associates',
      city: 'New York, NY',
      verified: true,
      tags: ['Residential', 'Property Law'],
      rating: 4.9,
      avgTAT: '2 Days',
      estFee: '$450',
      avatar: 'S&A',
    },
    {
      id: '2',
      name: 'Global Legal Partners',
      city: 'Chicago, IL',
      verified: true,
      tags: ['Commercial', 'Corporate'],
      rating: 4.7,
      avgTAT: '1 Day',
      estFee: '$750',
      avatar: 'GLP',
    },
    {
      id: '3',
      name: 'Downtown Law',
      city: 'Boston, MA',
      verified: false,
      tags: ['Residential', 'Budget Friendly'],
      rating: 4.5,
      avgTAT: '5 Days',
      estFee: '$300',
      avatar: 'DL',
    },
    {
      id: '4',
      name: 'Prestige Firm',
      city: 'Los Angeles, CA',
      verified: true,
      tags: ['Luxury', 'Complex Cases'],
      rating: 5.0,
      avgTAT: '3 Days',
      estFee: '$900',
      avatar: 'PF',
    },
    {
      id: '5',
      name: 'Beacon Hill Legal',
      city: 'Seattle, WA',
      verified: true,
      tags: ['Tech Focus', 'IP Law'],
      rating: 4.6,
      avgTAT: '4 Days',
      estFee: '$600',
      avatar: 'BHL',
    },
    {
      id: '6',
      name: 'River North Attorneys',
      city: 'Austin, TX',
      verified: true,
      tags: ['Fast Track', 'Residential'],
      rating: 4.3,
      avgTAT: '24 Hrs',
      estFee: '$550',
      avatar: 'RNA',
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1400px] mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <a href="#" className="hover:text-blue-600">
          Dashboard
        </a>
        <span>›</span>
        <a href="#" className="hover:text-blue-600">
          Property #1234
        </a>
        <span>›</span>
        <span className="text-gray-900 font-medium">Assign Firm</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-[#111827] text-3xl font-extrabold mb-2">
          Assign Legal Opinion Request
        </h1>
        <p className="text-gray-600">
          Select a verified partner to review the property at 123 Main St.
        </p>
      </div>

      {/* Property Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Property ID</p>
          </div>
          <p className="text-2xl font-bold text-[#111827]">#1234-NYC</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">$</span>
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Loan Amount</p>
          </div>
          <p className="text-2xl font-bold text-[#111827]">$500,000</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">🏠</span>
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Property Type</p>
          </div>
          <p className="text-2xl font-bold text-[#111827]">Residential</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by firm name, location"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm">Expertise</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm">Rating</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm">Turnaround Time</span>
        </button>
        <label className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-sm">Verified Only</span>
        </label>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Available Firms (12)</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button className="text-sm font-medium text-blue-600 hover:underline">Recommended</button>
        </div>
      </div>

      {/* Firms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {firms.map((firm) => (
          <div
            key={firm.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {firm.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{firm.name}</h3>
                    {firm.verified && (
                      <span className="flex items-center gap-1 text-green-600">
                        <span className="text-xs">✓</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{firm.city}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {firm.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{firm.rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg. TAT</p>
                  <p className="font-bold text-gray-900">{firm.avgTAT}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Est. Fee</p>
                  <p className="font-bold text-gray-900">{firm.estFee}</p>
                </div>
              </div>

              {/* Select Button */}
              <button className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-between">
                <span>Select Firm</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white font-medium">
          1
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-700 hover:bg-gray-50">
          2
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-700 hover:bg-gray-50">
          3
        </button>
      </div>
    </div>
  );
}
