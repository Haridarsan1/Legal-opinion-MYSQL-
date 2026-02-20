-- Migration: Document Verification
-- Date: 2026-02-03
-- Description: Add document verification workflow with status and comments

-- Add verification fields to documents
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS lawyer_comment TEXT;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_documents_verification_status ON documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_documents_verified_by ON documents(verified_by);

-- Add function to auto-set verified_at timestamp
CREATE OR REPLACE FUNCTION set_document_verified_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_status IN ('verified', 'rejected') AND OLD.verification_status = 'pending' THEN
        NEW.verified_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-setting verified_at
DROP TRIGGER IF EXISTS trigger_set_document_verified_at ON documents;
CREATE TRIGGER trigger_set_document_verified_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    WHEN (NEW.verification_status IS DISTINCT FROM OLD.verification_status)
    EXECUTE FUNCTION set_document_verified_at();

COMMENT ON COLUMN documents.verification_status IS 'Lawyer verification status: pending, verified, or rejected';
COMMENT ON COLUMN documents.verified_by IS 'Lawyer who verified or rejected this document';
COMMENT ON COLUMN documents.verified_at IS 'Timestamp when document was verified or rejected';
COMMENT ON COLUMN documents.lawyer_comment IS 'Lawyer comments about verification or rejection reasons';
