'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to subscribe to realtime updates for a specific request
 */
export function useRequestUpdates(requestId: string | null) {
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Fetch initial data
      const { data } = await supabase
        .from('legal_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (data) {
        setRequest(data);
      }
      setLoading(false);

      // Subscribe to realtime updates
      channel = supabase
        .channel(`request-${requestId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'legal_requests',
            filter: `id=eq.${requestId}`,
          },
          (payload) => {
            setRequest(payload.new);
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [requestId, supabase]);

  return { request, loading };
}

/**
 * Hook to subscribe to new notifications for current user
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch initial notifications
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
      setLoading(false);

      // Subscribe to new notifications
      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
            if (payload.new.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  return { notifications, unreadCount, loading };
}

/**
 * Hook to subscribe to requests for lawyers/firms
 */
export function useAssignedRequests(userId: string | null) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Fetch initial data
      const { data } = await supabase
        .from('legal_requests')
        .select('*')
        .or(`assigned_lawyer_id.eq.${userId},assigned_firm_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (data) {
        setRequests(data);
      }
      setLoading(false);

      // Subscribe to new assignments
      channel = supabase
        .channel(`assigned-requests-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'legal_requests',
          },
          (payload) => {
            const newData = payload.new as any;
            // Check if this request is assigned to current user
            if (newData.assigned_lawyer_id === userId || newData.assigned_firm_id === userId) {
              setRequests((prev) => {
                const exists = prev.find((r) => r.id === newData.id);
                if (exists) {
                  return prev.map((r) => (r.id === newData.id ? newData : r));
                } else {
                  return [newData, ...prev];
                }
              });
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, supabase]);

  return { requests, loading };
}

/**
 * Hook to subscribe to document uploads for a request
 */
export function useDocuments(requestId: string | null) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Fetch initial documents
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('request_id', requestId)
        .order('uploaded_at', { ascending: false });

      if (data) {
        setDocuments(data);
      }
      setLoading(false);

      // Subscribe to new document uploads
      channel = supabase
        .channel(`documents-${requestId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'documents',
            filter: `request_id=eq.${requestId}`,
          },
          (payload) => {
            setDocuments((prev) => [payload.new, ...prev]);
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [requestId, supabase]);

  return { documents, loading };
}
