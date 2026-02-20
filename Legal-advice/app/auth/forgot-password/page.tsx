'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, RotateCcw } from 'lucide-react'; // RotateCcw = Material's lock_reset

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none dark:from-slate-800/20"></div>

      {/* Main Card Container */}
      <main className="w-full max-w-[480px] relative z-10">
        <div className="bg-white dark:bg-[#1A2633] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header Image Section inside Card */}
          <div className="relative h-32 w-full overflow-hidden bg-primary">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-[#1A2633]"></div>
          </div>

          {/* Card Content */}
          <div className="px-8 pb-10 relative">
            {/* Floating Icon */}
            <div className="flex justify-center -mt-14 mb-4 relative z-20">
              <div className="h-24 w-24 bg-white dark:bg-[#1A2633] rounded-full flex items-center justify-center p-2 shadow-lg ring-1 ring-slate-100 dark:ring-slate-700">
                <div className="h-full w-full bg-background-light dark:bg-slate-800 rounded-full flex items-center justify-center text-primary dark:text-blue-400">
                  <RotateCcw className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center mb-8">
              <h1 className="text-[#0c141d] dark:text-white text-[28px] font-bold leading-tight mb-2 tracking-tight">
                Forgot Password
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-relaxed px-2">
                Enter your registered email to receive a password reset link.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">✓ Reset link sent successfully!</p>
                <p className="text-xs">Check your email for password reset instructions.</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Input Form */}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[#0c141d] dark:text-slate-200 text-sm font-semibold leading-normal ml-1"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    className="form-input block w-full rounded-lg border border-[#cddbea] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-[#0c141d] dark:text-white placeholder:text-slate-400 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary h-14 pl-12 pr-4 text-base font-normal shadow-sm transition-all"
                    id="email"
                    name="email"
                    placeholder="name@lawfirm.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-[#002852] active:bg-[#001f40] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading || success}
              >
                <span className="truncate">
                  {isLoading ? 'Sending...' : success ? 'Link Sent' : 'Send Reset Link'}
                </span>
              </button>
            </form>

            {/* Footer / Back Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <Link
                href="/auth/login"
                className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4.5 h-4.5 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Portal Branding Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 dark:text-slate-600 text-xs font-medium uppercase tracking-widest">
            Legal Opinion
          </p>
        </div>
      </main>
    </div>
  );
}
