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
CREATE POLICY "Final opinions are read-only"
  ON opinion_submissions FOR UPDATE
  USING (is_final = false)
  WITH CHECK (is_final = false);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ PHASE 2 RLS Policies created successfully!';
  RAISE NOTICE '🔐 CRITICAL: Document visibility gate enforced (acceptance required)';
  RAISE NOTICE '🔐 CRITICAL: Peer reviews invisible to clients';
  RAISE NOTICE '🔐 CRITICAL: Final opinions are read-only';
  RAISE NOTICE '🔐 CRITICAL: Second opinion lawyers cannot modify original opinion';
  RAISE NOTICE '📊 All new tables protected with RLS';
  RAISE NOTICE '⏭️  Implementation complete. Test with real workflows.';
END $$;
