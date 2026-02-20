-- ============================================================
-- Bank Profile System - Database Schema
-- ============================================================

-- 1. BANK IDENTITY
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_logo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_type TEXT CHECK (bank_type IN ('Public', 'Private', 'Cooperative', 'Foreign'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS head_office_location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS regulating_authority TEXT DEFAULT 'RBI';

-- 2. AUTHORIZED CONTACT DETAILS
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS authorized_person_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS authorized_person_designation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS official_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS official_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS secondary_contact TEXT;

-- 3. LEGAL ENGAGEMENT PREFERENCES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legal_services_required TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS engagement_model TEXT CHECK (engagement_model IN ('Case-based', 'Retainer-based', 'Opinion-only'));

-- 4. JURISDICTION & COURT COVERAGE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS operating_jurisdictions TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS courts_involved TEXT[];

-- 5. WORKFLOW & COMMUNICATION SETTINGS
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_communication_mode TEXT CHECK (preferred_communication_mode IN ('Portal only', 'Email alerts'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expected_turnaround_time TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS case_assignment_preference TEXT CHECK (case_assignment_preference IN ('Auto-assign', 'Manual approval'));

-- 6. COMPLIANCE & AUTHORIZATION
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS authorization_letter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document_sharing_consent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_reference_id TEXT;

-- 7. BILLING PREFERENCE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_model TEXT CHECK (payment_model IN ('Per opinion', 'Per case', 'Retainer'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_cycle TEXT CHECK (billing_cycle IN ('Monthly', 'Per engagement'));

-- 8. PROFILE STATUS (System-Controlled)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_status TEXT DEFAULT 'Draft' CHECK (profile_status IN ('Draft', 'Submitted', 'Verified', 'Suspended'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_by_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_by_user_id UUID REFERENCES auth.users(id);

-- Add comments for documentation
COMMENT ON COLUMN profiles.bank_name IS 'Legal registered name of the bank';
COMMENT ON COLUMN profiles.bank_type IS 'Type of bank: Public/Private/Cooperative/Foreign';
COMMENT ON COLUMN profiles.legal_services_required IS 'Array of legal services: Legal Opinions, Loan Recovery, Compliance & Regulatory, Litigation Support, Documentation & Contracts';
COMMENT ON COLUMN profiles.courts_involved IS 'Array of courts: District Court, High Court, DRT, NCLT, Supreme Court';
COMMENT ON COLUMN profiles.profile_status IS 'Bank profile status: Draft/Submitted/Verified/Suspended';

-- Verify the additions
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name LIKE '%bank%' OR column_name LIKE '%legal_%' OR column_name LIKE '%profile_status%'
ORDER BY column_name;
