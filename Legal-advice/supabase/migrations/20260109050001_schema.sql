-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS (use DO blocks for idempotency)
-- =====================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'lawyer', 'firm', 'bank', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM (
    'submitted', 'assigned', 'in_review', 'clarification_requested',
    'opinion_ready', 'delivered', 'completed', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'sale_deed', 'title_certificate', 'encumbrance_certificate',
    'tax_receipt', 'legal_opinion', 'supporting_document',
    'clarification', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  organization TEXT,
  bar_council_id TEXT,
  specialization TEXT[],
  years_of_experience INTEGER,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sla_hours INTEGER NOT NULL DEFAULT 48,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id),
  assigned_lawyer_id UUID REFERENCES profiles(id),
  assigned_firm_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_address TEXT,
  loan_amount NUMERIC(15, 2),
  status request_status NOT NULL DEFAULT 'submitted',
  priority priority_level NOT NULL DEFAULT 'medium',
  sla_tier TEXT,
  sla_deadline TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS request_number_seq START 1000;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  document_type document_type NOT NULL DEFAULT 'other',
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE UNIQUE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  lawyer_id UUID REFERENCES profiles(id),
  firm_id UUID REFERENCES profiles(id),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clarifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority priority_level NOT NULL DEFAULT 'medium',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_documents_request_id ON documents(request_id);
CREATE INDEX IF NOT EXISTS idx_documents_latest ON documents(request_id, is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_audit_logs_request ON audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_requests_client ON legal_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_legal_requests_lawyer ON legal_requests(assigned_lawyer_id);
CREATE INDEX IF NOT EXISTS idx_legal_requests_firm ON legal_requests(assigned_firm_id);
CREATE INDEX IF NOT EXISTS idx_legal_requests_status ON legal_requests(status);
CREATE INDEX IF NOT EXISTS idx_legal_requests_created_at ON legal_requests(created_at DESC);

-- =====================================================
-- SEED DATA (only if department table is empty)
-- =====================================================

INSERT INTO departments (name, description, icon, sla_hours, required_documents)
SELECT * FROM (VALUES
  ('Corporate & Tax Law', 'Corporate governance, mergers, acquisitions, and taxation matters', 'business', 48, ARRAY['MOA/AOA', 'Board Resolutions', 'Financial Statements', 'Tax Returns']),
  ('Intellectual Property', 'Patents, trademarks, copyrights, and IP litigation', 'lightbulb', 72, ARRAY['Trademark Application', 'Patent Documents', 'Copyright Certificate', 'Prior Art Search']),
  ('Real Estate & Property', 'Property transactions, title verification, and land disputes', 'home', 48, ARRAY['Sale Deed', 'Title Certificate', 'Encumbrance Certificate', 'Tax Receipts', 'Survey Documents']),
  ('Employment Law', 'Employment contracts, workplace disputes, and labor compliance', 'badge', 48, ARRAY['Employment Contract', 'Termination Letter', 'PF/ESI Documents', 'Salary Slips']),
  ('Banking & Finance', 'Loan documentation, security creation, and financial regulations', 'account_balance', 24, ARRAY['Loan Agreement', 'Security Documents', 'Financial Statements', 'KYC Documents']),
  ('Litigation Support', 'Court proceedings, case law research, and legal representation', 'gavel', 72, ARRAY['Plaint/Petition', 'Court Orders', 'Evidence Documents', 'Case Citations'])
) AS v(name, description, icon, sla_hours, required_documents)
WHERE NOT EXISTS (SELECT 1 FROM departments LIMIT 1);
