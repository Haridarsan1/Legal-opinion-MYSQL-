-- Create bucket if not exists (usually safe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('legal-documents', 'legal-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects
-- Note: We avoid "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY" as it requires ownership.
-- Usually RLS is already enabled on this table in Supabase.

-- 1. Views
DROP POLICY IF EXISTS "Authenticated users can view legal documents" ON storage.objects;
CREATE POLICY "Authenticated users can view legal documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'legal-documents');

-- 2. Uploads
DROP POLICY IF EXISTS "Authenticated users can upload legal documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload legal documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'legal-documents');

-- 3. Updates/Deletes
DROP POLICY IF EXISTS "Users can delete own legal documents" ON storage.objects;
CREATE POLICY "Users can delete own legal documents" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'legal-documents' AND owner = auth.uid());


-- Fix "Pending" status issue update policy (this part was fine)
DROP POLICY IF EXISTS "Update document requests" ON document_requests;
CREATE POLICY "Update document requests" ON document_requests
    FOR UPDATE
    TO authenticated
    USING (
        requested_by = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM legal_requests lr
            WHERE lr.id = request_id
            AND lr.client_id = auth.uid()
        )
    )
    WITH CHECK (
        requested_by = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM legal_requests lr
            WHERE lr.id = request_id
            AND lr.client_id = auth.uid()
        )
    );
