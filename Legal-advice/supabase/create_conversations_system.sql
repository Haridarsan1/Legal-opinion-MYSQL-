-- =====================================================
-- Legal Opinion Portal - Enhanced Messaging System
-- =====================================================
-- Creates standalone conversations and messages tables
-- for client-lawyer communication
-- =====================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    participant_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    request_id UUID REFERENCES legal_requests(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
    CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id, request_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_request ON conversations(request_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at ASC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read) WHERE read = FALSE;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

CREATE POLICY "Users can update their conversations"
    ON conversations FOR UPDATE
    USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    )
    WITH CHECK (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- Messages Policies
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = messages.conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM conversations
            WHERE id = messages.conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their received messages"
    ON messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = messages.conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = messages.conversation_id
            AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

-- =====================================================
-- Realtime Subscriptions
-- =====================================================

-- Enable realtime for instant message delivery
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to automatically update conversation's updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW(),
        last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when a message is created
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_user1_id UUID,
    p_user2_id UUID,
    p_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_participant_1 UUID;
    v_participant_2 UUID;
BEGIN
    -- Ensure consistent ordering of participants
    IF p_user1_id < p_user2_id THEN
        v_participant_1 := p_user1_id;
        v_participant_2 := p_user2_id;
    ELSE
        v_participant_1 := p_user2_id;
        v_participant_2 := p_user1_id;
    END IF;

    -- Try to find existing conversation
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE participant_1_id = v_participant_1
      AND participant_2_id = v_participant_2
      AND (request_id = p_request_id OR (request_id IS NULL AND p_request_id IS NULL))
    LIMIT 1;

    -- If not found, create new conversation
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (participant_1_id, participant_2_id, request_id)
        VALUES (v_participant_1, v_participant_2, p_request_id)
        RETURNING id INTO v_conversation_id;
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE (c.participant_1_id = user_id OR c.participant_2_id = user_id)
          AND m.sender_id != user_id
          AND m.read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE conversations IS 'Conversations between two users (client-lawyer, client-firm, etc.)';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN conversations.participant_1_id IS 'First participant (ordered by UUID)';
COMMENT ON COLUMN conversations.participant_2_id IS 'Second participant (ordered by UUID)';
COMMENT ON COLUMN conversations.request_id IS 'Optional associated legal request';
COMMENT ON COLUMN messages.attachments IS 'Optional JSON array of file attachments';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Messaging system created successfully!';
    RAISE NOTICE '💬 Created tables: conversations, messages';
    RAISE NOTICE '🔒 Added RLS policies for message privacy';
    RAISE NOTICE '⚡ Enabled realtime subscriptions';
    RAISE NOTICE '🔧 Created helper functions for conversation management';
END $$;
