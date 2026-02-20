import { TrendingUp, TrendingDown } from 'lucide-react';

export default function SystemAnalyticsPage() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
            System Analytics
          </h1>
          <p className="text-slate-500 text-base">
            Platform-wide insights on user growth, case volume, and revenue
          </p>
        </div>
        <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium cursor-pointer">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Last 6 Months</option>
          <option>Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <p className="text-slate-500 text-sm font-medium mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900 mb-1">₹5.2Cr</p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-green-600 font-medium">+28%</span>
            <span className="text-slate-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <p className="text-slate-500 text-sm font-medium mb-2">Cases Completed</p>
          <p className="text-3xl font-bold text-slate-900 mb-1">1,847</p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-green-600 font-medium">+18%</span>
            <span className="text-slate-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <p className="text-slate-500 text-sm font-medium mb-2">Avg. Turnaround</p>
          <p className="text-3xl font-bold text-slate-900 mb-1">34h</p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingDown className="size-4 text-green-600" />
            <span className="text-green-600 font-medium">-8% faster</span>
            <span className="text-slate-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <p className="text-slate-500 text-sm font-medium mb-2">User Satisfaction</p>
          <p className="text-3xl font-bold text-slate-900 mb-1">4.7</p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-green-600 font-medium">+0.3</span>
            <span className="text-slate-500">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Volume by Department */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Cases by Department</h2>
          <div className="space-y-4">
            {[
              { name: 'Real Estate & Property', count: 548, percentage: 35, color: 'bg-blue-500' },
              { name: 'Corporate & Tax Law', count: 442, percentage: 28, color: 'bg-purple-500' },
              { name: 'Intellectual Property', count: 332, percentage: 21, color: 'bg-green-500' },
              { name: 'Employment Law', count: 248, percentage: 16, color: 'bg-amber-500' },
            ].map((dept) => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                  <span className="text-sm text-slate-500">
                    {dept.count} ({dept.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`${dept.color} h-2.5 rounded-full transition-all`}
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Monthly Revenue Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {[1.2, 1.4, 1.6, 1.8, 2.1, 2.4, 2.8, 3.2, 3.6, 4.2, 4.8, 5.2].map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-green-500 rounded-t-lg hover:bg-green-600 transition-colors cursor-pointer"
                  style={{ height: `${(value / 5.2) * 100}%` }}
                ></div>
                <span className="text-[10px] text-slate-400">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">User Growth (Last 12 Months)</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {[420, 485, 512, 548, 595, 638, 692, 745, 812, 891, 952, 1024].map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t-lg hover:bg-primary/80 transition-colors cursor-pointer"
                  style={{ height: `${(value / 1024) * 100}%` }}
                ></div>
                <span className="text-[10px] text-slate-400">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Firms */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Top Performing Law Firms</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Wilson & Associates', cases: 184, rating: 4.9, revenue: '₹42L' },
                { name: 'Legal Partners LLP', cases: 156, rating: 4.8, revenue: '₹36L' },
                { name: 'Mumbai Law Chambers', cases: 128, rating: 4.7, revenue: '₹28L' },
                { name: 'Supreme Legal Associates', cases: 98, rating: 4.6, revenue: '₹22L' },
              ].map((firm, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="font-bold text-slate-600">#{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{firm.name}</p>
                      <p className="text-xs text-slate-500">{firm.cases} cases completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-sm">{firm.revenue}</p>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-yellow-500 text-xs">
                        star
                      </span>
                      <span className="text-xs font-medium text-slate-900">{firm.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SLA Performance */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">SLA Performance Across Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">24h Expedited</span>
              <span className="text-sm font-bold text-green-600">97% on-time</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '97%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">48h Standard</span>
              <span className="text-sm font-bold text-green-600">95% on-time</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">72h Regular</span>
              <span className="text-sm font-bold text-green-600">98% on-time</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '98%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
