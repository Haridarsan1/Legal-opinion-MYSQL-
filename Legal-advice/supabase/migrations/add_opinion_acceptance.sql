-- Add opinion acceptance tracking fields to legal_requests table
-- This enables clients to formally accept legal opinions and track that status

ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS opinion_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS opinion_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS opinion_accepted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS executive_summary TEXT;

-- Create index for faster queries on accepted opinions
CREATE INDEX IF NOT EXISTS idx_legal_requests_opinion_accepted 
ON legal_requests(opinion_accepted) 
WHERE opinion_accepted = TRUE;

-- Create index for opinion acceptance timestamp
CREATE INDEX IF NOT EXISTS idx_legal_requests_opinion_accepted_at 
ON legal_requests(opinion_accepted_at) 
WHERE opinion_accepted_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN legal_requests.opinion_accepted IS 'Whether the client has formally accepted the legal opinion';
COMMENT ON COLUMN legal_requests.opinion_accepted_at IS 'Timestamp when the opinion was accepted by the client';
COMMENT ON COLUMN legal_requests.opinion_accepted_by IS 'User ID of the client who accepted the opinion';
COMMENT ON COLUMN legal_requests.executive_summary IS 'Plain-language summary of the legal opinion for client understanding';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'legal_requests'
AND column_name IN ('opinion_accepted', 'opinion_accepted_at', 'opinion_accepted_by', 'executive_summary')
ORDER BY column_name;
