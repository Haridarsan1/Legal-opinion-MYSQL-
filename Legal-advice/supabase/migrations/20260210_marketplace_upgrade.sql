-- Marketplace Upgrade Migration
-- Adds business metadata fields to legal_requests and creates saved_requests table

-- =====================================================
-- 0. Update Enums
-- =====================================================

-- Add 'accepting_proposals' to request_status enum if it doesn't exist
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'accepting_proposals';

-- =====================================================
-- 1. Add Business Metadata Fields to legal_requests
-- =====================================================

-- Budget Range
ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS budget_min NUMERIC(15,2) CHECK (budget_min >= 0),
ADD COLUMN IF NOT EXISTS budget_max NUMERIC(15,2) CHECK (budget_max >= budget_min);

-- Timeline & Deadline
ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS proposal_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expected_timeline_days INTEGER CHECK (expected_timeline_days > 0);

-- Complexity Level
DO $$ BEGIN
    CREATE TYPE complexity_level AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS complexity_level complexity_level DEFAULT 'medium';

-- Required Experience
ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS required_experience_years INTEGER CHECK (required_experience_years >= 0);

-- Confidentiality Type
DO $$ BEGIN
    CREATE TYPE confidentiality_type AS ENUM ('public', 'confidential', 'highly_confidential');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS confidentiality_type confidentiality_type DEFAULT 'public';

-- Industry & Jurisdiction
ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS industry_type TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction TEXT;

-- Expected Deliverables (stored as JSONB array)
ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS expected_deliverables JSONB DEFAULT '[]'::jsonb;

-- Attachment Count (denormalized for performance)
ALTER TABLE legal_requests
ADD COLUMN IF NOT EXISTS attachments_count INTEGER DEFAULT 0;

-- =====================================================
-- 2. Create Saved Requests Table (Bookmark System)
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    notes TEXT, -- Optional notes for the lawyer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one bookmark per lawyer per request
    UNIQUE(lawyer_id, request_id)
);

-- =====================================================
-- 3. Create Performance Indexes
-- =====================================================

-- Indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_requests_deadline 
    ON legal_requests(proposal_deadline) 
    WHERE proposal_deadline IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_complexity 
    ON legal_requests(complexity_level) 
    WHERE complexity_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_budget 
    ON legal_requests(budget_min, budget_max) 
    WHERE budget_min IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_experience 
    ON legal_requests(required_experience_years) 
    WHERE required_experience_years IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_visibility_status 
    ON legal_requests(visibility, status) 
    WHERE visibility = 'public';

-- Indexes for saved_requests
CREATE INDEX IF NOT EXISTS idx_saved_requests_lawyer 
    ON saved_requests(lawyer_id);

CREATE INDEX IF NOT EXISTS idx_saved_requests_request 
    ON saved_requests(request_id);

CREATE INDEX IF NOT EXISTS idx_saved_requests_created 
    ON saved_requests(created_at DESC);

-- =====================================================
-- 4. Row Level Security for saved_requests
-- =====================================================

ALTER TABLE saved_requests ENABLE ROW LEVEL SECURITY;

-- Lawyers can manage their own bookmarks
CREATE POLICY "lawyers_manage_own_bookmarks" ON saved_requests
FOR ALL USING (auth.uid() = lawyer_id);

-- =====================================================
-- 5. Helper Function - Update Attachments Count
-- =====================================================

-- Function to update attachments count when documents are added/removed
CREATE OR REPLACE FUNCTION update_request_attachments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE legal_requests
        SET attachments_count = attachments_count + 1
        WHERE id = NEW.request_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE legal_requests
        SET attachments_count = GREATEST(0, attachments_count - 1)
        WHERE id = OLD.request_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on documents table (if exists)
DO $$ BEGIN
    DROP TRIGGER IF EXISTS trigger_update_attachments_count ON documents;
    CREATE TRIGGER trigger_update_attachments_count
        AFTER INSERT OR DELETE ON documents
        FOR EACH ROW
        EXECUTE FUNCTION update_request_attachments_count();
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- =====================================================
-- 6. Helper Function - Check Proposal Deadline
-- =====================================================

-- Function to check if a request is still accepting proposals
CREATE OR REPLACE FUNCTION is_accepting_proposals(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    req RECORD;
BEGIN
    SELECT visibility, status, proposal_deadline
    INTO req
    FROM legal_requests
    WHERE id = request_id;
    
    IF req IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN req.visibility = 'public'
        AND req.status::text IN ('submitted', 'accepting_proposals') -- Cast to text to avoid enum safety check in same txn
        AND (req.proposal_deadline IS NULL OR req.proposal_deadline > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. Update Existing Data (Optional Defaults)
-- =====================================================

-- Set default proposal deadline for existing public requests (7 days from now)
UPDATE legal_requests
SET proposal_deadline = NOW() + INTERVAL '7 days'
WHERE visibility = 'public' 
    AND status IN ('submitted') -- Removed 'accepting_proposals' as it is new and no rows have it yet
    AND proposal_deadline IS NULL;

-- Initialize attachments count for existing requests
UPDATE legal_requests lr
SET attachments_count = (
    SELECT COUNT(*)
    FROM documents d
    WHERE d.request_id = lr.id
)
WHERE attachments_count = 0;

-- =====================================================
-- 8. Comments for Documentation
-- =====================================================

COMMENT ON COLUMN legal_requests.budget_min IS 'Minimum budget for the legal request (in currency)';
COMMENT ON COLUMN legal_requests.budget_max IS 'Maximum budget for the legal request (in currency)';
COMMENT ON COLUMN legal_requests.proposal_deadline IS 'Deadline for lawyers to submit proposals';
COMMENT ON COLUMN legal_requests.complexity_level IS 'Complexity rating: low, medium, or high';
COMMENT ON COLUMN legal_requests.required_experience_years IS 'Minimum years of experience required';
COMMENT ON COLUMN legal_requests.confidentiality_type IS 'Level of confidentiality required';
COMMENT ON COLUMN legal_requests.expected_deliverables IS 'Array of expected deliverable items';
COMMENT ON COLUMN legal_requests.attachments_count IS 'Denormalized count of attachments for performance';

COMMENT ON TABLE saved_requests IS 'Stores lawyer bookmarks for public requests';
COMMENT ON COLUMN saved_requests.notes IS 'Optional private notes by the lawyer about this request';
