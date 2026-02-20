-- ============================================================
-- Check and Fix Specialization Column Type
-- ============================================================

-- First, check what type specialization currently is
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('specialization', 'case_types_handled');

-- If specialization is TEXT[] (array), we need to convert it to TEXT
-- Drop the column and recreate it as TEXT (if it exists as array)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS specialization;
-- ALTER TABLE profiles ADD COLUMN specialization TEXT;

-- OR convert existing array data to comma-separated text
-- UPDATE profiles 
-- SET specialization = array_to_string(specialization, ',')
-- WHERE specialization IS NOT NULL;

-- Then alter the column type
-- ALTER TABLE profiles ALTER COLUMN specialization TYPE TEXT USING array_to_string(specialization, ',');
