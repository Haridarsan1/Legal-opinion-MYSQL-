-- =====================================================
-- Add DELETE policy for legal_requests
-- This allows clients to delete their own requests
-- =====================================================

-- Clients can delete their own requests (only submitted/assigned status)
CREATE POLICY "Clients can delete own requests"
  ON legal_requests FOR DELETE
  USING (
    client_id = auth.uid()
    AND status IN ('submitted', 'assigned')
  );

-- Admins can delete any request
CREATE POLICY "Admins can delete requests"
  ON legal_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Also add DELETE policy for documents (users can delete their own uploads)
CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (
    uploaded_by = auth.uid()
  );

-- Admins can delete any document
CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ DELETE policies added successfully!';
  RAISE NOTICE '🗑️  Clients can now delete their own requests (submitted/assigned only)';
  RAISE NOTICE '🗑️  Users can now delete their own uploaded documents';
END $$;
