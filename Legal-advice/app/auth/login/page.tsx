'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        console.error('SignIn error:', result.error);
        return;
      }

      if (!result?.ok) {
        setError('Login failed. Please try again.');
        return;
      }

      // Get the session to determine the user's role
      const response = await fetch('/api/auth/session');
      const session = await response.json();

      if (session?.user?.role) {
        // Redirect to the user's role-specific dashboard
        const dashboardMap: Record<string, string> = {
          client: '/client',
          lawyer: '/lawyer',
          firm: '/firm',
          bank: '/bank',
          admin: '/admin',
        };
        const dashboard = dashboardMap[session.user.role] || '/client';
        router.push(dashboard);
      } else {
        // Fallback to home page
        router.push('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display antialiased text-slate-900 dark:text-white">
      <div className="layout-container flex h-full grow flex-col justify-center items-center p-4">
        {/* Login Card */}
        <div className="w-full max-w-[480px] bg-white dark:bg-[#1a2634] rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
          <div className="p-8 md:p-10 flex flex-col gap-6">
            {/* Back to Home Link */}
            <Link
              href="/"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>

            {/* Header Section */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg overflow-hidden mb-2">
                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-primary dark:text-blue-400 text-sm font-bold leading-normal tracking-[0.015em] uppercase text-center">
                Legal Opinion
              </h4>
              <h2 className="text-[#0c141d] dark:text-white tracking-light text-[28px] font-bold leading-tight text-center">
                Welcome Back
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center -mt-1">
                Please enter your details to sign in
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form Section */}
            <form className="flex flex-col gap-5 w-full" onSubmit={handleLogin}>
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[#0c141d] dark:text-slate-200 text-base font-medium leading-normal">
                  Email Address
                </label>
                <input
                  className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#0c141d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cddbea] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-primary h-14 placeholder:text-[#4573a1] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal transition-colors"
                  placeholder="name@firm.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[#0c141d] dark:text-slate-200 text-base font-medium leading-normal">
                    Password
                  </label>
                </div>
                <div className="flex w-full items-stretch rounded-lg group focus-within:ring-2 focus-within:ring-primary/20">
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg rounded-r-none text-[#0c141d] dark:text-white focus:outline-0 focus:ring-0 border border-[#cddbea] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-primary border-r-0 h-14 placeholder:text-[#4573a1] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal transition-colors"
                    placeholder="Enter your password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#4573a1] dark:text-slate-400 flex border border-[#cddbea] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 items-center justify-center pr-[15px] rounded-r-lg border-l-0 cursor-pointer hover:text-primary transition-colors group-focus-within:border-primary"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mt-1">
                <div className="custom-checkbox">
                  <label className="flex gap-x-3 items-center cursor-pointer">
                    <input
                      className="h-5 w-5 rounded border-[#cddbea] dark:border-slate-500 border-2 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 focus:border-primary focus:outline-none transition-colors cursor-pointer"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <p className="text-[#0c141d] dark:text-slate-300 text-sm font-medium leading-normal">
                      Remember me
                    </p>
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-bold text-primary dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-[#002a52] text-white text-base font-bold leading-normal tracking-[0.015em] w-full transition-all shadow-md mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="truncate">{isLoading ? 'Signing in...' : 'Log in'}</span>
              </button>
            </form>

            {/* SSO Divider */}
            <div className="relative flex items-center gap-2 py-2">
              <div className="grow border-t border-[#cddbea] dark:border-slate-700"></div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase px-2">
                Or continue with
              </span>
              <div className="grow border-t border-[#cddbea] dark:border-slate-700"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#cddbea] dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 h-12 px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1901 21.1039L16.3231 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853" />
                <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05" />
                <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
              </svg>
              <span className="text-[#0c141d] dark:text-white text-base font-bold leading-normal">
                Sign in with Google
              </span>
            </button>

            {/* Footer Link */}
            <div className="text-center pt-2">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Don&apos;t have an account?
                <Link
                  href="/auth/signup"
                  className="text-primary dark:text-blue-400 font-bold hover:underline ml-1"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Footer Text */}
        <p className="text-slate-400 dark:text-slate-600 text-xs mt-8 font-medium">
          © 2026 Legal Opinion. All rights reserved.
        </p>
      </div>
    </div>
  );
}
