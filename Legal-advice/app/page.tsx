import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Lock, Shield, Clock, Users, Globe, Gavel } from 'lucide-react';
import SmartSearchBar from '@/components/search/SmartSearchBar';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center">
                <Image src="/logo.jpeg" alt="Legal Opinion Logo" width={32} height={32} priority />
              </div>
              <span className="hidden text-lg font-bold text-primary sm:block">Legal Opinion</span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden max-w-lg flex-1 md:block">
              <SmartSearchBar />
            </div>

            {/* Navigation Links & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-6 md:flex">
                <Link className="text-sm font-medium text-slate-700 hover:text-primary" href="/">
                  Home
                </Link>
                <Link
                  className="text-sm font-medium text-slate-700 hover:text-primary"
                  href="/dashboard/client/departments"
                >
                  Practice Areas
                </Link>
                <Link
                  className="text-sm font-medium text-slate-700 hover:text-primary"
                  href="/auth/login"
                >
                  Pricing
                </Link>
                <Link
                  className="text-sm font-medium text-slate-700 hover:text-primary"
                  href="/auth/login"
                >
                  About
                </Link>
              </div>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <button className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary">
                  <Globe className="size-5" />
                </button>
                <div className="group relative">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-[#002855]"
                  >
                    <span>Login / Sign Up</span>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </Link>
                  {/* Dropdown */}
                  <div className="invisible absolute right-0 top-full mt-2 w-48 origin-top-right rounded-lg bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 transition-all group-hover:visible group-hover:opacity-100 opacity-0">
                    <Link
                      className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-primary"
                      href="/auth/login"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span> Client
                    </Link>
                    <Link
                      className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-primary"
                      href="/auth/login"
                    >
                      <span className="material-symbols-outlined text-[18px]">work</span> Lawyer
                    </Link>
                    <Link
                      className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-primary"
                      href="/auth/login"
                    >
                      <span className="material-symbols-outlined text-[18px]">account_balance</span>{' '}
                      Bank
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-[#003366] via-[#004080] to-[#001f3f] py-16 text-white sm:py-24">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          ></div>
        </div>
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-100 backdrop-blur-sm mb-6 border border-white/10">
                <span className="flex h-2 w-2 rounded-full bg-success"></span>
                Platform Live & Verified
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Expert Legal Opinions
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400">
                  Anytime, Anywhere
                </span>
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-lg leading-relaxed">
                Get quick expert analysis within 48 hours. Secure, confidential, and verified by
                over 500 legal experts globally.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center rounded-lg bg-success px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-[#218838] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success"
                >
                  Get Legal Opinion Now
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center rounded-lg border border-white/30 bg-white/5 px-6 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Lawyer Sign Up
                </Link>
              </div>
              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap gap-6 border-t border-white/10 pt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-success" />
                  <span className="text-sm font-medium text-blue-50">500+ Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="size-5 text-success" />
                  <span className="text-sm font-medium text-blue-50">100% Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="size-5 text-success" />
                  <span className="text-sm font-medium text-blue-50">Secure & Confidential</span>
                </div>
              </div>
            </div>

            {/* Hero Graphic / Live Request Status */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-bold text-white">Live Request Status</h3>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-200">
                    ID: #8821XJ
                  </span>
                </div>
                {/* Timeline */}
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-white">
                        <CheckCircle className="size-4" />
                      </div>
                      <div className="h-full w-0.5 bg-success/50"></div>
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-bold text-white">Query Submitted</p>
                      <p className="text-xs text-blue-200">Docs uploaded securely • 2 mins ago</p>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <Clock className="size-4" />
                      </div>
                      <div className="h-full w-0.5 bg-white/10"></div>
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-bold text-white">Expert Reviewing</p>
                      <p className="text-xs text-blue-200">
                        Matching with Senior Counsel • In Progress
                      </p>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-transparent text-white/40">
                        <span className="material-symbols-outlined text-sm">description</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60">Opinion Ready</p>
                      <p className="text-xs text-blue-200/50">Est. 48 hours</p>
                    </div>
                  </div>
                </div>
                {/* Card Action */}
                <div className="mt-6 rounded-lg bg-primary/40 p-3 text-center">
                  <p className="text-xs font-medium text-blue-100">
                    Average response time this week: <span className="text-success">36 hours</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-grow">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Choose Your Path
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Tailored solutions for every stakeholder in the legal ecosystem.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Client Card */}
            <div className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl border border-slate-100">
              <div className="mb-4 h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Users className="size-24 text-primary opacity-20" />
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="text-lg font-bold text-gray-900">Client</h3>
                </div>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  Individual or corporate entity seeking professional legal opinions and advice.
                </p>
                <Link
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                  href="/auth/signup"
                >
                  Join as Client
                </Link>
              </div>
            </div>

            {/* Lawyer Card */}
            <div className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl border border-slate-100">
              <div className="mb-4 h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                <div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <Gavel className="size-24 text-primary opacity-20" />
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <Gavel className="size-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-900">Legal Professional</h3>
                </div>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  Certified attorneys offering expert legal analysis, consultation, and services.
                </p>
                <Link
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                  href="/auth/signup"
                >
                  Join as Lawyer
                </Link>
              </div>
            </div>

            {/* Bank Card */}
            <div className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl border border-slate-100">
              <div className="mb-4 h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                <div className="h-full w-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[96px] text-primary opacity-20">
                    account_balance
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                  <h3 className="text-lg font-bold text-gray-900">Financial Institution</h3>
                </div>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  Banks and lenders requiring strict legal verification for complex transactions.
                </p>
                <Link
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                  href="/auth/signup"
                >
                  Join as Bank
                </Link>
              </div>
            </div>

            {/* Law Firm Card */}
            <div className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl border border-slate-100">
              <div className="mb-4 h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                <div className="h-full w-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Users className="size-24 text-primary opacity-20" />
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-900">Law Firm</h3>
                </div>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
                  Legal organizations managing multiple attorneys and institutional cases
                  efficiently.
                </p>
                <Link
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                  href="/auth/signup"
                >
                  Join as Firm
                </Link>
              </div>
            </div>
          </div>

          {/* Stats/Features Section */}
          <div className="mt-24 rounded-2xl bg-primary px-6 py-16 text-center text-white sm:px-12">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold sm:text-4xl">Why Leaders Choose Legal Opinion</h2>
              <p className="mt-4 text-blue-100">
                We combine technology with top-tier legal expertise.
              </p>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Clock className="size-6 text-success" />
                  </div>
                  <div className="text-3xl font-extrabold">48h</div>
                  <div className="text-sm font-medium text-blue-200">Turnaround Time</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Users className="size-6 text-success" />
                  </div>
                  <div className="text-3xl font-extrabold">500+</div>
                  <div className="text-sm font-medium text-blue-200">Legal Experts</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Shield className="size-6 text-success" />
                  </div>
                  <div className="text-3xl font-extrabold">100%</div>
                  <div className="text-sm font-medium text-blue-200">Encrypted Data</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Globe className="size-6 text-success" />
                  </div>
                  <div className="text-3xl font-extrabold">12</div>
                  <div className="text-sm font-medium text-blue-200">Languages Supported</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white pt-16 pb-8 text-slate-600">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <div className="size-8 flex items-center justify-center relative rounded-lg overflow-hidden">
                  <Image
                    src="/logo.jpeg"
                    alt="Legal Opinion Logo"
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="text-xl font-bold">Legal Opinion</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                The premier platform for rapid, secure, and expert legal opinions. Connecting
                clients with top-tier counsel globally.
              </p>
              <div className="flex gap-4">
                <Link className="text-slate-400 transition hover:text-primary" href="#">
                  <Globe className="size-5" />
                </Link>
                <Link className="text-slate-400 transition hover:text-primary" href="#">
                  <span className="material-symbols-outlined">mail</span>
                </Link>
              </div>
            </div>
            {/* Column 1 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link className="hover:text-primary" href="/dashboard/client/departments">
                    Practice Areas
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/signup">
                    For Banks
                  </Link>
                </li>
              </ul>
            </div>
            {/* Column 2 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            {/* Column 3 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" href="/auth/login">
                    Disclaimers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
            <p>© 2026 Legal Opinion Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
