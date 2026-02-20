-- Enable RLS
ALTER TABLE clarifications ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can see clarifications for their own cases
CREATE POLICY "Clients can view clarifications for their cases" ON clarifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = clarifications.request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Policy: Lawyers can see clarifications for assigned cases
CREATE POLICY "Lawyers can view clarifications for assigned cases" ON clarifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = clarifications.request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- Policy: Lawyers can insert clarifications for assigned cases
CREATE POLICY "Lawyers can create clarifications for assigned cases" ON clarifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = clarifications.request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- Policy: Clients can insert clarifications (responses) for their cases
CREATE POLICY "Clients can create clarifications for their cases" ON clarifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = clarifications.request_id
      AND lr.client_id = auth.uid()
    )
  );

-- Policy: Lawyers can update clarifications (mark resolved) for assigned cases
CREATE POLICY "Lawyers can update clarifications for assigned cases" ON clarifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = clarifications.request_id
      AND lr.assigned_lawyer_id = auth.uid()
    )
  );

-- Policy: Clients can update clarifications (respond) for their cases
CREATE POLICY "Clients can update clarifications for their cases" ON clarifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = clarifications.request_id
      AND lr.client_id = auth.uid()
    )
  );
