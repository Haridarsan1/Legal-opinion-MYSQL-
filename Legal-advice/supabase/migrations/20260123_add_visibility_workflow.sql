-- =====================================================
-- Add Private/Public Visibility & Lawyer Acceptance Workflow
-- =====================================================
-- This migration adds:
-- 1. Visibility control (private/public) for requests
-- 2. Lawyer acceptance workflow
-- 3. Dynamic document requests
-- 4. Clarification tags
-- 5. Second opinion sharing
-- =====================================================

-- Add visibility to legal_requests
ALTER TABLE legal_requests 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public'));

COMMENT ON COLUMN legal_requests.visibility IS 'private = only assigned lawyer can see, public = any lawyer can see and bid';

-- Add acceptance workflow fields
ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS lawyer_acceptance_status TEXT DEFAULT 'pending' CHECK (lawyer_acceptance_status IN ('pending', 'accepted', 'rejected')),
ADD COLUMN IF NOT EXISTS lawyer_acceptance_note TEXT,
ADD COLUMN IF NOT EXISTS lawyer_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS detailed_description TEXT,
ADD COLUMN IF NOT EXISTS client_details_submitted BOOLEAN DEFAULT false;

COMMENT ON COLUMN legal_requests.lawyer_acceptance_status IS 'Lawyer must accept before client provides full details';
COMMENT ON COLUMN legal_requests.detailed_description IS 'Full case description provided after lawyer accepts';
COMMENT ON COLUMN legal_requests.client_details_submitted IS 'True when client has submitted detailed case info';

-- Create table for lawyer-requested documents
CREATE TABLE IF NOT EXISTS document_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  document_name TEXT NOT NULL,
  document_description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  is_submitted BOOLEAN DEFAULT false,
  submitted_document_id UUID REFERENCES documents(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_requests_request ON document_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_submitted ON document_requests(is_submitted);

COMMENT ON TABLE document_requests IS 'Lawyer can dynamically request specific documents from client';

-- Add tags to clarifications
ALTER TABLE clarifications
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('factual', 'legal', 'documentation', 'procedural', 'other'));

COMMENT ON COLUMN clarifications.tags IS 'Tags for organizing clarifications (e.g., "urgent", "contract", "timeline")';
COMMENT ON COLUMN clarifications.category IS 'Category to classify clarification type';

-- Create second opinion requests table
CREATE TABLE IF NOT EXISTS second_opinion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  opinion_version_id UUID REFERENCES opinion_versions(id),
  shared_by UUID NOT NULL REFERENCES profiles(id),
  shared_with_lawyer_id UUID REFERENCES profiles(id),
  share_type TEXT NOT NULL CHECK (share_type IN ('peer_review', 'second_opinion')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined')),
  reviewer_notes TEXT,
  reviewer_opinion TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_second_opinion_original ON second_opinion_requests(original_request_id);
CREATE INDEX IF NOT EXISTS idx_second_opinion_shared_with ON second_opinion_requests(shared_with_lawyer_id);
CREATE INDEX IF NOT EXISTS idx_second_opinion_status ON second_opinion_requests(status);

COMMENT ON TABLE second_opinion_requests IS 'Allows sharing opinions with other lawyers for second opinions or peer review';

-- Create index for public requests
CREATE INDEX IF NOT EXISTS idx_legal_requests_visibility ON legal_requests(visibility) WHERE visibility = 'public';

-- RLS Policies for document_requests
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

-- Clients can see document requests for their own requests
CREATE POLICY document_requests_client_select ON document_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = document_requests.request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Lawyers can see and create document requests for assigned requests
CREATE POLICY document_requests_lawyer_all ON document_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = document_requests.request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = document_requests.request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- RLS Policies for second_opinion_requests
ALTER TABLE second_opinion_requests ENABLE ROW LEVEL SECURITY;

-- Users can see second opinion requests they created or are assigned to
CREATE POLICY second_opinion_select ON second_opinion_requests
  FOR SELECT
  TO authenticated
  USING (
    shared_by = auth.uid() OR shared_with_lawyer_id = auth.uid()
  );

-- Users can create second opinion requests for their own cases
CREATE POLICY second_opinion_insert ON second_opinion_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shared_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = second_opinion_requests.original_request_id
      AND (lr.client_id = auth.uid() OR lr.assigned_lawyer_id = auth.uid())
    )
  );

-- Assigned lawyers can update second opinion requests
CREATE POLICY second_opinion_update ON second_opinion_requests
  FOR UPDATE
  TO authenticated
  USING (shared_with_lawyer_id = auth.uid())
  WITH CHECK (shared_with_lawyer_id = auth.uid());

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Visibility & workflow enhancements applied successfully';
  RAISE NOTICE '   - Private/public request visibility added';
  RAISE NOTICE '   - Lawyer acceptance workflow implemented';
  RAISE NOTICE '   - Dynamic document requests enabled';
  RAISE NOTICE '   - Clarification tags added';
  RAISE NOTICE '   - Second opinion sharing created';
END $$;
