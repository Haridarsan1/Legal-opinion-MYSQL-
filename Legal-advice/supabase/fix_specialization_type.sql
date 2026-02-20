-- ============================================================
-- Fix: Convert specialization from ARRAY to TEXT (Simple Version)
-- ============================================================

-- Directly alter the column type from TEXT[] to TEXT
-- PostgreSQL will automatically convert array to text representation
ALTER TABLE profiles 
ALTER COLUMN specialization TYPE TEXT 
USING CASE 
    WHEN specialization IS NULL THEN NULL
    WHEN array_length(specialization, 1) IS NOT NULL THEN array_to_string(specialization, ', ')
    ELSE NULL
END;

-- Verify the fix
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'specialization';

-- Should now show: data_type = "text"
