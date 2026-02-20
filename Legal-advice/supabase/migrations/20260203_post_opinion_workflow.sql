-- Migration: Post-Opinion Workflow
-- Date: 2026-02-03
-- Description: Adds database support for client acknowledgement, post-opinion queries, and case closure.

-- 1. Add new status values to request_status enum
DO $$ BEGIN
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'client_acknowledged';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'case_closed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create post_opinion_queries table
CREATE TABLE IF NOT EXISTS post_opinion_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    raised_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    response_text TEXT,
    responded_by UUID REFERENCES profiles(id),
    responded_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('open', 'resolved')) DEFAULT 'open'
);

-- 3. Enable RLS
ALTER TABLE post_opinion_queries ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for post_opinion_queries

-- Policy: Clients can view their own queries
CREATE POLICY "Clients can view their own queries" ON post_opinion_queries
    FOR SELECT
    USING (
        raised_by = auth.uid()
    );

-- Policy: Lawyers can view queries for cases they are assigned to
CREATE POLICY "Lawyers can view queries for assigned cases" ON post_opinion_queries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM legal_requests
            WHERE legal_requests.id = post_opinion_queries.request_id
            AND legal_requests.assigned_lawyer_id = auth.uid()
        )
    );

-- Policy: Clients can insert queries for their own requests (only if permitted by logic, but DB policy effectively allows if they own the request)
-- A tighter check would be to ensure they are the client of the linked request.
CREATE POLICY "Clients can create queries for their cases" ON post_opinion_queries
    FOR INSERT
    WITH CHECK (
        auth.uid() = raised_by AND
        EXISTS (
            SELECT 1 FROM legal_requests
            WHERE legal_requests.id = post_opinion_queries.request_id
            AND legal_requests.client_id = auth.uid()
        )
    );

-- Policy: Lawyers can update (respond to) queries for assigned cases
CREATE POLICY "Lawyers can respond to queries" ON post_opinion_queries
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM legal_requests
            WHERE legal_requests.id = post_opinion_queries.request_id
            AND legal_requests.assigned_lawyer_id = auth.uid()
        )
    );

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_opinion_queries_request_id ON post_opinion_queries(request_id);
CREATE INDEX IF NOT EXISTS idx_post_opinion_queries_status ON post_opinion_queries(status);

-- Comments
COMMENT ON TABLE post_opinion_queries IS 'Stores follow-up queries raised by clients after legal opinion delivery';
COMMENT ON COLUMN post_opinion_queries.status IS 'Status of the query: "open" or "resolved"';
