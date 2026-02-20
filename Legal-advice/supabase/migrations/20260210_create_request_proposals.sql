-- =====================================================
-- Request Proposals System - Enhanced Marketplace
-- =====================================================
-- Migration: Create request_proposals table
-- This replaces/enhances public_case_claims with proposal-based system
-- Run after: 11_public_request_marketplace.sql
-- =====================================================

-- =====================================================
-- 1. CREATE REQUEST_PROPOSALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS request_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Proposal Details
    proposed_fee NUMERIC(15,2) NOT NULL,
    timeline_days INTEGER NOT NULL,
    proposal_message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Status Management
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(request_id, lawyer_id),
    CHECK (proposed_fee > 0),
    CHECK (timeline_days > 0),
    CHECK (char_length(proposal_message) >= 50)
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_proposals_request ON request_proposals(request_id);
CREATE INDEX IF NOT EXISTS idx_proposals_lawyer ON request_proposals(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON request_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON request_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_request_status ON request_proposals(request_id, status);

-- =====================================================
-- 3. ADD COLUMNS TO LEGAL_REQUESTS
-- =====================================================

-- Add visibility column (private/public)
ALTER TABLE legal_requests 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public'));

-- Add proposal deadline
ALTER TABLE legal_requests 
ADD COLUMN IF NOT EXISTS proposal_deadline TIMESTAMPTZ;

-- Update existing public requests to use visibility
UPDATE legal_requests
SET visibility = 'public'
WHERE request_type = 'public'
AND visibility IS NULL;

-- Update existing private/direct requests
UPDATE legal_requests
SET visibility = 'private'
WHERE request_type = 'direct'
AND visibility IS NULL;

-- Create index for visibility
CREATE INDEX IF NOT EXISTS idx_legal_requests_visibility ON legal_requests(visibility);
CREATE INDEX IF NOT EXISTS idx_legal_requests_proposal_deadline ON legal_requests(proposal_deadline) WHERE proposal_deadline IS NOT NULL;

-- =====================================================
-- 4. CREATE UPDATED_AT TRIGGER
-- =====================================================

CREATE TRIGGER request_proposals_updated_at
  BEFORE UPDATE ON request_proposals
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- 5. TRIGGER: ENFORCE ONLY ONE ACCEPTED PROPOSAL
-- =====================================================

CREATE OR REPLACE FUNCTION enforce_only_one_accepted_proposal()
RETURNS TRIGGER AS $$
BEGIN
    -- Only enforce if trying to set status to 'accepted'
    IF NEW.status = 'accepted' THEN
        -- Check if there's already an accepted proposal for this request (other than this one)
        IF EXISTS (
            SELECT 1 FROM request_proposals
            WHERE request_id = NEW.request_id
            AND status = 'accepted'
            AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'Only one proposal can be accepted per request';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_only_one_accepted_proposal
  BEFORE INSERT OR UPDATE ON request_proposals
  FOR EACH ROW
  EXECUTE FUNCTION enforce_only_one_accepted_proposal();

-- =====================================================
-- 6. FUNCTION: CREATE PROPOSAL
-- =====================================================

CREATE OR REPLACE FUNCTION create_proposal(
    p_request_id UUID,
    p_lawyer_id UUID,
    p_proposed_fee NUMERIC,
    p_timeline_days INTEGER,
    p_proposal_message TEXT,
    p_attachments JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE (
    success BOOLEAN,
    error TEXT,
    proposal_id UUID
) AS $$
DECLARE
    v_request_record RECORD;
    v_proposal_id UUID;
BEGIN
    -- Verify request exists and is public
    SELECT id, visibility, status, proposal_deadline INTO v_request_record
    FROM legal_requests
    WHERE id = p_request_id
    FOR UPDATE;
    
    IF v_request_record IS NULL THEN
        RETURN QUERY SELECT false, 'Request not found'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Verify request is public
    IF v_request_record.visibility != 'public' THEN
        RETURN QUERY SELECT false, 'Request is not public'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Verify request is accepting proposals
    IF v_request_record.status NOT IN ('submitted', 'assigned') THEN
        RETURN QUERY SELECT false, 'Request is no longer accepting proposals'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Verify deadline hasn't passed
    IF v_request_record.proposal_deadline IS NOT NULL AND v_request_record.proposal_deadline < NOW() THEN
        RETURN QUERY SELECT false, 'Proposal deadline has passed'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if lawyer already submitted a proposal
    IF EXISTS (
        SELECT 1 FROM request_proposals
        WHERE request_id = p_request_id 
        AND lawyer_id = p_lawyer_id 
        AND status NOT IN ('withdrawn')
    ) THEN
        RETURN QUERY SELECT false, 'You have already submitted a proposal for this request'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Insert proposal
    INSERT INTO request_proposals (
        request_id,
        lawyer_id,
        proposed_fee,
        timeline_days,
        proposal_message,
        attachments
    ) VALUES (
        p_request_id,
        p_lawyer_id,
        p_proposed_fee,
        p_timeline_days,
        p_proposal_message,
        p_attachments
    ) RETURNING id INTO v_proposal_id;
    
    -- Update request status if first proposal
    UPDATE legal_requests
    SET public_status = 'LAWYERS_INTERESTED'
    WHERE id = p_request_id 
    AND public_status = 'PUBLIC_OPEN';
    
    -- Create notification for client
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_request_id
    ) VALUES (
        (SELECT client_id FROM legal_requests WHERE id = p_request_id),
        'proposal_received',
        'New Proposal Received',
        'A lawyer has submitted a proposal for your request. Review it now!',
        p_request_id
    );
    
    RETURN QUERY SELECT true, NULL::TEXT, v_proposal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FUNCTION: ACCEPT PROPOSAL
-- =====================================================

CREATE OR REPLACE FUNCTION accept_proposal(
    p_proposal_id UUID,
    p_client_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    error TEXT
) AS $$
DECLARE
    v_proposal_record RECORD;
    v_request_record RECORD;
BEGIN
    -- Get proposal details
    SELECT id, request_id, lawyer_id, status INTO v_proposal_record
    FROM request_proposals
    WHERE id = p_proposal_id
    FOR UPDATE;
    
    IF v_proposal_record IS NULL THEN
        RETURN QUERY SELECT false, 'Proposal not found'::TEXT;
        RETURN;
    END IF;
    
    -- Verify request belongs to client
    SELECT id, client_id INTO v_request_record
    FROM legal_requests
    WHERE id = v_proposal_record.request_id
    AND client_id = p_client_id
    FOR UPDATE;
    
    IF v_request_record IS NULL THEN
        RETURN QUERY SELECT false, 'Request not found or does not belong to you'::TEXT;
        RETURN;
    END IF;
    
    -- Verify proposal is pending or shortlisted
    IF v_proposal_record.status NOT IN ('submitted', 'shortlisted') THEN
        RETURN QUERY SELECT false, 'Proposal is no longer available for selection'::TEXT;
        RETURN;
    END IF;
    
    -- Mark this proposal as accepted
    UPDATE request_proposals
    SET status = 'accepted', updated_at = NOW()
    WHERE id = p_proposal_id;
    
    -- Reject all other proposals
    UPDATE request_proposals
    SET status = 'rejected', updated_at = NOW()
    WHERE request_id = v_proposal_record.request_id 
    AND id != p_proposal_id 
    AND status IN ('submitted', 'shortlisted');
    
    -- Update request
    UPDATE legal_requests
    SET 
        assigned_lawyer_id = v_proposal_record.lawyer_id,
        assigned_at = NOW(),
        status = 'assigned',
        visibility = 'private',
        public_status = 'ASSIGNED'
    WHERE id = v_proposal_record.request_id;
    
    -- Notify selected lawyer
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_request_id
    ) VALUES (
        v_proposal_record.lawyer_id,
        'proposal_accepted',
        'Proposal Accepted!',
        'Congratulations! The client has accepted your proposal. Start working on the case now.',
        v_proposal_record.request_id
    );
    
    -- Notify rejected lawyers
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_request_id
    )
    SELECT 
        lawyer_id,
        'proposal_rejected',
        'Proposal Not Selected',
        'The client has selected another lawyer for this request.',
        request_id
    FROM request_proposals
    WHERE request_id = v_proposal_record.request_id
    AND status = 'rejected'
    AND lawyer_id != v_proposal_record.lawyer_id;
    
    -- Create audit log
    INSERT INTO audit_logs (
        user_id,
        request_id,
        action,
        details
    ) VALUES (
        p_client_id,
        v_proposal_record.request_id,
        'proposal_accepted',
        jsonb_build_object(
            'proposal_id', p_proposal_id,
            'lawyer_id', v_proposal_record.lawyer_id
        )
    );
    
    RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FUNCTION: WITHDRAW PROPOSAL
-- =====================================================

CREATE OR REPLACE FUNCTION withdraw_proposal(
    p_proposal_id UUID,
    p_lawyer_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    error TEXT
) AS $$
DECLARE
    v_proposal_record RECORD;
BEGIN
    -- Get proposal details
    SELECT id, request_id, lawyer_id, status INTO v_proposal_record
    FROM request_proposals
    WHERE id = p_proposal_id 
    AND lawyer_id = p_lawyer_id
    FOR UPDATE;
    
    IF v_proposal_record IS NULL THEN
        RETURN QUERY SELECT false, 'Proposal not found or does not belong to you'::TEXT;
        RETURN;
    END IF;
    
    -- Cannot withdraw accepted proposals
    IF v_proposal_record.status = 'accepted' THEN
        RETURN QUERY SELECT false, 'Cannot withdraw an accepted proposal'::TEXT;
        RETURN;
    END IF;
    
    -- Cannot withdraw already rejected/withdrawn proposals
    IF v_proposal_record.status IN ('rejected', 'withdrawn') THEN
        RETURN QUERY SELECT false, 'Proposal is already withdrawn or rejected'::TEXT;
        RETURN;
    END IF;
    
    -- Mark as withdrawn
    UPDATE request_proposals
    SET status = 'withdrawn', updated_at = NOW()
    WHERE id = p_proposal_id;
    
    -- Notify client
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_request_id
    ) VALUES (
        (SELECT client_id FROM legal_requests WHERE id = v_proposal_record.request_id),
        'proposal_withdrawn',
        'Proposal Withdrawn',
        'A lawyer has withdrawn their proposal for your request.',
        v_proposal_record.request_id
    );
    
    RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE request_proposals IS 'Lawyer proposals for public legal requests - enhanced marketplace system';
COMMENT ON COLUMN request_proposals.proposed_fee IS 'Lawyer quoted fee for the legal service';
COMMENT ON COLUMN request_proposals.timeline_days IS 'Estimated days to complete the work';
COMMENT ON COLUMN request_proposals.proposal_message IS 'Lawyer pitch explaining their approach and qualifications';
COMMENT ON COLUMN request_proposals.attachments IS 'JSON array of uploaded documents/credentials';
COMMENT ON COLUMN request_proposals.status IS 'submitted, shortlisted, accepted, rejected, or withdrawn';

COMMENT ON FUNCTION create_proposal IS 'Allows lawyer to submit a proposal for a public request';
COMMENT ON FUNCTION accept_proposal IS 'Client accepts a proposal, assigns lawyer, rejects others';
COMMENT ON FUNCTION withdraw_proposal IS 'Lawyer withdraws their pending/shortlisted proposal';

-- =====================================================
-- 10. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Request Proposals system created successfully!';
  RAISE NOTICE '📊 Created table: request_proposals';
  RAISE NOTICE '📊 Added columns to legal_requests: visibility, proposal_deadline';
  RAISE NOTICE '⚙️  Created functions: create_proposal, accept_proposal, withdraw_proposal';
  RAISE NOTICE '🔒 Next step: Run RLS policies migration';
END $$;
