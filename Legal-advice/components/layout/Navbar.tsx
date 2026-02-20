'use client';

import type { Profile } from '@/lib/types';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

import { Menu } from 'lucide-react';
import { useSidebar } from '@/components/providers/SidebarProvider';

export default function Navbar({ user }: { user: Profile }) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-slate-200 px-4 lg:px-8 py-3 lg:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex flex-col gap-0.5 lg:gap-1">
            <h2 className="text-slate-900 text-lg lg:text-xl font-bold leading-tight tracking-tight">
              Welcome back, {user.full_name.split(' ')[0]}
            </h2>
            <p className="text-slate-500 text-xs lg:text-sm font-medium hidden sm:block">
              Here's what's happening with your legal matters today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search - Optional for now */}
          <div className="relative hidden md:flex items-center min-w-[320px]">
            <span className="absolute left-3 text-slate-400 material-symbols-outlined">search</span>
            <input
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              placeholder="Search cases, lawyers..."
              type="text"
            />
          </div>

          {/* Notification Bell */}
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
