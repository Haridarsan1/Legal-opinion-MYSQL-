-- Migration to harden lawyer_reviews table
-- Created by Agent on 2026-02-18

-- 1. Ensure unique review per request (prevent duplicates)
ALTER TABLE lawyer_reviews
ADD CONSTRAINT unique_review_per_request UNIQUE (request_id, client_id);

-- 2. Ensure rating is between 1 and 5
ALTER TABLE lawyer_reviews
ADD CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5);

-- 3. Ensure review text length is reasonable (e.g. max 2000 chars)
ALTER TABLE lawyer_reviews
ADD CONSTRAINT review_text_length CHECK (char_length(review_text) <= 2000);

-- 4. Add index for faster querying by lawyer
CREATE INDEX IF NOT EXISTS idx_lawyer_reviews_lawyer_id ON lawyer_reviews(lawyer_id);

-- 5. Add index for faster querying by request (duplicate check)
CREATE INDEX IF NOT EXISTS idx_lawyer_reviews_request_id ON lawyer_reviews(request_id);

-- Note: 'ratings' table is deprecated and should be dropped after data migration.
-- DROP TABLE ratings;
