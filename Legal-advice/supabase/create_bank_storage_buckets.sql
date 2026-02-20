-- ============================================================
-- Create Bank Storage Buckets
-- ============================================================

-- 1. Bank Logos Bucket (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank_logos', 'bank_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Bank Logos: Public read access
CREATE POLICY "Bank logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'bank_logos');

-- Bank Logos: Authenticated users can upload their own
CREATE POLICY "Banks can upload their own logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'bank_logos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Bank Logos: Banks can update their own logos
CREATE POLICY "Banks can update their own logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'bank_logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Bank Logos: Banks can delete their own logos
CREATE POLICY "Banks can delete their own logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'bank_logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Bank Documents Bucket (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank_documents', 'bank_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Bank Documents: Banks can read their own documents
CREATE POLICY "Banks can read their own documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'bank_documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Bank Documents: Banks can upload their own documents
CREATE POLICY "Banks can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'bank_documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Bank Documents: Banks can update their own documents
CREATE POLICY "Banks can update their own documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'bank_documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Bank Documents: Banks can delete their own documents
CREATE POLICY "Banks can delete their own documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'bank_documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify buckets
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id IN ('bank_logos', 'bank_documents');
