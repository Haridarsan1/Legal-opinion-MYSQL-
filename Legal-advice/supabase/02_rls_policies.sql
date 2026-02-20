-- =====================================================
-- Legal Opinion Portal - Row Level Security Policies
-- =====================================================
-- Run this AFTER 01_schema.sql
-- =====================================================

-- =====================================================
-- ENABLE RLS on all tables
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES - Row Level Security
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert profiles (for user management)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DEPARTMENTS - Row Level Security
-- =====================================================

-- Everyone can view active departments
CREATE POLICY "Anyone can view active departments"
  ON departments FOR SELECT
  USING (active = true);

-- Admins can manage departments
CREATE POLICY "Admins can manage departments"
  ON departments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- LEGAL_REQUESTS - Row Level Security
-- =====================================================

-- Clients can view their own requests
CREATE POLICY "Clients can view own requests"
  ON legal_requests FOR SELECT
  USING (
    client_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('client')
    )
  );

-- Clients can create requests
CREATE POLICY "Clients can create requests"
  ON legal_requests FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('client', 'bank')
    )
  );

-- Lawyers can view assigned requests
CREATE POLICY "Lawyers can view assigned requests"
  ON legal_requests FOR SELECT
  USING (
    assigned_lawyer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'lawyer'
    )
  );

-- Firms can view requests assigned to their lawyers
CREATE POLICY "Firms can view assigned requests"
  ON legal_requests FOR SELECT
  USING (
    assigned_firm_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'firm'
    )
  );

-- Banks can view their own requests
CREATE POLICY "Banks can view own requests"
  ON legal_requests FOR SELECT
  USING (
    client_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'bank'
    )
  );

-- Lawyers and firms can update assigned requests (status, etc.)
CREATE POLICY "Lawyers can update assigned requests"
  ON legal_requests FOR UPDATE
  USING (
    assigned_lawyer_id = auth.uid()
    OR assigned_firm_id = auth.uid()
  );

-- Lawyers can claim unassigned submitted requests
CREATE POLICY "Lawyers can claim unassigned submitted requests"
  ON legal_requests FOR UPDATE
  USING (
    status = 'submitted'
    AND assigned_lawyer_id IS NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'lawyer'
    )
  );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON legal_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests"
  ON legal_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DOCUMENTS - Row Level Security
-- =====================================================

-- Users can view documents for requests they're involved in
CREATE POLICY "Users can view related documents"
  ON documents FOR SELECT
  USING (
    uploaded_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = documents.request_id
      AND (
        lr.client_id = auth.uid()
        OR lr.assigned_lawyer_id = auth.uid()
        OR lr.assigned_firm_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can upload documents for requests they're involved in
CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = documents.request_id
      AND (
        lr.client_id = auth.uid()
        OR lr.assigned_lawyer_id = auth.uid()
        OR lr.assigned_firm_id = auth.uid()
      )
    )
  );

-- =====================================================
-- RATINGS - Row Level Security
-- =====================================================

-- Clients can create ratings for their requests
CREATE POLICY "Clients can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM legal_requests
      WHERE id = ratings.request_id
      AND client_id = auth.uid()
      AND status IN ('delivered', 'completed')
    )
  );

-- Users can view ratings for requests they're involved in
CREATE POLICY "Users can view related ratings"
  ON ratings FOR SELECT
  USING (
    client_id = auth.uid()
    OR lawyer_id = auth.uid()
    OR firm_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- NOTIFICATIONS - Row Level Security
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can create notifications for any user
-- (This would typically be done via a service role key)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- AUDIT_LOGS - Row Level Security
-- =====================================================

-- Users can view audit logs for their requests
CREATE POLICY "Users can view related audit logs"
  ON audit_logs FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = audit_logs.request_id
      AND (
        lr.client_id = auth.uid()
        OR lr.assigned_lawyer_id = auth.uid()
        OR lr.assigned_firm_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'firm', 'bank')
    )
  );

-- System can create audit logs
CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- CLARIFICATIONS - Row Level Security
-- =====================================================

-- Users can view clarifications for requests they're involved in
CREATE POLICY "Users can view related clarifications"
  ON clarifications FOR SELECT
  USING (
    requester_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = clarifications.request_id
      AND (
        lr.client_id = auth.uid()
        OR lr.assigned_lawyer_id = auth.uid()
        OR lr.assigned_firm_id = auth.uid()
      )
    )
  );

-- Lawyers can create clarification requests
CREATE POLICY "Lawyers can create clarifications"
  ON clarifications FOR INSERT
  WITH CHECK (
    requester_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('lawyer', 'firm')
    )
  );

-- Clients can update clarifications (add responses)
CREATE POLICY "Clients can respond to clarifications"
  ON clarifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = clarifications.request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Lawyers can update (resolve) clarifications they created
CREATE POLICY "Lawyers can update own clarifications"
  ON clarifications FOR UPDATE
  USING (requester_id = auth.uid())
  WITH CHECK (requester_id = auth.uid());

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Row Level Security policies created successfully!';
  RAISE NOTICE '🔒 All tables are now protected with RLS';
  RAISE NOTICE '👥 Policies configured for: client, lawyer, firm, bank, admin';
  RAISE NOTICE '⏭️  Next step: Run 03_auth_trigger.sql';
END $$;
