'use client';
import { useSession, signIn } from 'next-auth/react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Lock,
  LockKeyhole,
  ArrowRight,
  CheckCircle2,
  Scale,
  ArrowLeft,
} from 'lucide-react';

type UserRole = 'client' | 'lawyer' | 'firm' | 'bank';

interface SignupFormProps {
  role: UserRole;
  roleTitle: string;
  roleDescription: string;
}

export default function SignupForm({ role, roleTitle, roleDescription }: SignupFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: role,
    organization: '',
    barCouncilId: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.fullName || !formData.email || !formData.password) {
      return 'Please fill in all required fields';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      return 'Please agree to the Terms of Service and Privacy Policy';
    }

    // Role-specific validation
    if ((formData.role === 'firm' || formData.role === 'bank') && !formData.organization) {
      return 'Organization name is required';
    }

    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up with Supabase Auth
      const signUpRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: formData.role,
            },
          },
        })
      });
      const signUpData = await signUpRes.json();
      const { error, user } = signUpData;

      if (error) {
        throw new Error(error);
      }

      if (!user) {
        throw new Error('Failed to create user account');
      }

      // 2. Wait a moment for the auth trigger to create the profile, then update it with additional info
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Now update the profile with additional information
      const { error: updateError } = (await __getSupabaseClient()).from('profiles')
        .update({
          phone: formData.phone || null,
          organization: formData.organization || null,
          bar_council_id: formData.barCouncilId || null,
        })
        .eq('id', user.id);

      if (updateError) {
        console.warn('Profile update warning:', updateError);
      }

      // 3. Redirect to role-specific dashboard
      router.push(`/${formData.role}`);
      router.refresh();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn('google', { callbackUrl: `/${formData.role}` });
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-50 font-display min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Navigation */}
      <header className="w-full bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded overflow-hidden">
                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-text-main dark:text-white">
                Legal Opinion
              </h2>
            </Link>
            {/* Nav Actions */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm font-medium text-text-muted dark:text-slate-400">
                Already a member?
              </span>
              <Link
                href="/auth/login"
                className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-5 bg-primary/10 hover:bg-primary/20 dark:bg-slate-700 dark:hover:bg-slate-600 text-primary dark:text-blue-100 text-sm font-bold transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary dark:text-blue-400 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to role selection
          </Link>

          {/* Card Container */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-8 sm:p-10">
            {/* Header Section */}
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight mb-2">
                Create {roleTitle} Account
              </h1>
              <p className="text-text-muted dark:text-slate-400 text-base">{roleDescription}</p>
            </div>

            {/* Error Message */}
            {
              error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 text-text-main dark:text-white font-bold rounded-lg h-12 transition-all mb-6 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-8">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light dark:border-border-dark"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface-light dark:bg-surface-dark text-text-muted dark:text-slate-500 font-medium">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Main Form */}
            <form className="space-y-5" onSubmit={handleSignup}>
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="flex flex-col flex-1">
                  <span className="text-text-main dark:text-slate-200 text-sm font-semibold pb-2">
                    Full Name *
                  </span>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted dark:text-slate-500" />
                    <input
                      className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 text-base placeholder:text-text-muted/70"
                      placeholder="John Doe"
                      required
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </label>
                <label className="flex flex-col flex-1">
                  <span className="text-text-main dark:text-slate-200 text-sm font-semibold pb-2">
                    Email Address *
                  </span>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted dark:text-slate-500" />
                    <input
                      className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 text-base placeholder:text-text-muted/70"
                      placeholder="john@company.com"
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </label>
              </div>

              {/* Row 2: Phone */}
              <label className="flex flex-col">
                <span className="text-text-main dark:text-slate-200 text-sm font-semibold pb-2">
                  Phone Number
                </span>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted dark:text-slate-500" />
                  <input
                    className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 text-base placeholder:text-text-muted/70"
                    placeholder="+91 98765 43210"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </label>

              {/* Conditional Fields based on Role */}
              {(formData.role === 'firm' || formData.role === 'bank') && (
                <label className="flex flex-col">
                  <span className="text-text-main dark:text-slate-200 text-sm font-semibold pb-2">
                    Organization Name *
                  </span>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted dark:text-slate-500" />
                    <input
                      className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 text-base placeholder:text-text-muted/70"
                      placeholder="Your Company Ltd."
                      required
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </label>
              )}

              {
                formData.role === 'lawyer' && (
                  <label className="flex flex-col">
                    <span className="text-text-main dark:text-slate-200 text-sm font-semibold pb-2">
                      Bar Council ID (Optional)
                    </span>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted dark:text-slate-500" />
                      <input
                        className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 text-base placeholder:text-text-muted/70"
                        placeholder="BAR/ST/YYYY/XXXXX"
                        type="text"
                        name="barCouncilId"
                        value={formData.barCouncilId}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </label>
                )}

              {/* Row 3: Password & Confirmation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="flex flex-col flex-1">
                  <span className="text-text-main dark:text-slate-200 text-sm font-semibold pb-2">
                    Password *
                  </span>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted dark:text-slate-500" />
                    <input
                      className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 text-base placeholder:text-text-muted/70"
                      placeholder="Min 8 characters"
                      required
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </label>
                <label className="flex flex-col flex-1">
                  <span className="text-text-main dark:text-slate-200 text-sm font-semibold pb-2">
                    Confirm Password *
                  </span>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted dark:text-slate-500" />
                    <input
                      className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 text-base placeholder:text-text-muted/70"
                      placeholder="Re-enter password"
                      required
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </label>
              </div>

              {/* Terms & Conditions */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-start pt-0.5">
                    <input
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 checked:bg-primary checked:border-transparent focus:ring-2 focus:ring-primary/20 transition-all"
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    />
                    <CheckCircle2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-sm text-text-main dark:text-slate-300 leading-snug">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-primary dark:text-blue-400 font-bold hover:underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-primary dark:text-blue-400 font-bold hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-[#002855] text-white text-base font-bold shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  <span className="mr-2">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-text-muted dark:text-slate-500">
                <Lock className="w-3.5 h-3.5" />
                <span>Your data is encrypted and secure</span>
              </div>
            </form>
          </div>

          {/* Bottom Login Link (Responsive Mobile View) */}
          <div className="mt-8 text-center sm:hidden">
            <p className="text-text-main dark:text-slate-300 text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary dark:text-blue-400 font-bold hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-sm text-text-muted dark:text-slate-600">
        © 2026 Legal Opinion. All rights reserved.
      </footer>
    </div>
  );
}

// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
