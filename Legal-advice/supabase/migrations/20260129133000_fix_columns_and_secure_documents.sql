-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
    -- If 'document_name' exists and 'title' does not, rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'document_name') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'title') THEN
            ALTER TABLE public.document_requests RENAME COLUMN document_name TO title;
        ELSE
            -- Both exist? Make document_name nullable or migrate data
            -- Copy data from document_name to title if title is empty
            UPDATE public.document_requests SET title = document_name WHERE title IS NULL OR title = 'Untitled';
            -- Make document_name nullable so we don't hit the error
            ALTER TABLE public.document_requests ALTER COLUMN document_name DROP NOT NULL;
        END IF;
    END IF;

    -- Ensure 'title' is NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'title') THEN
        ALTER TABLE public.document_requests ALTER COLUMN title SET NOT NULL;
    END IF;

END $$;

-- Verify RLS for documents table to match user requirements
-- "stored in bucket ... only viewed by lawyer"
-- "second lawyer can view ... from case link"

-- Update documents RLS policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 1. Lawyer can view documents for cases they are assigned to
DROP POLICY IF EXISTS "Lawyers can view documents for their cases" ON documents;
CREATE POLICY "Lawyers can view documents for their cases" ON documents
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM legal_requests lr
            WHERE lr.id = documents.request_id
            AND (
                lr.assigned_lawyer_id = auth.uid() 
                OR 
                lr.assigned_firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid())
            )
        )
    );

-- 2. Client can view documents they uploaded OR documents shared with them?
-- User said: "It should be only viewed by the lawyer" -> maybe client uploads but can't see other docs?
-- "in the request client will attach the file ... so it will be sent to lawyer" -> Client needs INSERT permission.
-- Client definitely needs SELECT permission for their OWN uploads to verify/manage.
DROP POLICY IF EXISTS "Clients can view their own uploads" ON documents;
CREATE POLICY "Clients can view their own uploads" ON documents
    FOR SELECT
    TO authenticated
    USING (uploaded_by = auth.uid());

-- 3. Clients can INSERT documents for their cases
DROP POLICY IF EXISTS "Clients can upload documents" ON documents;
CREATE POLICY "Clients can upload documents" ON documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        uploaded_by = auth.uid()
        AND
        EXISTS (
            SELECT 1 FROM legal_requests lr
            WHERE lr.id = documents.request_id
            AND lr.client_id = auth.uid()
        )
    );

-- 4. Lawyers can INSERT documents (e.g. opinions)
DROP POLICY IF EXISTS "Lawyers can upload documents" ON documents;
CREATE POLICY "Lawyers can upload documents" ON documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM legal_requests lr
            WHERE lr.id = documents.request_id
            AND (lr.assigned_lawyer_id = auth.uid() OR lr.assigned_firm_id IN (SELECT firm_id FROM profiles WHERE id = auth.uid()))
        )
    );

-- Force reload again
NOTIFY pgrst, 'reload schema';
