'use client';
import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Loader2,
  Mail,
  User,
  Lock,
  ArrowRight,
  Building2,
  CheckCircle,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  LayoutTemplate,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function FirmSignupPage() {
  const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form State
  const [firmName, setFirmName] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = { data: { user: (await auth())?.user }, error: null };
      if (session) {
        setIsAuthenticated(true);
        if (session.user.email) setEmail(session.user.email);
      }
    };
    checkAuth();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!acceptedTerms) {
        toast.error('You must accept the Terms and Privacy Policy');
        return;
      }
    }

    setIsLoading(true);

    try {
      // 1. Authenticate if needed
      if (!isAuthenticated) {
        const signUpRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          options: {
            data: {
              full_name: ownerName,
              role: 'firm',
            },
          },
        })
      });
      const signUpData = await signUpRes.json();
      const { error } = signUpData;

        if (authError) throw authError;

        if (authData.session) {
          setIsAuthenticated(true);
        } else if (authData.user && !authData.session) {
          toast.success('Verification email sent. Please check your inbox.');
          setIsLoading(false);
          return;
        }
      }

      // 2. Create Firm
      const {
        data: { session },
      } = { data: { user: (await auth())?.user }, error: null };
      if (isAuthenticated && !session) {
        // Session might be missing if just signed up with email confirmation flow
        // But we usually need session to create firm.
        // If the user isn't confirmed, they can't create firm yet in this flow.
        toast.success('Please verify email to continue.');
        return;
      }

      // Double check we have a session before calling API
      if (!session) {
        // Wait for auth state change or just return
        return;
      }

      const res = await fetch('/api/v1/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firm_name: firmName,
          official_email: officialEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error codes if API returns them
        if (res.status === 409) {
          toast.error('This official email is already registered.');
        } else {
          throw new Error(data.error || 'Failed to create firm');
        }
        return;
      }

      toast.success('Firm account created successfully!');
      router.push('/firm');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1120] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <LayoutTemplate className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">Legal Opinion</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Empowering Law Firms with Digital Excellence.
          </h1>
          <p className="text-xl text-slate-400 max-w-md">
            Join an elite network of partner firms and streamline your legal request management
            today.
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Testimonial Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <div className="flex gap-1 mb-4 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p className="text-lg italic text-slate-200 mb-6">
              "Legal Opinion has transformed how we handle corporate requests. The interface is
              intuitive and the support is exceptional."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold">
                SM
              </div>
              <div>
                <p className="font-semibold">Sarah Mitchell</p>
                <p className="text-sm text-slate-400">Senior Partner, Mitchell & Co.</p>
              </div>
            </div>
          </div>

          {/* Trusted By */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-[#0B1120] ${['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i - 1]}`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Trusted by 500+ law firms worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[520px] space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 text-slate-900">
            <LayoutTemplate className="w-6 h-6" />
            <span className="font-bold">Legal Opinion</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Join as a Partner Firm</h2>
            <p className="text-slate-500">
              Register your law firm to manage requests and team members.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Owner Account Details
                </h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Owner Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 focus:ring-0 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Owner Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 focus:ring-0 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                      placeholder="john@example.com"
                      required
                      disabled={isAuthenticated}
                    />
                  </div>
                  {isAuthenticated && <p className="text-xs text-green-600 mt-1">✓ Verified</p>}
                </div>

                {!isAuthenticated && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 focus:ring-0 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {/* Strength Meter Mockup */}
                      {
  password.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          <div
                            className={`h-1 flex-1 rounded-full ${password.length > 0 ? 'bg-green-500' : 'bg-slate-100'}`}
                          />
                          <div
                            className={`h-1 flex-1 rounded-full ${password.length > 5 ? 'bg-green-500' : 'bg-slate-100'}`}
                          />
                          <div
                            className={`h-1 flex-1 rounded-full ${password.length > 8 ? 'bg-green-500' : 'bg-slate-100'}`}
                          />
                          <div className="h-1 flex-1 rounded-full bg-slate-100" />
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">Strong password</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                      <div className="relative">
                        <RefreshCw className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 focus:ring-0 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Firm Professional Details
                </h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Legal Firm Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={firmName}
                      onChange={(e) => setFirmName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 focus:ring-0 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                      placeholder="Legal Associates LLP"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Official Firm Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-800 focus:ring-0 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                      placeholder="contact@firm.com"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    This email will be used for all official portal notifications.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              {!isAuthenticated && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm checked:border-slate-900 checked:bg-slate-900 focus:ring-0 transition-all"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <CheckCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    I accept the{' '}
                    <Link href="/terms" className="font-semibold underline text-slate-900">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-semibold underline text-slate-900">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0B1120] text-white font-medium h-12 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Firm Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-slate-900 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
