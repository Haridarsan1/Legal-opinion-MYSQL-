-- Enhance documents table with review status tracking
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Create indexes for review queries
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON documents(review_status);
CREATE INDEX IF NOT EXISTS idx_documents_reviewed_by ON documents(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_documents_reviewed_at ON documents(reviewed_at DESC);

-- Add comments
COMMENT ON COLUMN documents.reviewed_by IS 'Lawyer who reviewed this document';
COMMENT ON COLUMN documents.reviewed_at IS 'Timestamp when document was reviewed';
COMMENT ON COLUMN documents.review_status IS 'Review status: pending, reviewed, approved, rejected';
COMMENT ON COLUMN documents.review_notes IS 'Notes from the reviewer';

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'documents'
AND column_name IN ('reviewed_by', 'reviewed_at', 'review_status', 'review_notes')
ORDER BY column_name;
