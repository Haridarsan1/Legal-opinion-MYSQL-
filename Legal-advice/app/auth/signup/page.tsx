'use client';

import Link from 'next/link';
import { Scale, User, Building2, ArrowRight, Briefcase } from 'lucide-react';
import Image from 'next/image';

export default function SignupRoleSelectionPage() {
  return (
    <div className="bg-[#f8f9fb] dark:bg-background-dark min-h-screen flex flex-col font-display antialiased">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded overflow-hidden">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0d1829] dark:text-white">
              Legal Opinion
            </h2>
          </Link>
          {/* Log In Button */}
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-sm font-medium text-primary dark:text-blue-400 hover:underline"
          >
            Log In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-6xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#0d1829] dark:text-white tracking-tight mb-3">
              Join the Legal Opinion
            </h1>
            <p className="text-[#4a7aac] dark:text-blue-300 text-base sm:text-lg max-w-2xl mx-auto">
              Select your account type to access specialized tools
              <br className="hidden sm:block" />
              and services tailored to your needs.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
            {/* Client Card */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              {/* Background Image with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/client-bg.png"
                  alt="Client"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                {/* Icon */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#0d1829] dark:text-white mb-2">Client</h3>
                <p className="text-[#4a7aac] dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  Individual or corporate entity seeking professional legal opinions and advice.
                </p>
                <Link
                  href="/auth/signup/client"
                  className="flex items-center justify-center w-full h-11 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all group/btn"
                >
                  Join as Client
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Legal Professional Card (Most Popular) */}
            <div className="group relative bg-[#003366] dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-primary">
              {/* Most Popular Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              </div>

              {/* Background Image with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/lawyer-bg.png"
                  alt="Legal Professional"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                {/* Icon */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Legal Professional</h3>
                <p className="text-blue-200 text-sm mb-6 leading-relaxed">
                  Certified attorneys offering expert legal analysis, consultation, and services.
                </p>
                <Link
                  href="/auth/signup/lawyer"
                  className="flex items-center justify-center w-full h-11 rounded-lg bg-primary hover:bg-[#002855] text-white font-bold text-sm transition-all group/btn shadow-md"
                >
                  Join as Lawyer
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Financial Institution Card */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              {/* Background Image with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/bank-bg.png"
                  alt="Financial Institution"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                {/* Icon */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#0d1829] dark:text-white mb-2">
                  Financial Institution
                </h3>
                <p className="text-[#4a7aac] dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  Banks and lenders requiring strict legal verification for complex transactions.
                </p>
                <Link
                  href="/auth/signup/bank"
                  className="flex items-center justify-center w-full h-11 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all group/btn"
                >
                  Join as Bank
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Law Firm Card */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              {/* Background Image with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/firm-bg-v2.png"
                  alt="Law Firm"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                {/* Icon */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#0d1829] dark:text-white mb-2">Law Firm</h3>
                <p className="text-[#4a7aac] dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  Legal organizations managing multiple attorneys and institutional cases
                  efficiently.
                </p>
                <Link
                  href="/auth/signup/firm"
                  className="flex items-center justify-center w-full h-11 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all group/btn"
                >
                  Join as Firm
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Trusted by over 500 law firms and financial institutions globally.
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap opacity-40">
              {/* SecurityFirst */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-400"></div>
                <span className="text-sm font-medium text-slate-400">SecurityFirst</span>
              </div>
              {/* LexCorp */}
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">LexCorp</span>
              </div>
              {/* GlobalBank */}
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">GlobalBank</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            © 2026 Legal Opinion. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-primary dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-primary dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>
            <Link href="/support" className="text-primary dark:text-blue-400 hover:underline">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
