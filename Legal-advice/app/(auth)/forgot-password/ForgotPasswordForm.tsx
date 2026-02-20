'use client';
import { useSession } from 'next-auth/react';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {const session = await auth();
  const user = session?.user;

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success('Password reset link sent! Check your email.');
      }
    } catch (error: any) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">Email Sent Successfully!</p>
          <p className="text-green-600 text-sm mt-1">
            Check your inbox for the password reset link.
          </p>
        </div>
        <button
          onClick={() => setSent(false)}
          className="text-primary hover:underline text-sm font-semibold"
        >
          Didn't receive it? Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-[#002852] active:bg-[#001f40] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </div>
        ) : (
          <span className="truncate">Send Reset Link</span>
        )}
      </button>
    </form>
  );
}
