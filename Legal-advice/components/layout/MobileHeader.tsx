'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export default function MobileHeader({ onMenuToggle, isSidebarOpen }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-slate-700" />
          ) : (
            <Menu className="w-6 h-6 text-slate-700" />
          )}
        </button>
        <h1 className="text-lg font-bold text-slate-900">Legal Portal</h1>
      </div>
    </header>
  );
}
