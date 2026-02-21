'use client';
import { useSession } from 'next-auth/react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, Users, Landmark, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

export default function RoleSelectionForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const roles: { value: UserRole; label: string; description: string; icon: any; color: string }[] =
    [
      {
        value: 'client',
        label: 'Client / Individual',
        description: 'Get expert legal opinions for personal or business matters',
        icon: User,
        color: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400',
      },
      {
        value: 'lawyer',
        label: 'Lawyer',
        description: 'Provide professional legal opinions and expertise',
        icon: Briefcase,
        color: 'bg-green-50 text-green-600 border-green-200 hover:border-green-400',
      },
      {
        value: 'firm',
        label: 'Law Firm',
        description: ' Manage cases and team of lawyers effectively',
        icon: Users,
        color: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400',
      },
      {
        value: 'bank',
        label: 'Bank / Institution',
        description: 'Streamline property verification and due diligence',
        icon: Landmark,
        color: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400',
      },
      {
        value: 'admin',
        label: 'Platform Administrator',
        description: 'Manage users, content, and platform operations',
        icon: ShieldCheck,
        color: 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400',
      },
    ];

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement NextAuth user session fetch and Prisma role update
      const user = { id: 'mock-user-id' }; // Mock user

      if (!user) {
        toast.error('You must be logged in to select a role');
        router.push('/auth/login');
        return;
      }

      // Mock update user profile with selected role
      const error = null;

      if (error) {
        toast.error('Failed to update role');
        console.error(error);
      } else {
        toast.success(`Role set to ${selectedRole}!`);
        router.push(`/dashboard/${selectedRole}`);
        router.refresh();
      }
    } catch (error: any) {
      console.error('Role selection error:', error);
      toast.error('Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map(({ value, label, description, icon: Icon, color }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedRole(value)}
            className={`flex flex-col items-start gap-3 p-5 rounded-xl border-2 transition-all text-left ${selectedRole === value
                ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                : `${color} border-2`
              }`}
          >
            <div
              className={`p-3 rounded-lg ${selectedRole === value ? 'bg-primary/10' : 'bg-white'}`}
            >
              <Icon className={`w-7 h-7 ${selectedRole === value ? 'text-primary' : ''}`} />
            </div>
            <div>
              <h3
                className={`font-bold text-base mb-1 ${selectedRole === value ? 'text-primary' : 'text-slate-900'}`}
              >
                {label}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
            </div>
            {selectedRole === value && (
              <div className="mt-2 flex items-center gap-2 text-primary text-sm font-semibold">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Selected
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedRole || loading}
        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-[#002852] active:bg-[#001f40] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Setting Role...
          </div>
        ) : (
          <span className="truncate">Continue to Dashboard</span>
        )}
      </button>

      {/* Help Text */}
      <p className="text-center text-xs text-slate-500">
        You can change your role later from your account settings
      </p>
    </div>
  );
}
