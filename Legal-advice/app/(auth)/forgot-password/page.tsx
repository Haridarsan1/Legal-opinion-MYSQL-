import Link from 'next/link';
import { Metadata } from 'next';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password - Legal Opinion Portal',
  description: 'Reset your password to regain access to your account',
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-background-light min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

      {/* Main Card Container */}
      <main className="w-full max-w-[480px] relative z-10">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="relative h-32 w-full overflow-hidden bg-primary">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Card Content */}
          <div className="px-8 pb-10 relative">
            {/* Floating Icon */}
            <div className="flex justify-center -mt-14 mb-4 relative z-20">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center p-2 shadow-lg ring-1 ring-slate-100">
                <div className="h-full w-full bg-background-light rounded-full flex items-center justify-center text-primary">
                  <KeyRound className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center mb-8">
              <h1 className="text-[#0c141d] text-[28px] font-bold leading-tight mb-2 tracking-tight">
                Forgot Password
              </h1>
              <p className="text-slate-500 text-base font-normal leading-relaxed px-2">
                Enter your registered email to receive a password reset link.
              </p>
            </div>

            {/* Form */}
            <ForgotPasswordForm />

            {/* Footer / Back Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
              <Link
                href="/auth/login"
                className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
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
