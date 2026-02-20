'use client';

import { useEffect, useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import LawyerDirectory, { DirectoryLawyer } from '@/components/lawyer/LawyerDirectory';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lawyer: DirectoryLawyer) => void;
  lawyers: DirectoryLawyer[];
  selectedId?: string;
}

export default function LawyerSelectionModal({
  isOpen,
  onClose,
  onSelect,
  lawyers,
  selectedId,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            title="Close"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Lawyer</h2>
            <p className="text-sm text-slate-500 hidden sm:block">
              Choose the best expert for your case
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-80px)]">
        <LawyerDirectory
          lawyers={lawyers.map((l) => ({
            // Ensure required fields are present or mapped, though they likely match
            ...l,
            availability_status: l.availability_status || 'Available', // Default if missing
            title: l.title || 'Legal Expert',
          }))}
          selectedId={selectedId}
          onSelect={(lawyer) => {
            onSelect(lawyer);
            onClose();
          }}
          mode="select"
          className="h-full"
        />
      </div>
    </div>
  );
}
