'use client';

import { AlertTriangle, Flag, Gavel, FileWarning, DollarSign, Clock, X } from 'lucide-react';
import { EnhancedLegalRequest, RiskFlag } from '@/lib/types';
import { getRiskFlagDisplay } from '@/lib/lawyer-utils';
import { useState } from 'react';

interface LegalContextSectionProps {
  caseData: EnhancedLegalRequest;
  onToggleRiskFlag: (flag: RiskFlag, add: boolean) => Promise<void>;
}

const AVAILABLE_RISK_FLAGS: RiskFlag[] = [
  'pending_litigation',
  'missing_documents',
  'high_value_transaction',
  'time_sensitive',
];

export default function LegalContextSection({
  caseData,
  onToggleRiskFlag,
}: LegalContextSectionProps) {
  const [isAddingFlag, setIsAddingFlag] = useState(false);
  const [isTogglingFlag, setIsTogglingFlag] = useState<string | null>(null);

  const activeRiskFlags = caseData.risk_flags || [];

  const handleToggleFlag = async (flag: RiskFlag, add: boolean) => {
    setIsTogglingFlag(flag);
    try {
      await onToggleRiskFlag(flag, add);
    } finally {
      setIsTogglingFlag(null);
      setIsAddingFlag(false);
    }
  };

  const getRiskFlagIcon = (flag: string) => {
    switch (flag) {
      case 'pending_litigation':
        return Gavel;
      case 'missing_documents':
        return FileWarning;
      case 'high_value_transaction':
        return DollarSign;
      case 'time_sensitive':
        return Clock;
      default:
        return Flag;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900">Legal Context \u0026 Risk Indicators</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Legal Scope Summary */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Legal Scope</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Opinion Type</p>
              <p className="text-sm font-medium text-slate-900">
                {caseData.legal_opinion_type || 'Title Verification'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Opinion Standard</p>
              <p className="text-sm font-medium text-slate-900 capitalize">
                {caseData.opinion_standard || 'Preliminary'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Jurisdiction</p>
              <p className="text-sm font-medium text-slate-900">
                {caseData.jurisdiction || 'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Governing Law</p>
              <p className="text-sm font-medium text-slate-900">
                {caseData.governing_law || 'Indian Law'}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Flags */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Risk Flags
            </h3>
            <button
              onClick={() => setIsAddingFlag(!isAddingFlag)}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {isAddingFlag ? 'Cancel' : '+ Add Flag'}
            </button>
          </div>

          {/* Active Risk Flags */}
          {
  activeRiskFlags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {activeRiskFlags.map((flag) => {
                const flagData = getRiskFlagDisplay(flag);
                const Icon = getRiskFlagIcon(flag);

                return (
                  <div
                    key={flag}
                    className={`
                                            inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium
                                            ${
                                              flagData.color === 'red'
                                                ? 'bg-red-100 text-red-700'
                                                : flagData.color === 'orange'
                                                  ? 'bg-orange-100 text-orange-700'
                                                  : flagData.color === 'purple'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : flagData.color === 'blue'
                                                      ? 'bg-blue-100 text-blue-700'
                                                      : 'bg-gray-100 text-gray-700'
                                            }
                                        `}
                  >
                    <Icon className="size-3.5" />
                    {flagData.label}
                    <button
                      onClick={() => handleToggleFlag(flag as RiskFlag, false)}
                      disabled={isTogglingFlag === flag}
                      className="hover:bg-black/10 rounded-full p-0.5 transition-colors disabled:opacity-50"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic mb-3">No risk flags set</p>
          )}

          {/* Add Flag Dropdown */}
          {
  isAddingFlag && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <p className="text-xs font-medium text-slate-600 mb-2">Select a risk flag to add:</p>
              <div className="space-y-1">
                {AVAILABLE_RISK_FLAGS.filter((flag) => !activeRiskFlags.includes(flag)).map(
                  (flag) => {
                    const flagData = getRiskFlagDisplay(flag);
                    const Icon = getRiskFlagIcon(flag);

                    return (
                      <button
                        key={flag}
                        onClick={() => handleToggleFlag(flag, true)}
                        disabled={isTogglingFlag !== null}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Icon className="size-4 text-slate-600" />
                        {flagData.label}
                      </button>
                    );
                  }
                )}
                {AVAILABLE_RISK_FLAGS.every((flag) => activeRiskFlags.includes(flag)) && (
                  <p className="text-xs text-slate-500 italic py-2">All risk flags already added</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
