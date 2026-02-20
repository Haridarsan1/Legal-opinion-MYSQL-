'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, Bell } from 'lucide-react';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '@/app/actions/requests';
import SkeletonLine from '@/components/shared/skeletons/SkeletonLine';
import SkeletonBlock from '@/components/shared/skeletons/SkeletonBlock';
import NotificationItem from './NotificationItem';
import type { NotificationRecord, NotificationRole } from './types';

function resolveRole(pathname: string): NotificationRole {
  if (pathname.startsWith('/lawyer')) return 'lawyer';
  return 'client';
}

function resolveViewAllHref(role: NotificationRole) {
  return role === 'lawyer' ? '/lawyer/notifications' : '/client/notifications';
}

export default function NotificationDropdown() {
  const pathname = usePathname();
  const role = useMemo(() => resolveRole(pathname), [pathname]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = items.filter((item) => !item.is_read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listNotifications({ limit: 50 });
      if (!res?.success) {
        setError(res?.error || 'Failed to load notifications');
        return;
      }
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!open) return;
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    await markAllNotificationsRead();
  };

  const handleMarkRead = async (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    await markNotificationRead(id);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center size-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <Bell className="size-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-sky-600 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-[380px] origin-top-right transition-all duration-200 ease-out ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        }`}
      >
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-0.5">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <SkeletonBlock widthClass="w-9" heightClass="h-9" roundedClass="rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <SkeletonLine widthClass="w-40" />
                      <SkeletonLine />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-6 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-900">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  We will let you know when something arrives.
                </p>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <NotificationItem
                    key={item.id}
                    notification={item}
                    role={role}
                    onMarkRead={handleMarkRead}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3 text-sm">
            <Link
              href={resolveViewAllHref(role)}
              onClick={() => setOpen(false)}
              className="text-slate-600 hover:text-slate-900 font-semibold"
            >
              View all notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
