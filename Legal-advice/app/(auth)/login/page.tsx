import Link from 'next/link';
import { Metadata } from 'next';
import { LogIn, Gavel } from 'lucide-react';
import LoginForm from './LoginForm';
import BackButton from '@/components/shared/BackButton';

export const metadata: Metadata = {
  title: 'Login - Legal Opinion Portal',
  description: 'Sign in to access your legal opinion dashboard',
};

export default function LoginPage() {
  return (
    <div className="bg-background-light min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

      {/* Main Card Container */}
      <main className="w-full max-w-[540px] relative z-10">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/" />
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary via-[#004080] to-[#001f3f]">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Card Content */}
          <div className="px-8 pb-10 relative">
            {/* Floating Icon */}
            <div className="flex justify-center -mt-20 mb-6 relative z-20">
              <div className="h-28 w-28 bg-white rounded-full flex items-center justify-center p-2 shadow-xl ring-1 ring-slate-100">
                <div className="h-full w-full bg-primary rounded-full flex items-center justify-center text-white">
                  <Gavel className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center mb-8">
              <h1 className="text-[#0c141d] text-3xl font-bold leading-tight mb-2 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-slate-500 text-base font-normal leading-relaxed">
                Sign in to access your legal opinion dashboard
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">
                  New to the platform?
                </span>
              </div>
            </div>

            {/* Signup Link */}
            <div className="text-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Create an account
              </Link>
            </div>
          </div>
        </div>

        {/* Portal Branding Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            Legal Opinion Portal
          </p>
        </div>
      </main>
    </div>
  );
}
