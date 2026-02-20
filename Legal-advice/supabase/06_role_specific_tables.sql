-- =====================================================
-- Role-Specific Tables Migration
-- =====================================================
-- Creates separate tables for clients, lawyers, law_firms, and banks
-- Run this after 03_auth_trigger.sql
-- =====================================================

-- =====================================================
-- CLIENTS TABLE
-- =====================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT, -- for corporate clients
  industry TEXT,
  preferred_contact_method TEXT, -- 'email', 'phone', 'both'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LAWYERS TABLE
-- =====================================================

CREATE TABLE lawyers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bar_council_id TEXT NOT NULL,
  bar_council_state TEXT,
  year_of_enrollment INTEGER,
  years_of_experience INTEGER,
  specialization TEXT[], -- deprecated, use practice_areas
  practice_areas TEXT[], -- e.g., ['Criminal Law', 'Corporate Law']
  jurisdiction TEXT, -- court or state
  bio TEXT,
  bar_certificate_url TEXT, -- uploaded file URL
  rating_average NUMERIC(3,2) DEFAULT 0,
  total_cases INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LAW FIRMS TABLE
-- =====================================================

CREATE TABLE law_firms (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  firm_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  firm_size TEXT, -- 'small', 'medium', 'large'
  specialization TEXT[],
  total_lawyers INTEGER,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BANKS TABLE
-- =====================================================

CREATE TABLE banks (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  institution_type TEXT, -- 'bank', 'nbfc', 'cooperative'
  branch_name TEXT,
  ifsc_code TEXT,
  authorized_person_name TEXT,
  authorized_person_designation TEXT,
  authorized_person_department TEXT,
  authorized_person_phone TEXT,
  logo_url TEXT, -- uploaded company logo
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_lawyers_verified ON lawyers(verified);
CREATE INDEX idx_lawyers_rating ON lawyers(rating_average DESC);
CREATE INDEX idx_law_firms_verified ON law_firms(verified);
CREATE INDEX idx_banks_verified ON banks(verified);

-- =====================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER lawyers_updated_at
  BEFORE UPDATE ON lawyers
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER law_firms_updated_at
  BEFORE UPDATE ON law_firms
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER banks_updated_at
  BEFORE UPDATE ON banks
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own client profile"
  ON clients FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own client profile"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own client profile"
  ON clients FOR UPDATE
  USING (auth.uid() = id);

-- Lawyers table
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified lawyers"
  ON lawyers FOR SELECT
  USING (verified = true OR auth.uid() = id);

CREATE POLICY "Users can insert own lawyer profile"
  ON lawyers FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own lawyer profile"
  ON lawyers FOR UPDATE
  USING (auth.uid() = id);

-- Law Firms table
ALTER TABLE law_firms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified firms"
  ON law_firms FOR SELECT
  USING (verified = true OR auth.uid() = id);

CREATE POLICY "Users can insert own firm profile"
  ON law_firms FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own firm profile"
  ON law_firms FOR UPDATE
  USING (auth.uid() = id);

-- Banks table
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank profile"
  ON banks FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own bank profile"
  ON banks FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own bank profile"
  ON banks FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE clients IS 'Client-specific profile data';
COMMENT ON TABLE lawyers IS 'Lawyer-specific profile data including bar council details and credentials';
COMMENT ON TABLE law_firms IS 'Law firm-specific profile data';
COMMENT ON TABLE banks IS 'Bank/financial institution-specific profile data';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Role-specific tables created successfully!';
  RAISE NOTICE '📊 Created tables: clients, lawyers, law_firms, banks';
  RAISE NOTICE '🔒 RLS policies enabled for all tables';
  RAISE NOTICE '⏭️  Next step: Update signup/login flows to use these tables';
END $$;
