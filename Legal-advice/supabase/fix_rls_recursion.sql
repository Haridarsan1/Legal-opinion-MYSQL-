-- ============================================================
-- FIX: Remove Infinite Recursion in RLS Policies
-- ============================================================
-- This fixes the "infinite recursion detected" error

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Platform admins can manage all profiles" ON profiles;

-- Optionally, create a simpler admin policy without recursion
-- (Only if you need platform_admin-specific access beyond regular users)
-- For now, platform admins can use the same "Clients can view all user profiles" policy

-- Verify the fix
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
