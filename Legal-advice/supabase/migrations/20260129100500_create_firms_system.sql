-- =====================================================
-- FIRM MANAGEMENT & INVITES
-- =====================================================

-- 1. Create firms table
CREATE TABLE IF NOT EXISTS public.firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    official_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'active', 'rejected')),
    owner_id UUID REFERENCES auth.users(id),
    verification_documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_firms_slug ON firms(slug);
CREATE INDEX IF NOT EXISTS idx_firms_owner ON firms(owner_id);

-- 2. Update profiles table to link to firms
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS firm_id UUID REFERENCES public.firms(id);

CREATE INDEX IF NOT EXISTS idx_profiles_firm ON profiles(firm_id);

-- 3. Update handle_new_user function to support firm_id from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile on signup, reading role from metadata and casting to user_role type
  -- Also handles firm_id from metadata if present (for invites)
  INSERT INTO public.profiles (id, role, full_name, email, phone, organization, firm_id)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'client')::user_role,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email, 'New User'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'organization', ''),
    (NEW.raw_user_meta_data->>'firm_id')::uuid -- Cast to UUID, null if missing
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        firm_id = COALESCE(EXCLUDED.firm_id, profiles.firm_id), -- Don't overwrite if not provided in update
        updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 4. Enable RLS on firms
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;

-- Basic Policies for Firms (Refine later)
-- Firms are viewable by everyone (for profile linking/public pages?) or at least authenticated users?
-- For now, let's say authenticated users can read basic firm info context.
-- But specifically:
-- 1. Owner can update their firm.
-- 2. Firm members can view their firm.
-- 3. System admins can manage all.

CREATE POLICY "Firms are viewable by everyone" 
ON public.firms FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create firms" 
ON public.firms FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their firm" 
ON public.firms FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id);

-- Comments
COMMENT ON TABLE firms IS 'Stores firm-level metadata and verification status.';
COMMENT ON COLUMN profiles.firm_id IS 'Link to the firm this user belongs to.';
