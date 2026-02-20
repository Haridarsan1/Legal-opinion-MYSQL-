-- =====================================================
-- SECURE FIRMS RLS
-- =====================================================

-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "Firms are viewable by everyone" ON public.firms;
DROP POLICY IF EXISTS "Users can create firms" ON public.firms;
DROP POLICY IF EXISTS "Owners can update their firm" ON public.firms;

-- 2. Helper function to check if user is a member of the firm
-- (Avoids infinite recursion by not querying firms table directly if possible, or using efficient joins)
-- Ideally, we check the profile. We can trust auth.uid().

-- 3. Create Strict Policies

-- SELECT: 
-- A user can view a firm if:
-- a) They are the owner
-- b) They are a member of the firm (profile.firm_id = firm.id)
-- c) They are a platform admin (profile.role = 'admin')
-- d) OR it's for the initial creation check (we might need a "read own" policy?)
-- actually, for public profile / verification purposes, we might need some public visibility?
-- The user said "view sensitive data like verification_documents".
-- Perhaps we separate public data?
-- For now, let's stick to the prompt's requirement: Owner/Member/Admin.

CREATE POLICY "Firms are viewable by members and admins" 
ON public.firms FOR SELECT 
TO authenticated 
USING (
  auth.uid() = owner_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (
      profiles.firm_id = firms.id 
      OR 
      profiles.role = 'admin'
    )
  )
);

-- INSERT:
-- Users can create a firm if they become the owner.
-- The API creates the firm with owner_id = auth.uid().
CREATE POLICY "Users can create firms" 
ON public.firms FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = owner_id
);

-- UPDATE:
-- Only Owner or Admin can update.
CREATE POLICY "Owners and Admins can update firms" 
ON public.firms FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = owner_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- DELETE:
-- Only Admin can delete.
CREATE POLICY "Admins can delete firms" 
ON public.firms FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
