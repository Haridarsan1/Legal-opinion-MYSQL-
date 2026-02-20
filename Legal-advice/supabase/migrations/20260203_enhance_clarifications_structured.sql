-- Migration: Structured Clarifications
-- Date: 2026-02-03
-- Description: Add structured fields for clarification management

-- Add structured fields to clarifications
ALTER TABLE clarifications
    ADD COLUMN IF NOT EXISTS related_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS resolution_status VARCHAR(20) DEFAULT 'open' CHECK (resolution_status IN ('open', 'responded', 'resolved')),
    ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_clarifications_related_document ON clarifications(related_document_id);
CREATE INDEX IF NOT EXISTS idx_clarifications_resolution_status ON clarifications(resolution_status);
CREATE INDEX IF NOT EXISTS idx_clarifications_due_date ON clarifications(due_date) WHERE due_date IS NOT NULL;

-- Update existing clarifications to set resolution status based on is_resolved
UPDATE clarifications 
SET resolution_status = CASE 
    WHEN is_resolved = true THEN 'resolved'
    WHEN response IS NOT NULL THEN 'responded'
    ELSE 'open'
END
WHERE resolution_status IS NULL;

COMMENT ON COLUMN clarifications.related_document_id IS 'Optional reference to specific document this clarification is about';
COMMENT ON COLUMN clarifications.due_date IS 'Expected response date for the clarification';
COMMENT ON COLUMN clarifications.resolution_status IS 'Current status: open (awaiting response), responded (client replied), resolved (lawyer acknowledged)';
COMMENT ON COLUMN clarifications.resolved_by IS 'Lawyer who marked this clarification as resolved';
COMMENT ON COLUMN clarifications.resolved_at IS 'Timestamp when clarification was marked as resolved';
