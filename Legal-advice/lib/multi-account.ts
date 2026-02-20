import type { Session } from '@supabase/supabase-js';
import type { UserRole, Profile } from './types';

const STORAGE_KEY = 'legal_portal_accounts';

export interface StoredAccount {
  id: string; // user.id from Supabase
  email: string; // user email
  name: string; // user full name
  role: UserRole; // user role (client, lawyer, etc.)
  avatar_url?: string; // profile picture URL
  session: Session; // Supabase session object
  lastUsed: number; // timestamp for sorting
}

/**
 * Get all stored accounts from localStorage
 */
export function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const accounts: StoredAccount[] = JSON.parse(stored);

    // Filter out expired sessions
    // Note: Supabase expires_at is a Unix timestamp in SECONDS
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const validAccounts = accounts.filter((account) => {
      const expiresAt = account.session.expires_at || 0;
      return expiresAt > nowInSeconds;
    });

    // Update storage if we filtered out any accounts
    if (validAccounts.length !== accounts.length) {
      saveAccounts(validAccounts);
    }

    return validAccounts.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('Error loading stored accounts:', error);
    return [];
  }
}

/**
 * Save accounts array to localStorage
 */
function saveAccounts(accounts: StoredAccount[]): void {
  if (typeof window === 'undefined') {
    console.warn('[MultiAccount] saveAccounts: window is undefined (SSR)');
    return;
  }

  try {
    const jsonString = JSON.stringify(accounts);
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.error('[MultiAccount] Error saving accounts:', error);
  }
}

/**
 * Add or update an account in storage
 */
export function addAccount(session: Session, profile: Profile): void {
  const accounts = getStoredAccounts();

  // Check if account already exists
  const existingIndex = accounts.findIndex((acc) => acc.id === profile.id);

  const newAccount: StoredAccount = {
    id: profile.id,
    email: profile.email,
    name: profile.full_name,
    role: profile.role,
    avatar_url: profile.avatar_url,
    session,
    lastUsed: Date.now(),
  };

  if (existingIndex >= 0) {
    // Update existing account
    accounts[existingIndex] = newAccount;
  } else {
    // Add new account
    accounts.push(newAccount);
  }

  // Limit to maximum 5 accounts
  const MAX_ACCOUNTS = 5;
  if (accounts.length > MAX_ACCOUNTS) {
    // Remove oldest used account
    accounts.sort((a, b) => b.lastUsed - a.lastUsed);
    accounts.splice(MAX_ACCOUNTS);
  }

  saveAccounts(accounts);
}

/**
 * Remove an account from storage
 */
export function removeAccount(accountId: string): void {
  const accounts = getStoredAccounts();
  const filtered = accounts.filter((acc) => acc.id !== accountId);
  saveAccounts(filtered);
}

/**
 * Get account by ID
 */
export function getAccount(accountId: string): StoredAccount | null {
  const accounts = getStoredAccounts();
  return accounts.find((acc) => acc.id === accountId) || null;
}

/**
 * Update last used timestamp for an account
 */
export function updateLastUsed(accountId: string): void {
  const accounts = getStoredAccounts();
  const account = accounts.find((acc) => acc.id === accountId);

  if (account) {
    account.lastUsed = Date.now();
    saveAccounts(accounts);
  }
}

/**
 * Check if there are multiple accounts stored
 */
export function hasMultipleAccounts(): boolean {
  return getStoredAccounts().length > 1;
}

/**
 * Clear all stored accounts
 */
export function clearAllAccounts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get the current account ID from Supabase cookie/session
 */
export function getCurrentAccountId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try to get from Supabase cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name.includes('supabase') && name.includes('auth-token')) {
        const decoded = JSON.parse(decodeURIComponent(value));
        return decoded?.user?.id || null;
      }
    }
  } catch (error) {
    console.error('Error getting current account ID:', error);
  }

  return null;
}
