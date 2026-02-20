export type UserRole = 'client' | 'lawyer' | 'firm' | 'bank' | 'admin' | 'platform_admin';

export type RequestStatus =
  | 'submitted'
  | 'assigned'
  | 'in_review'
  | 'clarification_requested'
  | 'opinion_ready'
  | 'delivered'
  | 'completed'
  | 'accepting_proposals'
  // New Strict Workflow Statuses
  | 'pending_lawyer_response'
  | 'accepted'
  | 'awaiting_payment'
  | 'drafting'
  | 'review'
  | 'rejected'
  | 'awarded'
  | 'expired'
  | 'open';

export type LegalDepartment =
  | 'Civil'
  | 'Criminal'
  | 'Corporate'
  | 'Family'
  | 'Property'
  | 'Tax'
  | 'Labour'
  | 'Constitutional'
  | 'IP'
  | 'Environmental'
  | 'Banking & Finance'
  | 'Consumer Protection';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  firm_role?: 'owner' | 'senior_lawyer' | 'junior_lawyer';

  // Contact & Location
  phone?: string | null;
  location?: string | null;
  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  email_notifications?: boolean | null;
  in_app_notifications?: boolean | null;
  language?: string | null;
  timezone?: string | null;

  // Professional Info (Lawyer/Client)
  specialization?: string | null;
  bio?: string | null;
  organization?: string;

  // Lawyer-specific fields
  bar_council_id?: string | null;
  degree?: string | null;
  license_status?: string | null;
  enrollment_year?: number | null;
  jurisdiction?: string | null;
  years_of_experience?: number | null;
  availability_status?: string | null;
  response_time?: string | null;
  show_in_listings?: boolean | null;
  accept_new_requests?: boolean | null;
  consultation_modes?: string[] | null;
  total_cases_handled?: number | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  case_types_handled?: string[] | null;

  // Bank-specific fields
  // 1. Bank Identity
  bank_name?: string | null;
  bank_logo_url?: string | null;
  bank_type?: string | null; // Public/Private/Cooperative/Foreign
  head_office_location?: string | null;
  registration_number?: string | null;
  regulating_authority?: string | null;

  // 2. Authorized Contact
  authorized_person_name?: string | null;
  authorized_person_designation?: string | null;
  official_email?: string | null;
  official_phone?: string | null;
  secondary_contact?: string | null;

  // 3. Legal Engagement Preferences
  legal_services_required?: string[] | null;
  engagement_model?: string | null;

  // 4. Jurisdiction & Court Coverage
  operating_jurisdictions?: string[] | null;
  courts_involved?: string[] | null;

  // 5. Workflow & Communication
  preferred_communication_mode?: string | null;
  expected_turnaround_time?: string | null;
  case_assignment_preference?: string | null;

  // 6. Compliance & Authorization
  authorization_letter_url?: string | null;
  document_sharing_consent?: boolean | null;
  approval_reference_id?: string | null;

  // 7. Billing Preference
  payment_model?: string | null;
  billing_cycle?: string | null;

  // 8. Profile Status
  profile_status?: string | null;
  verified_by_admin?: boolean | null;
  verified_at?: string | null;
  verified_by_user_id?: string | null;

  // Timestamps
  created_at: string;
  updated_at?: string;
}

export interface LegalRequest {
  id: string;
  case_id: string;
  request_number?: string;
  client_id: string;
  lawyer_id?: string;
  assigned_lawyer_id?: string;
  firm_id?: string;
  bank_id?: string;
  department: LegalDepartment;
  title: string;
  description: string;
  status: RequestStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sla_hours: number;
  due_date: string;

  // Visibility & Public Request
  visibility: 'private' | 'public';
  public_status?: 'PUBLIC_OPEN' | 'LAWYERS_INTERESTED' | 'ASSIGNED' | 'EXPIRED';
  public_posted_at?: string;
  public_expires_at?: string;
  selected_lawyer_id?: string;

  // Opinion fields
  opinion_text?: string;
  opinion_submitted_at?: string;
  opinion_locked?: boolean;
  opinion_version?: number;
  opinion_accepted?: boolean;
  opinion_accepted_at?: string;
  opinion_accepted_by?: string;
  executive_summary?: string;

  // Review tracking
  review_started_at?: string;
  sla_deadline?: string; // Added

  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Document {
  id: string;
  request_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  version: number;
  created_at: string;
}

export interface Rating {
  id: string;
  request_id: string;
  lawyer_id: string;
  rated_by: string;
  stars: number;
  comment?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  request_id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface Clarification {
  id: string;
  request_id: string;
  requester_id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  is_resolved: boolean;
  response: string | null;
  responded_at: string | null;
  created_at: string;
  requester?: {
    id: string;
    full_name: string;
    role: string;
  };
}

// ===================================
// Lawyer Workspace Types
// ===================================

export interface InternalNote {
  id: string;
  request_id: string;
  created_by: string;
  note_text: string;
  note_type: 'general' | 'risk' | 'research' | 'strategy';
  visible_to_roles: string[];
  created_at: string;
  creator?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export interface OpinionSubmission {
  id: string;
  request_id: string;
  lawyer_id: string;
  opinion_type: 'preliminary' | 'final';
  version: number;
  is_final: boolean;
  assumptions?: string;
  limitations?: string;
  validity_period?: string;
  document_id?: string;
  firm_approved: boolean;
  firm_approved_by?: string;
  firm_approved_at?: string;
  self_review_checklist: {
    all_documents_reviewed: boolean;
    clarifications_resolved: boolean;
    legal_research_completed: boolean;
    citations_verified: boolean;
    opinion_proofread: boolean;
  };
  submitted_at: string;
}

export type RiskFlag =
  | 'pending_litigation'
  | 'missing_documents'
  | 'high_value_transaction'
  | 'time_sensitive';

export type CaseHealth = 'healthy' | 'at_risk' | 'blocked';

export type OpinionStandard = 'preliminary' | 'final' | 'bank_compliant';

export interface EnhancedLegalRequest {
  id: string;
  case_id?: string;
  request_number: string;
  client_id: string;
  lawyer_id?: string;
  firm_id?: string;
  bank_id?: string;
  department: any; // Can be object or array based on joins
  department_id?: string;
  title?: string;
  description: string;
  status: RequestStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sla_hours?: number;
  sla_tier?: string; // '24h', '48h', '72h'
  sla_deadline?: string;
  due_date?: string;
  created_at: string;
  updated_at?: string;
  submitted_at: string;
  assigned_at?: string;
  completed_at?: string;

  // Risk and legal context
  risk_flags?: RiskFlag[];
  legal_opinion_type?: string;
  opinion_standard?: OpinionStandard;
  jurisdiction?: string;
  governing_law?: string;

  // SLA management
  sla_paused?: boolean;
  sla_pause_reason?: string;
  sla_paused_at?: string;
  sla_resumed_at?: string;

  // Ownership tracking
  assigned_by?: string;
  assigned_lawyer_id?: string;
  assigned_firm_id?: string;
  escalation_owner?: string;

  // Case health
  case_health?: CaseHealth;

  // Expanded relations
  assigned_by_profile?: {
    id: string;
    full_name: string;
    role: string;
  };
  escalation_owner_profile?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export interface DocumentWithReview extends Document {
  reviewed_by?: string;
  reviewed_at?: string;
  review_status?: 'pending' | 'reviewed' | 'requires_clarification';
  reviewer?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export interface SLAHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  color: 'green' | 'amber' | 'red' | 'gray';
  percentRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  isOverdue: boolean;
}
