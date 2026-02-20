import { Download, Eye, RotateCcw } from 'lucide-react';

export default function DocumentVersioningPage() {
  const documents = [
    {
      id: 1,
      caseId: '#1023',
      title: 'Employment Contract Opinion',
      versions: [
        {
          version: 'v3.0',
          author: 'Robert Wilson (Senior Review)',
          date: 'Oct 24, 2023, 10:00 AM',
          changes: 'Final approval with firm stamp',
          status: 'Current',
          size: '5.2 MB',
        },
        {
          version: 'v2.0',
          author: 'Sarah Chen',
          date: 'Oct 23, 2023, 4:30 PM',
          changes: 'Addressed senior review comments, added case law citations',
          status: 'Previous',
          size: '4.8 MB',
        },
        {
          version: 'v1.0',
          author: 'Sarah Chen',
          date: 'Oct 22, 2023, 2:15 PM',
          changes: 'Initial draft submission',
          status: 'Previous',
          size: '4.2 MB',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
          Document Versioning
        </h1>
        <p className="text-slate-500 text-base">
          Track all document versions and changes with complete revision history
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
            placeholder="Search documents..."
            type="text"
          />
        </div>
        <div className="flex gap-3">
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Cases</option>
            <option>#1024</option>
            <option>#1023</option>
            <option>#1022</option>
          </select>
        </div>
      </div>

      {/* Document Version History */}
      {
  documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{doc.title}</h2>
                <p className="text-sm text-slate-500">Case {doc.caseId}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                {doc.versions.length} Versions
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

              <div className="space-y-6">
                {doc.versions.map((version, idx) => (
                  <div key={idx} className="relative flex gap-4">
                    {/* Version Indicator */}
                    <div
                      className={`relative z-10 flex-shrink-0 size-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        version.status === 'Current'
                          ? 'bg-primary text-white ring-4 ring-primary/20'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {version.version.replace('v', '')}
                    </div>

                    {/* Version Content */}
                    <div
                      className={`flex-1 pb-6 ${
                        version.status === 'Current' ? 'bg-blue-50/50' : 'bg-slate-50'
                      } rounded-xl p-6 border-2 ${
                        version.status === 'Current' ? 'border-primary/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-slate-900">{version.version}</h3>
                            {version.status === 'Current' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                                <span className="size-1 rounded-full bg-white animate-pulse"></span>
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{version.changes}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">person</span>
                              {version.author}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              {version.date}
                            </span>
                            <span>•</span>
                            <span>{version.size}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                            <Eye className="size-5" />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                            <Download className="size-5" />
                          </button>
                          {version.status !== 'Current' && (
                            <button className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                              <RotateCcw className="size-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Change Summary (if available) */}
                      {
  idx === 1 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-2">
                            Changes from v1.0:
                          </h4>
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">+</span>
                              <span>Added 3 case law citations (Section 2)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">+</span>
                              <span>Expanded analysis with statutory references</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">~</span>
                              <span>Modified conclusion to address senior feedback</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compare Versions */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Compare different versions to see detailed changes
                </p>
                <button className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-lg transition-colors">
                  Compare Versions
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">info</span>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-2">Version Control Benefits</h3>
            <ul className="text-sm text-slate-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Track every change made to opinions and documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Restore previous versions if needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Maintain complete audit trail for compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Compare versions to understand evolution of opinion</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
