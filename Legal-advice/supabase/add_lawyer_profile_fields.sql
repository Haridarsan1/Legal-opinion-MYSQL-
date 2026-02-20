-- ============================================================
-- Add Comprehensive Lawyer Profile Fields
-- ============================================================
-- This migration adds all required fields for the lawyer profile system

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bar_council_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS degree TEXT; -- LLB, JD, LLM, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS license_status TEXT DEFAULT 'Active'; -- Active, Suspended, Inactive
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enrollment_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jurisdiction TEXT; -- State/Country
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'Available'; -- Available, Busy, Offline
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT '24 hours'; -- Response time text
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consultation_modes TEXT[] DEFAULT ARRAY['chat', 'call', 'video']; -- Available consultation modes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_cases_handled INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS case_types_handled TEXT[]; -- Array of case types

-- Add comments for documentation
COMMENT ON COLUMN profiles.bar_council_id IS 'Bar Council registration ID';
COMMENT ON COLUMN profiles.degree IS 'Legal degree (LLB, JD, LLM, etc.)';
COMMENT ON COLUMN profiles.license_status IS 'Current license status';
COMMENT ON COLUMN profiles.enrollment_year IS 'Year of bar enrollment';
COMMENT ON COLUMN profiles.jurisdiction IS 'Practice jurisdiction (State/Country)';
COMMENT ON COLUMN profiles.years_of_experience IS 'Total years of legal practice';
COMMENT ON COLUMN profiles.availability_status IS 'Current availability (Available/Busy/Offline)';
COMMENT ON COLUMN profiles.response_time IS 'Typical response time description';
COMMENT ON COLUMN profiles.consultation_modes IS 'Available consultation methods';
COMMENT ON COLUMN profiles.total_cases_handled IS 'Approximate total cases handled';
COMMENT ON COLUMN profiles.average_rating IS 'Average client rating (0.00-5.00)';
COMMENT ON COLUMN profiles.total_reviews IS 'Total number of client reviews';
COMMENT ON COLUMN profiles.case_types_handled IS 'Types of cases handled (tags)';

-- Verify the additions
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN (
    'bar_council_id', 'degree', 'license_status', 'enrollment_year',
    'jurisdiction', 'years_of_experience', 'availability_status',
    'response_time', 'consultation_modes', 'total_cases_handled',
    'average_rating', 'total_reviews', 'case_types_handled'
)
ORDER BY column_name;
