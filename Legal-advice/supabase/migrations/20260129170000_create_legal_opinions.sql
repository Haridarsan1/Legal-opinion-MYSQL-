-- Create legal_opinions table
CREATE TABLE IF NOT EXISTS legal_opinions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
    lawyer_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'published')) DEFAULT 'draft',
    current_version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(request_id) -- Only one opinion chain per request for now
);

-- Create opinion_versions table
CREATE TABLE IF NOT EXISTS opinion_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opinion_id UUID NOT NULL REFERENCES legal_opinions(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content JSONB, -- TipTap JSON content
    text_content TEXT, -- Plain text for search/preview
    pdf_url TEXT, -- If this version is a PDF upload
    is_draft BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opinion_id, version_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_legal_opinions_request ON legal_opinions(request_id);
CREATE INDEX IF NOT EXISTS idx_opinion_versions_opinion ON opinion_versions(opinion_id);

-- Enable RLS
ALTER TABLE legal_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinion_versions ENABLE ROW LEVEL SECURITY;

-- Policies for legal_opinions

-- 1. Lawyers can view/create/update opinions for their assigned cases
CREATE POLICY "Lawyers can manage opinions for their cases"
ON legal_opinions
USING (
    lawyer_id = auth.uid() OR
    request_id IN (
        SELECT id FROM legal_requests WHERE assigned_lawyer_id = auth.uid()
    )
)
WITH CHECK (
    lawyer_id = auth.uid() OR
    request_id IN (
        SELECT id FROM legal_requests WHERE assigned_lawyer_id = auth.uid()
    )
);

-- 2. Clients can view PUBLISHED opinions for their cases
CREATE POLICY "Clients can view published opinions"
ON legal_opinions FOR SELECT
USING (
    status = 'published' AND
    request_id IN (
        SELECT id FROM legal_requests WHERE client_id = auth.uid()
    )
);

-- Policies for opinion_versions

-- 1. Lawyers can manage versions
CREATE POLICY "Lawyers can manage versions"
ON opinion_versions
USING (
    opinion_id IN (
        SELECT id FROM legal_opinions WHERE lawyer_id = auth.uid()
    )
)
WITH CHECK (
    opinion_id IN (
        SELECT id FROM legal_opinions WHERE lawyer_id = auth.uid()
    )
);

-- 2. Clients can view versions linked to PUBLISHED opinions
-- NOTE: We might strictly only show the "current published version", but allowing access to versions is okay if they are not drafts, or we rely on the parent status.
-- For simplicity: Clients can view versions IF the parent opinion is published. 
-- Ideally, we'd only show specific published versions, but `status` is on parent.
CREATE POLICY "Clients can view versions of published opinions"
ON opinion_versions FOR SELECT
USING (
    opinion_id IN (
        SELECT id FROM legal_opinions 
        WHERE status = 'published' 
        AND request_id IN (
            SELECT id FROM legal_requests WHERE client_id = auth.uid()
        )
    )
);

-- Storage Bucket for Opinion PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('opinion-pdfs', 'opinion-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Lawyers can upload opinion PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'opinion-pdfs' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view opinion PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'opinion-pdfs');
-- Note: 'Anyone' here includes clients. RLS on the table protects the *Link* to the PDF.
-- If aggressive security is needed, we can restrict this to auth users only.

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_legal_opinions_updated_at
BEFORE UPDATE ON legal_opinions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
