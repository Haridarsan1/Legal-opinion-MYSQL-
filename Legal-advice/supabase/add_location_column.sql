-- ============================================================
-- Add missing location column to profiles table
-- ============================================================

-- Add location column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.location IS 'Lawyer location (City, State/Country)';

-- Verify the addition
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'location';
