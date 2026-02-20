-- Create document_requests table
CREATE TABLE IF NOT EXISTS document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requested_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add document_request_id to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS document_request_id UUID REFERENCES document_requests(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Lawyers/Admins can create requests
CREATE POLICY "Lawyers can create document requests" ON document_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM legal_requests lr
            LEFT JOIN profiles p ON p.id = auth.uid()
            WHERE lr.id = request_id
            AND (
                lr.assigned_lawyer_id = auth.uid() OR
                p.role IN ('lawyer', 'admin', 'firm_admin')
            )
        )
    );

-- Everyone involved in the case can view requests
CREATE POLICY "Case participants can view document requests" ON document_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM legal_requests lr
            WHERE lr.id = request_id
            AND (
                lr.client_id = auth.uid() OR
                lr.assigned_lawyer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('admin', 'firm_admin')
                )
            )
        )
    );

-- Clients can update status implicitly by uploading (handled via triggers or checks?)
-- Actually status update logic might be in application code.
-- Allow updates if you are the creator or authorized
CREATE POLICY "Lawyers can update own requests" ON document_requests
    FOR UPDATE
    TO authenticated
    USING (requested_by = auth.uid());
