'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Home,
  Users,
  Building2,
  FileText,
  TrendingUp,
  Bell,
  Star,
  UserCircle,
  Settings,
  Gavel,
  FolderOpen,
  MessageSquare,
  MessageCircle,
  Upload,
  FileCheck,
  Shield,
  BookOpen,
  LogOut,
  RefreshCw,
  ChevronUp,
  X,
  FileStack,
} from 'lucide-react';
import type { UserRole, Profile } from '@/lib/types';
import { logout } from '@/app/actions/auth';
import AccountSwitcher from '@/components/shared/AccountSwitcher';
import { useSidebar } from '@/components/providers/SidebarProvider';

const menuItems: Record<UserRole, Array<{ label: string; href: string; icon: any }>> = {
  // CLIENT: 7 core items - simplified and focused on request workflow
  client: [
    { label: 'Dashboard', href: '/client', icon: Home },
    { label: 'Requests', href: '/client/requests', icon: FileText },
    { label: 'Track Status', href: '/client/track', icon: TrendingUp },
    { label: 'Proposals', href: '/client/proposals', icon: FileStack },
    { label: 'Messages', href: '/client/messages', icon: MessageCircle },
    { label: 'Lawyers', href: '/client/lawyers', icon: Users },
    { label: 'Notifications', href: '/client/notifications', icon: Bell },
    { label: 'Profile', href: '/client/profile', icon: UserCircle },
  ],
  // LAWYER: 7 core items - focused on case management and opinions
  lawyer: [
    { label: 'Dashboard', href: '/lawyer', icon: Home },
    { label: 'Requests', href: '/lawyer/requests', icon: FileText },
    { label: 'Opinions', href: '/lawyer/opinions', icon: FileCheck },
    { label: 'Documents', href: '/lawyer/documents', icon: FolderOpen },
    { label: 'Messages', href: '/lawyer/messages', icon: MessageCircle },
    { label: 'Notifications', href: '/lawyer/notifications', icon: Bell },
    { label: 'Profile', href: '/lawyer/profile', icon: UserCircle },
  ],
  firm: [
    { label: 'Dashboard', href: '/firm', icon: Home },
    { label: 'Requests', href: '/firm/requests', icon: FileText },
    { label: 'Tasks & Assignments', href: '/firm/tasks', icon: FileCheck },
    { label: 'Lawyers / Members', href: '/firm/team', icon: Users },
    { label: 'Legal Opinions', href: '/firm/opinions', icon: Gavel },
    { label: 'Bank Requests', href: '/firm/bank-requests', icon: Building2 },
    { label: 'Firm Services', href: '/firm/services', icon: Settings },
    { label: 'Reports & Logs', href: '/firm/reports', icon: TrendingUp },
    { label: 'Firm Settings', href: '/firm/settings', icon: Settings },
  ],
  bank: [
    { label: 'Dashboard', href: '/bank', icon: Home },
    { label: 'Assign to Firm', href: '/bank/assign', icon: Users },
    { label: 'Select SLA', href: '/bank/sla', icon: Settings },
    { label: 'Track Status', href: '/bank/track', icon: TrendingUp },
    { label: 'Audit Logs', href: '/bank/audit-logs', icon: FolderOpen },
    { label: 'Ratings', href: '/bank/ratings', icon: Star },
    { label: 'Integration', href: '/bank/integration', icon: Settings },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Content', href: '/admin/content', icon: BookOpen },
    { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { label: 'Security Logs', href: '/admin/security-logs', icon: Shield },
    { label: 'Disputes', href: '/admin/disputes', icon: Star },
  ],
  platform_admin: [
    { label: 'Dashboard', href: '/platform_admin', icon: Home },
    { label: 'User Management', href: '/platform_admin/users', icon: Users },
    { label: 'Content Management', href: '/platform_admin/content', icon: BookOpen },
    { label: 'System Analytics', href: '/platform_admin/analytics', icon: TrendingUp },
    { label: 'Dispute Resolution', href: '/platform_admin/disputes', icon: Star },
    { label: 'Security Logs', href: '/platform_admin/security', icon: Shield },
  ],
};

export default function Sidebar({ role, user }: { role: UserRole; user: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = menuItems[role];
  const { isOpen, close } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      {
  isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-[80]" onClick={close} />}

      {/* Sidebar */}
      <aside
        className={`
                fixed lg:static inset-y-0 left-0 z-[90]
                w-64 bg-primary border-r border-primary/10 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
      >
        {/* Logo - Hidden on mobile, shown on desktop */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-primary/10 lg:border-none">
          <div className="size-8 flex items-center justify-center relative rounded-lg overflow-hidden">
            <img src="/logo.jpeg" alt="Logo" className="object-cover w-full h-full" />
          </div>
          <h1 className="text-white text-lg font-bold">Legal Opinion</h1>

          {/* Close button on mobile */}
          <button onClick={close} className="lg:hidden ml-auto text-white/50 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;

            // Dashboard link matches only exactly. Other links match prefix (e.g. /requests matches /requests/123)
            const isDashboard = item.href === `/${role}`;
            const isActive = isDashboard
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  className={`size-5 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile with Dropdown */}
        <div className="p-4 border-t border-white/10 relative" ref={dropdownRef}>
          {/* Dropdown Menu */}
          {
  isDropdownOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <button
                onClick={handleSwitchAccount}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <RefreshCw className="size-4 text-gray-500" />
                <span className="text-sm font-medium">Switch Account</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}

          {/* Profile Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="size-8 rounded-full bg-slate-400 overflow-hidden flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-white text-xs font-bold bg-primary">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user.full_name}</p>
              <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
            </div>
            <ChevronUp
              className={`size-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
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
