import { Metadata } from 'next';
import { UserPlus } from 'lucide-react';
import SignupForm from './SignupForm';
import BackButton from '@/components/shared/BackButton';

export const metadata: Metadata = {
  title: 'Sign Up - Legal Opinion Portal',
  description: 'Create your account to access legal opinions',
};

export default function SignupPage() {
  return (
    <div className="bg-background-light min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

      {/* Main Card Container */}
      <main className="w-full max-w-[600px] relative z-10">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton href="/auth/login" />
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-primary via-[#004080] to-[#001f3f]">
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
            <div className="flex justify-center -mt-16 mb-6 relative z-20">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center p-2 shadow-xl ring-1 ring-slate-100">
                <div className="h-full w-full bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <UserPlus className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center mb-8">
              <h1 className="text-[#0c141d] text-3xl font-bold leading-tight mb-2 tracking-tight">
                Create Account
              </h1>
              <p className="text-slate-500 text-base font-normal leading-relaxed">
                Join our platform to access expert legal opinions
              </p>
            </div>

            {/* Signup Form */}
            <SignupForm />
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
