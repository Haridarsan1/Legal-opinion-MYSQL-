import { TrendingUp, TrendingDown } from 'lucide-react';

export default function FirmAnalyticsPage() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">Firm Analytics</h1>
          <p className="text-slate-500 text-base">
            Comprehensive performance metrics and insights for your firm
          </p>
        </div>
        <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium cursor-pointer">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Last 6 Months</option>
          <option>Last Year</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-sm font-medium">Total Cases Closed</p>
            <span className="material-symbols-outlined text-green-600 text-xl">trending_up</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">187</p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-green-600 font-medium">+24%</span>
            <span className="text-slate-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-sm font-medium">Avg. Turnaround Time</p>
            <span className="material-symbols-outlined text-blue-600 text-xl">schedule</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">28h</p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingDown className="size-4 text-green-600" />
            <span className="text-green-600 font-medium">-12% faster</span>
            <span className="text-slate-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-sm font-medium">Client Satisfaction</p>
            <span className="material-symbols-outlined text-yellow-600 text-xl">star</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">4.8</p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-green-600 font-medium">+0.3</span>
            <span className="text-slate-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
            <span className="material-symbols-outlined text-green-600 text-xl">payments</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">₹92.5L</p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-green-600 font-medium">+32%</span>
            <span className="text-slate-500">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Volume Trend */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Case Volume Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {[45, 52, 48, 68, 61, 58, 75, 68, 72, 65, 70, 87].map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t-lg hover:bg-primary/80 transition-colors cursor-pointer"
                  style={{ height: `${(value / 87) * 100}%` }}
                ></div>
                <span className="text-[10px] text-slate-400">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Cases by Department</h2>
          <div className="space-y-4">
            {[
              { name: 'Corporate & Tax Law', count: 72, percentage: 38, color: 'bg-blue-500' },
              { name: 'IP & Technology', count: 48, percentage: 26, color: 'bg-purple-500' },
              { name: 'Real Estate', count: 38, percentage: 20, color: 'bg-green-500' },
              { name: 'Employment Law', count: 20, percentage: 11, color: 'bg-amber-500' },
              { name: 'Others', count: 9, percentage: 5, color: 'bg-slate-400' },
            ].map((dept) => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                  <span className="text-sm text-slate-500">
                    {dept.count} ({dept.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`${dept.color} h-2 rounded-full transition-all`}
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Team Performance Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Lawyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Avg. Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  name: 'James Wilson',
                  cases: 24,
                  time: '32h',
                  rating: 4.9,
                  revenue: '₹18.5L',
                  efficiency: 96,
                },
                {
                  name: 'Sarah Chen',
                  cases: 20,
                  time: '28h',
                  rating: 4.8,
                  revenue: '₹15.2L',
                  efficiency: 94,
                },
                {
                  name: 'Michael Ross',
                  cases: 18,
                  time: '30h',
                  rating: 4.9,
                  revenue: '₹14.8L',
                  efficiency: 92,
                },
                {
                  name: 'Emily Davis',
                  cases: 15,
                  time: '26h',
                  rating: 4.7,
                  revenue: '₹12.5L',
                  efficiency: 90,
                },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-slate-200"></div>
                      <span className="font-medium text-slate-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.cases}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.time}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-yellow-500 text-sm">
                        star
                      </span>
                      <span className="font-bold text-slate-900">{row.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{row.revenue}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${row.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-slate-900 w-8">{row.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row - Revenue & SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700">Earned Revenue</p>
                <p className="text-xs text-slate-500">Completed & delivered</p>
              </div>
              <p className="text-2xl font-bold text-green-600">₹75.2L</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700">Pending Revenue</p>
                <p className="text-xs text-slate-500">In progress</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">₹17.3L</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm font-medium text-slate-900">Total Monthly Revenue</p>
                <p className="text-xs text-slate-600">October 2023</p>
              </div>
              <p className="text-2xl font-bold text-primary">₹92.5L</p>
            </div>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">SLA Compliance</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">Within SLA</p>
                <p className="text-sm font-bold text-green-600">94%</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">At Risk (24h remaining)</p>
                <p className="text-sm font-bold text-amber-600">4%</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-amber-500 h-3 rounded-full" style={{ width: '4%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">Breached SLA</p>
                <p className="text-sm font-bold text-red-600">2%</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: '2%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Excellent SLA performance this month. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
