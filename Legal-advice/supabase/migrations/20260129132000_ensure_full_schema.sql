-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
    -- Ensure table exists (though previous migrations should have handled this)
    CREATE TABLE IF NOT EXISTS public.document_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        requested_by UUID REFERENCES auth.users(id),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure 'title' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'title') THEN
        ALTER TABLE public.document_requests ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled';
    END IF;

    -- Ensure 'description' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'description') THEN
        ALTER TABLE public.document_requests ADD COLUMN description TEXT;
    END IF;

    -- Ensure 'status' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'status') THEN
        ALTER TABLE public.document_requests ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled'));
    END IF;

    -- Ensure 'requested_by' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'requested_by') THEN
        ALTER TABLE public.document_requests ADD COLUMN requested_by UUID REFERENCES auth.users(id);
    END IF;

    -- Ensure 'request_id' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'request_id') THEN
        ALTER TABLE public.document_requests ADD COLUMN request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE;
    END IF;

END $$;

-- Enable RLS if not enabled
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

-- Grant permissions explicitly
GRANT ALL ON public.document_requests TO authenticated;
GRANT ALL ON public.document_requests TO service_role;

-- Force reload again just to be sure
NOTIFY pgrst, 'reload schema';
