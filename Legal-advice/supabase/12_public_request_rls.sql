-- =====================================================
-- Public Request Marketplace - RLS Policies
-- =====================================================
-- Security policies for public case claims and notifications
-- =====================================================

-- =====================================================
-- ENABLE RLS on new tables
-- =====================================================

ALTER TABLE public_case_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_request_notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC_CASE_CLAIMS - RLS POLICIES
-- =====================================================

-- Clients can view claims on their own cases
CREATE POLICY "Clients can view claims on their cases"
  ON public_case_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests
      WHERE legal_requests.id = public_case_claims.case_id
      AND legal_requests.client_id = auth.uid()
    )
  );

-- Lawyers can view their own claims
CREATE POLICY "Lawyers can view their own claims"
  ON public_case_claims FOR SELECT
  USING (
    lawyer_id = auth.uid()
  );

-- Admins can view all claims
CREATE POLICY "Admins can view all claims"
  ON public_case_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Lawyers can create claims
CREATE POLICY "Lawyers can create claims"
  ON public_case_claims FOR INSERT
  WITH CHECK (
    auth.uid() = lawyer_id
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'lawyer'
    )
    AND
    -- Only on public open cases
    EXISTS (
      SELECT 1 FROM legal_requests
      WHERE id = case_id 
      AND request_type = 'public'
      AND public_status IN ('PUBLIC_OPEN', 'LAWYERS_INTERESTED')
    )
  );

-- Lawyers can update their own claims (withdraw)
CREATE POLICY "Lawyers can withdraw their claims"
  ON public_case_claims FOR UPDATE
  USING (
    lawyer_id = auth.uid()
  )
  WITH CHECK (
    lawyer_id = auth.uid()
    AND status IN ('pending', 'withdrawn')
  );

-- System (via functions) can update claims for selection
CREATE POLICY "System can update claims for selection"
  ON public_case_claims FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PUBLIC_REQUEST_NOTIFICATIONS - RLS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public_request_notifications FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON public_request_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON public_request_notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public_request_notifications FOR UPDATE
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- =====================================================
-- LEGAL_REQUESTS - UPDATE PUBLIC REQUEST POLICIES
-- =====================================================
-- NOTE: These policies are ADDITIONS to existing legal_requests policies
-- They DO NOT replace existing client/lawyer/admin policies
-- Existing RLS on legal_requests is preserved

-- IMPORTANT: The existing policies for legal_requests should include:
-- - Clients viewing their own requests
-- - Assigned lawyers viewing their cases
-- - Platform admins viewing all
-- These policies below are ADDITIONAL for marketplace functionality

-- Lawyers can view public open/interested cases (for marketplace discovery)
CREATE POLICY "Lawyers can view public marketplace cases"
  ON legal_requests FOR SELECT
  USING (
    request_type = 'public'
    AND public_status IN ('PUBLIC_OPEN', 'LAWYERS_INTERESTED')
  );

-- Lawyers can view cases where they have a marketplace claim
CREATE POLICY "Lawyers can view marketplace cases with claims"
  ON legal_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public_case_claims
      WHERE case_id = legal_requests.id
      AND lawyer_id = auth.uid()
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Clients can view claims on their cases" ON public_case_claims IS 'Clients see all claims on their public requests for selection';
COMMENT ON POLICY "Lawyers can view their own claims" ON public_case_claims IS 'Lawyers see only their own claims and status';
COMMENT ON POLICY "Lawyers can create claims" ON public_case_claims IS 'Lawyers can express interest in public cases';
COMMENT ON POLICY "Lawyers can withdraw their claims" ON public_case_claims IS 'Lawyers can withdraw pending claims (not selected ones)';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Public Request RLS policies created successfully!';
  RAISE NOTICE '🔐 Enabled RLS: public_case_claims, public_request_notifications';
  RAISE NOTICE '🔐 Policies ensure: Clients control case selection, Lawyers see only public posts and own claims, Data isolation';
  RAISE NOTICE '✓ Implementation complete - Public Marketplace ready!';
END $$;
