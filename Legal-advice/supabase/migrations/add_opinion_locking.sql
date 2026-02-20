-- Add opinion locking and versioning fields to legal_requests table
-- This prevents opinion resubmission and tracks opinion versions

ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS opinion_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS opinion_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS review_started_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_requests_opinion_locked 
ON legal_requests(opinion_locked) 
WHERE opinion_locked = TRUE;

CREATE INDEX IF NOT EXISTS idx_legal_requests_review_started 
ON legal_requests(review_started_at) 
WHERE review_started_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN legal_requests.opinion_locked IS 'Whether the opinion is locked from further edits after submission';
COMMENT ON COLUMN legal_requests.opinion_version IS 'Version number of the legal opinion (increments on revision)';
COMMENT ON COLUMN legal_requests.review_started_at IS 'Timestamp when lawyer explicitly started reviewing the case';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'legal_requests'
AND column_name IN ('opinion_locked', 'opinion_version', 'review_started_at')
ORDER BY column_name;
