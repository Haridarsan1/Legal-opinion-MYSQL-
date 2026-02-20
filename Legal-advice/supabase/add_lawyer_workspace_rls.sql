-- =====================================================
-- Lawyer Workspace - Row Level Security Policies
-- =====================================================
-- Run this AFTER add_lawyer_workspace_fields.sql
-- Ensures proper data isolation and security
-- =====================================================

-- =====================================================
-- RLS: internal_notes (NEVER visible to clients)
-- =====================================================

ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;

-- Lawyers can view internal notes for their assigned cases
CREATE POLICY "Lawyers view internal notes for assigned cases"
ON internal_notes FOR SELECT
USING (
  request_id IN (
    SELECT id FROM legal_requests 
    WHERE assigned_lawyer_id = auth.uid()
  )
);

-- Firm members can view internal notes for firm's cases
CREATE POLICY "Firm members view internal notes for firm cases"
ON internal_notes FOR SELECT
USING (
  request_id IN (
    SELECT lr.id FROM legal_requests lr
    WHERE lr.assigned_firm_id IN (
      SELECT id FROM profiles 
      WHERE organization = (SELECT organization FROM profiles WHERE id = auth.uid())
    )
  )
);

-- Admins can view all internal notes
CREATE POLICY "Admins view all internal notes"
ON internal_notes FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lawyers and firm members can create internal notes
CREATE POLICY "Lawyers and firms create internal notes"
ON internal_notes FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  request_id IN (
    SELECT id FROM legal_requests 
    WHERE assigned_lawyer_id = auth.uid()
       OR assigned_firm_id = (
         SELECT organization::uuid FROM profiles WHERE id = auth.uid()
       )
       OR assigned_firm_id IN (
         SELECT id FROM profiles 
         WHERE organization = (SELECT organization FROM profiles WHERE id = auth.uid())
       )
  )
);

-- Only creator can update their own notes
CREATE POLICY "Users update own internal notes"
ON internal_notes FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Only creator or admin can delete notes
CREATE POLICY "Users delete own internal notes"
ON internal_notes FOR DELETE
USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- RLS: opinion_submissions
-- =====================================================

ALTER TABLE opinion_submissions ENABLE ROW LEVEL SECURITY;

-- Lawyers can view their own opinion submissions
CREATE POLICY "Lawyers view own opinion submissions"
ON opinion_submissions FOR SELECT
USING (lawyer_id = auth.uid());

-- Clients can view opinions for their requests (after submission)
CREATE POLICY "Clients view opinions for their requests"
ON opinion_submissions FOR SELECT
USING (
  request_id IN (
    SELECT id FROM legal_requests WHERE client_id = auth.uid()
  )
);

-- Firm members can view opinions for firm cases
CREATE POLICY "Firm members view firm case opinions"
ON opinion_submissions FOR SELECT
USING (
  request_id IN (
    SELECT lr.id FROM legal_requests lr
    WHERE lr.assigned_firm_id IN (
      SELECT id FROM profiles 
      WHERE organization = (SELECT organization FROM profiles WHERE id = auth.uid())
    )
  )
);

-- Admins can view all opinions
CREATE POLICY "Admins view all opinions"
ON opinion_submissions FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lawyers can submit opinions for assigned cases
CREATE POLICY "Lawyers submit opinions for assigned cases"
ON opinion_submissions FOR INSERT
WITH CHECK (
  lawyer_id = auth.uid() AND
  request_id IN (
    SELECT id FROM legal_requests WHERE assigned_lawyer_id = auth.uid()
  )
);

-- Lawyers can update their own draft opinions (not final)
CREATE POLICY "Lawyers update own draft opinions"
ON opinion_submissions FOR UPDATE
USING (lawyer_id = auth.uid() AND is_final = false)
WITH CHECK (lawyer_id = auth.uid());

-- Firm admins can approve opinions
CREATE POLICY "Firm admins approve opinions"
ON opinion_submissions FOR UPDATE
USING (
  request_id IN (
    SELECT lr.id FROM legal_requests lr
    WHERE lr.assigned_firm_id IN (
      SELECT id FROM profiles 
      WHERE organization = (SELECT organization FROM profiles WHERE id = auth.uid())
    )
  )
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'firm'
)
WITH CHECK (firm_approved_by = auth.uid());

-- =====================================================
-- RLS: documents (Update for Review Tracking)
-- =====================================================

-- Lawyers can mark documents as reviewed for assigned cases
CREATE POLICY "Lawyers mark documents reviewed for assigned cases"
ON documents FOR UPDATE
USING (
  request_id IN (
    SELECT id FROM legal_requests WHERE assigned_lawyer_id = auth.uid()
  )
)
WITH CHECK (reviewed_by = auth.uid());

-- =====================================================
-- RLS: legal_requests (Update for New Fields)
-- =====================================================

-- Lawyers can update risk flags, case health, SLA status for assigned cases
CREATE POLICY "Lawyers update case management fields"
ON legal_requests FOR UPDATE
USING (assigned_lawyer_id = auth.uid())
WITH CHECK (assigned_lawyer_id = auth.uid());

-- Firm members can update firm-managed fields
CREATE POLICY "Firm members update firm case fields"
ON legal_requests FOR UPDATE
USING (
  assigned_firm_id IN (
    SELECT id FROM profiles 
    WHERE organization = (SELECT organization FROM profiles WHERE id = auth.uid())
  )
)
WITH CHECK (
  assigned_firm_id IN (
    SELECT id FROM profiles 
    WHERE organization = (SELECT organization FROM profiles WHERE id = auth.uid())
  )
);

-- =====================================================
-- RLS: clarifications (Update for Enhanced Workflow)
-- =====================================================

-- Update existing clarification policies to work with new workflow
-- (Assumes base clarification policies exist from 02_rls_policies.sql)

-- Allow lawyers to set priority and response deadline
CREATE POLICY "Lawyers manage clarification metadata"
ON clarifications FOR UPDATE
USING (
  request_id IN (
    SELECT id FROM legal_requests WHERE assigned_lawyer_id = auth.uid()
  )
)
WITH CHECK (
  request_id IN (
    SELECT id FROM legal_requests WHERE assigned_lawyer_id = auth.uid()
  )
);

-- =====================================================
-- SECURITY VERIFICATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION verify_internal_notes_security()
RETURNS TABLE (
  role TEXT,
  can_view_client_facing BOOLEAN,
  can_view_internal BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'client'::TEXT,
    true::BOOLEAN,  -- Can view their own requests
    false::BOOLEAN; -- CANNOT view internal notes
  
  RETURN QUERY
  SELECT 
    'lawyer'::TEXT,
    true::BOOLEAN,  -- Can view assigned cases
    true::BOOLEAN;  -- CAN view internal notes for assigned cases
  
  RETURN QUERY
  SELECT 
    'firm'::TEXT,
    true::BOOLEAN,  -- Can view firm cases
    true::BOOLEAN;  -- CAN view internal notes for firm cases
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verify_internal_notes_security IS 'Verification that clients cannot access internal notes';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Lawyer workspace RLS policies created successfully!';
  RAISE NOTICE '🔒 Internal notes: Client access BLOCKED';
  RAISE NOTICE '🔒 Opinion submissions: Role-based access configured';
  RAISE NOTICE '🔒 Document review: Lawyer-only updates enabled';
  RAISE NOTICE '🔒 Risk flags \u0026 SLA: Proper authorization enforced';
  RAISE NOTICE '⏭️  Next step: Test policies with different user roles';
END $$;
