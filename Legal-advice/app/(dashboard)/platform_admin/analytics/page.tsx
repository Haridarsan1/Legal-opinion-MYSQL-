'use client';

import { Download, Calendar, TrendingUp, Clock, AlertTriangle, Server, Search } from 'lucide-react';

export default function SystemAnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Analytics</h1>
            <p className="text-slate-600 mt-1">Sep 01 - Sep 30, 2023</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Calendar className="w-4 h-4" />
              This Month
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-slate-900">1,240</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-green-600 font-medium">↑ +12%</span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Avg Resolution</p>
                <p className="text-3xl font-bold text-slate-900">4.2 Days</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-green-600 font-medium">↓ 0.5 days</span>
              <span className="text-slate-500">improvement</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Open Disputes</p>
                <p className="text-3xl font-bold text-slate-900">85</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-orange-600 font-medium">⚠</span>
              <span className="text-slate-500">Requires Attention</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Server Load</p>
                <p className="text-3xl font-bold text-slate-900">32%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Server className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Healthy Status
              </span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* User Activity Trends */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">User Activity Trends</h3>
                <p className="text-sm text-slate-500">Daily logins vs Case submissions</p>
              </div>
              <span className="text-sm text-green-600 font-medium">↑ +12%</span>
            </div>
            {/* Placeholder for chart */}
            <div className="h-64 bg-gradient-to-b from-blue-50 to-transparent rounded-lg flex items-end justify-center p-8">
              <div className="w-full  bg-blue-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-slate-600">Chart: User Activity Line Graph</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
              <span>Sep 01</span>
              <span>Sep 07</span>
              <span>Sep 14</span>
              <span>Sep 21</span>
              <span>Sep 30</span>
            </div>
          </div>

          {/* Cases by Category */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cases by Legal Category</h3>
                <p className="text-sm text-slate-500">Distribution of case types</p>
              </div>
              <span className="text-lg font-bold text-slate-900">1,204</span>
            </div>
            {/* Placeholder for bar chart */}
            <div className="h-64 flex items-end gap-4">
              {[
                { label: 'Family', height: '60%', color: 'bg-blue-500' },
                { label: 'Corp', height: '50%', color: 'bg-blue-500' },
                { label: 'Criminal', height: '80%', color: 'bg-blue-500' },
                { label: 'Civil', height: '40%', color: 'bg-blue-500' },
                { label: 'IP', height: '65%', color: 'bg-blue-500' },
                { label: 'Other', height: '30%', color: 'bg-blue-300' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                    <div
                      className={`w-full ${bar.color} rounded-t-lg`}
                      style={{ height: bar.height }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Usage & Top Search Terms */}
        <div className="grid grid-cols-2 gap-6">
          {/* Regional Usage */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Regional Usage</h3>
              <button className="text-sm text-blue-600 hover:underline">View Map</button>
            </div>
            <div className="space-y-4">
              {/* Map placeholder */}
              <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <p className="text-sm text-slate-600">Map: Top Region - North America</p>
              </div>
              {/* Regional stats */}
              <div className="space-y-3">
                {[
                  { country: 'United States', percentage: 45, color: 'bg-blue-600' },
                  { country: 'United Kingdom', percentage: 22, color: 'bg-blue-500' },
                  { country: 'Germany', percentage: 15, color: 'bg-blue-400' },
                  { country: 'Canada', percentage: 12, color: 'bg-blue-300' },
                ].map((region, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-900">{region.country}</span>
                      <span className="text-slate-600">{region.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${region.color}`}
                        style={{ width: `${region.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Search Terms */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Top Search Terms</h3>
            <div className="space-y-4">
              {[
                { term: 'Intellectual Property', count: '2.4k', icon: Search },
                { term: 'Contract Breach', count: '1.8k', icon: Search },
                { term: 'Labor Laws', count: '1.2k', icon: Search },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.term}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
