'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, UserCircle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface Props {
  caseId: string;
  title: string;
  department: any;
  lawyer: any;
  status: string;
  submittedAt: string;
  isAccepted: boolean;
  acceptedAt?: string;
}

export default function OpinionHeader({
  caseId,
  title,
  department,
  lawyer,
  status,
  submittedAt,
  isAccepted,
  acceptedAt,
}: Props) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getStatusConfig = () => {
    if (isAccepted) {
      return {
        label: 'Accepted',
        color: 'bg-green-100 text-green-700 border-green-200',
      };
    }
    if (status === 'opinion_ready') {
      return {
        label: 'Ready for Review',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
      };
    }
    return {
      label: 'Completed',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <header
      className={`sticky top-0 z-40 bg-white border-b border-slate-200 transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Case Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{caseId}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 line-clamp-1">
                  {title}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 ml-13">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{department?.name || 'N/A'}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Submitted {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Lawyer Info */}
          {
  lawyer && (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
              {lawyer.avatar_url ? (
                <Image
                  src={lawyer.avatar_url}
                  alt={lawyer.full_name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-purple-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">{lawyer.full_name}</p>
                <p className="text-xs text-slate-500">{lawyer.specialization || 'Legal Advisor'}</p>
              </div>
            </div>
          )}

          {/* Right: Status Badge */}
          <div className="flex flex-col items-end gap-2">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border-2 ${statusConfig.color}`}
            >
              {isAccepted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {
  statusConfig.label}
            </div>
            {isAccepted && acceptedAt && (
              <p className="text-xs text-slate-500">
                Accepted {formatDistanceToNow(new Date(acceptedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
