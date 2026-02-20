'use client';

import { Bell, TrendingUp, Info } from 'lucide-react';

export default function LawyerRightSidebar() {
  return (
    <aside className="hidden lg:block w-80 shrink-0 space-y-6">
      {/* Notifications Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-slate-900">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">New Lawyer in Mumbai</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Adv. Priya Sharma matches your recent search.
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">2 mins ago</span>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">Consultation Fee Drop</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Adv. Rajesh Kumar lowered their fee by 15%.
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">5 New Reviews</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Lawyers you viewed have new client feedback.
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
            </div>
          </div>
        </div>

        <button className="w-full mt-4 py-2 text-xs font-semibold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
          View All Notifications
        </button>
      </div>

      {/* Quick Tip / Promo Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold">Pro Tip</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Verified lawyers with 10+ years of experience respond 2x faster on average.
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/10 p-2 rounded-lg">
          <Info className="w-4 h-4 shrink-0" />
          <span>Look for the blue shield badge.</span>
        </div>
      </div>
    </aside>
  );
}
