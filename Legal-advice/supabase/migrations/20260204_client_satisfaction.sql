-- Migration: Client Satisfaction Confirmation
-- Date: 2026-02-04
-- Description: Adds 'no_further_queries_confirmed' status and 'client_confirmed_at' column to legal_requests.

-- 1. Add new status value to request_status enum
DO $$ BEGIN
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'no_further_queries_confirmed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add client_confirmed_at column to legal_requests
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'legal_requests' 
        AND column_name = 'client_confirmed_at'
    ) THEN
        ALTER TABLE legal_requests ADD COLUMN client_confirmed_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Comments
COMMENT ON COLUMN legal_requests.client_confirmed_at IS 'Timestamp when the client confirmed they have no further queries';
