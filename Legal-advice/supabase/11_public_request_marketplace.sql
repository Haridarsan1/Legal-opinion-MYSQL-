-- =====================================================
-- Public Request Marketplace System
-- =====================================================
-- This migration adds support for public case requests
-- where clients can post cases and multiple lawyers
-- can express interest before one is selected.
-- =====================================================

-- =====================================================
-- NEW ENUMS
-- =====================================================

-- Request type: direct assignment or public marketplace
CREATE TYPE request_type AS ENUM ('direct', 'public');

-- Public case status
CREATE TYPE public_status AS ENUM (
    'PUBLIC_OPEN',
    'LAWYERS_INTERESTED',
    'LAWYER_SELECTED',
    'ASSIGNED',
    'EXPIRED'
);

-- Claim status
CREATE TYPE claim_status AS ENUM (
    'pending',
    'selected',
    'rejected',
    'withdrawn'
);

-- =====================================================
-- MIGRATE LEGAL_REQUESTS TABLE
-- =====================================================

-- Add new columns to legal_requests
ALTER TABLE legal_requests 
ADD COLUMN IF NOT EXISTS request_type request_type DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS public_status public_status,
ADD COLUMN IF NOT EXISTS selected_lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS public_posted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS public_expires_at TIMESTAMPTZ;

-- Set existing requests as 'direct' type
UPDATE legal_requests 
SET request_type = 'direct' 
WHERE request_type IS NULL;

-- Create index for public requests
CREATE INDEX IF NOT EXISTS idx_legal_requests_request_type ON legal_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_legal_requests_public_status ON legal_requests(public_status);
CREATE INDEX IF NOT EXISTS idx_legal_requests_selected_lawyer ON legal_requests(selected_lawyer_id);

-- =====================================================
-- NEW TABLE: PUBLIC_CASE_CLAIMS
-- =====================================================

CREATE TABLE IF NOT EXISTS public_case_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    interest_message TEXT NOT NULL,
    timeline_estimate TEXT,
    fee_estimate NUMERIC(15, 2),
    fee_currency TEXT DEFAULT 'INR',
    conflict_confirmed BOOLEAN NOT NULL DEFAULT false,
    
    status claim_status NOT NULL DEFAULT 'pending',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(case_id, lawyer_id) -- One claim per lawyer per case
);

-- Create indexes for public_case_claims
CREATE INDEX IF NOT EXISTS idx_public_case_claims_case ON public_case_claims(case_id);
CREATE INDEX IF NOT EXISTS idx_public_case_claims_lawyer ON public_case_claims(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_public_case_claims_status ON public_case_claims(status);
CREATE INDEX IF NOT EXISTS idx_public_case_claims_created_at ON public_case_claims(created_at DESC);

-- =====================================================
-- ADD TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER public_case_claims_updated_at
  BEFORE UPDATE ON public_case_claims
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- TRIGGER: ENFORCE ONLY ONE SELECTED CLAIM PER CASE
-- =====================================================

CREATE OR REPLACE FUNCTION enforce_only_one_selected_claim()
RETURNS TRIGGER AS $$
BEGIN
    -- Only enforce if trying to set status to 'selected'
    IF NEW.status = 'selected' THEN
        -- Check if there's already a selected claim for this case (other than this one)
        IF EXISTS (
            SELECT 1 FROM public_case_claims
            WHERE case_id = NEW.case_id
            AND status = 'selected'
            AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'Only one claim can be selected per case';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_only_one_selected_claim
  BEFORE INSERT OR UPDATE ON public_case_claims
  FOR EACH ROW
  EXECUTE FUNCTION enforce_only_one_selected_claim();

-- =====================================================
-- NEW TABLE: PUBLIC_REQUEST_NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public_request_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES public_case_claims(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL, -- 'claim_interest', 'lawyer_selected', 'claim_rejected', 'claim_withdrawn', 'case_expired'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_request_notifications_user ON public_request_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_public_request_notifications_case ON public_request_notifications(case_id);
CREATE INDEX IF NOT EXISTS idx_public_request_notifications_claim ON public_request_notifications(claim_id);

-- =====================================================
-- FUNCTION: CREATE PUBLIC REQUEST CLAIM
-- =====================================================

CREATE OR REPLACE FUNCTION create_public_claim(
    p_case_id UUID,
    p_lawyer_id UUID,
    p_interest_message TEXT,
    p_timeline_estimate TEXT,
    p_fee_estimate NUMERIC,
    p_fee_currency TEXT DEFAULT 'INR',
    p_conflict_confirmed BOOLEAN DEFAULT false
)
RETURNS TABLE (
    success BOOLEAN,
    error TEXT,
    claim_id UUID
) AS $$
DECLARE
    v_case_record RECORD;
    v_claim_id UUID;
BEGIN
    -- Verify case exists and is public
    SELECT id, public_status INTO v_case_record
    FROM legal_requests
    WHERE id = p_case_id AND request_type = 'public'
    FOR UPDATE;
    
    IF v_case_record IS NULL THEN
        RETURN QUERY SELECT false, 'Case not found or is not public'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Verify case is still open
    IF v_case_record.public_status NOT IN ('PUBLIC_OPEN', 'LAWYERS_INTERESTED') THEN
        RETURN QUERY SELECT false, 'Case is no longer accepting claims'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if lawyer already claimed
    IF EXISTS (
        SELECT 1 FROM public_case_claims
        WHERE case_id = p_case_id AND lawyer_id = p_lawyer_id AND status != 'withdrawn'
    ) THEN
        RETURN QUERY SELECT false, 'You have already claimed this case'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Insert claim
    INSERT INTO public_case_claims (
        case_id,
        lawyer_id,
        interest_message,
        timeline_estimate,
        fee_estimate,
        fee_currency,
        conflict_confirmed
    ) VALUES (
        p_case_id,
        p_lawyer_id,
        p_interest_message,
        p_timeline_estimate,
        p_fee_estimate,
        p_fee_currency,
        p_conflict_confirmed
    ) RETURNING public_case_claims.id INTO v_claim_id;
    
    -- Update case status to LAWYERS_INTERESTED if first claim
    UPDATE legal_requests
    SET public_status = 'LAWYERS_INTERESTED'
    WHERE id = p_case_id AND public_status = 'PUBLIC_OPEN';
    
    -- Create notification for client
    INSERT INTO public_request_notifications (
        user_id,
        case_id,
        claim_id,
        type,
        title,
        message
    ) VALUES (
        (SELECT client_id FROM legal_requests WHERE id = p_case_id),
        p_case_id,
        v_claim_id,
        'claim_interest',
        'New lawyer interested in your case',
        'A lawyer has expressed interest in your case. Review their proposal in your dashboard.'
    );
    
    RETURN QUERY SELECT true, NULL::TEXT, v_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: SELECT LAWYER FOR PUBLIC REQUEST
-- =====================================================

CREATE OR REPLACE FUNCTION select_lawyer_for_public_request(
    p_case_id UUID,
    p_claim_id UUID,
    p_client_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    error TEXT
) AS $$
DECLARE
    v_case_record RECORD;
    v_claim_record RECORD;
    v_rejected_lawyer_id UUID;
    v_rejected_claim_record RECORD;
BEGIN
    -- Verify case exists and belongs to client
    SELECT id, public_status, selected_lawyer_id INTO v_case_record
    FROM legal_requests
    WHERE id = p_case_id AND client_id = p_client_id AND request_type = 'public'
    FOR UPDATE;
    
    IF v_case_record IS NULL THEN
        RETURN QUERY SELECT false, 'Case not found or does not belong to you'::TEXT;
        RETURN;
    END IF;
    
    -- Verify claim exists and is for this case
    SELECT id, lawyer_id, status INTO v_claim_record
    FROM public_case_claims
    WHERE id = p_claim_id AND case_id = p_case_id AND status = 'pending'
    FOR UPDATE;
    
    IF v_claim_record IS NULL THEN
        RETURN QUERY SELECT false, 'Claim not found or is no longer pending'::TEXT;
        RETURN;
    END IF;
    
    -- Start transaction: select this claim and reject others
    -- Mark selected claim as selected
    UPDATE public_case_claims
    SET status = 'selected', updated_at = NOW()
    WHERE id = p_claim_id;
    
    -- Reject all other pending claims
    UPDATE public_case_claims
    SET status = 'rejected', updated_at = NOW()
    WHERE case_id = p_case_id AND id != p_claim_id AND status = 'pending';
    
    -- Update case
    UPDATE legal_requests
    SET 
        public_status = 'ASSIGNED',
        selected_lawyer_id = v_claim_record.lawyer_id,
        assigned_lawyer_id = v_claim_record.lawyer_id,
        assigned_at = NOW(),
        status = 'assigned'
    WHERE id = p_case_id;
    
    -- Notify selected lawyer
    INSERT INTO public_request_notifications (
        user_id,
        case_id,
        claim_id,
        type,
        title,
        message
    ) VALUES (
        v_claim_record.lawyer_id,
        p_case_id,
        p_claim_id,
        'lawyer_selected',
        'You have been selected for a case!',
        'Client has selected your proposal. Start working on the case immediately.'
    );
    
    -- Notify rejected lawyers
    FOR v_rejected_claim_record IN
        SELECT lawyer_id FROM public_case_claims
        WHERE case_id = p_case_id AND status = 'rejected'
    LOOP
        INSERT INTO public_request_notifications (
            user_id,
            case_id,
            claim_id,
            type,
            title,
            message
        ) VALUES (
            v_rejected_claim_record.lawyer_id,
            p_case_id,
            NULL,
            'claim_rejected',
            'Client selected another lawyer',
            'Unfortunately, the client selected another lawyer for this case.'
        );
    END LOOP;
    
    RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: WITHDRAW CLAIM
-- =====================================================

CREATE OR REPLACE FUNCTION withdraw_public_claim(
    p_claim_id UUID,
    p_lawyer_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    error TEXT
) AS $$
DECLARE
    v_claim_record RECORD;
BEGIN
    -- Verify claim exists and belongs to lawyer
    SELECT id, case_id, status INTO v_claim_record
    FROM public_case_claims
    WHERE id = p_claim_id AND lawyer_id = p_lawyer_id
    FOR UPDATE;
    
    IF v_claim_record IS NULL THEN
        RETURN QUERY SELECT false, 'Claim not found'::TEXT;
        RETURN;
    END IF;
    
    IF v_claim_record.status NOT IN ('pending', 'selected') THEN
        RETURN QUERY SELECT false, 'Cannot withdraw this claim'::TEXT;
        RETURN;
    END IF;
    
    -- Cannot withdraw if already selected
    IF v_claim_record.status = 'selected' THEN
        RETURN QUERY SELECT false, 'Cannot withdraw a selected claim'::TEXT;
        RETURN;
    END IF;
    
    -- Mark as withdrawn
    UPDATE public_case_claims
    SET status = 'withdrawn', updated_at = NOW()
    WHERE id = p_claim_id;
    
    RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: EXPIRE PUBLIC REQUESTS
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_public_requests()
RETURNS TABLE (
    expired_count INTEGER
) AS $$
DECLARE
    v_expired_count INTEGER;
BEGIN
    -- Mark public requests as expired if:
    -- 1. No claims within 7 days
    -- 2. Posted more than 7 days ago
    UPDATE legal_requests
    SET public_status = 'EXPIRED'
    WHERE 
        request_type = 'public'
        AND public_status IN ('PUBLIC_OPEN', 'LAWYERS_INTERESTED')
        AND public_posted_at < NOW() - INTERVAL '7 days'
    RETURNING id INTO v_expired_count;
    
    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    
    -- Notify remaining lawyers
    INSERT INTO public_request_notifications (
        user_id,
        case_id,
        type,
        title,
        message
    )
    SELECT DISTINCT
        pcc.lawyer_id,
        lr.id,
        'case_expired',
        'Public request expired',
        'This public request is no longer available.'
    FROM public_case_claims pcc
    JOIN legal_requests lr ON pcc.case_id = lr.id
    WHERE lr.request_type = 'public'
    AND lr.public_status = 'EXPIRED'
    AND pcc.status = 'pending'
    ON CONFLICT DO NOTHING;
    
    RETURN QUERY SELECT v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public_case_claims IS 'Lawyer interest claims for public case requests';
COMMENT ON TABLE public_request_notifications IS 'Notifications specific to public request marketplace';
COMMENT ON COLUMN legal_requests.request_type IS 'Type of request: direct (lawyer assigned) or public (multiple lawyers can claim)';
COMMENT ON COLUMN legal_requests.public_status IS 'Status of public request: OPEN, INTERESTED, SELECTED, ASSIGNED, EXPIRED';
COMMENT ON COLUMN legal_requests.selected_lawyer_id IS 'The lawyer selected by client for public request';
COMMENT ON FUNCTION create_public_claim IS 'Allows lawyer to claim interest in a public case request';
COMMENT ON FUNCTION select_lawyer_for_public_request IS 'Allows client to select a lawyer for public request, auto-rejects others';
COMMENT ON FUNCTION withdraw_public_claim IS 'Allows lawyer to withdraw a pending claim';
COMMENT ON FUNCTION expire_old_public_requests IS 'Marks old public requests as expired and notifies remaining lawyers';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Public Request Marketplace schema created successfully!';
  RAISE NOTICE '📊 Added: request_type, public_status columns to legal_requests';
  RAISE NOTICE '📊 Created: public_case_claims table';
  RAISE NOTICE '📊 Created: public_request_notifications table';
  RAISE NOTICE '⚙️ Created: Functions for claims, selection, withdrawal, expiry';
  RAISE NOTICE '⏭️  Next step: Run 12_public_request_rls.sql for security policies';
END $$;
