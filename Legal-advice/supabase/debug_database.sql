-- Diagnostic queries to find the signup error

-- 1. Check if user_role enum includes all roles
SELECT 
    enumlabel as allowed_roles
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY enumsortorder;

-- 2. Check profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check if trigger exists and is enabled
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Verify the current trigger function code
SELECT pg_get_functiondef('public.handle_new_user'::regproc);

-- 5. Check for any constraints on profiles table
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
ORDER BY tc.constraint_type, tc.constraint_name;
