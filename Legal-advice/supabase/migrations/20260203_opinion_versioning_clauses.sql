-- Migration: Opinion Versioning, Templates & Clause Library
-- Created: 2026-02-03

-- ============================================================================
-- 1. LEGAL CLAUSES TABLE (Clause Library)
-- ============================================================================

CREATE TABLE IF NOT EXISTS legal_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100), -- e.g., 'liability', 'indemnification', 'payment_terms'
    department VARCHAR(100), -- e.g., 'property', 'corporate', 'banking'
    tags TEXT[], -- Searchable keywords
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_clauses_category ON legal_clauses(category);
CREATE INDEX IF NOT EXISTS idx_legal_clauses_department ON legal_clauses(department);
CREATE INDEX IF NOT EXISTS idx_legal_clauses_tags ON legal_clauses USING GIN(tags);

-- ============================================================================
-- 2. CLAUSE USAGE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS clause_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clause_id UUID REFERENCES legal_clauses(id) ON DELETE CASCADE,
    opinion_version_id UUID REFERENCES opinion_versions(id) ON DELETE CASCADE,
    request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
    modifications JSONB, -- Tracks any changes made to the clause when inserted
    used_at TIMESTAMPTZ DEFAULT NOW(),
    used_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_clause_usage_clause ON clause_usage(clause_id);
CREATE INDEX IF NOT EXISTS idx_clause_usage_opinion ON clause_usage(opinion_version_id);

-- ============================================================================
-- 3. OPINION TEMPLATES (Department-based)
-- ============================================================================

CREATE TABLE IF NOT EXISTS opinion_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL, -- 'property', 'corporate', etc.
    description TEXT,
    structure JSONB NOT NULL, -- JSON defining sections: [{title: 'Facts', content: '...'}]
    default_clauses UUID[], -- Array of clause IDs to auto-include
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opinion_templates_department ON opinion_templates(department);

-- ============================================================================
-- 4. ENHANCE OPINION_VERSIONS WITH STRUCTURED SECTIONS
-- ============================================================================

-- Add structured sections to opinion_versions
ALTER TABLE opinion_versions
    ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES opinion_templates(id) ON DELETE SET NULL;

COMMENT ON COLUMN opinion_versions.sections IS 'Structured sections: {facts, issues, analysis, opinion, custom_sections}';

-- ============================================================================
-- 5. ENHANCE LEGAL_OPINIONS TABLE
-- ============================================================================

ALTER TABLE legal_opinions
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES opinion_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_final BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS finalized_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN legal_opinions.is_final IS 'When true, opinion is immutable and visible to client';

-- ============================================================================
-- 6. TRIGGER FUNCTIONS
-- ============================================================================

-- Auto-increment clause usage count
CREATE OR REPLACE FUNCTION increment_clause_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE legal_clauses
    SET usage_count = usage_count + 1
    WHERE id = NEW.clause_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_clause_usage
AFTER INSERT ON clause_usage
FOR EACH ROW
EXECUTE FUNCTION increment_clause_usage();

-- Prevent modification of finalized opinions
CREATE OR REPLACE FUNCTION prevent_final_opinion_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_final = true THEN
        RAISE EXCEPTION 'Cannot modify finalized opinion. Create a new version instead.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_final_opinion_edit
BEFORE UPDATE ON legal_opinions
FOR EACH ROW
WHEN (OLD.is_final = true AND NEW.is_final = true)
EXECUTE FUNCTION prevent_final_opinion_edit();

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE legal_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clause_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinion_templates ENABLE ROW LEVEL SECURITY;

-- Policies for legal_clauses
CREATE POLICY "Lawyers can view all approved clauses"
ON legal_clauses FOR SELECT
USING (
    is_approved = true OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer')
);

CREATE POLICY "Lawyers can create clauses"
ON legal_clauses FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer')
);

CREATE POLICY "Creators can update their own clauses"
ON legal_clauses FOR UPDATE
USING (created_by = auth.uid());

-- Policies for clause_usage
CREATE POLICY "Users can view clause usage for their cases"
ON clause_usage FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = clause_usage.request_id
        AND (lr.client_id = auth.uid() OR lr.assigned_lawyer_id = auth.uid())
    )
);

CREATE POLICY "Lawyers can create clause usage records"
ON clause_usage FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer')
);

-- Policies for opinion_templates
CREATE POLICY "Everyone can view active templates"
ON opinion_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Lawyers can create templates"
ON opinion_templates FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer')
);

CREATE POLICY "Creators can update their templates"
ON opinion_templates FOR UPDATE
USING (created_by = auth.uid());

-- ============================================================================
-- 8. DEFAULT TEMPLATES (Optional - seed data)
-- ============================================================================

-- Insert default template for property cases
INSERT INTO opinion_templates (name, department, description, structure, is_active)
VALUES (
    'Standard Property Opinion',
    'property',
    'Default template for property-related legal opinions',
    '[
        {"title": "Facts", "placeholder": "Describe the property, parties involved, and background..."},
        {"title": "Legal Issues", "placeholder": "Identify the key legal questions..."},
        {"title": "Analysis", "placeholder": "Legal analysis with citations..."},
        {"title": "Opinion", "placeholder": "Final legal opinion and recommendations..."}
    ]'::jsonb,
    true
)
ON CONFLICT DO NOTHING;

-- Insert default template for corporate cases
INSERT INTO opinion_templates (name, department, description, structure, is_active)
VALUES (
    'Standard Corporate Opinion',
    'corporate',
    'Default template for corporate legal opinions',
    '[
        {"title": "Executive Summary", "placeholder": "Brief overview of the matter..."},
        {"title": "Background", "placeholder": "Company details and context..."},
        {"title": "Legal Framework", "placeholder": "Applicable laws and regulations..."},
        {"title": "Analysis", "placeholder": "Detailed legal analysis..."},
        {"title": "Conclusion", "placeholder": "Final opinion and action items..."}
    ]'::jsonb,
    true
)
ON CONFLICT DO NOTHING;
