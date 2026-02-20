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
CREATE TYPE clarification_status AS ENUM ('open', 'answered', 'closed');

-- Peer review status
CREATE TYPE peer_review_status AS ENUM ('requested', 'in_progress', 'approved', 'changes_requested', 'rejected');

-- Opinion signature status
CREATE TYPE signature_status AS ENUM ('pending', 'signed', 'rejected');

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
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ PHASE 2 Schema extensions created successfully!';
  RAISE NOTICE '📊 New tables: request_status_history, request_acceptance, clarification_replies, peer_reviews, digital_signatures, opinion_access_logs, second_opinions';
  RAISE NOTICE '🔐 Document visibility gate installed (lawyer acceptance required)';
  RAISE NOTICE '📝 Clarifications separated into structured Q&A threads';
  RAISE NOTICE '✍️ Digital signature support added';
  RAISE NOTICE '⏭️  Next step: Run 09_phase2_rls_policies.sql';
END $$;
