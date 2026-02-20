-- ============================================================
-- Platform Admin User Creation Script
-- ============================================================
-- IMPORTANT: This script must be run in TWO SEPARATE STEPS
-- because PostgreSQL requires enum value additions to be
-- committed before they can be used.
-- ============================================================

-- ============================================================
-- STEP 1: Add 'platform_admin' to the user_role enum
-- ============================================================
-- Run this FIRST, then wait for it to complete before Step 2

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'platform_admin';

-- ============================================================
-- STOP HERE! After running Step 1 above, wait a moment,
-- then run Step 2 below in a SEPARATE query execution.
-- ============================================================











-- ============================================================
-- STEP 2: Update user role to platform_admin
-- ============================================================
-- Run this AFTER Step 1 has been committed
-- Replace the email with your actual admin user email

UPDATE profiles 
SET role = 'platform_admin'
WHERE email = 'voidbreaker404@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role = 'platform_admin';

-- ============================================================
-- Additional Verification Queries (Optional)
-- ============================================================

-- Check all platform admins
SELECT 
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM profiles 
WHERE role = 'platform_admin'
ORDER BY created_at DESC;

-- Count users by role
SELECT 
    role,
    COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;
