'use client';
import { useSession } from 'next-auth/react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check } from 'lucide-react';
import { useMultiAccount } from '@/lib/hooks/useMultiAccount';
import { createClient } from '@/lib/supabase/client';
import type { StoredAccount } from '@/lib/multi-account';
import { toast } from 'sonner';

interface AccountSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export default function AccountSwitcher({ isOpen, onClose, currentUserId }: AccountSwitcherProps) {
  const router = useRouter();
  const { accounts } = useMultiAccount();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitchAccount = async (account: StoredAccount) => {
    if (account.id === currentUserId) {
      onClose();
      return;
    }

    setSwitchingTo(account.id);

    try {
            // Set the session from stored account
      const session = await auth();
  const user = session?.user;

      if (error) {
        console.error('Switch account error:', error);
        toast.error('Failed to switch account. Session may have expired.');
        return;
      }

      toast.success(`Switched to ${account.name}`);

      // Redirect to the appropriate dashboard
      router.push(`/${account.role}`);
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error switching account:', error);
      toast.error('Failed to switch account');
    } finally {
      setSwitchingTo(null);
    }
  };

  const handleAddAccount = () => {
    router.push('/auth/login?multiAccount=true');
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleDescription = (account: StoredAccount) => {
    const roleDescriptions: Record<string, string> = {
      client: 'Client Account',
      lawyer: 'Lawyer Account',
      firm: 'Law Firm',
      bank: 'Bank Account',
      admin: 'Administrator',
    };
    return roleDescriptions[account.role] || account.role;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-50 animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Dropdown Panel - Instagram Style */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm animate-in zoom-in-95 duration-150">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Handle Bar (like Instagram) */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Accounts List */}
          <div className="px-4 py-2">
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No saved accounts</div>
            ) : (
              <div className="space-y-0">
                {accounts.map((account) => {
                  const isCurrent = account.id === currentUserId;
                  const isSwitching = switchingTo === account.id;

                  return (
                    <button
                      key={account.id}
                      onClick={() => handleSwitchAccount(account)}
                      disabled={isSwitching}
                      className="w-full flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {account.avatar_url ? (
                          <img
                            src={account.avatar_url}
                            alt={account.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg border-2 border-white">
                            {getInitials(account.name)}
                          </div>
                        )}
                        {
  isCurrent && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Account Info */}
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-[15px] text-gray-900 truncate">
                          {account.name}
                        </p>
                        <p className="text-[13px] text-gray-500 truncate">
                          {getRoleDescription(account)}
                        </p>
                      </div>

                      {/* Radio Indicator */}
                      <div className="flex-shrink-0">
                        {isSwitching ? (
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isCurrent ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}
                          >
                            {isCurrent && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Account Button */}
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              onClick={handleAddAccount}
              className="w-full flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* Plus Icon in Circle */}
              <div className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                <Plus className="w-7 h-7 text-gray-600" strokeWidth={2} />
              </div>

              {/* Text */}
              <div className="flex-1 text-left">
                <p className="font-semibold text-[15px] text-gray-900">Add account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
