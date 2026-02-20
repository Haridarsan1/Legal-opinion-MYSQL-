-- Lawyer Rating & Review System Migration

-- =====================================================
-- 1. Create Lawyer Reviews Table
-- =====================================================

CREATE TABLE IF NOT EXISTS lawyer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Assuming 'profiles' holds lawyer data
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Assuming 'profiles' holds client data
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    interaction_type TEXT CHECK (interaction_type IN ('opinion', 'chat', 'call', 'full_case')),
    
    is_visible BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT TRUE, -- Auto-approve for now, can be changed for moderation
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one review per request per client
    UNIQUE(request_id, client_id)
);

-- =====================================================
-- 2. Create Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reviews_lawyer ON lawyer_reviews(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON lawyer_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_request ON lawyer_reviews(request_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON lawyer_reviews(rating);

-- =====================================================
-- 3. Row Level Security (RLS)
-- =====================================================

ALTER TABLE lawyer_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read visible/approved reviews
CREATE POLICY "Public can view approved reviews" ON lawyer_reviews
    FOR SELECT
    USING (is_visible = true AND is_approved = true);

-- Clients can create reviews for their own requests (logic handled in app/actions, but policy backup)
-- Note: 'auth.uid() = client_id' is the typical check
CREATE POLICY "Clients can create reviews" ON lawyer_reviews
    FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- Clients can update their own reviews (optional, maybe restrict to short window)
CREATE POLICY "Clients can update own reviews" ON lawyer_reviews
    FOR UPDATE
    USING (auth.uid() = client_id);

-- Lawyers can view all reviews for themselves (even unapproved ones if needed)
CREATE POLICY "Lawyers can view own reviews" ON lawyer_reviews
    FOR SELECT
    USING (auth.uid() = lawyer_id);

-- Admins (service role) has full access - implicit bypass
