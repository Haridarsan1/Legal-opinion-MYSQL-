'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  Eye,
  ArrowLeft,
  X,
} from 'lucide-react';

export default function LawyerSignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    barCouncilNumber: '',
    yearOfEnrollment: '',
    experienceYears: '',
    primaryPracticeAreas: [] as string[],
    jurisdiction: '',
    agreeToTerms: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const practiceAreaOptions = [
    'Civil',
    'Family',
    'Intellectual Property',
    'Cyber Law',
    'Constitutional',
    'Criminal Law',
    'Corporate Law',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const togglePracticeArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      primaryPracticeAreas: prev.primaryPracticeAreas.includes(area)
        ? prev.primaryPracticeAreas.filter((a) => a !== area)
        : [...prev.primaryPracticeAreas, area],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('🔑 Creating LAWYER account with role: lawyer');

      const signUpRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              role: 'lawyer',
              bar_council_id: formData.barCouncilNumber,
              year_of_enrollment: formData.yearOfEnrollment,
              years_of_experience: formData.experienceYears,
              practice_areas: formData.primaryPracticeAreas,
              jurisdiction: formData.jurisdiction,
            },
          },
        })
      });
      const signUpData = await signUpRes.json();
      const { error, user } = signUpData;

      if (error) throw new Error(error);
      if (!user) throw new Error('Failed to create user account');

      console.log('✅ Lawyer account created:', user);
      toast.success('Account created successfully!');

      // Automatically sign in the user after signup
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!signInResult?.ok) {
        // If auto-login fails, redirect to login page
        toast.info('Please log in with your credentials');
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push('/auth/login');
        return;
      }

      // Redirect to lawyer dashboard
      toast.success('Logged in successfully!');
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/lawyer');
      router.refresh();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark flex font-display">
      {/* Left Sidebar - Blue */}
      <div className="hidden lg:flex lg:w-[340px] bg-[#003d82] text-white flex-col p-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded overflow-hidden">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold">Legal Opinion</span>
          </div>

          <div className="mb-10">
            <h1 className="text-[32px] font-bold leading-tight mb-4">
              Verify your expertise.
              <br />
              Expand your reach.
            </h1>
            <p className="text-[15px] text-blue-100 leading-relaxed">
              Join India's most trusted network of legal professionals. Get access to verified
              cases, manage your practice digitally, and connect with clients securely.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-[15px]">Verified Professional Badge</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-[15px]">Access to Premium Corporate Clients</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-[15px]">Encrypted Document Management</span>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-700 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-[#003d82] flex items-center justify-center text-xs font-medium">
                JD
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-[#003d82] flex items-center justify-center text-xs font-medium">
                AS
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-[#003d82] flex items-center justify-center text-xs font-medium">
                MK
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Trusted by 15,000+ Lawyers</div>
              <div className="text-xs text-blue-200">Across 25+ High Courts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-[#e5e7eb] px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded overflow-hidden">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-bold text-[#111827]">Legal Opinion</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/" className="text-[#6b7280] hover:text-[#111827]">
                  Home
                </Link>
                <Link href="/about" className="text-[#6b7280] hover:text-[#111827]">
                  About Us
                </Link>
                <Link href="/support" className="text-[#6b7280] hover:text-[#111827]">
                  Contact Support
                </Link>
              </nav>
            </div>
            <Link
              href="/auth/login"
              className="px-5 py-2 bg-[#003d82] text-white font-medium rounded-lg text-sm hover:bg-[#002a5c] transition-colors"
            >
              Log In
            </Link>
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
              <h2 className="text-[28px] font-bold text-[#111827] mb-2">Create your account</h2>
              <p className="text-[15px] text-[#4f7aac]">
                Enter your credentials below to begin the verification process.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
                      placeholder="e.g, Aditi Sharma"
                      required
                      disabled={isLoading}
                      className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      required
                      disabled={isLoading}
                      className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7280]" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      disabled={isLoading}
                      className="w-full h-11 pl-10 pr-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
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
                      placeholder="Min. 8 characters"
                      required
                      disabled={isLoading}
                      className="w-full h-11 pl-10 pr-10 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
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

              <div className="pt-4">
                <h3 className="text-base font-semibold text-[#111827] mb-1">
                  Professional Credentials
                </h3>
                <p className="text-sm text-[#6b7280] mb-4">
                  Required for bar license verification.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Bar Council Enrollment Number
                    </label>
                    <input
                      type="text"
                      name="barCouncilNumber"
                      value={formData.barCouncilNumber}
                      onChange={handleInputChange}
                      placeholder="e.g, MAH/1234/2015"
                      required
                      disabled={isLoading}
                      className="w-full h-11 px-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Year of Enrollment
                      </label>
                      <select
                        name="yearOfEnrollment"
                        value={formData.yearOfEnrollment}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="w-full h-11 px-3 border border-[#d1d5db] rounded-lg text-[15px] text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(
                          (year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Experience (Years)
                      </label>
                      <input
                        type="text"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        placeholder="e.g, 5"
                        disabled={isLoading}
                        className="w-full h-11 px-3 border border-[#d1d5db] rounded-lg text-[15px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Primary Practice Areas (Select up to 3)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.primaryPracticeAreas.map((area) => (
                        <div
                          key={area}
                          className="inline-flex items-center gap-1 bg-[#003d82] text-white px-3 py-1 rounded-full text-sm"
                        >
                          {area}
                          <button
                            type="button"
                            onClick={() => togglePracticeArea(area)}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {practiceAreaOptions.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => togglePracticeArea(area)}
                          disabled={
                            formData.primaryPracticeAreas.length >= 3 &&
                            !formData.primaryPracticeAreas.includes(area)
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.primaryPracticeAreas.includes(area)
                            ? 'bg-[#003d82] text-white'
                            : 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] disabled:opacity-50'
                            }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Jurisdiction
                    </label>
                    <select
                      name="jurisdiction"
                      value={formData.jurisdiction}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="w-full h-11 px-3 border border-[#d1d5db] rounded-lg text-[15px] text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#003d82]/20 focus:border-[#003d82]"
                    >
                      <option value="">Select Court or State</option>
                      <option value="Supreme Court">Supreme Court</option>
                      <option value="Delhi High Court">Delhi High Court</option>
                      <option value="Bombay High Court">Bombay High Court</option>
                      <option value="Madras High Court">Madras High Court</option>
                      <option value="Karnataka High Court">Karnataka High Court</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Bar Council ID / Certificate
                    </label>
                    <div className="border-2 border-dashed border-[#d1d5db] rounded-lg p-8 text-center hover:border-[#003d82] transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-10 h-10 text-[#6b7280] mx-auto mb-3" />
                        <p className="text-sm font-medium text-[#111827] mb-1">
                          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-[#6b7280]">PDF, JPG or PNG (max. 10 MB)</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#003d82] focus:ring-2 focus:ring-[#003d82]/20"
                />
                <label className="text-sm text-[#6b7280] leading-snug">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#003d82] hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#003d82] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  , and I certify that the information provided is accurate.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#003d82] hover:bg-[#002a5c] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up for Verification'}
              </button>

              <p className="text-center text-sm text-[#6b7280] pt-4">
                Already verified?{' '}
                <Link href="/auth/login" className="text-[#003d82] hover:underline font-medium">
                  Log in here
                </Link>
              </p>
            </form>
          </div>
        </main>

        <footer className="border-t border-[#e5e7eb] px-8 py-4 text-center text-sm text-[#6b7280]">
          © 2026 Legal Opinion. All rights reserved.
        </footer>
      </div>
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
