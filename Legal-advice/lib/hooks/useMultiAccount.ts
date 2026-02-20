'use client';

import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  getStoredAccounts,
  addAccount,
  removeAccount,
  updateLastUsed,
  hasMultipleAccounts,
  clearAllAccounts,
  type StoredAccount,
} from '../multi-account';
import type { Profile } from '../types';

export function useMultiAccount() {
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    setIsLoading(true);
    const storedAccounts = getStoredAccounts();
    setAccounts(storedAccounts);
    setIsLoading(false);
  };

  const addNewAccount = (session: Session, profile: Profile) => {
    addAccount(session, profile);
    loadAccounts();
  };

  const removeAccountById = (accountId: string) => {
    removeAccount(accountId);
    loadAccounts();
  };

  const updateAccountLastUsed = (accountId: string) => {
    updateLastUsed(accountId);
    loadAccounts();
  };

  const clearAll = () => {
    clearAllAccounts();
    loadAccounts();
  };

  const hasMultiple = accounts.length > 1;

  return {
    accounts,
    isLoading,
    hasMultiple,
    addAccount: addNewAccount,
    removeAccount: removeAccountById,
    updateLastUsed: updateAccountLastUsed,
    clearAll,
    refresh: loadAccounts,
  };
}
