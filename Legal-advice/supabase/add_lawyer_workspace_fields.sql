-- =====================================================
-- Lawyer Workspace Enhancement - Database Schema
-- =====================================================
-- Run this in Supabase SQL Editor after core schema
-- Adds professional case management features for lawyers
-- =====================================================

-- =====================================================
-- TABLE 1: Internal Notes (Lawyer/Firm Only)
-- =====================================================

CREATE TABLE IF NOT EXISTS internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  note_text TEXT NOT NULL,
  note_type TEXT DEFAULT 'general', -- 'general', 'risk', 'research', 'strategy'
  
  -- Visibility control (never includes 'client')
  visible_to_roles TEXT[] DEFAULT ARRAY['lawyer', 'firm'],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internal_notes_request ON internal_notes(request_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_created_by ON internal_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_internal_notes_created_at ON internal_notes(created_at DESC);

COMMENT ON TABLE internal_notes IS 'Lawyer and firm internal notes, never visible to clients';

-- =====================================================
-- TABLE 2: Opinion Submissions (Professional Metadata)
-- =====================================================

CREATE TABLE IF NOT EXISTS opinion_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Opinion metadata
  opinion_type TEXT NOT NULL, -- 'preliminary', 'final'
  version INTEGER NOT NULL DEFAULT 1,
  is_final BOOLEAN DEFAULT false,
  
  -- Professional context
  assumptions TEXT,
  limitations TEXT,
  validity_period TEXT,
  
  -- File reference
  document_id UUID REFERENCES documents(id),
  
  -- Approval workflow
  firm_approved BOOLEAN DEFAULT false,
  firm_approved_by UUID REFERENCES profiles(id),
  firm_approved_at TIMESTAMPTZ,
  
  -- Self-review checklist (JSONB for flexibility)
  self_review_checklist JSONB DEFAULT '{
    "all_documents_reviewed": false,
    "clarifications_resolved": false,
    "legal_research_completed": false,
    "citations_verified": false,
    "opinion_proofread": false
  }'::jsonb,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(request_id, version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opinion_submissions_request ON opinion_submissions(request_id);
CREATE INDEX IF NOT EXISTS idx_opinion_submissions_lawyer ON opinion_submissions(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_opinion_submissions_final ON opinion_submissions(request_id, is_final) WHERE is_final = true;

COMMENT ON TABLE opinion_submissions IS 'Professional opinion submissions with metadata and version control';

-- =====================================================
-- MODIFY: legal_requests (Add Professional Fields)
-- =====================================================

-- Risk flags and legal context
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS risk_flags TEXT[] DEFAULT '{}';
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS legal_opinion_type TEXT;
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS opinion_standard TEXT; -- 'preliminary', 'final', 'bank_compliant'
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS jurisdiction TEXT;
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS governing_law TEXT;

-- SLA management
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS sla_paused BOOLEAN DEFAULT false;
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS sla_pause_reason TEXT;
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS sla_paused_at TIMESTAMPTZ;
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS sla_resumed_at TIMESTAMPTZ;

-- Ownership tracking
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES profiles(id);
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS escalation_owner UUID REFERENCES profiles(id);

-- Case health indicator
ALTER TABLE legal_requests ADD COLUMN IF NOT EXISTS case_health TEXT DEFAULT 'healthy'; -- 'healthy', 'at_risk', 'blocked'

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_legal_requests_case_health ON legal_requests(case_health);
CREATE INDEX IF NOT EXISTS idx_legal_requests_sla_paused ON legal_requests(sla_paused) WHERE sla_paused = true;

-- =====================================================
-- MODIFY: documents (Add Review Tracking)
-- =====================================================

ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending'; -- 'pending', 'reviewed', 'requires_clarification'

-- Index for review tracking
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON documents(request_id, review_status);

-- =====================================================
-- FUNCTIONS: Case Health Calculation
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_case_health(p_request_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_total_docs INTEGER;
  v_reviewed_docs INTEGER;
  v_has_unresolved_clarifications BOOLEAN;
  v_sla_health TEXT;
  v_has_risk_flags BOOLEAN;
  v_deadline TIMESTAMPTZ;
  v_submitted TIMESTAMPTZ;
  v_percent_remaining NUMERIC;
BEGIN
  -- Get document counts
  SELECT COUNT(*), COUNT(*) FILTER (WHERE review_status = 'reviewed')
  INTO v_total_docs, v_reviewed_docs
  FROM documents
  WHERE request_id = p_request_id;
  
  -- Check clarifications
  SELECT EXISTS (
    SELECT 1 FROM clarifications 
    WHERE request_id = p_request_id AND is_resolved = false
  ) INTO v_has_unresolved_clarifications;
  
  -- Calculate SLA health
  SELECT sla_deadline, submitted_at INTO v_deadline, v_submitted
  FROM legal_requests WHERE id = p_request_id;
  
  IF v_deadline IS NOT NULL THEN
    v_percent_remaining := (
      EXTRACT(EPOCH FROM (v_deadline - NOW())) / 
      EXTRACT(EPOCH FROM (v_deadline - v_submitted))
    ) * 100;
    
    IF v_percent_remaining < 10 THEN
      v_sla_health := 'critical';
    ELSIF v_percent_remaining < 50 THEN
      v_sla_health := 'warning';
    ELSE
      v_sla_health := 'healthy';
    END IF;
  ELSE
    v_sla_health := 'unknown';
  END IF;
  
  -- Check risk flags
  SELECT array_length(risk_flags, 1) > 0 INTO v_has_risk_flags
  FROM legal_requests WHERE id = p_request_id;
  
  -- Determine overall health
  IF v_has_unresolved_clarifications OR v_sla_health = 'critical' THEN
    RETURN 'blocked';
  ELSIF v_total_docs > 0 AND v_reviewed_docs < v_total_docs THEN
    RETURN 'at_risk';
  ELSIF v_sla_health = 'warning' OR v_has_risk_flags THEN
    RETURN 'at_risk';
  ELSE
    RETURN 'healthy';
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_case_health IS 'Calculates case health based on documents, clarifications, SLA, and risk flags';

-- =====================================================
-- TRIGGER: Auto-update case health
-- =====================================================

CREATE OR REPLACE FUNCTION update_case_health_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE legal_requests
  SET case_health = calculate_case_health(NEW.request_id)
  WHERE id = NEW.request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on document review changes
CREATE TRIGGER trigger_update_case_health_on_document_review
  AFTER INSERT OR UPDATE OF review_status ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_case_health_trigger();

-- Trigger on clarification resolution
CREATE TRIGGER trigger_update_case_health_on_clarification
  AFTER UPDATE OF is_resolved ON clarifications
  FOR EACH ROW
  EXECUTE FUNCTION update_case_health_trigger();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Lawyer workspace schema created successfully!';
  RAISE NOTICE '📋 Created tables: internal_notes, opinion_submissions';
  RAISE NOTICE '🔧 Modified tables: legal_requests, documents';
  RAISE NOTICE '⚡ Added case health calculation function';
  RAISE NOTICE '⏭️  Next step: Run add_lawyer_workspace_rls.sql';
END $$;
