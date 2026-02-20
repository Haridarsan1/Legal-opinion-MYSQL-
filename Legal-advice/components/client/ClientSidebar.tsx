'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Scale,
  LayoutDashboard,
  Users,
  Building,
  FileText,
  FolderOpen,
  MessageCircle,
  Settings,
  LogOut,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import type { Profile } from '@/lib/types';
import { logout } from '@/app/actions/auth';
import AccountSwitcher from '@/components/shared/AccountSwitcher';

interface ClientSidebarProps {
  user: Profile;
}

const menuItems = [
  { label: 'Dashboard', href: '/client', icon: LayoutDashboard },
  { label: 'Find Lawyers', href: '/client/lawyers', icon: Users },
  { label: 'Legal Departments', href: '/client/departments', icon: Building },
  { label: 'New Request', href: '/client/new-request', icon: FileText },
  { label: 'Track Status', href: '/client/track', icon: FolderOpen },
  { label: 'Messages', href: '/client/messages', icon: MessageCircle },
];

export default function ClientSidebar({ user }: ClientSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
      <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-md object-cover" />
          <h1 className="text-[#111827] text-lg font-bold">Legal Opinion</h1>
        </div>

        {/* Menu Label */}
        <div className="px-6 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">MENU</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/client' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-[#003366] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-4">
          <Link
            href="/client/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              pathname === '/client/settings'
                ? 'bg-[#003366] text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </Link>
        </div>

        {/* User Profile with Dropdown */}
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 relative" ref={dropdownRef}>
          {/* Dropdown Menu */}
          {
  isDropdownOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <button
                onClick={handleSwitchAccount}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Switch Account</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}

          {/* Profile Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(user.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#111827] truncate">
                {user.full_name || 'Client User'}
              </p>
              <p className="text-xs text-gray-500 truncate">Client Account</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
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
