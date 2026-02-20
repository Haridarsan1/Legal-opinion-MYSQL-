-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Case participants can view document requests" ON document_requests;
DROP POLICY IF EXISTS "Lawyers can create document requests" ON document_requests;
DROP POLICY IF EXISTS "View document requests" ON document_requests;
DROP POLICY IF EXISTS "Create document requests" ON document_requests;

-- Improved SELECT policy:
-- 1. Creator can always view
-- 2. Participants in the linked legal_request can view
CREATE POLICY "View document requests" ON document_requests
    FOR SELECT
    TO authenticated
    USING (
        -- Creator can always view
        requested_by = auth.uid()
        OR
        -- Link to legal_request
        EXISTS (
            SELECT 1 FROM legal_requests lr
            WHERE lr.id = request_id
            AND (
                lr.client_id = auth.uid() OR
                lr.assigned_lawyer_id = auth.uid() OR
                lr.assigned_firm_id IN (
                    SELECT firm_id FROM profiles WHERE id = auth.uid() AND role IN ('lawyer', 'firm', 'admin')
                )
            )
        )
    );

-- Improved INSERT policy
CREATE POLICY "Create document requests" ON document_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Must be the one requesting
        requested_by = auth.uid()
        AND
        -- Must have access to the legal_request as lawyer/admin/firm
        EXISTS (
            SELECT 1 FROM legal_requests lr
            WHERE lr.id = request_id
            AND (
                lr.assigned_lawyer_id = auth.uid() OR
                lr.assigned_firm_id IN (
                    SELECT firm_id FROM profiles WHERE id = auth.uid() AND role IN ('lawyer', 'firm', 'admin')
                )
            )
        )
    );

-- Ensure authenticated role has permissions
GRANT ALL ON document_requests TO authenticated;
