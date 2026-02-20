import type { UserRole, Profile } from './types';

const STORAGE_KEY = 'legal_portal_accounts';

export interface StoredAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  token?: string; // NextAuth JWT token reference (replaces Supabase session)
  lastUsed: number;
}

export function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const accounts: StoredAccount[] = JSON.parse(stored);
    return accounts.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('Error loading stored accounts:', error);
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('[MultiAccount] Error saving accounts:', error);
  }
}

export function addAccount(session: any, profile: Profile): void {
  const accounts = getStoredAccounts();
  const existingIndex = accounts.findIndex((acc) => acc.id === profile.id);

  const newAccount: StoredAccount = {
    id: profile.id,
    email: profile.email,
    name: profile.full_name,
    role: profile.role,
    avatar_url: profile.avatar_url,
    lastUsed: Date.now(),
  };

  if (existingIndex >= 0) {
    accounts[existingIndex] = newAccount;
  } else {
    accounts.push(newAccount);
  }

  const MAX_ACCOUNTS = 5;
  if (accounts.length > MAX_ACCOUNTS) {
    accounts.sort((a, b) => b.lastUsed - a.lastUsed);
    accounts.splice(MAX_ACCOUNTS);
  }

  saveAccounts(accounts);
}

export function removeAccount(accountId: string): void {
  const accounts = getStoredAccounts();
  saveAccounts(accounts.filter((acc) => acc.id !== accountId));
}

export function getAccount(accountId: string): StoredAccount | null {
  return getStoredAccounts().find((acc) => acc.id === accountId) || null;
}

export function updateLastUsed(accountId: string): void {
  const accounts = getStoredAccounts();
  const account = accounts.find((acc) => acc.id === accountId);
  if (account) {
    account.lastUsed = Date.now();
    saveAccounts(accounts);
  }
}

export function hasMultipleAccounts(): boolean {
  return getStoredAccounts().length > 1;
}

export function clearAllAccounts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentAccountId(): string | null {
  if (typeof window === 'undefined') return null;
  // With NextAuth, session is managed server-side via cookies.
  // Return null here and rely on useSession() hook in components.
  return null;
}
