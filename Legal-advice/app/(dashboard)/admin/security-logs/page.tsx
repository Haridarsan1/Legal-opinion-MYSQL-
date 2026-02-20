export default function SecurityLogsPage() {
  const logs = [
    {
      id: 1,
      type: 'Login Success',
      user: 'admin@legalportal.com',
      ip: '103.212.45.89',
      location: 'Mumbai, India',
      timestamp: 'Oct 24, 2023 at 5:42 PM',
      icon: 'login',
      color: 'text-green-600 bg-green-100',
      risk: 'low',
    },
    {
      id: 2,
      type: 'Failed Login Attempt',
      user: 'unknown@suspicious.com',
      ip: '45.128.232.76',
      location: 'Unknown',
      timestamp: 'Oct 24, 2023 at 5:15 PM',
      icon: 'warning',
      color: 'text-amber-600 bg-amber-100',
      risk: 'medium',
    },
    {
      id: 3,
      type: 'Password Reset',
      user: 'lawyer@wilsonassociates.com',
      ip: '103.154.92.34',
      location: 'Delhi, India',
      timestamp: 'Oct 24, 2023 at 3:22 PM',
      icon: 'lock_reset',
      color: 'text-blue-600 bg-blue-100',
      risk: 'low',
    },
    {
      id: 4,
      type: 'Multiple Failed Login Attempts',
      user: 'admin@legalportal.com',
      ip: '192.168.45.12',
      location: 'Suspicious Location',
      timestamp: 'Oct 24, 2023 at 2:10 PM',
      icon: 'error',
      color: 'text-red-600 bg-red-100',
      risk: 'high',
    },
    {
      id: 5,
      type: 'API Key Generated',
      user: 'bank@hdfc.com',
      ip: '203.45.78.124',
      location: 'Bangalore, India',
      timestamp: 'Oct 24, 2023 at 11:45 AM',
      icon: 'key',
      color: 'text-purple-600 bg-purple-100',
      risk: 'low',
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">Security Logs</h1>
        <p className="text-slate-500 text-base">
          Monitor login attempts, access logs, and suspicious activity
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition"
            placeholder="Search by user, IP address, or location..."
            type="text"
          />
        </div>
        <div className="flex gap-3">
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Event Types</option>
            <option>Login Attempts</option>
            <option>Failed Logins</option>
            <option>Password Resets</option>
            <option>API Activity</option>
          </select>
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Risk Levels</option>
            <option>High Risk</option>
            <option>Medium Risk</option>
            <option>Low Risk</option>
          </select>
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Events (24h)</p>
          <p className="text-2xl font-bold text-slate-900">1,248</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Failed Logins</p>
          <p className="text-2xl font-bold text-amber-600">18</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">High Risk Events</p>
          <p className="text-2xl font-bold text-red-600">3</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Active Sessions</p>
          <p className="text-2xl font-bold text-green-600">156</p>
        </div>
      </div>

      {/* Security Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Recent Security Events</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.color}`}>
                        <span className="material-symbols-outlined text-lg">{log.icon}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{log.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-mono">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-mono">{log.ip}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{log.location}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        log.risk === 'high'
                          ? 'bg-red-100 text-red-700'
                          : log.risk === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {log.risk.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center">
          <button className="px-6 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-white transition-colors">
            Load More Events
          </button>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* High Risk Alert */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-2">High Risk Activity Detected</h3>
              <p className="text-sm text-slate-700 mb-3">
                Multiple failed login attempts from IP 192.168.45.12 for admin account
              </p>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors">
                Block IP Address
              </button>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">download</span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-2">Export Security Logs</h3>
              <p className="text-sm text-slate-700 mb-3">
                Download security logs for audit and compliance purposes
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-colors">
                  Export CSV
                </button>
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
