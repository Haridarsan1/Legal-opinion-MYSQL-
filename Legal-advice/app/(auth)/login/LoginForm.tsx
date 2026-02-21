'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { addAccount } from '@/lib/multi-account';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      // Sign in with email and password
      const { error, data } = { error: 'Use NextAuth signIn() instead', data: null as any }; // TODO: migrate to signIn from next-auth/react

      if (error) {
        toast.error(error);
        return;
      }

      if (data?.user && data?.session) {
        console.log('[Login] User logged in:', data.user.id);
        console.log('[Login] Session:', data.session);

        // Fetch user profile to get role (TODO: role should be in NextAuth session)
        const profile: any = { role: 'client', id: 'mock-id', email: 'test@example.com', full_name: 'Mock User', created_at: new Date().toISOString() }; // Mock for build
        const profileError = null;

        console.log('[Login] Profile fetched:', profile);

        if (profileError) {
          console.error('[Login] Profile fetch error:', profileError);
          toast.error('Failed to fetch user profile');
          return;
        }

        if (!profile) {
          console.error('[Login] Profile is null');
          toast.error('User profile not found');
          return;
        }

        // Store account in multi-account storage
        console.log('[Login] Calling addAccount with session and profile...');
        try {
          addAccount(data.session, profile);
          console.log('[Login] addAccount completed successfully');
        } catch (accountError) {
          console.error('[Login] Error in addAccount:', accountError);
        }

        toast.success('Login successful!');

        // Redirect based on role
        const role = profile.role;
        console.log('[Login] Redirecting to:', `/${role}`);
        router.push(`/${role}`);
        router.refresh();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@lawfirm.com"
            required
            className="form-input block w-full rounded-lg border border-[#cddbea] bg-slate-50 text-[#0c141d] placeholder:text-slate-400 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary h-14 pl-12 pr-4 text-base font-normal shadow-sm transition-all"
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
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="form-input block w-full rounded-lg border border-[#cddbea] bg-slate-50 text-[#0c141d] placeholder:text-slate-400 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary h-14 pl-12 pr-12 text-base font-normal shadow-sm transition-all"
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

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
            Remember me
          </span>
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-[#002852] active:bg-[#001f40] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </div>
        ) : (
          <span className="truncate">Sign In</span>
        )}
      </button>
    </form>
  );
}
