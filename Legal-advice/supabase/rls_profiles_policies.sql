-- ============================================================
-- RLS Policies for Profiles Table - Lawyer Visibility
-- ============================================================
-- This script adds RLS policies to allow clients to view lawyer profiles

-- First, ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Clients can view lawyer profiles" ON profiles;
DROP POLICY IF EXISTS "Clients can view all user profiles" ON profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 3: Allow clients to view lawyer profiles (and all other profiles for browsing)
CREATE POLICY "Clients can view all user profiles"
ON profiles
FOR SELECT
USING (true);
-- This allows any authenticated user to view all profiles
-- You can make this more restrictive if needed, for example:
-- USING (role = 'lawyer' OR auth.uid() = id);

-- Policy 4: Allow platform admins to view and manage all profiles
CREATE POLICY "Platform admins can manage all profiles"
ON profiles
FOR ALL
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'platform_admin'
    )
);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
