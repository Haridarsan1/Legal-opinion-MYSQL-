'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

export default function BankRatingsPage() {
  const [firmRating, setFirmRating] = useState(4);
  const [lawyerRating, setLawyerRating] = useState(5);
  const [firmTurnaround, setFirmTurnaround] = useState(4);
  const [firmAccuracy, setFirmAccuracy] = useState(5);
  const [lawyerCommunication, setLawyerCommunication] = useState(5);
  const [adheresFormat, setAdheresFormat] = useState<boolean | null>(null);
  const [firmReview, setFirmReview] = useState('');
  const [lawyerReview, setLawyerReview] = useState('');

  const renderStars = (rating: number, setRating: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderSlider = (
    value: number,
    setValue: (val: number) => void,
    label: string,
    score: string
  ) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          <span className="text-sm font-bold text-blue-600">{score}</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    if (rating >= 5) return 'Excellent!';
    if (rating >= 4) return 'Very Good';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1200px] mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <a href="#" className="hover:underline">
          Dashboard
        </a>
        <span className="text-gray-400">›</span>
        <a href="#" className="hover:underline">
          Completed Cases
        </a>
        <span className="text-gray-400">›</span>
        <a href="#" className="hover:underline">
          Case #1234
        </a>
        <span className="text-gray-400">›</span>
        <span className="text-gray-900 font-medium">Rate Service</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-[#111827] text-3xl font-extrabold mb-2">Rate your experience</h1>
        <p className="text-gray-600">
          Your feedback helps us maintain quality standards across the portal. Please rate the law
          firm and the specific lawyer assigned to this case.
        </p>
      </div>

      {/* Case Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-5">
        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200"
            alt="Property"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
              COMPLETED
            </span>
            <span className="text-sm text-gray-600">ID: #1234-8892</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">450 Lexington Ave, New York, NY</h3>
          <p className="text-sm text-gray-600">Opinion delivered on Oct 24, 2023</p>
        </div>
        <a
          href="#"
          className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
        >
          View Case Details
          <span>→</span>
        </a>
      </div>

      {/* Dual Rating System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LAW FIRM Rating */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              S&A
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Law Firm</p>
              <h3 className="font-bold text-gray-900">Smith & Associates</h3>
            </div>
          </div>

          {/* Overall Satisfaction */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Overall Satisfaction</h4>
            <div className="flex items-center justify-center mb-2">
              {renderStars(firmRating, setFirmRating)}
            </div>
            <p className="text-center text-sm font-bold text-gray-900">
              {getRatingText(firmRating)}
            </p>
          </div>

          {/* Sliders */}
          <div className="mb-6">
            {renderSlider(
              firmTurnaround,
              setFirmTurnaround,
              'Turnaround Time',
              `${firmTurnaround}/5`
            )}
            {renderSlider(firmAccuracy, setFirmAccuracy, 'Document Accuracy', `${firmAccuracy}/5`)}
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Written Review</label>
            <textarea
              value={firmReview}
              onChange={(e) => setFirmReview(e.target.value)}
              placeholder="What did the firm do well?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              rows={4}
            />
          </div>
        </div>

        {/* ASSIGNED LAWYER Rating */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200"
                alt="Jane Doe"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Assigned Lawyer</p>
              <h3 className="font-bold text-gray-900">Jane Doe</h3>
            </div>
          </div>

          {/* Lawyer Performance */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Lawyer Performance</h4>
            <div className="flex items-center justify-center mb-2">
              {renderStars(lawyerRating, setLawyerRating)}
            </div>
            <p className="text-center text-sm font-bold text-blue-600">
              {getRatingText(lawyerRating)}
            </p>
          </div>

          {/* Slider */}
          <div className="mb-6">
            {renderSlider(
              lawyerCommunication,
              setLawyerCommunication,
              'Communication',
              `${lawyerCommunication}/5`
            )}
          </div>

          {/* Yes/No Question */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-3">Adhered to standard format?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setAdheresFormat(true)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  adheresFormat === true
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setAdheresFormat(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  adheresFormat === false
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Written Review</label>
            <textarea
              value={lawyerReview}
              onChange={(e) => setLawyerReview(e.target.value)}
              placeholder="Share details about your interaction..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
          Submit Ratings
        </button>
      </div>
    </div>
  );
}
