-- ========================================
-- MANUAL FIX FOR DOCUMENT VERIFICATION AND COMMENTS
-- Run this entire file in your Supabase SQL Editor
-- ========================================

-- ========================================
-- PART 1: Fix Document Verification RLS Policy
-- ========================================

-- Drop existing UPDATE policies for documents
DROP POLICY IF EXISTS "Lawyers can update documents for their cases" ON documents;
DROP POLICY IF EXISTS "Lawyers can update verification and review fields" ON documents;

-- Create UPDATE policy for lawyers to verify documents
CREATE POLICY "Lawyers can update verification and review fields" ON documents
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM legal_requests lr
        JOIN profiles p ON p.id = auth.uid()
        WHERE lr.id = documents.request_id
        AND p.role = 'lawyer'
        AND lr.assigned_lawyer_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM legal_requests lr
        JOIN profiles p ON p.id = auth.uid()
        WHERE lr.id = documents.request_id
        AND p.role = 'lawyer'
        AND lr.assigned_lawyer_id = auth.uid()
    )
);

-- ========================================
-- PART 2: Create Document Comments Table
-- ========================================

-- Create document_comments table for document-specific discussions
CREATE TABLE IF NOT EXISTS document_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_comments_document ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_request ON document_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_user ON document_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_created ON document_comments(created_at DESC);

-- Enable RLS on document_comments
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PART 3: RLS Policies for Document Comments
-- ========================================

-- Users can view comments for their cases
DROP POLICY IF EXISTS "Users can view comments for their cases" ON document_comments;
CREATE POLICY "Users can view comments for their cases" ON document_comments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = document_comments.request_id
        AND (
            lr.client_id = auth.uid()
            OR lr.assigned_lawyer_id = auth.uid()
        )
    )
);

-- Users can create comments
DROP POLICY IF EXISTS "Users can create comments" ON document_comments;
CREATE POLICY "Users can create comments" ON document_comments
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = document_comments.request_id
        AND (
            lr.client_id = auth.uid()
            OR lr.assigned_lawyer_id = auth.uid()
        )
    )
);

-- Users can update their own comments
DROP POLICY IF EXISTS "Users can update own comments" ON document_comments;
CREATE POLICY "Users can update own comments" ON document_comments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments
DROP POLICY IF EXISTS "Users can delete own comments" ON document_comments;
CREATE POLICY "Users can delete own comments" ON document_comments
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ========================================
-- PART 4: Triggers and Functions
-- ========================================

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_document_comment_updated_at ON document_comments;
CREATE TRIGGER trigger_update_document_comment_updated_at
    BEFORE UPDATE ON document_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_document_comment_updated_at();

-- Add helpful comments
COMMENT ON TABLE document_comments IS 'Comments and replies for specific documents';
COMMENT ON COLUMN document_comments.document_id IS 'The document this comment is about';
COMMENT ON COLUMN document_comments.request_id IS 'The legal request this comment belongs to';
COMMENT ON COLUMN document_comments.user_id IS 'User who created the comment';
COMMENT ON COLUMN document_comments.comment_text IS 'The comment content';

-- ========================================
-- DONE!
-- ========================================
-- After running this, you should be able to:
-- 1. Verify documents as a lawyer
-- 2. Add comments to documents (feature coming soon in UI)
-- ========================================
