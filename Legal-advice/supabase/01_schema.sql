-- =====================================================
-- Legal Opinion Portal - Complete Database Schema
-- =====================================================
-- Run this in Supabase SQL Editor (Query tab)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('client', 'lawyer', 'firm', 'bank', 'admin');

-- Request status
CREATE TYPE request_status AS ENUM (
  'submitted',
  'assigned',
  'in_review',
  'clarification_requested',
  'opinion_ready',
  'delivered',
  'completed',
  'cancelled'
);

-- Priority levels
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- Document types
CREATE TYPE document_type AS ENUM (
  'sale_deed',
  'title_certificate',
  'encumbrance_certificate',
  'tax_receipt',
  'legal_opinion',
  'supporting_document',
  'clarification',
  'other'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  organization TEXT,
  bar_council_id TEXT, -- for lawyers
  specialization TEXT[], -- for lawyers
  years_of_experience INTEGER, -- for lawyers
  bio TEXT, -- for lawyers
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- material symbol icon name
  sla_hours INTEGER NOT NULL DEFAULT 48,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Requests
CREATE TABLE legal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL, -- e.g., #LN-2024, #1024
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id),
  assigned_lawyer_id UUID REFERENCES profiles(id),
  assigned_firm_id UUID REFERENCES profiles(id),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_address TEXT, -- for bank cases
  loan_amount NUMERIC(15, 2), -- for bank cases
  
  status request_status NOT NULL DEFAULT 'submitted',
  priority priority_level NOT NULL DEFAULT 'medium',
  
  sla_tier TEXT, -- '24h', '48h', '72h'
  sla_deadline TIMESTAMPTZ,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create auto-generated request number trigger
CREATE SEQUENCE request_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS trigger AS $$
BEGIN
  NEW.request_number := '#' || nextval('request_number_seq')::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_number
  BEFORE INSERT ON legal_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL)
  EXECUTE FUNCTION generate_request_number();

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size BIGINT NOT NULL, -- in bytes
  file_type TEXT NOT NULL, -- MIME type
  
  document_type document_type NOT NULL DEFAULT 'other',
  description TEXT,
  
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast document lookup
CREATE INDEX idx_documents_request_id ON documents(request_id);
CREATE INDEX idx_documents_latest ON documents(request_id, is_latest) WHERE is_latest = true;

-- Ratings & Reviews
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  lawyer_id UUID REFERENCES profiles(id),
  firm_id UUID REFERENCES profiles(id),
  
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(request_id) -- one rating per request
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'case_assigned', 'status_update', 'clarification', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  related_request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  is_read BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'document_uploaded', etc.
  details JSONB, -- additional context
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_request ON audit_logs(request_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Clarifications
CREATE TABLE clarifications (
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
-- SEED DATA - Legal Departments
-- =====================================================

INSERT INTO departments (name, description, icon, sla_hours, required_documents) VALUES
('Corporate & Tax Law', 'Corporate governance, mergers, acquisitions, and taxation matters', 'business', 48, ARRAY['MOA/AOA', 'Board Resolutions', 'Financial Statements', 'Tax Returns']),
('Intellectual Property', 'Patents, trademarks, copyrights, and IP litigation', 'lightbulb', 72, ARRAY['Trademark Application', 'Patent Documents', 'Copyright Certificate', 'Prior Art Search']),
('Real Estate & Property', 'Property transactions, title verification, and land disputes', 'home', 48, ARRAY['Sale Deed', 'Title Certificate', 'Encumbrance Certificate', 'Tax Receipts', 'Survey Documents']),
('Employment Law', 'Employment contracts, workplace disputes, and labor compliance', 'badge', 48, ARRAY['Employment Contract', 'Termination Letter', 'PF/ESI Documents', 'Salary Slips']),
('Banking & Finance', 'Loan documentation, security creation, and financial regulations', 'account_balance', 24, ARRAY['Loan Agreement', 'Security Documents', 'Financial Statements', 'KYC Documents']),
('Litigation Support', 'Court proceedings, case law research, and legal representation', 'gavel', 72, ARRAY['Plaint/Petition', 'Court Orders', 'Evidence Documents', 'Case Citations']);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER legal_requests_updated_at
  BEFORE UPDATE ON legal_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- INDEXES for Performance
-- =====================================================

CREATE INDEX idx_legal_requests_client ON legal_requests(client_id);
CREATE INDEX idx_legal_requests_lawyer ON legal_requests(assigned_lawyer_id);
CREATE INDEX idx_legal_requests_firm ON legal_requests(assigned_firm_id);
CREATE INDEX idx_legal_requests_status ON legal_requests(status);
CREATE INDEX idx_legal_requests_created_at ON legal_requests(created_at DESC);

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending auth.users with role-specific fields';
COMMENT ON TABLE legal_requests IS 'Main table for legal opinion requests with workflow tracking';
COMMENT ON TABLE documents IS 'Document storage metadata with version control';
COMMENT ON TABLE ratings IS 'Client ratings and reviews for lawyers/firms';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE audit_logs IS 'Complete audit trail for all actions';
COMMENT ON TABLE clarifications IS 'Clarification requests between lawyers and clients';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Created tables: profiles, departments, legal_requests, documents, ratings, notifications, audit_logs, clarifications';
  RAISE NOTICE '🌱 Seeded 6 legal departments';
  RAISE NOTICE '⏭️  Next step: Run 02_rls_policies.sql';
END $$;
