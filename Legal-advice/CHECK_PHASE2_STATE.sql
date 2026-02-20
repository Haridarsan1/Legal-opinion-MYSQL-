-- =================================================================
-- PHASE 2 STATE CHECK
-- Run this to verify what tables, columns, and types already exist
-- =================================================================

-- 1. Check Tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'request_status_history', 
    'request_acceptance', 
    'clarification_replies', 
    'peer_reviews', 
    'digital_signatures', 
    'opinion_access_logs', 
    'second_opinions'
);

-- 2. Check Enums
SELECT t.typname
FROM pg_type t 
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public' 
AND t.typname IN ('clarification_status', 'peer_review_status', 'signature_status');

-- 3. Check New Columns in Existing Tables
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND (
    (table_name = 'legal_requests' AND column_name IN ('accepted_by_lawyer', 'lawyer_acceptance_date')) OR
    (table_name = 'documents' AND column_name IN ('reviewed_by', 'review_status', 'visible_after_acceptance', 'reviewed_at')) OR
    (table_name = 'opinion_submissions' AND column_name IN ('opinion_status', 'locked_at', 'is_locked'))
);

-- 4. Check Indexes (Approximate check by name)
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_request_status_history_request',
    'idx_request_acceptance_lawyer',
    'idx_clarification_replies_clarification',
    'idx_peer_reviews_opinion',
    'idx_digital_signatures_opinion',
    'idx_opinion_access_logs_opinion',
    'idx_second_opinions_original_request'
);

-- 5. Check RLS Policies (Count per table)
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'request_status_history', 
    'request_acceptance', 
    'clarification_replies', 
    'peer_reviews', 
    'digital_signatures', 
    'opinion_access_logs', 
    'second_opinions',
    'documents'
)
ORDER BY tablename;
