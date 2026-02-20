-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- Ensure status column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'status') THEN
        ALTER TABLE public.document_requests ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled'));
    END IF;
END $$;

-- Re-grant permissions just in case
GRANT ALL ON public.document_requests TO authenticated;
