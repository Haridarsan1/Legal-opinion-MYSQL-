'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, Building2, Briefcase, Users, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles: { value: UserRole; label: string; icon: any }[] = [
    { value: 'client', label: 'Client / Individual', icon: User },
    { value: 'lawyer', label: 'Lawyer', icon: Briefcase },
    { value: 'firm', label: 'Law Firm', icon: Users },
    { value: 'bank', label: 'Bank / Institution', icon: Landmark },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            organization: organization || null,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: role,
            organization: organization || null,
          },
        ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Account created but profile setup failed');
        } else {
          toast.success('Account created successfully! Please check your email to verify.');
          router.push('/auth/login');
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Full Name Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="fullName"
          className="text-[#0c141d] text-sm font-semibold leading-normal ml-1"
        >
          Full Name
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <User className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            className="form-input block w-full rounded-lg border border-[#cddbea] bg-slate-50 text-[#0c141d] placeholder:text-slate-400 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-4 text-base font-normal shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[#0c141d] text-sm font-semibold leading-normal ml-1">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@lawfirm.com"
            required
            className="form-input block w-full rounded-lg border border-[#cddbea] bg-slate-50 text-[#0c141d] placeholder:text-slate-400 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-4 text-base font-normal shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-[#0c141d] text-sm font-semibold leading-normal ml-1"
        >
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            className="form-input block w-full rounded-lg border border-[#cddbea] bg-slate-50 text-[#0c141d] placeholder:text-slate-400 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-12 text-base font-normal shadow-sm transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-[#0c141d] text-sm font-semibold leading-normal ml-1">
          I am a...
        </label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                role === value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold text-left">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Organization Field (conditional) */}
      {(role === 'firm' || role === 'bank') && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="organization"
            className="text-[#0c141d] text-sm font-semibold leading-normal ml-1"
          >
            Organization Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Building2 className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Enter organization name"
              className="form-input block w-full rounded-lg border border-[#cddbea] bg-slate-50 text-[#0c141d] placeholder:text-slate-400 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-4 text-base font-normal shadow-sm transition-all"
            />
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
        />
        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
          I agree to the{' '}
          <Link href="/terms" className="text-primary hover:underline font-semibold">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline font-semibold">
            Privacy Policy
          </Link>
        </span>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !acceptedTerms}
        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-[#002852] active:bg-[#001f40] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating Account...
          </div>
        ) : (
          <span className="truncate">Create Account</span>
        )}
      </button>

      {/* Login Link */}
      <div className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </form>
  );
}
