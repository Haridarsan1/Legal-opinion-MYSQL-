-- =====================================================
-- Legal Opinion Portal - Complete Database Setup
-- =====================================================
-- This migration creates the entire database schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('client', 'lawyer', 'firm', 'bank', 'admin');
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
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
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

CREATE TABLE profiles (
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

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sla_hours INTEGER NOT NULL DEFAULT 48,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE legal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL,
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

CREATE SEQUENCE request_number_seq START 1000;

CREATE TABLE documents (
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

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES legal_requests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  lawyer_id UUID REFERENCES profiles(id),
  firm_id UUID REFERENCES profiles(id),
  
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(request_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  related_request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  is_read BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,
  details JSONB,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- INDEXES
-- =====================================================

CREATE INDEX idx_documents_request_id ON documents(request_id);
CREATE INDEX idx_documents_latest ON documents(request_id, is_latest) WHERE is_latest = true;
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_audit_logs_request ON audit_logs(request_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_legal_requests_client ON legal_requests(client_id);
CREATE INDEX idx_legal_requests_lawyer ON legal_requests(assigned_lawyer_id);
CREATE INDEX idx_legal_requests_firm ON legal_requests(assigned_firm_id);
CREATE INDEX idx_legal_requests_status ON legal_requests(status);
CREATE INDEX idx_legal_requests_created_at ON legal_requests(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER legal_requests_updated_at
  BEFORE UPDATE ON legal_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Auto-generate request numbers
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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, phone, organization)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'organization'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-log status changes
CREATE OR REPLACE FUNCTION log_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (request_id, user_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_request_status_changed
  AFTER UPDATE ON legal_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_request_status_change();

-- Auto-create notifications on status change
CREATE OR REPLACE FUNCTION notify_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'assigned' THEN
        notification_title := 'Case Assigned';
        notification_message := 'Your request ' || NEW.request_number || ' has been assigned to a lawyer.';
      WHEN 'in_review' THEN
        notification_title := 'Review Started';
        notification_message := 'Your request ' || NEW.request_number || ' is now being reviewed.';
      WHEN 'clarification_requested' THEN
        notification_title := 'Clarification Required';
        notification_message := 'The lawyer has requested clarification for ' || NEW.request_number || '.';
      WHEN 'opinion_ready' THEN
        notification_title := 'Opinion Ready';
        notification_message := 'Legal opinion for ' || NEW.request_number || ' is ready for review.';
      WHEN 'delivered' THEN
        notification_title := 'Opinion Delivered';
        notification_message := 'Legal opinion for ' || NEW.request_number || ' has been delivered.';
      WHEN 'completed' THEN
        notification_title := 'Case Completed';
        notification_message := 'Your request ' || NEW.request_number || ' has been completed.';
      ELSE
        notification_title := 'Status Updated';
        notification_message := 'Status updated for ' || NEW.request_number || '.';
    END CASE;

    INSERT INTO notifications (user_id, type, title, message, related_request_id)
    VALUES (
      NEW.client_id,
      'status_update',
      notification_title,
      notification_message,
      NEW.id
    );

    IF NEW.assigned_lawyer_id IS NOT NULL AND NEW.status IN ('clarification_requested') THEN
      INSERT INTO notifications (user_id, type, title, message, related_request_id)
      VALUES (
        NEW.assigned_lawyer_id,
        'status_update',
        'Case Update',
        'Status updated for ' || NEW.request_number || '.',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_request_notification
  AFTER UPDATE ON legal_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_on_status_change();

-- Set SLA deadline on creation
CREATE OR REPLACE FUNCTION set_sla_deadline()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  dept_sla_hours INTEGER;
BEGIN
  SELECT sla_hours INTO dept_sla_hours
  FROM departments
  WHERE id = NEW.department_id;

  IF NEW.sla_tier = '24h' THEN
    dept_sla_hours := 24;
  ELSIF NEW.sla_tier = '48h' THEN
    dept_sla_hours := 48;
  ELSIF NEW.sla_tier = '72h' THEN
    dept_sla_hours := 72;
  END IF;

  NEW.sla_deadline := NEW.submitted_at + (dept_sla_hours || ' hours')::INTERVAL;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_request_created_set_sla
  BEFORE INSERT ON legal_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_sla_deadline();

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO departments (name, description, icon, sla_hours, required_documents) VALUES
('Corporate & Tax Law', 'Corporate governance, mergers, acquisitions, and taxation matters', 'business', 48, ARRAY['MOA/AOA', 'Board Resolutions', 'Financial Statements', 'Tax Returns']),
('Intellectual Property', 'Patents, trademarks, copyrights, and IP litigation', 'lightbulb', 72, ARRAY['Trademark Application', 'Patent Documents', 'Copyright Certificate', 'Prior Art Search']),
('Real Estate & Property', 'Property transactions, title verification, and land disputes', 'home', 48, ARRAY['Sale Deed', 'Title Certificate', 'Encumbrance Certificate', 'Tax Receipts', 'Survey Documents']),
('Employment Law', 'Employment contracts, workplace disputes, and labor compliance', 'badge', 48, ARRAY['Employment Contract', 'Termination Letter', 'PF/ESI Documents', 'Salary Slips']),
('Banking & Finance', 'Loan documentation, security creation, and financial regulations', 'account_balance', 24, ARRAY['Loan Agreement', 'Security Documents', 'Financial Statements', 'KYC Documents']),
('Litigation Support', 'Court proceedings, case law research, and legal representation', 'gavel', 72, ARRAY['Plaint/Petition', 'Court Orders', 'Evidence Documents', 'Case Citations']);
