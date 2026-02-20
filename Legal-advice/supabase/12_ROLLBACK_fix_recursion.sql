-- =====================================================
-- ROLLBACK: Remove problematic RLS policies
-- =====================================================
-- This script removes the policies that caused infinite recursion
-- Run this if you need to revert migration 12

-- Drop the problematic policies from legal_requests
DROP POLICY IF EXISTS "Clients can create public requests" ON legal_requests;
DROP POLICY IF EXISTS "Lawyers can view public open cases" ON legal_requests;
DROP POLICY IF EXISTS "Lawyers can view cases with their claims" ON legal_requests;

-- Keep the marketplace-specific policies that work correctly
-- (these don't cause recursion):
-- - "Lawyers can view public marketplace cases" 
-- - "Lawyers can view marketplace cases with claims"

-- Other tables can stay as-is
-- public_case_claims policies are fine
-- public_request_notifications policies are fine

-- =====================================================
-- After running this, re-run 12_public_request_rls.sql
-- =====================================================
