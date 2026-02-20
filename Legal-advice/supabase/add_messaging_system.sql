-- =====================================================
-- Legal Opinion Portal - Private Messaging System
-- =====================================================
-- This migration adds private messaging between clients and lawyers
-- =====================================================

-- Create request_messages table
CREATE TABLE IF NOT EXISTS request_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  attachments JSONB DEFAULT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_request_messages_request_id ON request_messages(request_id);
CREATE INDEX idx_request_messages_sender_id ON request_messages(sender_id);
CREATE INDEX idx_request_messages_recipient_id ON request_messages(recipient_id);
CREATE INDEX idx_request_messages_created_at ON request_messages(created_at DESC);
CREATE INDEX idx_request_messages_unread ON request_messages(recipient_id, is_read) WHERE is_read = false;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Enable RLS
ALTER TABLE request_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages where they are sender or recipient
CREATE POLICY "Users can view their own messages"
  ON request_messages FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Policy: Users can send messages if they are part of the request
-- (either client or assigned lawyer)
CREATE POLICY "Users can send messages for their requests"
  ON request_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND (
      -- Sender is the client
      EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = request_id
        AND lr.client_id = auth.uid()
      )
      OR
      -- Sender is the assigned lawyer
      EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = request_id
        AND lr.assigned_lawyer_id = auth.uid()
      )
    )
    AND
    -- Recipient must be the other party (client or lawyer)
    (
      -- If sender is client, recipient must be assigned lawyer
      EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = request_id
        AND lr.client_id = auth.uid()
        AND lr.assigned_lawyer_id = recipient_id
      )
      OR
      -- If sender is lawyer, recipient must be client
      EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = request_id
        AND lr.assigned_lawyer_id = auth.uid()
        AND lr.client_id = recipient_id
      )
    )
  );

-- Policy: Users can mark their own messages as read
CREATE POLICY "Users can update their received messages"
  ON request_messages FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- =====================================================
-- Realtime Subscriptions
-- =====================================================

-- Enable realtime for instant message delivery
ALTER PUBLICATION supabase_realtime ADD TABLE request_messages;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM request_messages
    WHERE recipient_id = user_id
    AND is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE request_messages IS 'Private messages between clients and assigned lawyers for specific requests';
COMMENT ON COLUMN request_messages.request_id IS 'The legal request this message belongs to';
COMMENT ON COLUMN request_messages.sender_id IS 'User who sent the message';
COMMENT ON COLUMN request_messages.recipient_id IS 'User who will receive the message';
COMMENT ON COLUMN request_messages.attachments IS 'Optional JSON array of file attachments';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Messaging system created successfully!';
  RAISE NOTICE '📧 Created table: request_messages';
  RAISE NOTICE '🔒 Added RLS policies for message privacy';
  RAISE NOTICE '⚡ Enabled realtime subscriptions for instant messaging';
END $$;
