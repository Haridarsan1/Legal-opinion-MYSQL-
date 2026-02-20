-- =====================================================
-- PHASE 3: RLS Policies for Opinion Versioning
-- =====================================================
-- Enforces strict data isolation:
-- - Draft versions invisible to clients
-- - Peer review comments invisible to clients
-- - Locked versions read-only
-- - Closed requests immutable
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE opinion_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinion_section_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinion_autosaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinion_signature_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinion_clarification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_closures ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: opinion_versions
-- CRITICAL: Clients see ONLY signed/published versions
-- =====================================================

-- Lawyers view ALL versions of opinions they created
CREATE POLICY "Lawyers view their opinion versions"
  ON opinion_versions FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- 🔴 CRITICAL: Clients view ONLY signed or published versions
CREATE POLICY "Clients view only signed/published versions"
  ON opinion_versions FOR SELECT
  USING (
    status IN ('signed', 'published')
    AND EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Admin view all
CREATE POLICY "Admins view all opinion versions"
  ON opinion_versions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Lawyers INSERT new versions
CREATE POLICY "Lawyers create opinion versions"
  ON opinion_versions FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- 🔴 CRITICAL: UPDATE only if NOT locked
CREATE POLICY "Update opinion versions only if not locked"
  ON opinion_versions FOR UPDATE
  USING (
    is_locked = false
    AND created_by = auth.uid()
  )
  WITH CHECK (
    is_locked = false
  );

-- NO DELETE (versions are immutable historical records)

-- =====================================================
-- RLS: opinion_section_comments
-- CRITICAL: Invisible to clients (peer review only)
-- =====================================================

-- Only lawyers involved in peer review see comments
CREATE POLICY "Lawyers view peer review comments"
  ON opinion_section_comments FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM peer_reviews pr
      WHERE pr.id = peer_review_id
      AND (pr.reviewer_id = auth.uid() OR pr.requested_by = auth.uid())
    )
  );

-- Admin view all
CREATE POLICY "Admins view all section comments"
  ON opinion_section_comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Lawyers create comments
CREATE POLICY "Lawyers create section comments"
  ON opinion_section_comments FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM peer_reviews pr
      WHERE pr.id = peer_review_id
      AND pr.reviewer_id = auth.uid()
    )
  );

-- Lawyers update their own comments
CREATE POLICY "Lawyers update their section comments"
  ON opinion_section_comments FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- =====================================================
-- RLS: opinion_autosaves
-- CRITICAL: Only lawyer who created can access
-- =====================================================

-- Lawyer views their own autosaves
CREATE POLICY "Lawyers view their autosaves"
  ON opinion_autosaves FOR SELECT
  USING (lawyer_id = auth.uid());

-- Lawyer inserts autosaves (UPSERT pattern)
CREATE POLICY "Lawyers create autosaves"
  ON opinion_autosaves FOR INSERT
  WITH CHECK (lawyer_id = auth.uid());

-- Lawyer updates their autosaves
CREATE POLICY "Lawyers update their autosaves"
  ON opinion_autosaves FOR UPDATE
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

-- Lawyer can delete autosaves (cleanup)
CREATE POLICY "Lawyers delete their autosaves"
  ON opinion_autosaves FOR DELETE
  USING (lawyer_id = auth.uid());

-- =====================================================
-- RLS: opinion_signature_validations
-- Lawyers & admins only
-- =====================================================

-- Lawyers view validations for their opinions
CREATE POLICY "Lawyers view signature validations"
  ON opinion_signature_validations FOR SELECT
  USING (
    validated_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM opinion_versions ov
      WHERE ov.id = opinion_version_id
      AND ov.created_by = auth.uid()
    )
  );

-- Admin view all
CREATE POLICY "Admins view all signature validations"
  ON opinion_signature_validations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Lawyers create validations
CREATE POLICY "Lawyers create signature validations"
  ON opinion_signature_validations FOR INSERT
  WITH CHECK (validated_by = auth.uid());

-- No UPDATE/DELETE (validations are immutable)

-- =====================================================
-- RLS: version_access_logs
-- Audit logs - admin only for viewing
-- =====================================================

-- User views their own access logs
CREATE POLICY "Users view their access logs"
  ON version_access_logs FOR SELECT
  USING (accessed_by = auth.uid());

-- Admin view all
CREATE POLICY "Admins view all version access logs"
  ON version_access_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- System INSERT (auto-logged)
CREATE POLICY "System creates access logs"
  ON version_access_logs FOR INSERT
  WITH CHECK (true); -- Server-side enforcement

-- No UPDATE/DELETE (logs are immutable)

-- =====================================================
-- RLS: opinion_clarification_requests
-- Client & assigned lawyer only
-- =====================================================

-- Client views their clarification requests
CREATE POLICY "Clients view their opinion clarifications"
  ON opinion_clarification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Lawyer views clarifications for their cases
CREATE POLICY "Lawyers view opinion clarifications"
  ON opinion_clarification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- Admin view all
CREATE POLICY "Admins view all opinion clarifications"
  ON opinion_clarification_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Client creates clarification requests
CREATE POLICY "Clients create opinion clarifications"
  ON opinion_clarification_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Lawyer updates (responds to) clarifications
CREATE POLICY "Lawyers update opinion clarifications"
  ON opinion_clarification_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- =====================================================
-- RLS: request_closures
-- 🔴 CRITICAL: Immutable once created
-- =====================================================

-- Client views closure of their request
CREATE POLICY "Clients view their request closures"
  ON request_closures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Lawyer views closures for their cases
CREATE POLICY "Lawyers view request closures"
  ON request_closures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- Admin view all
CREATE POLICY "Admins view all request closures"
  ON request_closures FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Client creates closures (closes their own requests)
CREATE POLICY "Clients close their requests"
  ON request_closures FOR INSERT
  WITH CHECK (
    closed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Admin can close any request
CREATE POLICY "Admins close any request"
  ON request_closures FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- 🔴 CRITICAL: NO UPDATE/DELETE on closures (immutable)

-- =====================================================
-- ENHANCED RLS: legal_requests (closed state)
-- =====================================================

-- 🔴 CRITICAL: Prevent updates to closed requests
CREATE POLICY "Prevent updates to closed requests"
  ON legal_requests FOR UPDATE
  USING (is_closed = false)
  WITH CHECK (is_closed = false);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Clients view only signed/published versions" ON opinion_versions 
  IS 'CRITICAL: Draft versions invisible to clients - only signed/published visible';

COMMENT ON POLICY "Update opinion versions only if not locked" ON opinion_versions 
  IS 'CRITICAL: Locked versions (signed) are read-only';

COMMENT ON POLICY "Lawyers view peer review comments" ON opinion_section_comments 
  IS 'CRITICAL: Peer review comments invisible to clients';

COMMENT ON POLICY "Prevent updates to closed requests" ON legal_requests 
  IS 'CRITICAL: Closed requests are immutable';

-- =====================================================
-- END PHASE 3 RLS POLICIES
-- =====================================================
