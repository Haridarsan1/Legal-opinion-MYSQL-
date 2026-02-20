export default function FirmAuditLogsPage() {
  const logs = [
    {
      id: 1,
      action: 'Opinion Submitted',
      user: 'Robert Wilson (Senior Partner)',
      details: 'Final opinion submitted to client for case #1023',
      timestamp: 'Oct 24, 2023 at 10:00 AM',
      icon: 'send',
      color: 'text-green-600 bg-green-100',
      caseId: '#1023',
    },
    {
      id: 2,
      action: 'Senior Review Approved',
      user: 'Robert Wilson (Senior Partner)',
      details: 'Approved draft opinion for case #1023 with minor comments',
      timestamp: 'Oct 24, 2023 at 9:30 AM',
      icon: 'check_circle',
      color: 'text-green-600 bg-green-100',
      caseId: '#1023',
    },
    {
      id: 3,
      action: 'Draft Submitted for Review',
      user: 'Sarah Chen (Junior Associate)',
      details: 'Submitted v2.0 draft incorporating feedback',
      timestamp: 'Oct 23, 2023 at 4:30 PM',
      icon: 'upload',
      color: 'text-blue-600 bg-blue-100',
      caseId: '#1023',
    },
    {
      id: 4,
      action: 'Revision Requested',
      user: 'Robert Wilson (Senior Partner)',
      details: 'Requested revisions on initial draft - add case law citations',
      timestamp: 'Oct 23, 2023 at 11:00 AM',
      icon: 'edit_note',
      color: 'text-amber-600 bg-amber-100',
      caseId: '#1023',
    },
    {
      id: 5,
      action: 'Case Assigned',
      user: 'Admin System',
      details: 'Case #1024 assigned to James Wilson',
      timestamp: 'Oct 22, 2023 at 3:00 PM',
      icon: 'person_add',
      color: 'text-purple-600 bg-purple-100',
      caseId: '#1024',
    },
    {
      id: 6,
      action: 'Document Accessed',
      user: 'Sarah Chen (Junior Associate)',
      details: 'Viewed client documents for case #1023',
      timestamp: 'Oct 22, 2023 at 2:30 PM',
      icon: 'visibility',
      color: 'text-slate-600 bg-slate-100',
      caseId: '#1023',
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">Firm Audit Logs</h1>
        <p className="text-slate-500 text-base">
          Complete audit trail of all actions and activities across the firm
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
            placeholder="Search logs..."
            type="text"
          />
        </div>
        <div className="flex gap-3">
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Users</option>
            <option>Robert Wilson</option>
            <option>Sarah Chen</option>
            <option>James Wilson</option>
            <option>System Actions</option>
          </select>
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Actions</option>
            <option>Submissions</option>
            <option>Reviews</option>
            <option>Assignments</option>
            <option>Document Access</option>
          </select>
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Actions (7 days)</p>
          <p className="text-2xl font-bold text-slate-900">248</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-slate-900">18</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Cases Modified</p>
          <p className="text-2xl font-bold text-slate-900">42</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Documents Accessed</p>
          <p className="text-2xl font-bold text-slate-900">156</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>

          {/* Log Items */}
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="relative flex gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`size-12 rounded-full ${log.color} flex items-center justify-center shadow-md`}
                  >
                    <span className="material-symbols-outlined text-xl">{log.icon}</span>
                  </div>
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-slate-900 font-bold text-lg">{log.action}</h3>
                        <span className="text-xs font-bold text-slate-400">{log.caseId}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{log.details}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="size-5 rounded-full bg-slate-200"></div>
                          <span className="text-xs font-medium text-slate-500">{log.user}</span>
                        </div>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{log.timestamp}</span>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-6 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Load More Logs
          </button>
        </div>
      </div>

      {/* Export Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Export Audit Logs</h3>
            <p className="text-sm text-slate-600">
              Download complete audit trail for compliance and record-keeping
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 border border-slate-300 hover:bg-white text-slate-700 rounded-lg font-bold transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined">download</span>
              Export CSV
            </button>
            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
              <span className="material-symbols-outlined">download</span>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
