import Link from 'next/link';

export default function NewRequestDeptSelectPage() {
  const departments = [
    { value: 'Corporate', label: 'Corporate & Commercial Law' },
    { value: 'Family', label: 'Family & Matrimonial Law' },
    { value: 'IP', label: 'Intellectual Property Rights' },
    { value: 'Civil', label: 'Civil Litigation & Dispute Resolution' },
    { value: 'Tax', label: 'Taxation Law' },
    { value: 'Property', label: 'Real Estate & Property Law' },
  ];

  const slaOptions = [
    { hours: 24, label: '24 Hours', price: '₹15,000', popular: false },
    { hours: 48, label: '48 Hours', price: '₹10,000', popular: true },
    { hours: 72, label: '72 Hours', price: '₹7,500', popular: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900">
            Start New Legal Opinion Request
          </h1>
          <p className="text-slate-500 text-base md:text-lg">
            Please select the relevant department and SLA to get started.
          </p>
        </div>

        {/* Stepper */}
        <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full"></div>

            {/* Active Progress Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary w-1/3 rounded-full"></div>

            {/* Step 1 (Active) */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-white">
                <span className="material-symbols-outlined text-sm md:text-base">domain</span>
              </div>
              <span className="text-sm font-bold text-primary whitespace-nowrap">Department</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold ring-4 ring-white border-2 border-slate-200">
                <span className="material-symbols-outlined text-sm md:text-base">description</span>
              </div>
              <span className="text-sm font-medium text-slate-400 whitespace-nowrap">
                Case Details
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold ring-4 ring-white border-2 border-slate-200">
                <span className="material-symbols-outlined text-sm md:text-base">check_circle</span>
              </div>
              <span className="text-sm font-medium text-slate-400 whitespace-nowrap">Review</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Form */}
          <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col gap-8">
              {/* Department Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-slate-900 text-base font-bold flex items-center gap-2">
                  Select Legal Department
                  <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 text-slate-900 p-4 pr-12 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option value="">Choose a department...</option>
                    {departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Select the department that best fits your legal inquiry.
                </p>
              </div>

              {/* SLA Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-slate-900 text-base font-bold flex items-center gap-2">
                  Select Service Level Agreement (SLA)
                  <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {slaOptions.map((sla) => (
                    <button
                      key={sla.hours}
                      className={`relative flex flex-col gap-2 p-4 rounded-xl border-2 transition-all hover:border-primary hover:shadow-md ${
                        sla.popular ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
                      }`}
                    >
                      {sla.popular && (
                        <span className="absolute -top-2 right-4 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">schedule</span>
                        <span className="text-lg font-bold text-slate-900">{sla.label}</span>
                      </div>
                      <span className="text-2xl font-black text-primary">{sla.price}</span>
                      <span className="text-xs text-slate-500">
                        Get your opinion within {sla.hours} hours
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  Choose the turnaround time that best fits your urgency.
                </p>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <Link
                href="/client"
                className="text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <Link
                href="/client/request/new/details"
                className="bg-primary hover:bg-primary/90 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-md flex items-center gap-2 transition-all"
              >
                Next Step
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">info</span>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">
                    Why choose the right department?
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Selecting the correct legal department ensures your request is reviewed by
                    specialists in that area, resulting in more accurate and comprehensive opinions.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Drafts */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Recent Drafts</h3>
                <button className="text-xs text-primary font-semibold hover:underline">
                  View All
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  className="group flex flex-col gap-1 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  href="#"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-primary">
                      IP Dispute - TechCorp
                    </p>
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                      Draft
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Edited 2h ago</p>
                </a>
                <a
                  className="group flex flex-col gap-1 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  href="#"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-primary">
                      Merger Inquiry
                    </p>
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                      Draft
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Edited 1d ago</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
