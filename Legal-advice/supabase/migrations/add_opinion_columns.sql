-- Add opinion-related columns to legal_requests table
-- Run this FIRST before the test opinion script

ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS opinion_text TEXT,
ADD COLUMN IF NOT EXISTS opinion_submitted_at TIMESTAMPTZ;

-- Create index for faster queries on opinion submissions
CREATE INDEX IF NOT EXISTS idx_legal_requests_opinion_submitted 
ON legal_requests(opinion_submitted_at) 
WHERE opinion_submitted_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN legal_requests.opinion_text IS 'The full legal opinion text submitted by the lawyer';
COMMENT ON COLUMN legal_requests.opinion_submitted_at IS 'Timestamp when the opinion was submitted';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'legal_requests'
AND column_name IN ('opinion_text', 'opinion_submitted_at')
ORDER BY column_name;
