-- =====================================================
-- PHASE 3: Opinion Versioning & Digital Signatures
-- =====================================================
-- Adds opinion version control, section-based editing,
-- digital signature enforcement, and audit trails
-- =====================================================

-- =====================================================
-- NEW ENUMS
-- =====================================================

-- Opinion version status
CREATE TYPE opinion_version_status AS ENUM ('draft', 'peer_review', 'approved', 'signed', 'published');

-- Signature type
CREATE TYPE signature_type_enum AS ENUM ('digital', 'electronic', 'scanned', 'biometric');

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at column on row modification';

-- =====================================================
-- TABLE 1: opinion_versions
-- Purpose: Complete version history for all opinions
-- CRITICAL: Drafts invisible to clients
-- =====================================================

CREATE TABLE IF NOT EXISTS opinion_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_submission_id UUID NOT NULL REFERENCES opinion_submissions(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  -- Version tracking
  version_number INTEGER NOT NULL, -- 1, 2, 3...
  parent_version_id UUID REFERENCES opinion_versions(id), -- For branching
  
  -- Opinion structure (JSON for flexibility)
  content_sections JSONB NOT NULL, -- { facts, issues, analysis, conclusion, references }
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id),
  status opinion_version_status DEFAULT 'draft',
  
  -- Peer review integration
  peer_review_id UUID REFERENCES peer_reviews(id),
  
  -- Locking (after signature)
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(opinion_submission_id, version_number)
);

CREATE INDEX idx_opinion_versions_submission ON opinion_versions(opinion_submission_id);
CREATE INDEX idx_opinion_versions_request ON opinion_versions(request_id);
CREATE INDEX idx_opinion_versions_created_by ON opinion_versions(created_by);
CREATE INDEX idx_opinion_versions_status ON opinion_versions(status);

COMMENT ON TABLE opinion_versions IS 'Complete version history - drafts invisible to clients via RLS';
COMMENT ON COLUMN opinion_versions.content_sections IS 'Structured opinion: {facts, issues, analysis, conclusion, references}';
COMMENT ON COLUMN opinion_versions.is_locked IS 'TRUE after digital signature - prevents further edits';

-- Auto-update updated_at
CREATE TRIGGER update_opinion_versions_updated_at
  BEFORE UPDATE ON opinion_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 2: opinion_section_comments
-- Purpose: Inline comments for peer review
-- =====================================================

CREATE TABLE IF NOT EXISTS opinion_section_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_version_id UUID NOT NULL REFERENCES opinion_versions(id) ON DELETE CASCADE,
  peer_review_id UUID NOT NULL REFERENCES peer_reviews(id) ON DELETE CASCADE,
  
  -- Comment location
  section_name TEXT NOT NULL, -- 'facts', 'issues', 'analysis', etc.
  section_position INTEGER, -- Line number or paragraph
  
  -- Comment content
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'suggestion', -- 'suggestion', 'issue', 'approval'
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id),
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opinion_section_comments_version ON opinion_section_comments(opinion_version_id);
CREATE INDEX idx_opinion_section_comments_review ON opinion_section_comments(peer_review_id);

COMMENT ON TABLE opinion_section_comments IS 'Inline peer review comments on opinion sections';

-- Auto-update updated_at
CREATE TRIGGER update_opinion_section_comments_updated_at
  BEFORE UPDATE ON opinion_section_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 3: opinion_autosaves
-- Purpose: Autosave drafts without creating versions
-- =====================================================

CREATE TABLE IF NOT EXISTS opinion_autosaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_submission_id UUID NOT NULL REFERENCES opinion_submissions(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Draft content
  content_sections JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Only keep latest autosave per lawyer
  UNIQUE(opinion_submission_id, lawyer_id)
);

CREATE INDEX idx_opinion_autosaves_submission ON opinion_autosaves(opinion_submission_id);
CREATE INDEX idx_opinion_autosaves_lawyer ON opinion_autosaves(lawyer_id);

COMMENT ON TABLE opinion_autosaves IS 'Temporary autosaves - overwritten on each save, replaced by version on publish';

-- =====================================================
-- TABLE 4: opinion_signature_validations
-- Purpose: Pre-signature validation checks
-- =====================================================

CREATE TABLE IF NOT EXISTS opinion_signature_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_version_id UUID NOT NULL REFERENCES opinion_versions(id) ON DELETE CASCADE,
  
  -- Validation checks
  no_open_clarifications BOOLEAN NOT NULL,
  no_pending_peer_reviews BOOLEAN NOT NULL,
  all_sections_complete BOOLEAN NOT NULL,
  client_notified BOOLEAN NOT NULL,
  
  -- Validation metadata
  validated_by UUID NOT NULL REFERENCES profiles(id),
  validation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Pass/Fail
  validation_passed BOOLEAN GENERATED ALWAYS AS (
    no_open_clarifications AND 
    no_pending_peer_reviews AND 
    all_sections_complete AND 
    client_notified
  ) STORED,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opinion_signature_validations_version ON opinion_signature_validations(opinion_version_id);

COMMENT ON TABLE opinion_signature_validations IS 'Pre-signature validation - prevents signing if checks fail';

-- =====================================================
-- TABLE 5: version_access_logs
-- Purpose: Audit trail of who accessed which version
-- =====================================================

CREATE TABLE IF NOT EXISTS version_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_version_id UUID NOT NULL REFERENCES opinion_versions(id) ON DELETE CASCADE,
  
  -- Access metadata
  accessed_by UUID NOT NULL REFERENCES profiles(id),
  access_type TEXT NOT NULL, -- 'view', 'edit', 'download', 'print', 'share'
  access_source TEXT, -- 'web', 'mobile', 'api'
  
  -- Technical details
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  access_duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_version_access_logs_version ON version_access_logs(opinion_version_id);
CREATE INDEX idx_version_access_logs_user ON version_access_logs(accessed_by);
CREATE INDEX idx_version_access_logs_created_at ON version_access_logs(created_at DESC);

COMMENT ON TABLE version_access_logs IS 'Complete audit trail of version access - compliance requirement';

-- =====================================================
-- TABLE 6: opinion_clarification_requests
-- Purpose: Client requests clarification on delivered opinion
-- =====================================================

CREATE TABLE IF NOT EXISTS opinion_clarification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opinion_submission_id UUID NOT NULL REFERENCES opinion_submissions(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  -- Clarification details
  section_reference TEXT NOT NULL, -- Which section needs clarification
  client_question TEXT NOT NULL,
  
  -- Lawyer response
  lawyer_response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES profiles(id),
  
  -- Status
  status clarification_status DEFAULT 'open',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opinion_clarification_requests_opinion ON opinion_clarification_requests(opinion_submission_id);
CREATE INDEX idx_opinion_clarification_requests_request ON opinion_clarification_requests(request_id);
CREATE INDEX idx_opinion_clarification_requests_status ON opinion_clarification_requests(status);

COMMENT ON TABLE opinion_clarification_requests IS 'Client clarification requests on delivered opinions';

-- Auto-update updated_at
CREATE TRIGGER update_opinion_clarification_requests_updated_at
  BEFORE UPDATE ON opinion_clarification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 7: request_closures
-- Purpose: Track request closure with final validation
-- =====================================================

CREATE TABLE IF NOT EXISTS request_closures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  -- Closure details
  closed_by UUID NOT NULL REFERENCES profiles(id), -- Client or admin
  closure_reason TEXT,
  client_satisfaction_rating INTEGER CHECK (client_satisfaction_rating >= 1 AND client_satisfaction_rating <= 5),
  
  -- Final validation
  opinion_delivered BOOLEAN NOT NULL,
  all_clarifications_resolved BOOLEAN NOT NULL,
  signature_verified BOOLEAN NOT NULL,
  
  -- Enforcement
  is_immutable BOOLEAN DEFAULT true, -- Prevents reopening
  
  closed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(request_id) -- One closure per request
);

CREATE INDEX idx_request_closures_request ON request_closures(request_id);
CREATE INDEX idx_request_closures_closed_by ON request_closures(closed_by);

COMMENT ON TABLE request_closures IS 'Final request closure - enforces read-only state';

-- =====================================================
-- ALTERATIONS TO EXISTING TABLES
-- =====================================================

-- Add version reference to digital_signatures
ALTER TABLE digital_signatures
  ADD COLUMN IF NOT EXISTS opinion_version_id UUID REFERENCES opinion_versions(id);

CREATE INDEX IF NOT EXISTS idx_digital_signatures_version ON digital_signatures(opinion_version_id);

-- Add closure reference to legal_requests
ALTER TABLE legal_requests
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_legal_requests_closed ON legal_requests(is_closed);

-- Add current version to opinion_submissions
ALTER TABLE opinion_submissions
  ADD COLUMN IF NOT EXISTS current_version_id UUID REFERENCES opinion_versions(id),
  ADD COLUMN IF NOT EXISTS total_versions INTEGER DEFAULT 0;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Increment total_versions on opinion_submissions
CREATE OR REPLACE FUNCTION increment_opinion_version_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE opinion_submissions
  SET total_versions = total_versions + 1
  WHERE id = NEW.opinion_submission_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_opinion_version_count
  AFTER INSERT ON opinion_versions
  FOR EACH ROW
  EXECUTE FUNCTION increment_opinion_version_count();

-- Trigger: Prevent edits to locked versions
CREATE OR REPLACE FUNCTION prevent_locked_version_edits()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    RAISE EXCEPTION 'Cannot modify locked opinion version (signed/published)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_locked_version_edits
  BEFORE UPDATE ON opinion_versions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_version_edits();

-- Trigger: Auto-close request on closure record
CREATE OR REPLACE FUNCTION auto_close_request()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE legal_requests
  SET 
    is_closed = true,
    closed_at = NEW.closed_at,
    status = 'completed'
  WHERE id = NEW.request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_close_request
  AFTER INSERT ON request_closures
  FOR EACH ROW
  EXECUTE FUNCTION auto_close_request();

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TYPE opinion_version_status IS 'Draft→Peer Review→Approved→Signed→Published';
COMMENT ON TYPE signature_type_enum IS 'Digital signature types for legal validity';

-- =====================================================
-- END PHASE 3 SCHEMA
-- =====================================================
