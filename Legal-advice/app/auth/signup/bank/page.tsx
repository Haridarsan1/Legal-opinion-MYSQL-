'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Building2,
  Shield,
  TrendingUp,
  Globe,
  User,
  IdCard,
  Phone,
  Mail,
  Lock,
  Upload,
  ArrowLeft,
  Eye,
} from 'lucide-react';

export default function BankSignupPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    registrationNumber: '',
    fullName: '',
    department: '',
    officialPhone: '',
    officialEmail: '',
    password: '',
    agreeToTerms: false,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('🔑 Creating BANK account with role: bank');

      const signUpRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        email: formData.officialEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.officialPhone,
            role: 'bank',
            institution_name: formData.organizationName,
            registration_number: formData.registrationNumber,
            authorized_person_name: formData.fullName,
            authorized_person_department: formData.department,
            authorized_person_phone: formData.officialPhone,
          },
        },
      })
      });
      const signUpData = await signUpRes.json();
      const { error } = signUpData;

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create user account');

      await new Promise((resolve) => setTimeout(resolve, 500));

      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', authData.user.id)
        .single();

      console.log('✅ Profile created:', profileCheck);
      console.log('📋 Assigned role:', profileCheck?.role);

      router.push('/bank');
      router.refresh();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark flex font-display">
      <div className="hidden lg:flex lg:w-[340px] bg-[#0056b3] text-white flex-col p-8">
        <div className="flex-1">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-8 h-8" />
              <span className="text-xl font-bold">BankSecure</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              Official Banking Partner
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-[32px] font-bold leading-tight mb-4">
              Trusted by 500+ Financial Institutions
            </h1>
            <p className="text-[15px] text-blue-100 leading-relaxed">
              Secure, compliant, and fast banking infrastructure designed for the modern financial
              world.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Bank-Grade Security</h3>
                <p className="text-sm text-blue-100">
                  AES-256 encryption and SOC 2 Type II compliant infrastructure.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Real-time Compliance</h3>
                <p className="text-sm text-blue-100">
                  Automated regulatory checks for KYC, KYB, and AML.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Global Network</h3>
                <p className="text-sm text-blue-100">
                  Seamlessly access markets and settle in 100+ currencies.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-600 pt-6">
          <p className="text-sm text-blue-100 italic mb-3">
            "BankSecure has transformed our onboarding process efficiency by 200%."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-sm font-semibold">
              JW
            </div>
            <div>
              <div className="text-sm font-semibold">James Wilson</div>
              <div className="text-xs text-blue-200">CTO, Apex Finance</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-[#e5e7eb] px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="lg:hidden flex items-center gap-2">
              <Building2 className="w-7 h-7 text-[#0056b3]" />
              <span className="text-lg font-bold text-[#111827]">BankSecure</span>
            </Link>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-[#6b7280]">Already a partner?</span>
              <Link
                href="/auth/login"
                className="px-5 py-2 bg-[#0056b3] text-white font-medium rounded-lg text-sm hover:bg-[#003d82] transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-[680px] mx-auto">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#4b5563] hover:text-[#111827] mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to role selection
            </Link>

            <div className="mb-8">
              <h2 className="text-[28px] font-bold text-[#111827] mb-2">Register Institution</h2>
              <p className="text-[15px] text-[#6b7280]">
                Join our secure banking network. Please verify your organizational details below.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wide mb-4">
                  Organization Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Organization Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          placeholder="e.g, Acme Financial Group"
                          required
                          disabled={isLoading}
                          className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0056b3]/20 focus:border-[#0056b3]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Registration Number / GSTIN
                      </label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          placeholder="e.g, 12ABCDE3456F1Z5"
                          required
                          disabled={isLoading}
                          className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0056b3]/20 focus:border-[#0056b3]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Company Logo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-[#d1d5db] rounded-lg p-6 text-center hover:border-[#0056b3] transition-colors">
                      <input
                        type="file"
                        id="logo-upload"
                        onChange={handleLogoChange}
                        accept=".png,.jpg,.jpeg,.gif"
                        className="hidden"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-[#6b7280] mx-auto mb-2" />
                        <p className="text-sm font-medium text-[#0056b3] mb-1">
                          {logoFile ? logoFile.name : 'Upload a file'}{' '}
                          <span className="text-[#6b7280]">or drag and drop</span>
                        </p>
                        <p className="text-xs text-[#6b7280]">PNG, JPG, GIF up to 10 MB</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wide mb-4">
                  Authorized Person Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Authorized Signatory Name"
                        required
                        disabled={isLoading}
                        className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0056b3]/20 focus:border-[#0056b3]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Department
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading}
                          className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#0056b3]/20 focus:border-[#0056b3] appearance-none"
                        >
                          <option value="">Select Department</option>
                          <option value="Legal">Legal</option>
                          <option value="Compliance">Compliance</option>
                          <option value="Operations">Operations</option>
                          <option value="Risk Management">Risk Management</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Official Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                        <input
                          type="tel"
                          name="officialPhone"
                          value={formData.officialPhone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 000-0000"
                          disabled={isLoading}
                          className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0056b3]/20 focus:border-[#0056b3]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wide mb-4">
                  Account Security
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Official Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                        <input
                          type="email"
                          name="officialEmail"
                          value={formData.officialEmail}
                          onChange={handleInputChange}
                          placeholder="name@company.com"
                          required
                          disabled={isLoading}
                          className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0056b3]/20 focus:border-[#0056b3]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          required
                          disabled={isLoading}
                          className="w-full h-11 pl-10 pr-10 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0056b3]/20 focus:border-[#0056b3]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827]"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20"
                />
                <label className="text-sm text-[#6b7280] leading-snug">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#0056b3] hover:underline font-medium">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#0056b3] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  .<br />
                  <span className="text-xs">
                    By registering, you confirm that you are authorized to act on behalf of the
                    institution.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0056b3] hover:bg-[#003d82] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register Institution'}
              </button>

              <p className="text-center text-sm text-[#6b7280] pt-2">
                Having trouble?{' '}
                <Link href="/support" className="text-[#0056b3] hover:underline font-medium">
                  Contact Support
                </Link>
              </p>
            </form>
          </div>
        </main>

        <footer className="border-t border-[#e5e7eb] px-8 py-4 text-center text-sm text-[#6b7280]">
          © 2024 BankSecure. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
