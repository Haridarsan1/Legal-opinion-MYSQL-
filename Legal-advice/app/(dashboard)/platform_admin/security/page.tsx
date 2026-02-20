'use client';

import { useState } from 'react';
import { Download, Settings, Search, AlertTriangle, Shield, Activity } from 'lucide-react';

export default function SecurityLogsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-white">Security Audit Logs</h1>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                LIVE MONITORING
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Real-time monitoring of system integrity and access events.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Settings className="w-4 h-4" />
              Configure Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Total Events (Today)</p>
                <p className="text-3xl font-bold text-white">12,405</p>
              </div>
              <div className="p-3 bg-slate-700 rounded-lg">
                <Activity className="w-6 h-6 text-slate-300" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-400">↑ +12%</span>
              <span className="text-xs text-slate-500">Vs. 7-day average</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Critical Incidents</p>
                <p className="text-3xl font-bold text-white">3</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded font-medium">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
                +2 Active
              </span>
              <span className="text-xs text-slate-500">Requires immediate attention</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Unique IPs</p>
                <p className="text-3xl font-bold text-white">450</p>
              </div>
              <div className="p-3 bg-slate-700 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-400">↑ +5%</span>
              <span className="text-xs text-slate-500">Global distribution stable</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by User ID, IP, or Event Code..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Date: Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
          <select className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Severity: All</option>
            <option>Critical</option>
            <option>Warning</option>
            <option>Info</option>
          </select>
          <select className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Type: All Types</option>
            <option>Login Attempt</option>
            <option>Permission Change</option>
            <option>API Access</option>
          </select>
          <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600">
            Reset
          </button>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    User / Actor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[
                  {
                    time: '10:42:05 AM',
                    severity: 'Critical',
                    event: 'Failed Login Attempt',
                    user: 'admin_02',
                    ip: '192.168.1.1',
                    details: '5th consecutive failed attempt. Account...',
                  },
                  {
                    time: '10:40:12 AM',
                    severity: 'Info',
                    event: 'Document Uploaded',
                    user: 'lawyer_jane',
                    ip: '10.0.0.5',
                    details: 'Upload: case_file_892.pdf (12.4 MB)',
                  },
                  {
                    time: '10:38:45 AM',
                    severity: 'Warning',
                    event: 'Permission Change',
                    user: 'super_admin',
                    ip: '192.168.1.4',
                    details: "Modified role for user: intern_01 from 'Vie...",
                  },
                  {
                    time: '10:35:22 AM',
                    severity: 'Info',
                    event: 'API Access',
                    user: 'external_service',
                    ip: '54.23.11.0',
                    details: 'GET /api/v1/cases/status - 200 OK',
                  },
                  {
                    time: '10:32:10 AM',
                    severity: 'Info',
                    event: 'User Logout',
                    user: 'partner_mike',
                    ip: '172.16.0.22',
                    details: 'Session terminated normally',
                  },
                  {
                    time: '10:15:00 AM',
                    severity: 'Critical',
                    event: 'Suspicious IP Detected',
                    user: 'unknown',
                    ip: '45.22.19.112',
                    details: 'IP flagged in threat intelligence feed. Acc...',
                  },
                  {
                    time: '10:10:05 AM',
                    severity: 'Info',
                    event: 'Password Reset',
                    user: 'clerk_03',
                    ip: '192.168.1.55',
                    details: 'Password reset requested and email sent.',
                  },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-sm text-slate-300">{log.time}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                          log.severity === 'Critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : log.severity === 'Warning'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.severity === 'Critical'
                              ? 'bg-red-400'
                              : log.severity === 'Warning'
                                ? 'bg-orange-400'
                                : 'bg-blue-400'
                          }`}
                        ></span>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{log.event}</td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">{log.user}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{log.ip}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-400">Showing 1-7 of 12,405 events</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-slate-400 hover:bg-slate-700 rounded">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm text-slate-400 hover:bg-slate-700 rounded">
                2
              </button>
              <button className="px-3 py-1 text-sm text-slate-400 hover:bg-slate-700 rounded">
                3
              </button>
              <span className="px-2 text-slate-600">...</span>
              <button className="px-3 py-1 text-sm text-slate-400 hover:bg-slate-700 rounded">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
