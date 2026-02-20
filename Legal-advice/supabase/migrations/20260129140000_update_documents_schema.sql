-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
    -- Add file_url if missing (store public URL for convenience)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_url') THEN
        ALTER TABLE public.documents ADD COLUMN file_url TEXT;
    END IF;

    -- Add review_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'review_status') THEN
        ALTER TABLE public.documents ADD COLUMN review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'rejected'));
    END IF;

    -- Add reviewed_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'reviewed_by') THEN
        ALTER TABLE public.documents ADD COLUMN reviewed_by UUID REFERENCES profiles(id);
    END IF;

    -- Add reviewed_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'reviewed_at') THEN
        ALTER TABLE public.documents ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;

    -- Add document_request_id if missing (it was in a previous migration but let's be safe as user flow depends on it)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'document_request_id') THEN
        ALTER TABLE public.documents ADD COLUMN document_request_id UUID REFERENCES document_requests(id);
    END IF;

END $$;

-- Make existing NOT NULL columns nullable temporarily OR ensure we provide them?
-- Ideally we provide them. But if file_path is redundant with file_url, maybe drop not null?
-- No, let's keep strictness. Code should provide file_path, file_size, file_type.
-- But just in case, let's ensure file_url is populated if empty? No, can't easily.

-- Force reload
NOTIFY pgrst, 'reload schema';
