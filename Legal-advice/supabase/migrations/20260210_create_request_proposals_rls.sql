-- =====================================================
-- Request Proposals - Row Level Security Policies
-- =====================================================
-- This file defines RLS policies for the request_proposals table
-- Run after: 20260210_create_request_proposals.sql
-- =====================================================

-- Enable RLS on request_proposals table
ALTER TABLE request_proposals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- LAWYER POLICIES
-- =====================================================

-- Policy 1: Lawyers can view their own proposals
CREATE POLICY "lawyers_view_own_proposals" 
ON request_proposals
FOR SELECT 
USING (
    auth.uid() = lawyer_id
);

-- Policy 2: Lawyers can create proposals for public requests
CREATE POLICY "lawyers_create_proposals" 
ON request_proposals
FOR INSERT 
WITH CHECK (
    auth.uid() = lawyer_id
    AND EXISTS (
        SELECT 1 FROM legal_requests
        WHERE id = request_id
        AND visibility = 'public'
        AND status IN ('submitted', 'assigned')
        AND (proposal_deadline IS NULL OR proposal_deadline > NOW())
    )
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'lawyer'
    )
);

-- Policy 3: Lawyers can update their own pending/shortlisted proposals
CREATE POLICY "lawyers_update_own_proposals" 
ON request_proposals
FOR UPDATE 
USING (
    auth.uid() = lawyer_id
    AND status IN ('submitted', 'shortlisted')
)
WITH CHECK (
    auth.uid() = lawyer_id
    AND status IN ('submitted', 'shortlisted', 'withdrawn')
);

-- =====================================================
-- CLIENT POLICIES
-- =====================================================

-- Policy 4: Clients can view all proposals for their requests
CREATE POLICY "clients_view_request_proposals" 
ON request_proposals
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM legal_requests
        WHERE id = request_proposals.request_id
        AND client_id = auth.uid()
    )
);

-- Policy 5: Clients can update proposal status (shortlist, accept, reject)
CREATE POLICY "clients_update_proposal_status" 
ON request_proposals
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM legal_requests
        WHERE id = request_proposals.request_id
        AND client_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM legal_requests
        WHERE id = request_proposals.request_id
        AND client_id = auth.uid()
    )
);

-- =====================================================
-- ADMIN POLICIES
-- =====================================================

-- Policy 6: Admins can view all proposals
CREATE POLICY "admins_view_all_proposals" 
ON request_proposals
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Policy 7: Admins can update any proposal (for moderation)
CREATE POLICY "admins_update_proposals" 
ON request_proposals
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- =====================================================
-- VISIBILITY POLICIES FOR LEGAL_REQUESTS
-- =====================================================

-- Update existing policies to respect visibility
-- Drop and recreate the client select policy
DROP POLICY IF EXISTS "clients_view_own_requests" ON legal_requests;

CREATE POLICY "clients_view_own_requests" 
ON legal_requests
FOR SELECT 
USING (
    client_id = auth.uid()
);

-- Drop and recreate lawyer select policy to include public requests
DROP POLICY IF EXISTS "lawyers_view_assigned_requests" ON legal_requests;

CREATE POLICY "lawyers_view_requests" 
ON legal_requests
FOR SELECT 
USING (
    assigned_lawyer_id = auth.uid()
    OR assigned_firm_id = auth.uid()
    OR (
        visibility = 'public'
        AND status IN ('submitted', 'assigned')
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'lawyer'
        )
    )
);

-- =====================================================
-- HELPER FUNCTION: GET PROPOSAL COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION get_proposal_count(p_request_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM request_proposals
        WHERE request_id = p_request_id
        AND status NOT IN ('withdrawn')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "lawyers_view_own_proposals" ON request_proposals IS 
'Lawyers can only see their own proposals, not other lawyers proposals';

COMMENT ON POLICY "clients_view_request_proposals" ON request_proposals IS 
'Clients can see all proposals submitted for their requests';

COMMENT ON POLICY "lawyers_create_proposals" ON request_proposals IS 
'Lawyers can submit proposals only for public requests that are accepting proposals';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Request Proposals RLS policies created successfully!';
  RAISE NOTICE '🔒 Lawyers can only view their own proposals';
  RAISE NOTICE '🔒 Clients can view all proposals for their requests';
  RAISE NOTICE '🔒 Admins have full access for moderation';
  RAISE NOTICE '✨ Marketplace is now secure and ready!';
END $$;
