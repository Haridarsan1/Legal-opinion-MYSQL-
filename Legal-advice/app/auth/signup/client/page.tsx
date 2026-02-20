'use client';

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
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function ClientSignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔑 Creating CLIENT account with role: client');

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'client',
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create user account');

      await new Promise((resolve) => setTimeout(resolve, 500));

      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', authData.user.id)
        .single();

      console.log('✅ Profile created:', profileCheck);
      console.log('📋 Assigned role:', profileCheck?.role);

      router.push('/client');
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f7fa] dark:bg-background-dark min-h-screen flex flex-col font-display antialiased">
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded overflow-hidden">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-[#111827]">Legal Opinion</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6b7280]">Already a member?</span>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#003d82] hover:text-[#002a5c] px-4 py-2 rounded-md bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[520px] mb-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4b5563] hover:text-[#111827]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to role selection
          </Link>
        </div>

        <div className="w-full max-w-[520px] bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-[#e5e7eb] p-8">
          <div className="mb-6">
            <h1 className="text-[26px] font-bold text-[#111827] mb-1">
              Create your Client Account
            </h1>
            <p className="text-[15px] text-[#4f7aac]">
              Get started with your legal opinion request today.
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#d1d5db] hover:bg-[#f9fafb] text-[#111827] font-medium rounded-lg h-11 transition-colors mb-5 disabled:opacity-50"
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

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e7eb]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-[#6b7280]">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
                    required
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[#374151]">Account Type</label>
                  <span className="text-xs text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded">
                    Fixed
                  </span>
                </div>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#003d82]" />
                  <input
                    type="text"
                    value="Client"
                    disabled
                    className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] bg-[#f9fafb] rounded-lg text-[15px] text-[#003d82] font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min 8 characters"
                    required
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-10 border border-[#d1d5db] rounded-lg text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    required
                    disabled={isLoading}
                    className="w-full h-11 pl-10 pr-10 border border-[#d1d5db] rounded-lg text-[15px] text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#003d82] focus:ring-2 focus:ring-[#003d82]/20"
              />
              <label className="text-sm text-[#6b7280] leading-snug">
                I agree to the{' '}
                <Link href="/terms" className="text-[#003d82] hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#003d82] hover:underline font-medium">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#003d82] hover:bg-[#002a5c] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Lock className="w-3.5 h-3.5 text-[#6b7280]" />
              <span className="text-xs text-[#6b7280]">Your data is encrypted and secure</span>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="text-sm text-[#6b7280]">© 2026 Legal Opinion. All rights reserved.</p>
      </footer>
    </div>
  );
}
