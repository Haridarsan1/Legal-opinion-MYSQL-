export default function AuditLogsPage() {
  const logs = [
    {
      id: 1,
      action: 'Request Created',
      user: 'You',
      details: 'Created new request #1024: Corporate Tax Review',
      timestamp: 'Oct 20, 2023 at 9:30 AM',
      icon: 'add_circle',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      id: 2,
      action: 'Documents Uploaded',
      user: 'You',
      details: 'Uploaded 3 documents (preliminary_brief_v1.pdf, tax_returns.pdf, audit_report.pdf)',
      timestamp: 'Oct 20, 2023 at 9:32 AM',
      icon: 'cloud_upload',
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 3,
      action: 'Lawyer Assigned',
      user: 'System',
      details: 'James Wilson assigned to case #1024',
      timestamp: 'Oct 20, 2023 at 2:15 PM',
      icon: 'person_add',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      id: 4,
      action: 'Status Updated',
      user: 'James Wilson',
      details: 'Status changed from "Assigned" to "In Review"',
      timestamp: 'Oct 22, 2023 at 10:00 AM',
      icon: 'update',
      color: 'text-amber-600 bg-amber-100',
    },
    {
      id: 5,
      action: 'Comment Added',
      user: 'James Wilson',
      details:
        'Added review comment: "Initial assessment complete, proceeding with detailed analysis"',
      timestamp: 'Oct 22, 2023 at 3:45 PM',
      icon: 'comment',
      color: 'text-slate-600 bg-slate-100',
    },
    {
      id: 6,
      action: 'Document Accessed',
      user: 'James Wilson',
      details: 'Viewed document: preliminary_brief_v1.pdf',
      timestamp: 'Oct 23, 2023 at 11:20 AM',
      icon: 'visibility',
      color: 'text-slate-600 bg-slate-100',
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">Audit Logs</h1>
        <p className="text-slate-500 text-base">
          Complete history of all activities and changes on your requests
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
        <div className="flex gap-4">
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Requests</option>
            <option>#1024 - Corporate Tax Review</option>
            <option>#1023 - Employment Contract</option>
            <option>#1020 - IP Rights</option>
          </select>
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>All Time</option>
          </select>
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
                    <h3 className="text-slate-900 font-bold text-lg">{log.action}</h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{log.details}</p>
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-slate-200"></div>
                    <span className="text-xs font-medium text-slate-500">{log.user}</span>
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
              Download a complete audit trail for your records or compliance purposes.
            </p>
          </div>
          <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
