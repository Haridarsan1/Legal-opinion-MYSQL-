'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';type RealtimeChannel = any; // Supabase-free stub type

const supabase = createClient();

/**
 * Hook to fetch request updates via polling (replaces Supabase realtime).
 */
export function useRequestUpdates(requestId: string | null) {
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);useEffect(() => {
    if (!requestId) { setLoading(false); return; }

    const fetchData = async () => {
      const { data } = (await __getSupabaseClient()).from('legal_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (data) setRequest(data);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [requestId]);

  return { request, loading };
}

/**
 * Hook to fetch notifications via polling.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = (await __getSupabaseClient()).auth.getUser();
      const user = userData?.user;
      if (!user) { setLoading(false); return; }

      const { data } = (await __getSupabaseClient()).from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as any[]);
        setUnreadCount((data as any[]).filter((n: any) => !n.is_read).length);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  return { notifications, unreadCount, loading };
}

/**
 * Hook to fetch requests assigned to a lawyer/firm.
 */
export function useAssignedRequests(userId: string | null) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const fetchData = async () => {
      const { data } = (await __getSupabaseClient()).from('legal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const filtered = (data as any[]).filter(
          (r: any) => r.assigned_lawyer_id === userId || r.assigned_firm_id === userId
        );
        setRequests(filtered);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  return { requests, loading };
}

/**
 * Hook to fetch documents for a request.
 */
export function useDocuments(requestId: string | null) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);useEffect(() => {
    if (!requestId) { setLoading(false); return; }

    const fetchData = async () => {
      const { data } = (await __getSupabaseClient()).from('documents')
        .select('*')
        .eq('request_id', requestId)
        .order('uploaded_at', { ascending: false });

      if (data) setDocuments(data as any[]);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [requestId]);

  return { documents, loading };
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
