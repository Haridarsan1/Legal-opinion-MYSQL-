-- Migration: Case-Type Based Document Checklist
-- Created: 2026-02-03

-- ============================================================================
-- 1. DOCUMENT CHECKLIST TEMPLATES
--    Defines required documents per case type
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_type VARCHAR(100) NOT NULL, -- 'property', 'corporate', 'banking', etc.
    document_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    file_type_hints VARCHAR(255), -- e.g., 'PDF, DOCX' suggested formats
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_checklists_case_type ON document_checklists(case_type);
CREATE INDEX IF NOT EXISTS idx_document_checklists_active ON document_checklists(is_active);

-- ============================================================================
-- 2. DOCUMENT CHECKLIST PROGRESS TRACKING
--    Tracks which documents have been submitted for each case
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES document_checklists(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL, -- Links to uploaded document
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'rejected', 'not_required')),
    marked_not_required_by UUID REFERENCES profiles(id),
    marked_not_required_at TIMESTAMPTZ,
    notes TEXT, -- Lawyer notes about this item
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(request_id, checklist_id) -- One entry per checklist item per case
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_request ON document_checklist_items(request_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_status ON document_checklist_items(status);

-- ============================================================================
-- 3. SEED DEFAULT DOCUMENT CHECKLISTS
-- ============================================================================

-- Property Case Documents
INSERT INTO document_checklists (case_type, document_name, description, is_mandatory, display_order, file_type_hints) VALUES
('property', 'Title Deed', 'Original or certified copy of property title deed', true, 1, 'PDF'),
('property', 'Sale Agreement', 'Signed agreement between buyer and seller', true, 2, 'PDF, DOCX'),
('property', 'Property Tax Receipt', 'Latest property tax payment receipt', true, 3, 'PDF'),
('property', 'Encumbrance Certificate', 'Certificate showing property is free from legal liabilities', true, 4, 'PDF'),
('property', 'Building Approval Plan', 'Approved building plan from local authority', false, 5, 'PDF'),
('property', 'NOC from Society', 'No Objection Certificate from housing society if applicable', false, 6, 'PDF')
ON CONFLICT DO NOTHING;

-- Corporate Case Documents
INSERT INTO document_checklists (case_type, document_name, description, is_mandatory, display_order, file_type_hints) VALUES
('corporate', 'Certificate of Incorporation', 'Company registration certificate', true, 1, 'PDF'),
('corporate', 'Memorandum of Association', 'Company MOA', true, 2, 'PDF'),
('corporate', 'Articles of Association', 'Company AOA', true, 3, 'PDF'),
('corporate', 'Board Resolution', 'Board resolution authorizing the transaction', true, 4, 'PDF, DOCX'),
('corporate', 'Financial Statements', 'Latest audited financial statements', true, 5, 'PDF'),
('corporate', 'PAN Card', 'Company PAN card copy', true, 6, 'PDF'),
('corporate', 'GST Registration', 'GST registration certificate', false, 7, 'PDF')
ON CONFLICT DO NOTHING;

-- Banking Case Documents
INSERT INTO document_checklists (case_type, document_name, description, is_mandatory, display_order, file_type_hints) VALUES
('banking', 'Loan Agreement', 'Copy of loan agreement', true, 1, 'PDF'),
('banking', 'Bank Statements', 'Last 6 months bank statements', true, 2, 'PDF'),
('banking', 'Income Proof', 'Salary slips or income tax returns', true, 3, 'PDF'),
('banking', 'Identity Proof', 'Aadhaar/PAN/Passport', true, 4, 'PDF'),
('banking', 'Address Proof', 'Utility bill or rental agreement', true, 5, 'PDF'),
('banking', 'Collateral Documents', 'Property papers if loan is secured', false, 6, 'PDF')
ON CONFLICT DO NOTHING;

-- Tax Case Documents
INSERT INTO document_checklists (case_type, document_name, description, is_mandatory, display_order, file_type_hints) VALUES
('tax', 'Income Tax Returns', 'Last 3 years ITR with acknowledgments', true, 1, 'PDF'),
('tax', 'Form 16', 'Form 16 from employer', true, 2, 'PDF'),
('tax', 'Assessment Order', 'Tax assessment order if applicable', true, 3, 'PDF'),
('tax', 'PAN Card', 'PAN card copy', true, 4, 'PDF'),
('tax', 'Bank Statements', 'Relevant bank statements', false, 5, 'PDF')
ON CONFLICT DO NOTHING;

-- Employment Case Documents
INSERT INTO document_checklists (case_type, document_name, description, is_mandatory, display_order, file_type_hints) VALUES
('employment', 'Employment Contract', 'Copy of employment agreement', true, 1, 'PDF, DOCX'),
('employment', 'Termination Letter', 'Letter of termination if applicable', false, 2, 'PDF'),
('employment', 'Pay Slips', 'Last 3-6 months salary slips', true, 3, 'PDF'),
('employment', 'Experience Letter', 'Previous employment certificates', false, 4, 'PDF'),
('employment', 'Correspondence', 'Email/letter exchanges with employer', false, 5, 'PDF, MSG')
ON CONFLICT DO NOTHING;

-- Intellectual Property Case Documents
INSERT INTO document_checklists (case_type, document_name, description, is_mandatory, display_order, file_type_hints) VALUES
('intellectual_property', 'Trademark Registration', 'Trademark registration certificate', true, 1, 'PDF'),
('intellectual_property', 'Copyright Certificate', 'Copyright registration if applicable', false, 2, 'PDF'),
('intellectual_property', 'Patent Documents', 'Patent filing or grant documents', false, 3, 'PDF'),
('intellectual_property', 'Infringement Evidence', 'Evidence of IP infringement', true, 4, 'PDF, JPG'),
('intellectual_property', 'License Agreements', 'Any licensing agreements', false, 5, 'PDF')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. TRIGGER: AUTO-CREATE CHECKLIST ITEMS WHEN CASE TYPE IS SET
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_create_checklist_items()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create if case_type is newly set (was NULL before)
    IF NEW.case_type IS NOT NULL AND (OLD.case_type IS NULL OR OLD.case_type != NEW.case_type) THEN
        INSERT INTO document_checklist_items (request_id, checklist_id, status)
        SELECT NEW.id, dc.id, 'pending'
        FROM document_checklists dc
        WHERE dc.case_type = NEW.case_type
        AND dc.is_active = true
        ON CONFLICT (request_id, checklist_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_checklist_items
AFTER INSERT OR UPDATE OF case_type ON legal_requests
FOR EACH ROW
EXECUTE FUNCTION auto_create_checklist_items();

-- ============================================================================
-- 5. TRIGGER: AUTO-UPDATE CHECKLIST STATUS ON DOCUMENT UPLOAD
-- ============================================================================

CREATE OR REPLACE FUNCTION update_checklist_on_document_upload()
RETURNS TRIGGER AS $$
BEGIN
    -- When a document is uploaded and matches a checklist item name, update status
    -- This is a simple match on document type or filename
    UPDATE document_checklist_items
    SET 
        document_id = NEW.id,
        status = CASE 
            WHEN NEW.verification_status = 'verified' THEN 'verified'
            WHEN NEW.verification_status = 'rejected' THEN 'rejected'
            ELSE 'submitted'
        END,
        updated_at = NOW()
    WHERE request_id = NEW.request_id
    AND status = 'pending'
    AND checklist_id IN (
        SELECT id FROM document_checklists 
        WHERE LOWER(document_name) = LOWER(NEW.document_type)
        OR LOWER(document_name) = LOWER(NEW.file_name)
    )
    AND document_id IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checklist_on_upload
AFTER INSERT ON documents
FOR EACH ROW
EXECUTE FUNCTION update_checklist_on_document_upload();

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE document_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_checklist_items ENABLE ROW LEVEL SECURITY;

-- Policies for document_checklists
CREATE POLICY "Everyone can view active checklists"
ON document_checklists FOR SELECT
USING (is_active = true);

CREATE POLICY "Lawyers can manage checklists"
ON document_checklists FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer')
);

-- Policies for document_checklist_items
CREATE POLICY "Users can view checklist items for their cases"
ON document_checklist_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = document_checklist_items.request_id
        AND (lr.client_id = auth.uid() OR lr.assigned_lawyer_id = auth.uid())
    )
);

CREATE POLICY "Lawyers can update checklist items"
ON document_checklist_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM legal_requests lr
        WHERE lr.id = document_checklist_items.request_id
        AND lr.assigned_lawyer_id = auth.uid()
    )
);

-- ============================================================================
-- 7. HELPER VIEWS
-- ============================================================================

-- View to see checklist completion percentage per case
CREATE OR REPLACE VIEW case_checklist_progress AS
SELECT 
    dci.request_id,
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE dc.is_mandatory = true) as mandatory_items,
    COUNT(*) FILTER (WHERE dci.status = 'verified') as verified_items,
    COUNT(*) FILTER (WHERE dci.status IN ('verified', 'not_required')) as completed_items,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE dci.status IN ('verified', 'not_required')) / NULLIF(COUNT(*), 0),
        2
    ) as completion_percentage
FROM document_checklist_items dci
JOIN document_checklists dc ON dci.checklist_id = dc.id
GROUP BY dci.request_id;

COMMENT ON VIEW case_checklist_progress IS 'Shows document checklist completion status per case';
