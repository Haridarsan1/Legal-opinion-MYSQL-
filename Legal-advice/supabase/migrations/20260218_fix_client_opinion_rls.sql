-- Fix RLS to allow clients to view their own legal opinions and versions

-- 1. Policy for legal_opinions
-- Drop existing if conflict (optional, but safe to just add new permissive one with unique name)
DROP POLICY IF EXISTS "Clients can view opinions for their requests" ON legal_opinions;

CREATE POLICY "Clients can view opinions for their requests"
ON legal_opinions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM legal_requests lr
    WHERE lr.id = legal_opinions.request_id
    AND lr.client_id = auth.uid()
  )
);

-- 2. Policy for opinion_versions
DROP POLICY IF EXISTS "Clients can view opinion versions" ON opinion_versions;

CREATE POLICY "Clients can view opinion versions"
ON opinion_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM legal_opinions lo
    JOIN legal_requests lr ON lr.id = lo.request_id
    WHERE lo.id = opinion_versions.opinion_id
    AND lr.client_id = auth.uid()
  )
);
