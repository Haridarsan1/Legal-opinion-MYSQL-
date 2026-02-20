export type NotificationRecord = {
  id: string;
  user_id?: string;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  related_request_id?: string | null;
  link?: string | null;
  is_read: boolean;
  created_at: string;
};

export type NotificationRole = 'client' | 'lawyer';
