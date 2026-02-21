'use client';

import { useMemo, useState } from 'react';
import { Bell, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { markAllNotificationsRead, markNotificationRead, markNotificationUnread } from '@/app/actions/requests';
import NotificationItem from './NotificationItem';
import type { NotificationRecord, NotificationRole } from './types';

const PAGE_SIZE = 20;

export default function NotificationsPageContent({
  initialNotifications,
  role,
  userId,
}: {
  initialNotifications: NotificationRecord[];
  role: NotificationRole;
  userId: string;
}) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialNotifications.length === PAGE_SIZE);
    const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((notification) => !notification.is_read);
    }
    return notifications;
  }, [activeTab, notifications]);

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    await markAllNotificationsRead();
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    await markNotificationRead(id);
  };

  const handleToggleRead = async (id: string, nextRead: boolean) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: nextRead } : item)));
    if (nextRead) {
      await markNotificationRead(id);
    } else {
      await markNotificationUnread(id);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const from = notifications.length;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = (await __getSupabaseClient()).from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && Array.isArray(data)) {
      setNotifications((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
  };

  return (
    <div className="flex flex-col flex-1 p-6 sm:p-8 gap-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600 mt-1">Stay updated on your cases and messages</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'unread'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Unread
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Bell className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No notifications</h3>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === 'unread'
              ? 'You have no unread notifications.'
              : 'You are all caught up.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              role={role}
              variant="page"
              onMarkRead={handleMarkRead}
              onToggleRead={handleToggleRead}
            />
          ))}
        </div>
      )}

      {
  hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          className="mx-auto inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {
  loadingMore ? 'Loading' : 'Load more'}
        </button>
      )}
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
