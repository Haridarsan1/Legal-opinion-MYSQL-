'use client';

import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

interface MarketInsightsPanelProps {
  stats: {
    total_proposals: number;
    average_fee: number | null;
    lowest_fee: number | null;
    highest_fee: number | null;
    average_timeline: number | null;
  };
  className?: string;
}

export default function MarketInsightsPanel({ stats, className = '' }: MarketInsightsPanelProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDays = (days: number | null) => {
    if (days === null) return 'N/A';
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  if (stats.total_proposals === 0) {
    return (
      <div className={`bg-slate-50 border border-slate-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Market Insights</h3>
        </div>
        <p className="text-sm text-slate-500">No proposals yet. Be the first to submit!</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-800">Market Insights</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Proposals */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-slate-600 font-medium">Total Bids</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{stats.total_proposals}</p>
        </div>

        {/* Average Timeline */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs text-slate-600 font-medium">Avg. Time</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{formatDays(stats.average_timeline)}</p>
        </div>

        {/* Average Fee */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-slate-600 font-medium">Avg. Fee</span>
          </div>
          <p className="text-base font-bold text-slate-800">{formatCurrency(stats.average_fee)}</p>
        </div>

        {/* Lowest Fee */}
        <div className="bg-white/80 backdrop-blur rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs text-slate-600 font-medium">Lowest Fee</span>
          </div>
          <p className="text-base font-bold text-slate-800">{formatCurrency(stats.lowest_fee)}</p>
        </div>
      </div>

      {/* Fee Range (if available) */}
      {
  stats.lowest_fee !== null &&
        stats.highest_fee !== null &&
        stats.lowest_fee !== stats.highest_fee && (
          <div className="mt-3 pt-3 border-t border-blue-200/50">
            <p className="text-xs text-slate-600">
              Fee Range:{' '}
              <span className="font-semibold text-slate-700">
                {formatCurrency(stats.lowest_fee)}
              </span>{' '}
              –{' '}
              <span className="font-semibold text-slate-700">
                {formatCurrency(stats.highest_fee)}
              </span>
            </p>
          </div>
        )}
    </div>
  );
}
