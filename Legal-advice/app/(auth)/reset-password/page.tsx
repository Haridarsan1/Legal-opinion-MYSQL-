import { Metadata } from 'next';
import { Shield } from 'lucide-react';
import ResetPasswordForm from './ResetPasswordForm';
import BackButton from '@/components/shared/BackButton';

export const metadata: Metadata = {
  title: 'Reset Password - Legal Opinion Portal',
  description: 'Create a new password for your account',
};

export default function ResetPasswordPage() {
  return (
    <div className="bg-background-light min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

      {/* Main Card Container */}
      <main className="w-full max-w-[520px] relative z-10">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/auth/login" />
        </div>

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
                  <Shield className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center mb-8">
              <h1 className="text-[#0c141d] text-[28px] font-bold leading-tight mb-2 tracking-tight">
                Reset Password
              </h1>
              <p className="text-slate-500 text-base font-normal leading-relaxed px-2">
                Enter a new strong password for your account.
              </p>
            </div>

            {/* Form */}
            <ResetPasswordForm />
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
