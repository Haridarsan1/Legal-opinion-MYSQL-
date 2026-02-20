import { Profile } from './types';

export type Permission =
  | 'view_senior_dashboard'
  | 'view_junior_dashboard'
  | 'access_marketplace'
  | 'manage_firm_users'
  | 'bypass_review' // Can submit opinion directly to client without internal review
  | 'submit_opinion'
  | 'review_drafts'
  | 'manage_billing'
  | 'manage_settings'
  | 'view_analytics'
  | 'view_assigned_cases'
  | 'access_bank_dashboard'
  | 'create_bank_requests'
  | 'access_firm_dashboard'
  | 'assign_cases'
  | 'view_all_firm_cases'
  | 'manage_firm_lawyers'
  | 'view_firm_directory'
  | 'view_admin_dashboard';

/**
 * Mapping of Roles (and Firm Roles) to their explicit permissions.
 *
 * Logic:
 * - 'lawyer': Base role. If no firm_role, they get full independent access.
 * - 'junior_lawyer': Restricted access.
 * - 'senior_lawyer': Full access + review capabilities.
 * - 'owner': Admin-level access within the firm.
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Independent / Standard Lawyer
  lawyer: [
    'view_senior_dashboard',
    'access_marketplace',
    'bypass_review',
    'submit_opinion',
    'manage_billing',
    'manage_settings',
    'view_analytics',
  ],

  // Junior Associate (Firm)
  junior_lawyer: [
    'view_junior_dashboard',
    'submit_opinion', // Can draft/submit, but workflow might trap it in review if bypass_review is missing
    'view_assigned_cases',
    'view_firm_directory',
    // NO bypass_review
    // NO access_marketplace (usually handled by partners, but configurable)
  ],

  // Senior Associate (Firm)
  senior_lawyer: [
    'view_senior_dashboard',
    'access_marketplace',
    'bypass_review',
    'submit_opinion',
    'review_drafts',
    'view_analytics',
    'view_assigned_cases',
    'view_firm_directory',
  ],

  // Firm Owner / Partner
  owner: [
    'view_senior_dashboard',
    'access_marketplace',
    'bypass_review',
    'submit_opinion',
    'review_drafts',
    'manage_firm_users',
    'manage_billing',
    'manage_settings',
    'view_analytics',
  ],

  // Firm Account (The Entity)
  firm: [
    'access_firm_dashboard',
    'assign_cases',
    'view_all_firm_cases',
    'manage_firm_lawyers',
    'manage_billing',
    'manage_settings',
    'view_analytics',
    'view_firm_directory'
  ],

  // Bank Account
  bank: [
    'access_bank_dashboard',
    'create_bank_requests',
    'manage_settings'
  ],

  // Client (for completeness, though usually has different guard rails)
  client: [],
  
  // Admin
  admin: [
    'view_admin_dashboard',
    'view_senior_dashboard', 
    'manage_firm_users',
    'manage_billing',
    'manage_settings', 
    'view_analytics'
  ]
};

/**
 * Check if a user profile has a specific permission.
 * Handles the fallback between 'role' and 'firm_role'.
 */
export function hasPermission(profile: Profile | null | undefined, permission: Permission): boolean {
  if (!profile) return false;

  // Platform Admins have all permissions
  if (profile.role === 'platform_admin') return true;

  // 1. Check Firm Role first (more specific)
  if (profile.role === 'lawyer' && profile.firm_role) {
    const firmPermissions = ROLE_PERMISSIONS[profile.firm_role];
    if (firmPermissions && firmPermissions.includes(permission)) {
      return true;
    }
    // If firm_role doesn't explicitly have it, do NOT fall back to generic 'lawyer' 
    // because 'junior_lawyer' is meant to stricter than generic 'lawyer'.
    return false; 
  }

  // 2. Check Base Role
  // This covers independent lawyers (no firm_role) and other primary roles
  const basePermissions = ROLE_PERMISSIONS[profile.role];
  if (basePermissions && basePermissions.includes(permission)) {
    return true;
  }

  return false;
}
