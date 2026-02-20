-- Fix RLS policy for document verification
-- Allow lawyers to update verification fields on documents

-- Drop existing UPDATE policies for documents
DROP POLICY IF EXISTS "Lawyers can update documents for their cases" ON documents;
DROP POLICY IF EXISTS "Lawyers can update verification and review fields" ON documents;

-- Create comprehensive UPDATE policy for lawyers
CREATE POLICY "Lawyers can update verification and review fields" ON documents
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM legal_requests lr
        JOIN profiles p ON p.id = auth.uid()
        WHERE lr.id = documents.request_id
        AND p.user_role = 'lawyer'
        AND (
            lr.assigned_lawyer_id = auth.uid()
            OR lr.second_opinion_lawyer_id = auth.uid()  
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM legal_requests lr
        JOIN profiles p ON p.id = auth.uid()
        WHERE lr.id = documents.request_id
        AND p.user_role = 'lawyer'
        AND (
            lr.assigned_lawyer_id = auth.uid()
            OR lr.second_opinion_lawyer_id = auth.uid()
        )
    )
);
