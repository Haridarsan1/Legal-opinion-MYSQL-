'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Scale,
  LayoutDashboard,
  FileText,
  FileStack,
  FolderOpen,
  MessageCircle,
  Calendar,
  Settings,
  Bell,
  BarChart3,
  LogOut,
  RefreshCw,
  ChevronDown,
  CheckSquare,
  Search,
  FileCheck,
  Briefcase,
  Bookmark,
  Star,
} from 'lucide-react';
import type { Profile } from '@/lib/types';
import { logout } from '@/app/actions/auth';
import AccountSwitcher from '@/components/shared/AccountSwitcher';
import clsx from 'clsx';
import { hasPermission, type Permission } from '@/lib/permissions';

interface LawyerSidebarProps {
  user: Profile;
}

type MenuItem = {
  label: string;
  href: string;
  icon: any;
  permission?: Permission;
};

const baseItems: MenuItem[] = [
  { label: 'Dashboard', href: '/lawyer', icon: LayoutDashboard },
  { label: 'My Profile', href: '/lawyer/profile', icon: User },
  { label: 'Assigned Requests', href: '/lawyer/assigned', icon: FileText },
  { label: 'Opinions', href: '/lawyer/opinions', icon: FileStack },
  { label: 'Client Reviews', href: '/lawyer/client-reviews', icon: Star },
  { label: 'Reviews & Approvals', href: '/lawyer/reviews', icon: FileCheck, permission: 'review_drafts' },
  { label: 'Messages', href: '/lawyer/messages', icon: MessageCircle },
  { label: 'Notifications', href: '/lawyer/notifications', icon: Bell },
  { label: 'Public Requests', href: '/lawyer/public-requests', icon: Briefcase, permission: 'access_marketplace' },
  { label: 'Saved Requests', href: '/lawyer/saved-requests', icon: Bookmark, permission: 'access_marketplace' },
  { label: 'My Proposals', href: '/lawyer/my-proposals', icon: CheckSquare, permission: 'access_marketplace' },
];

import { useSidebar } from '@/components/providers/SidebarProvider';
import { X, User } from 'lucide-react';

// ... (imports remain the same, just adding X and useSidebar)

export default function LawyerSidebar({ user }: LawyerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = baseItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(user, item.permission);
  });
  const roleLabel =
    user.firm_role === 'senior_lawyer'
      ? 'Senior Counsel'
      : user.firm_role === 'junior_lawyer'
        ? 'Junior Associate'
        : 'Lawyer';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSwitchAccount = () => {
    setIsDropdownOpen(false);
    setIsAccountSwitcherOpen(true);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-[80]" onClick={close} />}

      <aside
        className={`
                fixed lg:static inset-y-0 left-0 z-[90]
                w-64 bg-[#0F172A] text-slate-300 flex flex-col h-full shrink-0
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:transform-none'}
            `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-md object-cover" />
          <h1 className="text-white text-lg font-bold tracking-tight">Legal Opinion</h1>

          {/* Close button on mobile */}
          <button onClick={close} className="lg:hidden ml-auto text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-6 border-b border-slate-800" ref={dropdownRef}>
          {/* ... (User Profile content remains the same) ... */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 p-3 rounded-xl transition-all border border-slate-700/50 group"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 group-hover:border-blue-500 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-600 group-hover:border-blue-500 transition-colors">
                  {user.full_name?.charAt(0) || 'L'}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate">
                  {user.full_name || 'Lawyer'}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">{roleLabel}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="py-1">
                  <button
                    onClick={handleSwitchAccount}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">Switch Account</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/lawyer' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group relative',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                )}
              >
                <Icon
                  className={clsx(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Account Switcher Modal */}
      <AccountSwitcher
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
        currentUserId={user.id}
      />
    </>
  );
}
