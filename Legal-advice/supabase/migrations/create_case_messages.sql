-- Create case_messages table for in-case messaging
CREATE TABLE IF NOT EXISTS case_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'lawyer')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    attachments JSONB DEFAULT '[]'::jsonb,
    read_by JSONB DEFAULT '[]'::jsonb,
    CONSTRAINT valid_message_length CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 5000)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_case_messages_request ON case_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_case_messages_created ON case_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_messages_sender ON case_messages(sender_id);

-- Enable Row Level Security
ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view messages for cases they're involved in
CREATE POLICY "Users can view messages for their cases"
ON case_messages FOR SELECT
USING (
    request_id IN (
        SELECT id FROM legal_requests 
        WHERE client_id = auth.uid() 
        OR assigned_lawyer_id = auth.uid()
    )
);

-- RLS Policy: Users can send messages for cases they're involved in
CREATE POLICY "Users can send messages for their cases"
ON case_messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND request_id IN (
        SELECT id FROM legal_requests 
        WHERE client_id = auth.uid() 
        OR assigned_lawyer_id = auth.uid()
    )
);

-- RLS Policy: Users can update their own messages (for read receipts)
CREATE POLICY "Users can update their own messages"
ON case_messages FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Add comment for documentation
COMMENT ON TABLE case_messages IS 'In-case messaging between clients and lawyers';
COMMENT ON COLUMN case_messages.sender_role IS 'Role of the message sender: client or lawyer';
COMMENT ON COLUMN case_messages.attachments IS 'Array of attachment objects {name, url, type, size}';
COMMENT ON COLUMN case_messages.read_by IS 'Array of user IDs who have read the message';

-- Verify creation
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'case_messages';
