-- Force schema cache reload by notifying PostgREST
NOTIFY pgrst, 'reload schema';

-- Create a dummy function to ensure schema change is detected if NOTIFY isn't sufficient
CREATE OR REPLACE FUNCTION public.force_schema_cache_reload()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Do nothing, just used to trigger cache invalidation
END;
$$;

-- Drop it immediately
DROP FUNCTION public.force_schema_cache_reload();

-- Re-apply column check just in case
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_requests' AND column_name = 'description') THEN
        ALTER TABLE public.document_requests ADD COLUMN description TEXT;
    END IF;
END $$;
