-- =====================================================
-- PHASE 2: Legal Opinion Portal - Schema Extensions
-- =====================================================
-- Adds critical tables for request acceptance gate,
-- structured clarifications, peer reviews, and signatures
-- =====================================================

-- =====================================================
-- NEW ENUMS
-- =====================================================

-- Clarification status
DO $$ BEGIN
    CREATE TYPE clarification_status AS ENUM ('open', 'answered', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Peer review status
DO $$ BEGIN
    CREATE TYPE peer_review_status AS ENUM ('requested', 'in_progress', 'approved', 'changes_requested', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Opinion signature status
DO $$ BEGIN
    CREATE TYPE signature_status AS ENUM ('pending', 'signed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLE 1: request_status_history
-- Purpose: Audit trail of all request status changes
-- =====================================================

CREATE TABLE IF NOT EXISTS request_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  -- Status tracking
  from_status request_status,
  to_status request_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Context
  reason TEXT, -- Why the status changed
  notes JSONB, -- Additional metadata
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_status_history_request ON request_status_history(request_id);
CREATE INDEX idx_request_status_history_created_at ON request_status_history(created_at DESC);

COMMENT ON TABLE request_status_history IS 'Complete audit trail of request status changes with context';

-- =====================================================
-- TABLE 2: request_acceptance (REQUEST ACCEPTANCE GATE)
-- Purpose: Track when lawyer accepts case + document visibility control
-- =====================================================

CREATE TABLE IF NOT EXISTS request_acceptance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL UNIQUE REFERENCES legal_requests(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Acceptance tracking
  accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ,
  
  -- Conditions
  documents_visible_from TIMESTAMPTZ, -- When documents become visible
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_acceptance_lawyer ON request_acceptance(lawyer_id);
CREATE INDEX idx_request_acceptance_accepted ON request_acceptance(accepted) WHERE accepted = true;

COMMENT ON TABLE request_acceptance IS 'Controls document visibility and request acceptance workflow. CRITICAL: Documents invisible until accepted=true';

-- =====================================================
-- TABLE 3: clarification_replies (STRUCTURED CLARIFICATIONS)
-- Purpose: Separate Q&A thread for each clarification request
-- =====================================================

CREATE TABLE IF NOT EXISTS clarification_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clarification_id UUID NOT NULL REFERENCES clarifications(id) ON DELETE CASCADE,
  
  -- Message
  sender_id UUID NOT NULL REFERENCES profiles(id),
  reply_text TEXT NOT NULL,
  attachments JSONB, -- File references {[filename, url]}
  
  -- Metadata
  is_resolution BOOLEAN DEFAULT false, -- Marks when clarification is resolved
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clarification_replies_clarification ON clarification_replies(clarification_id);
CREATE INDEX idx_clarification_replies_sender ON clarification_replies(sender_id);

COMMENT ON TABLE clarification_replies IS 'Structured Q&A thread for each clarification (separate from general messages)';

-- =====================================================
-- TABLE 4: peer_reviews (OPINION PEER REVIEW)
-- Purpose: Track peer review of draft opinions before finalization
-- =====================================================

CREATE TABLE IF NOT EXISTS peer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_submission_id UUID NOT NULL REFERENCES opinion_submissions(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  -- Reviewer
  requested_by UUID NOT NULL REFERENCES profiles(id), -- Who requested the review
  reviewer_id UUID NOT NULL REFERENCES profiles(id), -- Who is reviewing
  
  -- Review status
  status peer_review_status NOT NULL DEFAULT 'requested',
  reviewed_at TIMESTAMPTZ,
  
  -- Feedback
  feedback TEXT,
  feedback_version INTEGER DEFAULT 1, -- Multiple rounds allowed
  
  -- Metadata
  visibility_to_client BOOLEAN DEFAULT false, -- Client sees review? (usually false)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_peer_reviews_opinion ON peer_reviews(opinion_submission_id);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);
CREATE INDEX idx_peer_reviews_status ON peer_reviews(status);

COMMENT ON TABLE peer_reviews IS 'Peer review workflow for draft opinions. Client cannot see (visibility_to_client=false). Separate from final opinion.';

-- =====================================================
-- TABLE 5: digital_signatures (OPINION SIGNATURES)
-- Purpose: Track digital signatures on final opinions
-- =====================================================

CREATE TABLE IF NOT EXISTS digital_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_submission_id UUID NOT NULL REFERENCES opinion_submissions(id) ON DELETE CASCADE,
  
  -- Signer
  signer_id UUID NOT NULL REFERENCES profiles(id),
  signer_name TEXT NOT NULL,
  signer_designation TEXT, -- e.g., "Senior Lawyer", "Firm Director"
  signer_bar_council_id TEXT, -- Verification
  
  -- Signature data
  signature_type TEXT NOT NULL DEFAULT 'digital', -- 'digital', 'electronic', 'scanned'
  signature_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_hash TEXT, -- For verification (SHA-256)
  certificate_url TEXT, -- Path to certificate
  
  -- Status
  status signature_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_digital_signatures_opinion ON digital_signatures(opinion_submission_id);
CREATE INDEX idx_digital_signatures_signer ON digital_signatures(signer_id);
CREATE INDEX idx_digital_signatures_status ON digital_signatures(status);

COMMENT ON TABLE digital_signatures IS 'Digital signatures on finalized opinions. Includes verification data and timestamp.';

-- =====================================================
-- TABLE 6: opinion_access_logs (OPINION AUDIT TRAIL)
-- Purpose: Track all access to opinions (compliance requirement)
-- =====================================================

CREATE TABLE IF NOT EXISTS opinion_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_submission_id UUID NOT NULL REFERENCES opinion_submissions(id) ON DELETE CASCADE,
  
  -- Access
  accessed_by UUID NOT NULL REFERENCES profiles(id),
  access_type TEXT NOT NULL, -- 'read', 'downloaded', 'shared', 'printed'
  
  -- Context
  accessed_from TEXT, -- IP or device info
  access_duration_seconds INTEGER, -- How long they viewed
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opinion_access_logs_opinion ON opinion_access_logs(opinion_submission_id);
CREATE INDEX idx_opinion_access_logs_accessed_by ON opinion_access_logs(accessed_by);
CREATE INDEX idx_opinion_access_logs_created_at ON opinion_access_logs(created_at DESC);

COMMENT ON TABLE opinion_access_logs IS 'Complete audit trail of opinion access for compliance & security';

-- =====================================================
-- TABLE 7: second_opinions (SECOND OPINION WORKFLOW)
-- Purpose: Track second opinions based on existing request
-- =====================================================

CREATE TABLE IF NOT EXISTS second_opinions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  -- New lawyer for second opinion
  second_lawyer_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Status
  status request_status NOT NULL DEFAULT 'submitted', -- Uses same status enum
  
  -- Linkage
  original_opinion_id UUID REFERENCES opinion_submissions(id), -- Links to original opinion
  second_opinion_id UUID REFERENCES opinion_submissions(id), -- Links to new opinion
  
  -- Context
  reason_requested TEXT, -- Why second opinion was requested
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_second_opinions_original_request ON second_opinions(original_request_id);
CREATE INDEX idx_second_opinions_second_lawyer ON second_opinions(second_lawyer_id);
CREATE INDEX idx_second_opinions_status ON second_opinions(status);

COMMENT ON TABLE second_opinions IS 'Second opinion workflow. Reuses original request data. New lawyer cannot modify original opinion.';

-- =====================================================
-- ALTER: legal_requests (ADD REQUEST ACCEPTANCE TRACKING)
-- =====================================================

ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS accepted_by_lawyer BOOLEAN DEFAULT false;
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS lawyer_acceptance_date TIMESTAMPTZ;

COMMENT ON COLUMN legal_requests.accepted_by_lawyer IS 'Critical: Lawyer must accept before documents are visible';
COMMENT ON COLUMN legal_requests.lawyer_acceptance_date IS 'Timestamp when lawyer accepted the request';

-- =====================================================
-- ALTER: documents (ADD REVIEW TRACKING & VISIBILITY CONTROL)
-- =====================================================

ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending'; -- 'pending', 'reviewed', 'flagged'
ALTER TABLE documents ADD COLUMN IF NOT EXISTS visible_after_acceptance BOOLEAN DEFAULT true;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

COMMENT ON COLUMN documents.reviewed_by IS 'Lawyer who reviewed the document';
COMMENT ON COLUMN documents.review_status IS 'pending | reviewed | flagged for issues';
COMMENT ON COLUMN documents.visible_after_acceptance IS 'CRITICAL: Document invisible until lawyer accepts case';

-- =====================================================
-- ALTER: opinion_submissions (ENHANCE WITH VERSIONING)
-- =====================================================

ALTER TABLE opinion_submissions ADD COLUMN IF NOT EXISTS opinion_status TEXT DEFAULT 'draft'; -- 'draft', 'peer_review', 'final', 'closed'
ALTER TABLE opinion_submissions ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ; -- When opinion becomes read-only
ALTER TABLE opinion_submissions ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

COMMENT ON COLUMN opinion_submissions.opinion_status IS 'draft | peer_review | final | closed';
COMMENT ON COLUMN opinion_submissions.is_locked IS 'CRITICAL: Final opinions are read-only';

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update updated_at for new tables
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER request_acceptance_updated_at
  BEFORE UPDATE ON request_acceptance
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER clarification_replies_updated_at
  BEFORE UPDATE ON clarification_replies
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER peer_reviews_updated_at
  BEFORE UPDATE ON peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- PHASE 2: Legal Opinion Portal - RLS Policies
-- =====================================================
-- Strict data isolation for Phase 2 tables
-- CRITICAL: Document visibility gate & peer review isolation
-- =====================================================

-- =====================================================
-- RLS: request_status_history
-- =====================================================

ALTER TABLE request_status_history ENABLE ROW LEVEL SECURITY;

-- Users can view status history for requests they're involved in
CREATE POLICY "Users view request status history for their requests"
  ON request_status_history FOR SELECT
  USING (
    -- Client: own requests
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id AND lr.client_id = auth.uid()
    )
    OR
    -- Lawyer: assigned requests
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id AND lr.assigned_lawyer_id = auth.uid()
    )
    OR
    -- Firm: firm cases
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id AND lr.assigned_firm_id = auth.uid()
    )
    OR
    -- Admin: all
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can create status history records
CREATE POLICY "System creates request status history"
  ON request_status_history FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- RLS: request_acceptance (CRITICAL - DOCUMENT VISIBILITY GATE)
-- =====================================================

ALTER TABLE request_acceptance ENABLE ROW LEVEL SECURITY;

-- Lawyer can view their own acceptance records
CREATE POLICY "Lawyers view their own acceptance records"
  ON request_acceptance FOR SELECT
  USING (lawyer_id = auth.uid());

-- Client can view acceptance status for their requests
CREATE POLICY "Clients view acceptance status for their requests"
  ON request_acceptance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id AND lr.client_id = auth.uid()
    )
  );

-- Lawyer can create acceptance record (automatic on assignment)
CREATE POLICY "Lawyers create their own acceptance records"
  ON request_acceptance FOR INSERT
  WITH CHECK (lawyer_id = auth.uid());

-- Lawyer can update their own acceptance (mark as accepted)
CREATE POLICY "Lawyers update their own acceptance"
  ON request_acceptance FOR UPDATE
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

-- =====================================================
-- RLS: documents (ENHANCED - VISIBILITY GATE)
-- =====================================================

-- UPDATE existing documents RLS policy to enforce acceptance gate
DROP POLICY IF EXISTS "Documents visible only after lawyer acceptance" ON documents;
CREATE POLICY "Documents visible only after lawyer acceptance"
  ON documents FOR SELECT
  USING (
    -- Client: can view own documents
    uploaded_by = auth.uid()
    OR
    -- Lawyer: can view ONLY if lawyer accepted the request
    (
      EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = documents.request_id
        AND lr.assigned_lawyer_id = auth.uid()
      )
      AND
      EXISTS (
        SELECT 1 FROM request_acceptance ra
        WHERE ra.request_id = documents.request_id
        AND ra.lawyer_id = auth.uid()
        AND ra.accepted = true
      )
    )
    OR
    -- Firm: can view if firm is assigned AND accepted
    (
      EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = documents.request_id
        AND lr.assigned_firm_id = auth.uid()
      )
      AND
      EXISTS (
        SELECT 1 FROM request_acceptance ra
        WHERE ra.request_id = documents.request_id
        AND ra.accepted = true
      )
    )
    OR
    -- Admin: can view all
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CRITICAL: Clients can ONLY upload documents if lawyer accepted
DROP POLICY IF EXISTS "Clients upload documents only after lawyer accepts" ON documents;
CREATE POLICY "Clients upload documents only after lawyer accepts"
  ON documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.client_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM request_acceptance ra
      WHERE ra.request_id = request_id
      AND ra.accepted = true
    )
  );

-- =====================================================
-- RLS: clarification_replies (STRUCTURED Q&A)
-- =====================================================

ALTER TABLE clarification_replies ENABLE ROW LEVEL SECURITY;

-- Users can view clarification replies for their clarifications
CREATE POLICY "Users view clarification replies for their clarifications"
  ON clarification_replies FOR SELECT
  USING (
    -- Requester: lawyer who asked the question
    EXISTS (
      SELECT 1 FROM clarifications c
      WHERE c.id = clarification_id
      AND c.requester_id = auth.uid()
    )
    OR
    -- Client: who is responding
    EXISTS (
      SELECT 1 FROM clarifications c
      WHERE c.id = clarification_id
      AND EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = c.request_id
        AND lr.client_id = auth.uid()
      )
    )
    OR
    -- Sender: their own reply
    sender_id = auth.uid()
  );

-- Users can create clarification replies
CREATE POLICY "Users create clarification replies"
  ON clarification_replies FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND
    -- Must be part of the request
    (
      EXISTS (
        SELECT 1 FROM clarifications c
        WHERE c.id = clarification_id
        AND c.requester_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM clarifications c
        WHERE c.id = clarification_id
        AND EXISTS (
          SELECT 1 FROM legal_requests lr
          WHERE lr.id = c.request_id
          AND lr.client_id = auth.uid()
        )
      )
    )
  );

-- =====================================================
-- RLS: peer_reviews (LAWYER-ONLY, INVISIBLE TO CLIENT)
-- =====================================================

ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Only lawyers involved in review can see it
CREATE POLICY "Lawyers view peer reviews they are involved in"
  ON peer_reviews FOR SELECT
  USING (
    -- Reviewer can see their own reviews
    reviewer_id = auth.uid()
    OR
    -- Requester (lawyer who requested review) can see
    requested_by = auth.uid()
    OR
    -- Admin can see all
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CRITICAL: Clients CANNOT see peer reviews
-- (RLS naturally denies access since no rule allows client viewing)

-- Lawyer can request peer review
CREATE POLICY "Lawyers request peer reviews"
  ON peer_reviews FOR INSERT
  WITH CHECK (
    requested_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lawyer', 'firm')
    )
  );

-- Reviewer can update their review
CREATE POLICY "Reviewers update their reviews"
  ON peer_reviews FOR UPDATE
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

-- =====================================================
-- RLS: digital_signatures (OPINION SIGNOFF)
-- =====================================================

ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;

-- Signer can view their own signatures
CREATE POLICY "Signers view their own signatures"
  ON digital_signatures FOR SELECT
  USING (signer_id = auth.uid());

-- Client can view signatures on finalized opinions
CREATE POLICY "Clients view signatures on their opinions"
  ON digital_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM opinion_submissions os
      WHERE os.id = opinion_submission_id
      AND EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = os.request_id
        AND lr.client_id = auth.uid()
      )
    )
  );

-- Lawyer can view signatures on their opinions
CREATE POLICY "Lawyers view signatures on their opinions"
  ON digital_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM opinion_submissions os
      WHERE os.id = opinion_submission_id
      AND os.lawyer_id = auth.uid()
    )
  );

-- System can create signatures
CREATE POLICY "System creates digital signatures"
  ON digital_signatures FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- RLS: opinion_access_logs (AUDIT TRAIL)
-- =====================================================

ALTER TABLE opinion_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can view access logs for opinions they own/have access to
CREATE POLICY "Users view access logs for their opinions"
  ON opinion_access_logs FOR SELECT
  USING (
    -- Lawyer: their own opinions
    EXISTS (
      SELECT 1 FROM opinion_submissions os
      WHERE os.id = opinion_submission_id
      AND os.lawyer_id = auth.uid()
    )
    OR
    -- Client: opinions on their requests
    EXISTS (
      SELECT 1 FROM opinion_submissions os
      WHERE os.id = opinion_submission_id
      AND EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = os.request_id
        AND lr.client_id = auth.uid()
      )
    )
    OR
    -- Admin: all
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can create access logs
CREATE POLICY "System creates opinion access logs"
  ON opinion_access_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- RLS: second_opinions (SECOND OPINION WORKFLOW)
-- =====================================================

ALTER TABLE second_opinions ENABLE ROW LEVEL SECURITY;

-- Client can view second opinion requests for their requests
CREATE POLICY "Clients view second opinion requests"
  ON second_opinions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = original_request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Second lawyer can view their own second opinion cases
CREATE POLICY "Second lawyers view their own second opinions"
  ON second_opinions FOR SELECT
  USING (second_lawyer_id = auth.uid());

-- Original lawyer can view second opinions on their cases
CREATE POLICY "Original lawyers view second opinions on their cases"
  ON second_opinions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = original_request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- Admin can view all
CREATE POLICY "Admins view all second opinions"
  ON second_opinions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CRITICAL: Second opinion lawyer CANNOT modify original opinion
-- (No UPDATE policy on opinion_submissions for second_lawyer_id on original opinion)

-- =====================================================
-- UPDATED RLS: opinion_submissions (ENFORCE READ-ONLY CLOSURE)
-- =====================================================

-- Add policy: Clients can view finalized opinions only
DROP POLICY IF EXISTS "Clients view only final opinions for their requests" ON opinion_submissions;
CREATE POLICY "Clients view only final opinions for their requests"
  ON opinion_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.client_id = auth.uid()
      AND is_final = true
    )
  );

-- Add policy: Final opinions are READ-ONLY after creation
DROP POLICY IF EXISTS "Final opinions are read-only" ON opinion_submissions;
CREATE POLICY "Final opinions are read-only"
  ON opinion_submissions FOR UPDATE
  USING (is_final = false)
  WITH CHECK (is_final = false);

DO $$
BEGIN
  RAISE NOTICE '✅ PHASE 2 MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '   - Tables created';
  RAISE NOTICE '   - Columns added';
  RAISE NOTICE '   - RLS policies applied';
END $$;
