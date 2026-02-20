-- Add new statuses to request_status enum
-- We must add them one by one as they cannot be added in a single transaction block with other operations easily in some postgres versions, 
-- but DO block works fine.

DO $$
BEGIN
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'pending_lawyer_response';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'accepted';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'awaiting_payment';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'drafting';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'review';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'rejected';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'awarded';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'expired';
    ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'open';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns for Case Workflow
ALTER TABLE legal_requests 
ADD COLUMN IF NOT EXISTS proposal_id UUID REFERENCES request_proposals(id),
ADD COLUMN IF NOT EXISTS origin_request_id UUID REFERENCES legal_requests(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_requests_proposal_id ON legal_requests(proposal_id);
CREATE INDEX IF NOT EXISTS idx_legal_requests_origin_request_id ON legal_requests(origin_request_id);

-- Comment on columns
COMMENT ON COLUMN legal_requests.proposal_id IS 'Link to the accepted proposal that created this case';
COMMENT ON COLUMN legal_requests.origin_request_id IS 'Link to the original public request if this case was derived from one';
