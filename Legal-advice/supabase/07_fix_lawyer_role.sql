-- Fix for lawyer login routing issue
-- This updates the handle_new_user() function to correctly read the role from user metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile on signup, reading role from metadata and casting to user_role type
  INSERT INTO public.profiles (id, role, full_name, email, phone, organization)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'client')::user_role,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email, 'New User'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'organization', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Fix existing lawyer account (if you want to update your current account)
-- Replace 'your-lawyer-email@example.com' with your actual lawyer email
-- UPDATE profiles 
-- SET role = 'lawyer' 
-- WHERE email = 'your-lawyer-email@example.com';
