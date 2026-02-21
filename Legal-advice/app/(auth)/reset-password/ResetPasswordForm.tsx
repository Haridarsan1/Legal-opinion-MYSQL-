'use client';
import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const passwordStrength = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordStrength < 4) {
      toast.error('Password is too weak. Please meet all requirements.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement NextAuth password reset logic
      const error = null;

      if (error) {
        toast.error('Error');
      } else {
        setSuccess(true);
        toast.success('Password reset successfully!');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (error: any) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successfully!</h3>
        <p className="text-slate-600 text-sm">Redirecting you to login page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* New Password Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-[#0c141d] text-sm font-semibold leading-normal ml-1"
        >
          New Password
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
            placeholder="Enter new password"
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

      {/* Password Strength Indicator */}
      {
        password && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-3">Password Strength:</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${level <= passwordStrength
                      ? passwordStrength >= 4
                        ? 'bg-green-500'
                        : passwordStrength >= 3
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      : 'bg-slate-200'
                    }`}
                />
              ))}
            </div>
            <div className="space-y-1.5 text-xs">
              <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
              <PasswordRequirement met={hasUppercase} text="One uppercase letter" />
              <PasswordRequirement met={hasLowercase} text="One lowercase letter" />
              <PasswordRequirement met={hasNumber} text="One number" />
              <PasswordRequirement met={hasSpecialChar} text="One special character" />
            </div>
          </div>
        )}

      {/* Confirm Password Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="text-[#0c141d] text-sm font-semibold leading-normal ml-1"
        >
          Confirm New Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="form-input block w-full rounded-lg border border-[#cddbea] bg-slate-50 text-[#0c141d] placeholder:text-slate-400 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary h-14 pl-12 pr-12 text-base font-normal shadow-sm transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {confirmPassword && (
          <p className={`text-xs ml-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || passwordStrength < 4 || !passwordsMatch}
        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-[#002852] active:bg-[#001f40] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Resetting Password...
          </div>
        ) : (
          <span className="truncate">Reset Password</span>
        )}
      </button>
    </form>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-slate-300" />
      )}
      <span className={met ? 'text-green-700' : 'text-slate-500'}>{text}</span>
    </div>
  );
}
