import { FileText, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-12 max-w-md text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FolderOpen className="w-10 h-10 text-slate-400" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Documents Yet</h2>

        <p className="text-slate-600 mb-6">Documents from your assigned cases will appear here.</p>

        <Link
          href="/lawyer/requests"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <FileText className="w-5 h-5" />
          View Assigned Requests
        </Link>

        <p className="text-xs text-slate-500 mt-6">
          Documents are automatically added when clients upload them or when you add working files
          to cases.
        </p>
      </div>
    </div>
  );
}
