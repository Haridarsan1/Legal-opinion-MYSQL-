-- =====================================================
-- SECOND OPINION RLS ACCESS
-- =====================================================
-- Ensure second lawyers can view the opinions they are asked to review

-- Policy for legal_opinions
CREATE POLICY "Second opinion lawyers can view opinions"
ON legal_opinions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM second_opinion_requests sor
    WHERE sor.original_request_id = legal_opinions.request_id
    AND sor.shared_with_lawyer_id = auth.uid()
  )
);

-- Policy for opinion_versions
CREATE POLICY "Second opinion lawyers can view versions"
ON opinion_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM legal_opinions lo
    JOIN second_opinion_requests sor ON sor.original_request_id = lo.request_id
    WHERE lo.id = opinion_versions.opinion_id
    AND sor.shared_with_lawyer_id = auth.uid()
  )
);
