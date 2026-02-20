-- Migration: Add Document Repository Features
-- Description: Extends documents table for lawyer document management
-- Date: 2026-01-19

--  Make request_id nullable to support non-case documents (drafts, templates, etc.)
ALTER TABLE documents ALTER COLUMN request_id DROP NOT NULL;

-- Add new columns for document categorization
ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  category TEXT DEFAULT 'case_document' CHECK (category IN (
    'legal_opinion', 'draft', 'template', 'research', 'compliance', 'case_document'
  ));

ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  visibility TEXT DEFAULT 'private' CHECK (visibility IN (
    'private', 'firm', 'admin', 'public'
  ));

ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  tags TEXT[] DEFAULT '{}';

ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  practice_area TEXT;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  opinion_type TEXT CHECK (opinion_type IN ('preliminary', 'final', NULL));

ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  version TEXT DEFAULT 'v1';

ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  is_template BOOLEAN DEFAULT false;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  template_category TEXT;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'final', 'archived'
  ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_practice_area ON documents(practice_area);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);
CREATE INDEX IF NOT EXISTS idx_documents_is_template ON documents(is_template);

-- Update RLS Policies for Document Repository

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Lawyers view repository documents" ON documents;
DROP POLICY IF EXISTS "Lawyers upload repository documents" ON documents;
DROP POLICY IF EXISTS "Lawyers update own documents" ON documents;
DROP POLICY IF EXISTS "Lawyers delete own documents" ON documents;

-- Lawyers can view:
-- 1. Their own documents (all categories)
-- 2. Case documents from assigned cases
CREATE POLICY "Lawyers view repository documents"
ON documents FOR SELECT
USING (
  uploaded_by = auth.uid() OR
  (category = 'case_document' AND request_id IN (
    SELECT id FROM legal_requests WHERE assigned_lawyer_id = auth.uid()
  ))
);

-- Lawyers can upload documents
CREATE POLICY "Lawyers upload repository documents"
ON documents FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid() AND
  (category IN ('legal_opinion', 'draft', 'template', 'research', 'compliance', 'case_document'))
);

-- Lawyers can update their own documents (except finalized opinions)
CREATE POLICY "Lawyers update own documents"
ON documents FOR UPDATE
USING (
  uploaded_by = auth.uid() AND
  (status != 'final' OR category IN ('draft', 'template', 'research'))
);

-- Lawyers can delete drafts, templates, and research only
CREATE POLICY "Lawyers delete own documents"
ON documents FOR DELETE
USING (
  uploaded_by = auth.uid() AND
  category IN ('draft', 'template', 'research') AND
  status != 'final'
);

-- Admin policies
CREATE POLICY "Admins view all documents"
ON documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Comments for documentation
COMMENT ON COLUMN documents.category IS 'Document category: legal_opinion, draft, template, research, compliance, case_document';
COMMENT ON COLUMN documents.visibility IS 'Visibility level: private (lawyer only), firm, admin, public';
COMMENT ON COLUMN documents.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN documents.practice_area IS 'Legal practice area/department';
COMMENT ON COLUMN documents.opinion_type IS 'Type of legal opinion: preliminary or final';
COMMENT ON COLUMN documents.version IS 'Document version (v1, v2, etc.)';
COMMENT ON COLUMN documents.is_template IS 'Whether document is a reusable template';
COMMENT ON COLUMN documents.status IS 'Document status: draft, submitted, final, archived';
