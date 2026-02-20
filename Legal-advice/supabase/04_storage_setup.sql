-- =====================================================
-- Legal Opinion Portal - Storage Configuration
-- =====================================================
-- Run this manually in Supabase Storage Dashboard
-- OR via SQL for storage policies
-- =====================================================

-- =====================================================
-- STORAGE BUCKET SETUP
-- =====================================================

-- Create bucket named "legal-documents" in Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "Create Bucket"
-- 3. Name: "legal-documents"
-- 4. Public: NO (keep private)
-- 5. File size limit: 10 MB
-- 6. Allowed MIME types: application/pdf, image/png, image/jpeg, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- =====================================================
-- STORAGE POLICIES - RLS for storage.objects
-- =====================================================

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'legal-documents'
  AND auth.uid() IS NOT NULL
);

-- Users can view documents they uploaded or are related to their requests
CREATE POLICY "Users can view related documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'legal-documents'
  AND (
    -- User uploaded the file
    owner = auth.uid()
    OR
    -- User is involved in the request (check via documents table)
    EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.legal_requests lr ON lr.id = d.request_id
      WHERE d.file_path = storage.objects.name
      AND (
        lr.client_id = auth.uid()
        OR lr.assigned_lawyer_id = auth.uid()
        OR lr.assigned_firm_id = auth.uid()
      )
    )
    OR
    -- User is admin
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Users can delete documents they uploaded (before final submission)
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'legal-documents'
  AND owner = auth.uid()
);

-- =====================================================
-- STORAGE HELPER FUNCTIONS
-- =====================================================

-- Function to get signed URL for document download
CREATE OR REPLACE FUNCTION get_document_url(file_path TEXT, expires_in INTEGER DEFAULT 3600)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- This is a placeholder - actual signed URL generation
  -- happens in the application layer using Supabase client
  RETURN '/storage/v1/object/sign/legal-documents/' || file_path;
END;
$$;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📦 STORAGE SETUP INSTRUCTIONS';
  RAISE NOTICE '================================';
  RAISE NOTICE '';
  RAISE NOTICE '1️⃣  Create Storage Bucket (Supabase Dashboard):';
  RAISE NOTICE '   - Go to: Storage → Create Bucket';
  RAISE NOTICE '   - Name: "legal-documents"';
  RAISE NOTICE '   - Public: NO';
  RAISE NOTICE '   - Max file size: 10 MB';
  RAISE NOTICE '   - Allowed types: PDF, PNG, JPG, DOC, DOCX';
  RAISE NOTICE '';
  RAISE NOTICE '2️⃣  Verify Storage Policies (above SQL):';
  RAISE NOTICE '   ✅ Upload policy: authenticated users';
  RAISE NOTICE '   ✅ View policy: request participants';
  RAISE NOTICE '   ✅ Delete policy: file owners';
  RAISE NOTICE '';
  RAISE NOTICE '3️⃣  Test in Application:';
  RAISE NOTICE '   - Upload a file via FileUploader component';
  RAISE NOTICE '   - Verify file appears in Storage dashboard';
  RAISE NOTICE '   - Verify download works for authorized users';
  RAISE NOTICE '';
  RAISE NOTICE '⏭️  Next step: Run 05_realtime_setup.sql';
END $$;
