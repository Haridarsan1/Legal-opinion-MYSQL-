'use client';

import { useState } from 'react';
import { Check, Info, HelpCircle } from 'lucide-react';

export default function SelectSLAPage() {
  const [selectedSLA, setSelectedSLA] = useState<string | null>('expedited');

  const slaOptions = [
    {
      id: 'standard',
      name: 'STANDARD',
      duration: '72h',
      price: '$150',
      icon: '⏱',
      features: ['Full Title Search', 'Standard Compliance Check', 'Email Support'],
    },
    {
      id: 'expedited',
      name: 'EXPEDITED',
      duration: '48h',
      price: '$250',
      icon: '⚡',
      recommended: true,
      features: [
        'Everything in Standard',
        'Priority Queue processing',
        'Dedicated Account Manager',
      ],
    },
    {
      id: 'urgent',
      name: 'URGENT',
      duration: '24h',
      price: '$400',
      icon: '🚀',
      features: ['Immediate Start', 'Overnight Delivery', '24/7 Phone Support'],
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1200px] mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <a href="#" className="hover:underline">
          Home
        </a>
        <span className="text-gray-400">/</span>
        <a href="#" className="hover:underline">
          New Request
        </a>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Select SLA</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-[#111827] text-3xl font-extrabold mb-2">
          Select Service Level Agreement
        </h1>
        <p className="text-gray-600">Choose the turnaround time required for this legal opinion.</p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">STEP 2 OF 4</p>
          <p className="text-sm font-semibold text-blue-600">50%</p>
        </div>
        <p className="text-xs text-gray-600 mb-3">SLA Selection</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - SLA Cards */}
        <div className="lg:col-span-2">
          {/* Property Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                Commercial RE
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">123 Main St, Springfield, IL</h3>
            <p className="text-sm text-gray-600">Property ID: #88219 • Loan Ref: LN-2023-X</p>
          </div>

          {/* SLA Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slaOptions.map((sla) => (
              <div
                key={sla.id}
                onClick={() => setSelectedSLA(sla.id)}
                className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
                  selectedSLA === sla.id
                    ? 'border-blue-600 ring-4 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Recommended Badge */}
                {sla.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                    {sla.icon}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-center font-bold text-gray-900 mb-1">{sla.name}</h3>
                <p className="text-center text-2xl font-extrabold text-gray-900 mb-1">
                  {sla.duration}
                </p>
                <p className="text-center text-3xl font-black text-gray-900 mb-4">{sla.price}</p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {sla.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Estimated Delivery */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Estimated Delivery</p>
                <p className="font-bold text-gray-900">Oct 26, 2023 by 5:00 PM EST</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <span>Proceed to Payment</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* SLA Guidelines */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">SLA Guidelines</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Turnaround times are calculated based on business days. Requests submitted after 3 PM
              EST will be processed the following business day.
            </p>
            <a href="#" className="text-sm text-blue-600 hover:underline font-medium">
              Read full policy
            </a>
          </div>

          {/* Need Help */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Our legal operations team is available to assist with any queries.
            </p>
            <button className="w-full px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
