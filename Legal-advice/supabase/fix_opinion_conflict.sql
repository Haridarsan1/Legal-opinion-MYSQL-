-- =====================================================
-- FIX OPINION SCHEMA CONFLICTS
-- =====================================================
-- This script removes the conflicting tables so the migration
-- '20260129170000_create_legal_opinions.sql' can run cleanly.

-- Drop tables with CASCADE to handle foreign key constraints
DROP TABLE IF EXISTS opinion_versions CASCADE;
DROP TABLE IF EXISTS legal_opinions CASCADE;

-- Note: We are using CASCADE, so any tables depending on these
-- (like second_opinion_requests) will also have their constraints
-- dropped or be affected. Since 'second_opinion_requests' is
-- likely not populated yet or is also in a draft state, this is safe.
-- If 'second_opinion_requests' was created, it might need to receive the
-- foreign key constraint again if it persists.

-- Ideally, just dropping these two is enough for the create script to work.
