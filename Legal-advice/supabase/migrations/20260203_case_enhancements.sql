-- Migration: Case Enhancements
-- Date: 2026-02-03
-- Description: Add case type classification and enhanced lawyer acceptance tracking

-- Create case_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE case_type AS ENUM (
        'property',
        'corporate',
        'banking',
        'tax',
        'employment',
        'intellectual_property'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to legal_requests
ALTER TABLE legal_requests 
    ADD COLUMN IF NOT EXISTS case_type case_type,
    ADD COLUMN IF NOT EXISTS lawyer_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS lawyer_rejected_at TIMESTAMPTZ;

-- Add new status values to request_status enum
DO $$ BEGIN
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'documents_pending';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'clarification_raised';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'drafting_opinion';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'opinion_sent';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create index for case_type filtering
CREATE INDEX IF NOT EXISTS idx_legal_requests_case_type ON legal_requests(case_type);

-- Create index for lawyer acceptance status
CREATE INDEX IF NOT EXISTS idx_legal_requests_lawyer_acceptance ON legal_requests(lawyer_acceptance_status);

COMMENT ON COLUMN legal_requests.case_type IS 'Type of legal case for specialized handling and document requirements';
COMMENT ON COLUMN legal_requests.lawyer_accepted_at IS 'Timestamp when lawyer accepted the case';
COMMENT ON COLUMN legal_requests.lawyer_rejected_at IS 'Timestamp when lawyer rejected the case';
